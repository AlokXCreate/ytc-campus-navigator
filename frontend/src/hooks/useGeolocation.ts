import { useState, useEffect, useRef, useCallback } from 'react';

export interface GeolocationPositionState {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export type GeolocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPositionState | null>(null);
  const [permission, setPermission] = useState<GeolocationPermissionState>('prompt');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Check initial permission query if supported
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((res) => {
          setPermission(res.state as GeolocationPermissionState);
          res.onchange = () => setPermission(res.state as GeolocationPermissionState);
        })
        .catch(() => {});
    }
  }, []);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      timestamp: pos.timestamp,
    });
    setPermission('granted');
    setError(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let msg = 'Failed to obtain GPS position.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        msg = 'Location permission was denied. Please allow location access in your browser settings.';
        setPermission('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        msg = 'GPS signal is currently unavailable. Move to an outdoor area with clear sky view.';
        break;
      case err.TIMEOUT:
        msg = 'GPS request timed out. Retrying location search...';
        break;
    }
    setError(msg);
  }, []);

  const getCurrentLocation = useCallback((): Promise<GeolocationPositionState | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        setError('Browser does not support geolocation.');
        resolve(null);
        return;
      }

      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSuccess(pos);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          handleError(err);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    });
  }, [handleSuccess, handleError]);

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    if (watchIdRef.current !== null) return;

    setIsTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => handleSuccess(pos),
      (err) => handleError(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );
  }, [handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    permission,
    isTracking,
    error,
    getCurrentLocation,
    startTracking,
    stopTracking,
  };
};
