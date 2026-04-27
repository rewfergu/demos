import { useCallback, useEffect, useRef, useState } from 'react';
import { extractGps } from '@demo-archive/demo-utils/exif';
import { processImage } from '@demo-archive/demo-utils/image-processing';

export interface PhotoBlobs {
  thumb: Blob;
  full: Blob;
}

export type GpsStatusKind = 'found' | 'missing';

export interface GpsStatusState {
  message: string | null;
  kind: GpsStatusKind;
}

export interface UsePhotoCaptureOptions {
  /** Called when EXIF GPS coords are extracted from a selected photo. */
  onGpsFound?: (coords: { lat: number; lng: number }) => void;
}

export interface UsePhotoCaptureResult {
  lat: string;
  lng: string;
  photoBlobs: PhotoBlobs | null;
  previewUrl: string | null;
  photoHadGps: boolean;
  gpsStatus: GpsStatusState;
  setLat: (value: string) => void;
  setLng: (value: string) => void;
  /** Pass directly to <PhotoInput onFileSelected={...}>. Processes the image, reads EXIF, updates state. */
  handleFileSelected: (file: File) => Promise<void>;
  /** Apply pin-drop coords (already unprojected from screen to lat/lng by the caller). */
  handlePinDrop: (coords: { lat: number; lng: number }) => void;
  /** Show an existing image (e.g. from a saved entity) without taking ownership of its URL. Clears photo + GPS state. */
  showExternalPreview: (url: string | null) => void;
  /** Clear all photo + lat/lng + GPS state and revoke any owned preview URL. */
  reset: () => void;
}

const INITIAL_STATUS: GpsStatusState = { message: null, kind: 'missing' };

export function usePhotoCapture(options: UsePhotoCaptureOptions = {}): UsePhotoCaptureResult {
  const onGpsFoundRef = useRef(options.onGpsFound);
  onGpsFoundRef.current = options.onGpsFound;

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [photoBlobs, setPhotoBlobs] = useState<PhotoBlobs | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoHadGps, setPhotoHadGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<GpsStatusState>(INITIAL_STATUS);

  const ownedUrlRef = useRef<string | null>(null);

  const releaseOwnedUrl = useCallback(() => {
    if (ownedUrlRef.current) {
      URL.revokeObjectURL(ownedUrlRef.current);
      ownedUrlRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      if (ownedUrlRef.current) URL.revokeObjectURL(ownedUrlRef.current);
    },
    [],
  );

  const handleFileSelected = useCallback(
    async (file: File) => {
      const blobs = await processImage(file);
      setPhotoBlobs(blobs);

      releaseOwnedUrl();
      const url = URL.createObjectURL(blobs.thumb);
      ownedUrlRef.current = url;
      setPreviewUrl(url);

      setGpsStatus({ message: 'Reading EXIF data...', kind: 'missing' });

      const gps = await extractGps(file);
      if (!gps) {
        setPhotoHadGps(false);
        setGpsStatus({
          message: 'No GPS data found. Drag the pin onto the map or enter coordinates manually.',
          kind: 'missing',
        });
        return;
      }

      const hasExistingCoords =
        Number.isFinite(parseFloat(lat)) && Number.isFinite(parseFloat(lng));
      if (hasExistingCoords) {
        const accept = window.confirm(
          "This photo has GPS coordinates. Use them instead of your current location?",
        );
        if (!accept) {
          setPhotoHadGps(false);
          setGpsStatus({
            message: 'Photo has GPS data but kept existing coordinates.',
            kind: 'found',
          });
          return;
        }
      }

      setLat(gps.lat.toFixed(6));
      setLng(gps.lng.toFixed(6));
      setPhotoHadGps(true);
      setGpsStatus({
        message: 'GPS coordinates extracted from photo. Drop the pin on the map to override.',
        kind: 'found',
      });
      onGpsFoundRef.current?.({ lat: gps.lat, lng: gps.lng });
    },
    [lat, lng, releaseOwnedUrl],
  );

  const handlePinDrop = useCallback(
    ({ lat: la, lng: ll }: { lat: number; lng: number }) => {
      const overwriting = photoHadGps;
      setLat(la.toFixed(6));
      setLng(ll.toFixed(6));
      setPhotoHadGps(false);
      setGpsStatus({
        message: overwriting
          ? 'Photo GPS overwritten with marker location.'
          : 'Location set from map. Drag the marker to fine-tune.',
        kind: 'found',
      });
    },
    [photoHadGps],
  );

  const showExternalPreview = useCallback(
    (url: string | null) => {
      releaseOwnedUrl();
      setPhotoBlobs(null);
      setPhotoHadGps(false);
      setGpsStatus(INITIAL_STATUS);
      setPreviewUrl(url);
    },
    [releaseOwnedUrl],
  );

  const reset = useCallback(() => {
    releaseOwnedUrl();
    setLat('');
    setLng('');
    setPhotoBlobs(null);
    setPreviewUrl(null);
    setPhotoHadGps(false);
    setGpsStatus(INITIAL_STATUS);
  }, [releaseOwnedUrl]);

  return {
    lat,
    lng,
    photoBlobs,
    previewUrl,
    photoHadGps,
    gpsStatus,
    setLat,
    setLng,
    handleFileSelected,
    handlePinDrop,
    showExternalPreview,
    reset,
  };
}
