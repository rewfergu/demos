import { useEffect, useRef, useState } from 'react';
import {
  Button,
  TextField,
  TextAreaField,
  LatLngInputs,
  GpsStatus,
  PhotoInput,
  DragPinHandle,
  usePhotoCapture,
} from '@demo-archive/demo-ui';
import '@demo-archive/demo-ui/styles.css';
import {
  initMap,
  initRoute,
  createRouteRenderer,
  createPreviewMarker,
} from './map-view.js';
import './style.css';

function clampIndex(idx, length) {
  if (length === 0) return 0;
  return Math.min(Math.max(idx, 0), length - 1);
}

function releaseWaypoint(w) {
  if (w.thumbUrl) URL.revokeObjectURL(w.thumbUrl);
  if (w.fullUrl) URL.revokeObjectURL(w.fullUrl);
}

export default function RouteCreator() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const previewMarkerRef = useRef(null);
  const routeRendererRef = useRef(null);
  const photoInputRef = useRef(null);
  const nextIdRef = useRef(1);
  const handleMarkerClickRef = useRef(null);

  const [waypoints, setWaypoints] = useState([]);
  const [mode, setMode] = useState('edit');
  const [viewIndex, setViewIndex] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const photo = usePhotoCapture({
    onGpsFound: ({ lat: la, lng: ll }) => {
      mapRef.current?.flyTo({ center: [ll, la], zoom: 14 });
    },
  });

  useEffect(() => {
    if (!mapContainerRef.current) return undefined;
    const map = initMap(mapContainerRef.current);
    mapRef.current = map;
    initRoute(map);
    routeRendererRef.current = createRouteRenderer(map, index => {
      handleMarkerClickRef.current?.(index);
    });
    previewMarkerRef.current = createPreviewMarker(map, (lng, lat) => {
      photo.setLat(lat.toFixed(6));
      photo.setLng(lng.toFixed(6));
    });

    return () => {
      map.remove();
      mapRef.current = null;
      previewMarkerRef.current = null;
      routeRendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const marker = previewMarkerRef.current;
    if (!marker) return;
    const latNum = parseFloat(photo.lat);
    const lngNum = parseFloat(photo.lng);
    if (
      Number.isFinite(latNum) &&
      Number.isFinite(lngNum) &&
      latNum >= -90 &&
      latNum <= 90 &&
      lngNum >= -180 &&
      lngNum <= 180
    ) {
      marker.set(lngNum, latNum);
    } else {
      marker.clear();
    }
  }, [photo.lat, photo.lng]);

  useEffect(() => {
    const renderer = routeRendererRef.current;
    if (!renderer) return;
    const activeIdx =
      mode === 'view' && waypoints.length > 0
        ? clampIndex(viewIndex, waypoints.length)
        : -1;
    renderer.render(waypoints, activeIdx);
  }, [waypoints, viewIndex, mode]);

  // Revoke any remaining waypoint URLs on unmount.
  useEffect(
    () => () => {
      waypoints.forEach(releaseWaypoint);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  );

  handleMarkerClickRef.current = index => {
    if (!confirmDiscardIfEditing()) return;
    if (editingId !== null) exitEditMode();
    setMode('view');
    setViewIndex(index);
    const w = waypoints[index];
    if (w) mapRef.current?.flyTo({ center: [w.lng, w.lat], zoom: 18 });
  };

  const resetFormState = () => {
    setName('');
    setDescription('');
    photo.reset();
    photoInputRef.current?.reset();
    previewMarkerRef.current?.clear();
  };

  const enterEditMode = w => {
    setEditingId(w.id);
    setName(w.name);
    setDescription(w.description);
    photo.setLat(w.lat.toFixed(6));
    photo.setLng(w.lng.toFixed(6));
    photo.showExternalPreview(w.fullUrl ?? null);
    photoInputRef.current?.reset();
  };

  const exitEditMode = () => {
    setEditingId(null);
    resetFormState();
  };

  const confirmDiscardIfEditing = () => {
    if (editingId == null) return true;
    return window.confirm('Discard changes to this waypoint?');
  };

  const handlePinDrop = (x, y) => {
    const map = mapRef.current;
    if (!map) return;
    const { lng, lat } = map.unproject([x, y]);
    photo.handlePinDrop({ lat, lng });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const map = mapRef.current;
    if (!map) return;

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const latNum = parseFloat(photo.lat);
    const lngNum = parseFloat(photo.lng);

    if (editingId !== null) {
      let updatedIdx = -1;
      setWaypoints(prev =>
        prev.map((w, i) => {
          if (w.id !== editingId) return w;
          updatedIdx = i;
          let next = {
            ...w,
            name: trimmedName,
            description: trimmedDesc,
            lat: latNum,
            lng: lngNum,
          };
          if (photo.photoBlobs) {
            if (w.thumbUrl) URL.revokeObjectURL(w.thumbUrl);
            if (w.fullUrl) URL.revokeObjectURL(w.fullUrl);
            next = {
              ...next,
              photoThumb: photo.photoBlobs.thumb,
              photoFull: photo.photoBlobs.full,
              thumbUrl: URL.createObjectURL(photo.photoBlobs.thumb),
              fullUrl: URL.createObjectURL(photo.photoBlobs.full),
            };
          }
          return next;
        })
      );
      if (updatedIdx >= 0) setViewIndex(updatedIdx);
      setEditingId(null);
      resetFormState();
      setMode('view');
      return;
    }

    const id = nextIdRef.current++;
    const blobs = photo.photoBlobs;
    setWaypoints(prev => [
      ...prev,
      {
        id,
        name: trimmedName,
        description: trimmedDesc,
        lat: latNum,
        lng: lngNum,
        photoThumb: blobs?.thumb ?? null,
        photoFull: blobs?.full ?? null,
        thumbUrl: blobs ? URL.createObjectURL(blobs.thumb) : null,
        fullUrl: blobs ? URL.createObjectURL(blobs.full) : null,
      },
    ]);
    resetFormState();
  };

  const removeWaypoint = id => {
    if (!confirmDiscardIfEditing()) return;
    if (editingId !== null) exitEditMode();
    setWaypoints(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx < 0) return prev;
      releaseWaypoint(prev[idx]);
      const next = prev.slice();
      next.splice(idx, 1);
      return next;
    });
  };

  const flyToWaypoint = (w, listIndex) => {
    if (editingId !== null && editingId !== w.id) {
      if (!confirmDiscardIfEditing()) return;
      exitEditMode();
    }
    if (mode === 'view') setViewIndex(listIndex);
    mapRef.current?.flyTo({ center: [w.lng, w.lat], zoom: 18 });
    console.log('flyToWaypoint', w);
  };

  const clearRoute = () => {
    if (!confirmDiscardIfEditing()) return;
    if (editingId !== null) exitEditMode();
    setWaypoints(prev => {
      prev.forEach(releaseWaypoint);
      return [];
    });
  };

  const switchMode = next => {
    if (next === mode) return;
    if (next === 'view') {
      if (!confirmDiscardIfEditing()) return;
      if (editingId !== null) exitEditMode();
      setMode('view');
      const w = waypoints[clampIndex(viewIndex, waypoints.length)];
      if (w) mapRef.current?.flyTo({ center: [w.lng, w.lat], zoom: 14 });
    } else {
      setMode('edit');
    }
  };

  const startEditFromView = () => {
    const w = waypoints[clampIndex(viewIndex, waypoints.length)];
    if (!w) return;
    enterEditMode(w);
    setMode('edit');
    mapRef.current?.flyTo({ center: [w.lng, w.lat], zoom: 14 });
  };

  const cancelEdit = () => {
    if (!confirmDiscardIfEditing()) return;
    exitEditMode();
    setMode('view');
  };

  const stepView = delta => {
    const next = clampIndex(viewIndex + delta, waypoints.length);
    if (next === viewIndex) return;
    setViewIndex(next);
    const w = waypoints[next];
    if (w) mapRef.current?.flyTo({ center: [w.lng, w.lat], zoom: 18 });
    console.log('stepView', mapRef.current, w);
  };

  const count = waypoints.length;
  const viewSafeIndex = clampIndex(viewIndex, count);
  const currentView =
    mode === 'view' && count > 0 ? waypoints[viewSafeIndex] : null;

  return (
    <div className="rc-layout">
      <div className="rc-sidebar">
        <div className="rc-mode-toggle" role="tablist" aria-label="Mode">
          <button
            type="button"
            className={`rc-mode-btn ${mode === 'edit' ? 'rc-mode-active' : ''}`}
            role="tab"
            aria-selected={mode === 'edit'}
            onClick={() => switchMode('edit')}
          >
            Edit
          </button>
          <button
            type="button"
            className={`rc-mode-btn ${mode === 'view' ? 'rc-mode-active' : ''}`}
            role="tab"
            aria-selected={mode === 'view'}
            onClick={() => switchMode('view')}
          >
            View
          </button>
        </div>

        {mode === 'view' ? (
          <section className="rc-view">
            {count === 0 ? (
              <p className="rc-view-empty">
                No waypoints yet. Switch to Edit to add some.
              </p>
            ) : (
              <>
                <article className="rc-view-card">
                  <header className="rc-view-head">
                    <span className="rc-view-index">{viewSafeIndex + 1}</span>
                    <span className="rc-view-position">
                      {viewSafeIndex + 1} of {count}
                    </span>
                  </header>
                  {currentView?.fullUrl ? (
                    <img
                      className="rc-view-photo"
                      src={currentView.fullUrl}
                      alt={currentView.name}
                    />
                  ) : null}
                  <h2 className="rc-view-name">{currentView?.name}</h2>
                  {currentView?.description ? (
                    <p className="rc-view-desc">{currentView.description}</p>
                  ) : null}
                  <div className="rc-view-coords">
                    {currentView
                      ? `${currentView.lat.toFixed(5)}, ${currentView.lng.toFixed(5)}`
                      : ''}
                  </div>
                  <Button variant="outline" onClick={startEditFromView}>
                    Edit waypoint
                  </Button>
                </article>
                <div className="rc-view-nav">
                  <Button
                    variant="secondary"
                    onClick={() => stepView(-1)}
                    disabled={viewSafeIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => stepView(1)}
                    disabled={viewSafeIndex === count - 1}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </section>
        ) : (
          <form className="rc-form" onSubmit={handleSubmit}>
            <PhotoInput
              ref={photoInputRef}
              previewUrl={photo.previewUrl}
              onFileSelected={photo.handleFileSelected}
            />
            <LatLngInputs
              lat={photo.lat}
              lng={photo.lng}
              onLatChange={photo.setLat}
              onLngChange={photo.setLng}
              required
            />
            <DragPinHandle
              dropTargetRef={mapContainerRef}
              onDrop={handlePinDrop}
            />
            <GpsStatus
              message={photo.gpsStatus.message}
              kind={photo.gpsStatus.kind}
            />
            <TextField
              label="Waypoint Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Brooklyn Bridge"
            />
            <TextAreaField
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe this stop..."
            />
            <div className="rc-form-actions">
              <Button type="submit">
                {editingId !== null ? 'Update Waypoint' : 'Add Waypoint'}
              </Button>
              {editingId !== null ? (
                <Button variant="secondary" onClick={cancelEdit}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        )}

        <div className="rc-route-panel">
          <div className="rc-route-header">
            <h3>Route</h3>
            <span className="rc-count">
              {count} waypoint{count === 1 ? '' : 's'}
            </span>
          </div>
          {count === 0 ? (
            <p className="rc-empty">Add a waypoint to start the route.</p>
          ) : (
            <ol className="rc-list">
              {waypoints.map((w, i) => (
                <li key={w.id} className="rc-list-item">
                  <span className="rc-list-index">{i + 1}</span>
                  {w.thumbUrl ? (
                    <img className="rc-list-thumb" src={w.thumbUrl} alt="" />
                  ) : (
                    <div className="rc-list-thumb rc-list-thumb-empty" />
                  )}
                  <div className="rc-list-info">
                    <div className="rc-list-title">{w.name}</div>
                    <div className="rc-list-coords">
                      {w.lat.toFixed(4)}, {w.lng.toFixed(4)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rc-list-fly"
                    aria-label={`Fly to waypoint ${i + 1}`}
                    onClick={() => flyToWaypoint(w, i)}
                  >
                    Show
                  </button>
                  <button
                    type="button"
                    className="rc-list-remove"
                    aria-label={`Remove waypoint ${i + 1}`}
                    onClick={() => removeWaypoint(w.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
          )}
          {count > 0 ? (
            <Button variant="danger" onClick={clearRoute}>
              Clear Route
            </Button>
          ) : null}
        </div>
      </div>
      <div className="rc-map-wrap">
        <div ref={mapContainerRef} className="rc-map" />
      </div>
    </div>
  );
}
