'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issue with Next.js
const fixLeafletIcon = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
};

interface RunTrackerMapProps {
    path: [number, number][];
}

export default function RunTrackerMap({ path }: RunTrackerMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const polylineRef = useRef<L.Polyline | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        fixLeafletIcon();

        if (!mapContainerRef.current || mapRef.current) return;

        const initialCenter: [number, number] = path.length > 0 ? path[path.length - 1] : [20.5937, 78.9629];

        mapRef.current = L.map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 15,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
        }).addTo(mapRef.current);

        // Custom pulsing marker for current position
        const pulsingIcon = L.divIcon({
            className: '',
            html: `
        <div style="position:relative;width:20px;height:20px;">
          <div style="
            width:20px;height:20px;border-radius:50%;
            background:rgba(0,255,136,0.9);
            box-shadow: 0 0 0 0 rgba(0,255,136,0.6);
            animation: mapPulse 2s infinite;
          "></div>
          <style>
            @keyframes mapPulse {
              0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.6); }
              70% { box-shadow: 0 0 0 15px rgba(0,255,136,0); }
              100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
            }
          </style>
        </div>
      `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

        if (path.length > 0) {
            markerRef.current = L.marker(path[path.length - 1], { icon: pulsingIcon }).addTo(mapRef.current);
            polylineRef.current = L.polyline(path, { color: '#00ff88', weight: 4, opacity: 0.85 }).addTo(mapRef.current);
        } else {
            markerRef.current = L.marker(initialCenter, { icon: pulsingIcon }).addTo(mapRef.current);
        }

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // Update polyline + marker when path changes
    useEffect(() => {
        if (!mapRef.current || path.length === 0) return;

        const latest = path[path.length - 1];

        if (!polylineRef.current) {
            polylineRef.current = L.polyline(path, { color: '#00ff88', weight: 4, opacity: 0.85 }).addTo(mapRef.current);
        } else {
            polylineRef.current.setLatLngs(path);
        }

        if (markerRef.current) {
            markerRef.current.setLatLng(latest);
        }

        mapRef.current.panTo(latest, { animate: true });
    }, [path]);

    return (
        <div
            ref={mapContainerRef}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: 16,
                overflow: 'hidden',
            }}
        />
    );
}
