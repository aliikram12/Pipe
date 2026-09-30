'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Layers, Navigation, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
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
  radius: number;
  type: string;
}

interface LiveTrackingMapProps {
  markers?: MapMarkerItem[];
  geofences?: GeofenceZone[];
  routePath?: [number, number][];
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const popupRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showPath, setShowPath] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  const defaultCenter = useMemo(() => {
    if (activeMarkerId) {
      const active = markers.find((m) => m.id === activeMarkerId);
      if (active) return [active.longitude, active.latitude] as [number, number];
    }
    // Default: Pakistan center
    return [69.3451, 30.3753] as [number, number];
  }, [activeMarkerId, markers]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;

        if (!mapboxToken) {
          console.warn('Mapbox token not found');
          setMapLoaded(true);
          return;
        }

        mapboxgl.accessToken = mapboxToken;

        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: defaultCenter,
          zoom: 6,
          attributionControl: false,
        });

        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

        map.on('load', () => {
          mapRef.current = map;
          setMapLoaded(true);
          updateMapData(map, mapboxgl);
        });

      } catch (err) {
        console.error('Mapbox init error:', err);
        setMapLoaded(true);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const updateMapData = async (map: any, mapboxgl: any) => {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add markers
    markers.forEach((marker) => {
      const el = document.createElement('div');
      el.className = 'mapbox-custom-marker';
      
      const isAlert = marker.type === 'VEHICLE' && typeof marker.temperature === 'number' && (marker.temperature > 8 || marker.temperature < 0);
      
      let bgColor = '#15803d'; // Farm green
      let emoji = '🌾';
      if (marker.type === 'VEHICLE') {
        bgColor = isAlert ? '#ef4444' : '#0f172a';
        emoji = '🚛';
      } else if (marker.type === 'WAREHOUSE') {
        bgColor = '#0284c7';
        emoji = '🏭';
      }

      el.innerHTML = `
        <div style="
          width: 36px; height: 36px; 
          background: ${bgColor}; 
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
          transition: transform 0.2s;
          ${isAlert ? 'animation: pulse-ring 1.5s ease-out infinite;' : ''}
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
        </div>
      `;

      el.addEventListener('mouseenter', () => {
        el.querySelector('div')!.style.transform = 'rotate(-45deg) scale(1.15)';
      });
      el.addEventListener('mouseleave', () => {
        el.querySelector('div')!.style.transform = 'rotate(-45deg) scale(1)';
      });

      // Popup content
      const popupHtml = `
        <div style="font-family: Inter, system-ui, sans-serif; min-width: 200px; padding: 12px;">
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            ${emoji} ${marker.name}
          </div>
          ${marker.code ? `<div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Ref: <b style="color: #334155">${marker.code}</b></div>` : ''}
          ${typeof marker.temperature === 'number' ? `
            <div style="
              margin-top: 6px; font-weight: 700; padding: 6px 10px; border-radius: 8px; font-size: 12px;
              background: ${marker.temperature > 8 ? '#fef2f2' : '#f0fdf4'}; 
              color: ${marker.temperature > 8 ? '#b91c1c' : '#166534'};
              border: 1px solid ${marker.temperature > 8 ? '#fecaca' : '#bbf7d0'};
            ">
              🌡️ Temp: ${marker.temperature > 0 ? '+' : ''}${marker.temperature.toFixed(1)}°C
            </div>
          ` : ''}
          ${typeof marker.speed === 'number' && marker.speed > 0 ? `
            <div style="color: #0369a1; margin-top: 6px; font-weight: 600; font-size: 12px;">⚡ Speed: ${marker.speed} km/h</div>
          ` : ''}
          ${marker.status ? `
            <div style="margin-top: 6px; display: inline-block; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; font-size: 10px; font-weight: 700; color: #475569; border: 1px solid #e2e8f0;">
              ${marker.status}
            </div>
          ` : ''}
          ${marker.driverName ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">👤 ${marker.driverName}</div>` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '280px' })
        .setHTML(popupHtml);

      const mapMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        setSelectedMarker(marker);
        if (onSelectMarker) onSelectMarker(marker);
      });

      markersRef.current.push(mapMarker);
    });

    // Add route polyline
    if (routePath.length > 1) {
      if (map.getSource('route')) {
        map.removeLayer('route-line');
        map.removeSource('route');
      }
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routePath.map(p => [p[1], p[0]]),
          },
        },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });
    }

    // Add geofence circles
    geofences.forEach((geo, idx) => {
      const sourceId = `geofence-${idx}`;
      if (map.getSource(sourceId)) {
        map.removeLayer(`${sourceId}-fill`);
        map.removeLayer(`${sourceId}-outline`);
        map.removeSource(sourceId);
      }

      // Approximate circle with 64-point polygon
      const points = 64;
      const coords = [];
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * (2 * Math.PI);
        const dx = (geo.radius / 111320) * Math.cos(angle);
        const dy = (geo.radius / (111320 * Math.cos(geo.latitude * Math.PI / 180))) * Math.sin(angle);
        coords.push([geo.longitude + dy, geo.latitude + dx]);
      }
      coords.push(coords[0]); // close polygon

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: geo.name },
          geometry: { type: 'Polygon', coordinates: [coords] },
        },
      });

      map.addLayer({
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        paint: { 'fill-color': '#10b981', 'fill-opacity': 0.12 },
      });

      map.addLayer({
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        paint: { 'line-color': '#059669', 'line-width': 2, 'line-opacity': 0.7 },
      });
    });
  };

  // Update markers when data changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const doUpdate = async () => {
        const mapboxgl = (await import('mapbox-gl')).default;
        updateMapData(mapRef.current, mapboxgl);
      };
      doUpdate();
    }
  }, [markers, geofences, routePath, mapLoaded]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => {
    mapRef.current?.flyTo({ center: defaultCenter, zoom: 6, duration: 1000 });
  };

  return (
    <div className={cn('relative rounded-xl overflow-hidden shadow-neu-sm border border-slate-200', className)} style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* If no token, show a nice fallback */}
      {!mapboxToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
          <div className="text-center p-6">
            <Navigation className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="font-semibold text-sm">Map Token Required</p>
            <p className="text-xs mt-1 text-slate-400">Add NEXT_PUBLIC_MAPBOX_TOKEN to .env</p>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        <button onClick={handleZoomIn} className="w-8 h-8 bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="w-8 h-8 bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleRecenter} className="w-8 h-8 bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Control Bar Overlay */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs">
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
      <div className="absolute bottom-3 left-3 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-[11px] text-slate-700">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-3 h-3 rounded-full bg-slate-900 inline-block" /> Active Fleet
        </span>
        <span className="flex items-center gap-1.5 font-bold text-rose-700">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block animate-pulse" /> Temp Alert
        </span>
        <span className="flex items-center gap-1.5 font-bold text-sky-700">
          <span className="w-3 h-3 rounded-sm bg-sky-600 inline-block" /> Cold Hub
        </span>
        <span className="flex items-center gap-1.5 font-bold text-emerald-700">
          <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" /> Farm
        </span>
      </div>
    </div>
  );
}
