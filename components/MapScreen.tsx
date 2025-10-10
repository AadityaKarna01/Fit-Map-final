import React, { useEffect, useRef, useState } from 'react';
import { haversineDistance } from '../utils';
import { RunIcon } from './icons';
import { useApp } from '../App';

// Declare Leaflet 'L' object to avoid TypeScript errors.
declare const L: any;

// Fix: Add GeoJSON type definitions to resolve 'Cannot find namespace' error.
declare namespace GeoJSON {
  interface GeoJsonObject {
    type: string;
    bbox?: number[];
  }

  interface Geometry extends GeoJsonObject {
    coordinates: any;
  }

  interface Point extends Geometry {
    type: 'Point';
    coordinates: number[];
  }

  interface MultiPoint extends Geometry {
    type: 'MultiPoint';
    coordinates: number[][];
  }

  interface LineString extends Geometry {
    type: 'LineString';
    coordinates: number[][];
  }

  interface MultiLineString extends Geometry {
    type: 'MultiLineString';
    coordinates: number[][][];
  }

  interface Polygon extends Geometry {
    type: 'Polygon';
    coordinates: number[][][];
  }

  interface MultiPolygon extends Geometry {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  }

  interface GeometryCollection extends GeoJsonObject {
    type: 'GeometryCollection';
    geometries: Geometry[];
  }

  interface Feature<G extends Geometry | null = Geometry, P = any> extends GeoJsonObject {
    type: 'Feature';
    geometry: G;
    id?: string | number;
    properties: P | null;
  }

  interface FeatureCollection<G extends Geometry | null = Geometry, P = any> extends GeoJsonObject {
    type: 'FeatureCollection';
    features: Array<Feature<G, P>>;
  }
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
    const sqSize = 50;
    const strokeWidth = 5;
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * percentage) / 100;

    return (
        <svg width={sqSize} height={sqSize} viewBox={viewBox}>
            <circle
                className="stroke-current text-gray-700"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
                fill="none"
            />
            <circle
                className="stroke-current text-green-500"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
                transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                fill="none"
                style={{
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset,
                    strokeLinecap: 'round',
                    transition: 'stroke-dashoffset 0.3s ease'
                }}
            />
            <text
                className="fill-current text-white font-bold"
                x="50%"
                y="50%"
                dy=".3em"
                textAnchor="middle"
                fontSize="12px"
            >
                {`${percentage}%`}
            </text>
        </svg>
    );
};

const StatsBar = ({ duration, distance }: { duration: number; distance: number; }) => {
    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    return (
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl p-3 flex justify-between items-center text-center shadow-lg">
            <div className="flex items-center gap-2">
                <CircularProgress percentage={60} />
                <div className="text-left">
                    <p className="text-sm font-bold text-green-400">ZORCAPE</p>
                    <p className="text-xs text-gray-400">60%</p>
                </div>
            </div>
            <div className="w-px h-10 bg-gray-700 mx-2"></div>
            <div className="text-center flex-1">
                <p className="text-2xl font-bold">{formatDuration(duration)}<span className="text-base font-medium"> MIN</span></p>
                <p className="text-sm text-gray-400">{distance.toFixed(2)} KM</p>
            </div>
            <div className="w-px h-10 bg-gray-700 mx-2"></div>
            <div className="text-center flex-1">
                <p className="text-sm text-gray-400">TERRITORY</p>
                <p className="font-bold text-xl">450 <span className="text-base font-medium">POINTS</span></p>
            </div>
        </div>
    );
};

