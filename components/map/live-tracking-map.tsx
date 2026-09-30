'use client';

import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, PolylineF, CircleF } from '@react-google-maps/api';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MapMarkerItem {
  id: string;
  type: 'VEHICLE' | 'WAREHOUSE' | 'FARM';
  name: string;
  code?: string;
  latitude: number;
  longitude: number;
  speed?: number | null;
  temperature?: number | null;
  status?: string;
  driverName?: string;
  geofenceStatus?: 'INSIDE' | 'OUTSIDE' | 'APPROACHING';
  cropType?: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  type: string;
}

interface LiveTrackingMapProps {
  markers?: MapMarkerItem[];
  geofences?: GeofenceZone[];
  routePath?: [number, number][]; // [lat, lng] array
  activeMarkerId?: string;
  onSelectMarker?: (marker: MapMarkerItem) => void;
  className?: string;
  height?: string;
}

export function LiveTrackingMap({
  markers = [],
  geofences = [],
  routePath = [],
  activeMarkerId,
  onSelectMarker,
  className,
  height = '500px',
}: LiveTrackingMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showPath, setShowPath] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const defaultCenter = useMemo(() => {
    if (activeMarkerId) {
      const active = markers.find((m) => m.id === activeMarkerId);
      if (active) return { lat: active.latitude, lng: active.longitude };
    }
    return {
      lat: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT ?? '30.3753'),
      lng: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG ?? '69.3451'),
    };
  }, [activeMarkerId, markers]);

  const defaultZoom = parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM ?? '6');

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const pathCoords = useMemo(() => {
    return routePath.map((pt) => ({ lat: pt[0], lng: pt[1] }));
  }, [routePath]);

  // Use elegant modern Google Maps styling to match the professional theme
  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
      {
        featureType: "all",
        elementType: "geometry.fill",
        stylers: [{ weight: "2.00" }]
      },
      {
        featureType: "all",
        elementType: "geometry.stroke",
        stylers: [{ color: "#9c9c9c" }]
      },
      {
        featureType: "all",
        elementType: "labels.text",
        stylers: [{ visibility: "on" }]
      },
      {
        featureType: "landscape",
        elementType: "all",
        stylers: [{ color: "#f2f2f2" }]
      },
      {
        featureType: "landscape",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "landscape.man_made",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "poi",
        elementType: "all",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "road",
        elementType: "all",
        stylers: [{ saturation: -100 }, { lightness: 45 }]
      },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#eeeeee" }]
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#7b7b7b" }]
      },
      {
        featureType: "road",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "road.highway",
        elementType: "all",
        stylers: [{ visibility: "simplified" }]
      },
      {
        featureType: "road.arterial",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "transit",
        elementType: "all",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "water",
        elementType: "all",
        stylers: [{ color: "#46bcec" }, { visibility: "on" }]
      },
      {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [{ color: "#c8d7d4" }]
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#070707" }]
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#ffffff" }]
      }
    ]
  };

  const getMarkerIcon = (marker: MapMarkerItem) => {
    // Generate SVG path for a high-quality pin
    let color = '#15803d'; // Farm / Default Green
    let path = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
    
    if (marker.type === 'VEHICLE') {
      const isAlert = typeof marker.temperature === 'number' && (marker.temperature > 8 || marker.temperature < 0);
      color = isAlert ? '#ef4444' : '#0f172a'; // Red for alert, Navy for standard
    } else if (marker.type === 'WAREHOUSE') {
      color = '#0284c7'; // Blue for warehouse
    }

    return {
      path: path,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#ffffff',
      scale: 1.6,
      anchor: new google.maps.Point(12, 24),
    };
  };

  return (
    <div className={cn('relative rounded-xl overflow-hidden shadow-neu-sm border border-slate-200', className)} style={{ height }}>
      {!isLoaded ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></span>
            Loading Professional Tracking Map...
          </div>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={defaultCenter}
          zoom={defaultZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
          onClick={() => setSelectedMarker(null)}
        >
          {/* Render Route Polyline */}
          {showPath && pathCoords.length > 1 && (
            <PolylineF
              path={pathCoords}
              options={{
                strokeColor: '#0ea5e9', // Sky blue
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }}
            />
          )}

          {/* Render Geofences */}
          {showGeofences && geofences.map((geo) => (
            <CircleF
              key={geo.id}
              center={{ lat: geo.latitude, lng: geo.longitude }}
              radius={geo.radius || 1500}
              options={{
                fillColor: '#10b981',
                fillOpacity: 0.15,
                strokeColor: '#059669',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          ))}

          {/* Render Markers */}
          {markers.map((marker) => (
            <MarkerF
              key={marker.id}
              position={{ lat: marker.latitude, lng: marker.longitude }}
              icon={getMarkerIcon(marker)}
              onClick={() => {
                setSelectedMarker(marker);
                if (onSelectMarker) onSelectMarker(marker);
              }}
            >
              {selectedMarker?.id === marker.id && (
                <InfoWindowF
                  position={{ lat: marker.latitude, lng: marker.longitude }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="font-inter text-xs text-slate-800 min-w-[170px] p-1">
                    <strong className="text-[13px] font-bold block mb-1">{marker.name}</strong>
                    {marker.code && <div className="text-slate-500 text-[11px] mb-1">Ref: <b className="text-slate-700">{marker.code}</b></div>}
                    
                    {typeof marker.temperature === 'number' && (
                      <div className={cn("mt-1.5 font-bold p-1.5 rounded-md", marker.temperature > 8 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800")}>
                        🌡️ Temp: {marker.temperature > 0 ? '+' : ''}{marker.temperature.toFixed(1)}°C
                      </div>
                    )}
                    
                    {typeof marker.speed === 'number' && marker.speed > 0 && (
                      <div className="text-sky-700 mt-1 font-semibold">⚡ Speed: {marker.speed} km/h</div>
                    )}
                    
                    {marker.status && (
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">
                        {marker.status}
                      </div>
                    )}
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      )}

      {/* Layer Control Bar Overlay */}
      <div className="absolute top-3 right-14 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs">
        <Layers className="w-3.5 h-3.5 text-slate-500" />
        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700 transition">
          <input
            type="checkbox"
            checked={showGeofences}
            onChange={(e) => setShowGeofences(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
          />
          <span className="font-bold text-slate-700">Geofences</span>
        </label>

        <span className="w-px h-3 bg-slate-300 mx-1" />

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-sky-700 transition">
          <input
            type="checkbox"
            checked={showPath}
            onChange={(e) => setShowPath(e.target.checked)}
            className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
          />
          <span className="font-bold text-slate-700">Route Trails</span>
        </label>
      </div>

      {/* Telemetry Status Legend Overlay */}
      <div className="absolute bottom-6 left-3 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-[11px] text-slate-700">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-3 h-3 rounded-full bg-slate-900 inline-block" /> Active Fleet (Safe)
        </span>
        <span className="flex items-center gap-1.5 font-bold text-rose-700">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block animate-pulse" /> Temp Excursion
        </span>
        <span className="flex items-center gap-1.5 font-bold text-sky-700">
          <span className="w-3 h-3 rounded-sm bg-sky-600 inline-block" /> Cold Storage Hub
        </span>
      </div>
    </div>
  );
}
