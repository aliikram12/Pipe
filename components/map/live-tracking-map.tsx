'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Layers, Navigation, ZoomIn, ZoomOut, Maximize2, Shield, Radio, Truck, Warehouse, Sprout } from 'lucide-react';
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
  routePath?: [number, number][]; // [lat, lng] pairs
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletLibRef = useRef<any>(null);
  const markerLayersRef = useRef<any[]>([]);
  const geofenceLayersRef = useRef<any[]>([]);
  const routePolylineRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showPath, setShowPath] = useState(true);
  const [mapStyle, setMapStyle] = useState<'voyager' | 'osm'>('voyager');

  // Center on active marker or default to Pakistan central geography
  const defaultCenter = useMemo<[number, number]>(() => {
    if (activeMarkerId) {
      const active = markers.find((m) => m.id === activeMarkerId);
      if (active && typeof active.latitude === 'number' && typeof active.longitude === 'number') {
        return [active.latitude, active.longitude];
      }
    }
    // Default: Central Pakistan view (covering Punjab, Sindh, Motorway corridor)
    return [30.8, 72.5];
  }, [activeMarkerId, markers]);

  // Tile layer URLs (100% free, zero token required)
  const tileLayers = {
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  const tileAttribution = {
    voyager: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
    osm: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    const initLeaflet = async () => {
      if (!mapContainerRef.current || leafletMapRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (isCancelled || !mapContainerRef.current) return;
        leafletLibRef.current = L;

        // Ensure container is clean
        const container = mapContainerRef.current;
        if ((container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
        }

        const map = L.map(container, {
          center: defaultCenter,
          zoom: 6.5,
          zoomControl: false,
          attributionControl: false,
        });

        // Add sleek attribution
        L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

        // Add base tile layer
        const tileLayer = L.tileLayer(tileLayers[mapStyle], {
          attribution: tileAttribution[mapStyle],
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        (map as any)._activeTileLayer = tileLayer;
        leafletMapRef.current = map;

        // Invalidate size to ensure crisp rendering
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
          setMapReady(true);
        }, 150);
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    };

    initLeaflet();

    return () => {
      isCancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  // 2. Handle map style changes
  useEffect(() => {
    const map = leafletMapRef.current;
    const L = leafletLibRef.current;
    if (!map || !L) return;

    if (map._activeTileLayer) {
      map.removeLayer(map._activeTileLayer);
    }

    const newLayer = L.tileLayer(tileLayers[mapStyle], {
      attribution: tileAttribution[mapStyle],
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    map._activeTileLayer = newLayer;
  }, [mapStyle]);

  // 3. Update Markers, Geofences, and Route Polyline
  const renderMapLayers = useCallback(() => {
    const map = leafletMapRef.current;
    const L = leafletLibRef.current;
    if (!map || !L) return;

    // --- A. CLEAR OLD LAYERS ---
    markerLayersRef.current.forEach((m) => m.remove());
    markerLayersRef.current = [];

    geofenceLayersRef.current.forEach((g) => g.remove());
    geofenceLayersRef.current = [];

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    // --- B. RENDER GEOFENCES ---
    if (showGeofences && geofences.length > 0) {
      geofences.forEach((geo) => {
        const isFarm = geo.type === 'FARM';
        const circle = L.circle([geo.latitude, geo.longitude], {
          radius: geo.radius,
          color: isFarm ? '#059669' : '#0284c7',
          fillColor: isFarm ? '#10b981' : '#38bdf8',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '4, 4',
        }).addTo(map);

        circle.bindTooltip(`📍 Geofence: ${geo.name} (${Math.round(geo.radius / 1000)}km)`, {
          permanent: false,
          direction: 'top',
          className: 'bg-white text-slate-800 text-xs px-2 py-1 rounded shadow-md border font-semibold',
        });

        geofenceLayersRef.current.push(circle);
      });
    }

    // --- C. RENDER ROUTE TRAIL ---
    if (showPath && routePath.length > 1) {
      // Glow background line
      const glowLine = L.polyline(routePath, {
        color: '#38bdf8',
        weight: 6,
        opacity: 0.4,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Core route line
      const coreLine = L.polyline(routePath, {
        color: '#0284c7',
        weight: 3.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = L.featureGroup([glowLine, coreLine]);
    }

    // --- D. RENDER MARKERS ---
    markers.forEach((marker) => {
      const isVehicle = marker.type === 'VEHICLE';
      const isAlert =
        isVehicle &&
        typeof marker.temperature === 'number' &&
        (marker.temperature > 8 || marker.temperature < 0);

      let pinColor = '#15803d'; // Farm
      let emoji = '🌾';

      if (isVehicle) {
        pinColor = isAlert ? '#ef4444' : '#0f172a';
        emoji = '🚛';
      } else if (marker.type === 'WAREHOUSE') {
        pinColor = '#0284c7';
        emoji = '🏭';
      }

      const pulseStyle = isAlert ? 'animation: pulse-ring 1.5s ease-out infinite;' : '';

      const markerHtml = `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="
            width: 36px; height: 36px;
            background: ${pinColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2.5px solid #ffffff;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            ${pulseStyle}
          ">
            <span style="transform: rotate(45deg); font-size: 16px; user-select: none;">${emoji}</span>
          </div>
          ${
            typeof marker.temperature === 'number'
              ? `<div style="
                  position: absolute; top: -8px; right: -8px;
                  background: ${isAlert ? '#dc2626' : '#166534'};
                  color: #ffffff;
                  font-family: Inter, sans-serif;
                  font-size: 9px;
                  font-weight: 800;
                  padding: 1px 5px;
                  border-radius: 9999px;
                  border: 1.5px solid #ffffff;
                  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
                  white-space: nowrap;
                ">
                  ${marker.temperature > 0 ? '+' : ''}${marker.temperature.toFixed(1)}°
                </div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 36],
        popupAnchor: [0, -34],
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: customIcon });

      // Rich formatted popup
      const popupHtml = `
        <div style="min-width: 210px; padding: 12px; font-family: Inter, system-ui, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${
              isAlert ? '#dc2626' : '#047857'
            }; letter-spacing: 0.05em;">
              ${marker.type}
            </span>
            ${
              marker.status
                ? `<span style="font-size: 10px; font-weight: 700; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    ${marker.status}
                  </span>`
                : ''
            }
          </div>

          <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${emoji} ${marker.name}
          </h4>

          ${
            marker.code
              ? `<div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Reference: <strong style="color: #1e293b;">${marker.code}</strong></div>`
              : ''
          }

          ${
            marker.cropType
              ? `<div style="font-size: 11px; color: #059669; font-weight: 600; margin-bottom: 6px;">🌿 ${marker.cropType}</div>`
              : ''
          }

          <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            ${
              typeof marker.temperature === 'number'
                ? `<div style="
                    background: ${isAlert ? '#fef2f2' : '#f0fdf4'};
                    border: 1px solid ${isAlert ? '#fecaca' : '#bbf7d0'};
                    border-radius: 8px;
                    padding: 6px 8px;
                    text-align: center;
                  ">
                    <span style="font-size: 9px; font-weight: 700; color: ${isAlert ? '#991b1b' : '#166534'}; text-transform: uppercase; display: block;">Reefer Temp</span>
                    <strong style="font-size: 13px; color: ${isAlert ? '#dc2626' : '#15803d'};">
                      ${marker.temperature > 0 ? '+' : ''}${marker.temperature.toFixed(1)}°C
                    </strong>
                  </div>`
                : ''
            }

            ${
              typeof marker.speed === 'number'
                ? `<div style="
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 6px 8px;
                    text-align: center;
                  ">
                    <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">GPS Speed</span>
                    <strong style="font-size: 13px; color: #0284c7;">
                      ${marker.speed} km/h
                    </strong>
                  </div>`
                : ''
            }
          </div>

          ${
            marker.driverName
              ? `<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #475569; display: flex; align-items: center; gap: 4px;">
                  <span>👤</span>
                  <span>Driver: <strong>${marker.driverName}</strong></span>
                </div>`
              : ''
          }
        </div>
      `;

      leafletMarker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'custom-leaflet-popup',
      });

      leafletMarker.on('click', () => {
        if (onSelectMarker) onSelectMarker(marker);
      });

      leafletMarker.addTo(map);
      markerLayersRef.current.push(leafletMarker);
    });
  }, [markers, geofences, routePath, showGeofences, showPath, onSelectMarker]);

  // Re-render markers/geofences whenever inputs change
  useEffect(() => {
    if (mapReady) {
      renderMapLayers();
    }
  }, [mapReady, renderMapLayers]);

  // Zoom and Recenter handlers
  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();
  const handleRecenter = () => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (markers.length > 0) {
      const L = leafletLibRef.current;
      const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude]));
      map.flyToBounds(bounds.pad(0.2), { duration: 1 });
    } else {
      map.flyTo(defaultCenter, 6.5, { duration: 1 });
    }
  };

  return (
    <div
      className={cn('relative rounded-2xl overflow-hidden shadow-neu-sm border border-slate-200 bg-slate-100', className)}
      style={{ height }}
    >
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" tabIndex={0} />

      {/* Top Left Navigation Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-white active:scale-95 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-white active:scale-95 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          title="Recenter Map Bounds"
          className="w-8 h-8 bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-white active:scale-95 transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Top Right Layers & Map Mode Control */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
        <div className="flex items-center gap-1 text-slate-600 font-semibold mr-1">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Layers:</span>
        </div>

        {/* Geofence Toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 hover:text-emerald-700 transition">
          <input
            type="checkbox"
            checked={showGeofences}
            onChange={(e) => setShowGeofences(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
          />
          <span className="font-bold">Geofences</span>
        </label>

        <span className="w-px h-3.5 bg-slate-300 mx-1" />

        {/* Route Trail Toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 hover:text-sky-700 transition">
          <input
            type="checkbox"
            checked={showPath}
            onChange={(e) => setShowPath(e.target.checked)}
            className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
          />
          <span className="font-bold">Routes</span>
        </label>

        <span className="w-px h-3.5 bg-slate-300 mx-1" />

        {/* Map Tile Style Switcher */}
        <button
          onClick={() => setMapStyle(mapStyle === 'voyager' ? 'osm' : 'voyager')}
          className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
          title="Toggle Tile Style"
        >
          {mapStyle === 'voyager' ? 'Carto Voyager' : 'OpenStreetMap'}
        </button>
      </div>

      {/* Bottom Left Telemetry Status Legend */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 sm:gap-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-[11px] text-slate-700">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" /> Active Fleet (M-2 / M-5)
        </span>
        <span className="flex items-center gap-1.5 font-bold text-rose-700">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block animate-pulse" /> Temp Breach (&gt;8°C)
        </span>
        <span className="flex items-center gap-1.5 font-bold text-sky-700">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-600 inline-block" /> Cold Hub
        </span>
        <span className="flex items-center gap-1.5 font-bold text-emerald-700">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> Farm
        </span>
      </div>

      {/* Live Status Chip Bottom Right */}
      <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center gap-1.5 bg-emerald-50/90 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur">
        <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
        <span>Telemetry Live • 0 Token Required</span>
      </div>
    </div>
  );
}