const MapScreen = () => {
  const { userProfile } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);

  // Refs for Leaflet instances
  const mapInstance = useRef<any | null>(null);
  const userMarker = useRef<any | null>(null);
  const routePolyline = useRef<any | null>(null);
  const territoriesLayer = useRef<any | null>(null);
  const watchId = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [distance, setDistance] = useState(0); // in km
  const [duration, setDuration] = useState(0); // in seconds
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState<any[]>([]);

  // Ref to get latest recording state inside watchPosition callback
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const territoriesData: GeoJSON.FeatureCollection = {
    "type": "FeatureCollection",
    "features": [
      { "type": "Feature", "properties": { "name": "YOUR TERRITORY", "owner": "user" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -70.83, 42.93 ], [ -70.83, 42.94 ], [ -70.82, 42.94 ], [ -70.82, 42.93 ], [ -70.83, 42.93 ] ] ] } },
      { "type": "Feature", "properties": { "name": "RIVAL TERRITORY", "owner": "rival" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -70.845, 42.925 ], [ -70.845, 42.935 ], [ -70.835, 42.935 ], [ -70.835, 42.925 ], [ -70.845, 42.925 ] ] ] } },
      { "type": "Feature", "properties": { "name": "UNCLAIMED", "owner": "unclaimed" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -70.84, 42.915 ], [ -70.84, 42.925 ], [ -70.83, 42.925 ], [ -70.83, 42.915 ], [ -70.84, 42.915 ] ] ] } }
    ]
  };

  // 1. Initialize map on mount and start continuous tracking
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current!, { zoomControl: false });
    const map = mapInstance.current;
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    territoriesLayer.current = L.layerGroup().addTo(map);

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'});
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' });
    darkLayer.addTo(map);
    const baseMaps = { "Dark": darkLayer, "Standard": osmLayer, "Satellite": satelliteLayer };
    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

    L.geoJSON(territoriesData, {
        style: (feature) => {
            switch (feature?.properties.owner) {
                case 'user': return {color: "#22c55e", weight: 0, fillOpacity: 0.5, fillColor: "#22c55e"};
                case 'rival': return {color: "#ef4444", weight: 0, fillOpacity: 0.5, fillColor: "#ef4444"};
                default: return {color: "#6b7280", weight: 0, fillOpacity: 0.5, fillColor: "#6b7280"};
            }
        },
        onEachFeature: (feature, layer) => {
            if (feature.properties?.name) {
                layer.bindTooltip(feature.properties.name, { permanent: true, direction: 'center', className: 'territory-label' }).openTooltip();
            }
        }
    }).addTo(map);

    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15),
      () => map.setView([42.91, -70.84], 15) // Fallback
    );

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    const userIconHTML = `<div class="player-marker"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.1,6.9c0.2-0.2,0.3-0.4,0.3-0.7c0-0.3-0.1-0.5-0.3-0.7c-0.2-0.2-0.4-0.3-0.7-0.3c-0.3,0-0.5,0.1-0.7,0.3 c-0.2,0.2-0.3,0.4-0.3,0.7c0,0.3,0.1,0.5,0.3,0.7c0.2,0.2,0.4,0.3,0.7,0.3C13.7,7.2,13.9,7.1,14.1,6.9z M15,11.3L12.8,9l-1.6,2.3 l1,5.5h1.5c0.6,0,1.1-0.2,1.5-0.6c0.4-0.4,0.6-0.9,0.6-1.5V12C15.8,11.7,15.5,11.4,15,11.3z M8.5,12.5l-2.1,1.5l-0.9-2.3 c-0.1-0.3-0.3-0.5-0.5-0.6c-0.2-0.1-0.5-0.1-0.8,0l-1,0.5C3,11.8,2.8,12,2.8,12.3c0,0.3,0.1,0.5,0.4,0.7l1.3,0.8 C4.7,14,4.8,14,5,14c0.2,0,0.4-0.1,0.5-0.2L7.3,12l1.2,1.5L7.3,18.5c-0.1,0.4,0,0.8,0.2,1.1c0.2,0.3,0.6,0.5,1,0.5 c0.1,0,0.2,0,0.3,0c0.4-0.1,0.8-0.4,1-0.8l2.3-5.2L8.5,12.5z"></path></svg></div>`;
    const userIcon = L.divIcon({ className: '', html: userIconHTML, iconSize: [44, 44], iconAnchor: [22, 22] });
    
    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      const newLatLng = L.latLng(latitude, longitude);
      setError(null);
      if (!userMarker.current) {
        userMarker.current = L.marker(newLatLng, { icon: userIcon }).addTo(map);
        if (userProfile?.displayName) {
          userMarker.current.bindTooltip(userProfile.displayName, {permanent: true, direction: 'top', offset: [0, -22], className: 'territory-label'}).openTooltip();
        }
      } else {
        userMarker.current.setLatLng(newLatLng);
      }
      if (!isRecordingRef.current) map.panTo(newLatLng);

      if (isRecordingRef.current) {
        setPath(prev => {
            const updatedPath = [...prev, newLatLng];
            if (prev.length > 0) {
                const segment = haversineDistance([prev[prev.length - 1].lat, prev[prev.length - 1].lng], [newLatLng.lat, newLatLng.lng]);
                setDistance(d => d + segment);
            }
            if (!routePolyline.current) {
                routePolyline.current = L.polyline(updatedPath, { color: '#06b6d4', weight: 4, opacity: 0.8 }).addTo(map);
            } else {
                routePolyline.current.setLatLngs(updatedPath);
            }
            return updatedPath;
        });
      }
    };
    const handleError = (err: GeolocationPositionError) => setError(`Tracking error: ${err.message}`);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      map.remove();
      mapInstance.current = null;
    };
  }, [userProfile]);

  // 2. Manage recording session based on isRecording state
  useEffect(() => {
    if (isRecording) {
        setPath([]);
        setDistance(0);
        setDuration(0);
        if (routePolyline.current) {
            routePolyline.current.remove();
            routePolyline.current = null;
        }
        timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);
    } else {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        
        if (path.length > 2 && mapInstance.current && territoriesLayer.current) {
            const startPoint = path[0];
            const endPoint = path[path.length - 1];
            const closeDistance = haversineDistance([startPoint.lat, startPoint.lng], [endPoint.lat, endPoint.lng]);
            const CAPTURE_THRESHOLD_KM = 0.05; // 50 meters

            if (closeDistance <= CAPTURE_THRESHOLD_KM) {
                const capturedPath = [...path, startPoint];
                L.polygon(capturedPath, { color: "#22c55e", weight: 1, fillOpacity: 0.5, fillColor: "#22c55e" }).addTo(territoriesLayer.current);
                if (routePolyline.current) {
                    routePolyline.current.remove();
                    routePolyline.current = null;
                }
            }
        }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); }
  }, [isRecording]);
  
  return (
    <div className="h-full relative">
      <div className="absolute top-0 left-0 right-0 p-4 z-[1000]">
         <StatsBar duration={duration} distance={distance} />
         {error && <div className="mt-2 text-center text-red-400 bg-red-500/20 p-2 rounded-lg text-sm">{error}</div>}
      </div>
      
      <div ref={mapRef} id="map" className="h-full w-full bg-gray-800" />

       <div className="absolute bottom-4 left-4 right-4 z-[1000]">
         <button onClick={() => setIsRecording(prev => !prev)} className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg text-lg tracking-wider ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90'}`}>
            {isRecording ? 'STOP CAPTURE' : 'START CAPTURE'}
         </button>
       </div>
    </div>
  );
};

export default MapScreen;
