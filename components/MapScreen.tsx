import React, { useEffect, useRef, useState } from 'react';
import { SearchIcon, GymIcon, YogaIcon, ParkIcon, LocationIcon } from './icons';

// Fix: Declare google object to fix TypeScript errors for Google Maps API.
declare const google: any;

const MapScreen = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<google.maps.Map | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const trackingPath = useRef<google.maps.Polyline | null>(null);
  
  // Simulated GPS data
  const mockPath = [
    { lat: 37.772, lng: -122.214 },
    { lat: 37.774, lng: -122.216 },
    { lat: 37.776, lng: -122.214 },
    { lat: 37.778, lng: -122.216 },
    { lat: 37.780, lng: -122.214 },
  ];
  let pathIndex = 0;

  useEffect(() => {
    if (mapRef.current && !googleMap.current) {
      // Fix: Use declared 'google' object for consistency.
      googleMap.current = new google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.2148 },
        zoom: 15,
        disableDefaultUI: true,
        styles: [ // Dark mode styles
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
            { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
        ],
      });
    }
  }, []);
  
  // Simulate GPS tracking
  useEffect(() => {
    let intervalId: number;
    if (isTracking && googleMap.current) {
      if (!trackingPath.current) {
        trackingPath.current = new google.maps.Polyline({
            strokeColor: '#06b6d4', // cyan-500
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map: googleMap.current,
        });
      }
      intervalId = window.setInterval(() => {
        if (pathIndex < mockPath.length) {
            const newPoint = mockPath[pathIndex];
            const path = trackingPath.current!.getPath();
            path.push(new google.maps.LatLng(newPoint.lat, newPoint.lng));
            googleMap.current?.panTo(newPoint);
            pathIndex++;
        } else {
            setIsTracking(false);
            pathIndex = 0;
        }
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [isTracking]);

  return (
    <div className="h-full relative">
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
         <div className="relative">
          <input
            type="text"
            placeholder="Search for gyms, tracks..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="flex justify-center gap-2 mt-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm font-medium border border-gray-700 hover:bg-gray-700">
            <GymIcon className="w-4 h-4 text-cyan-400" /> Gyms
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm font-medium border border-gray-700 hover:bg-gray-700">
            <YogaIcon className="w-4 h-4 text-pink-400" /> Yoga
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm font-medium border border-gray-700 hover:bg-gray-700">
            <ParkIcon className="w-4 h-4 text-green-400" /> Parks
          </button>
        </div>
      </div>
      
      <div ref={mapRef} className="h-full w-full" />
      
      <div className="absolute bottom-20 right-4 z-10">
        <button onClick={() => googleMap.current?.panTo({ lat: 37.7749, lng: -122.2148 })} className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-600">
          <LocationIcon className="w-7 h-7 text-cyan-400" />
        </button>
        <p className="text-xs text-center text-gray-400 mt-1">Locator+</p>
      </div>

       <div className="absolute bottom-4 left-4 right-4 z-10">
         <button onClick={() => setIsTracking(prev => !prev)} className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold rounded-lg transition-colors">
            {isTracking ? 'Stop Tracking' : 'Start Mock Tracking'}
         </button>
       </div>
    </div>
  );
};

export default MapScreen;