import { useEffect, useRef } from 'react';
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
import { useState } from 'react';
import { saveEntry, getAllEntriesMeta, getEntryPhoto } from './store.js';
import { initMap, addMarker, loadMarkers, createPreviewMarker } from './map-view.js';
import './style.css';

const loadPhoto = (id) => getEntryPhoto(id, 'photoThumb');

export default function PhotoLocation() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const previewMarkerRef = useRef(null);
  const photoInputRef = useRef(null);

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
    previewMarkerRef.current = createPreviewMarker(map, (lng, lat) => {
      photo.setLat(lat.toFixed(6));
      photo.setLng(lng.toFixed(6));
    });

    getAllEntriesMeta()
      .then((entries) => {
        map.on('load', () => loadMarkers(map, entries, loadPhoto));
      })
      .catch(() => {});

    return () => {
      map.remove();
      mapRef.current = null;
      previewMarkerRef.current = null;
    };
    // photo.setLat/setLng are stable across renders
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
      latNum >= -90 && latNum <= 90 &&
      lngNum >= -180 && lngNum <= 180
    ) {
      marker.set(lngNum, latNum);
    } else {
      marker.clear();
    }
  }, [photo.lat, photo.lng]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/photo-location-sw.js').catch(() => {});
    }
  }, []);

  const handlePinDrop = (x, y) => {
    const map = mapRef.current;
    if (!map) return;
    const { lng, lat } = map.unproject([x, y]);
    photo.handlePinDrop({ lat, lng });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    photo.reset();
    photoInputRef.current?.reset();
    previewMarkerRef.current?.clear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const map = mapRef.current;
    if (!map) return;

    const entry = {
      name: name.trim(),
      description: description.trim(),
      lat: parseFloat(photo.lat),
      lng: parseFloat(photo.lng),
      photoThumb: photo.photoBlobs?.thumb ?? null,
      photoFull: photo.photoBlobs?.full ?? null,
    };

    const id = await saveEntry(entry);
    addMarker(map, { ...entry, id }, loadPhoto);
    map.flyTo({ center: [entry.lng, entry.lat], zoom: 14 });

    resetForm();
  };

  return (
    <div className="pl-layout">
      <div className="pl-sidebar">
        <form className="pl-form" onSubmit={handleSubmit}>
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
          <DragPinHandle dropTargetRef={mapContainerRef} onDrop={handlePinDrop} />
          <GpsStatus message={photo.gpsStatus.message} kind={photo.gpsStatus.kind} />
          <TextField
            label="Location Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Brooklyn Bridge"
          />
          <TextAreaField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this place..."
          />
          <Button type="submit">Add to Map</Button>
        </form>
      </div>
      <div className="pl-map-wrap">
        <div ref={mapContainerRef} className="pl-map" />
      </div>
    </div>
  );
}
