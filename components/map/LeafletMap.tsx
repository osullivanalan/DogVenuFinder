import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { distanceMiles, MILES_TO_KM } from '../../lib/geo';
import * as React from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';

const DEFAULT_ZOOM = 12;
const USER_LOC_COLOR = 'grey';   // or use '#888'/'#bbb' for a grey shade

const UserLocationMarker = ({ position }: { position: [number, number] }) =>
    position ? <CircleMarker
        center={position}
        pathOptions={{ color: USER_LOC_COLOR, fillColor: USER_LOC_COLOR, fillOpacity: 0.8 }}
        radius={12} // Size as desired
    /> : null;


const isOpen = (Hours) => {
    if (!Hours) return undefined;

    const now = new Date();
    const month = now.getMonth() + 1;
    const season = (month >= 4 && month <= 9) ? 'Summer' : 'Winter';
    const todayKey = 'Mon-Sun'; // adjust if you add per-day keys later

    const seasonHours = Hours[season];
    if (!seasonHours || !seasonHours[todayKey]) return undefined;

    const [openStr, closeStr] = seasonHours[todayKey].split(' - ');
    const toMinutes = (s) => {
        const [h, m] = s.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return undefined;
        return h * 60 + m;
    };

    const openMins = toMinutes(openStr.trim());
    const closeMins = toMinutes(closeStr.trim());
    if (openMins === undefined || closeMins === undefined) return undefined;

    const nowMins = now.getHours() * 60 + now.getMinutes();
    return openMins <= nowMins && nowMins <= closeMins;
};




const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
);
const CircleMarker = dynamic(
    () => import('react-leaflet').then(mod => mod.CircleMarker),
    { ssr: false }
);
const MarkerClusterGroup = dynamic(
    () => import('react-leaflet-markercluster').then(mod => mod.default as React.ComponentType<React.PropsWithChildren<unknown>>),
    { ssr: false }
);

// Types
type Venue = {
    Name: string;
    Address: string;
    Latitude: number;
    Longitude: number;
    Type: 'Cafe' | 'Pub' | 'Restaurant' | 'Coffee' | string;
    OutDoorOnly?: boolean;
    Hours: object; // e.g. { Monday: '09:00-17:00', ... }
    Info?: string;
    Link: string;
    Location?: string; // Optional field for additional location info
    ZipCode: string
};

const IRELAND_CENTER: [number, number] = [53.4129, -8.2439];
const RADIUS_MILES = 100;

function SetViewOnLocation({ userLoc, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (userLoc) {
            map.setView(userLoc, zoom, { animate: true });
        }
    }, [userLoc, zoom, map]);
    return null;
}

export default function LeafletMap() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [userLoc, setUserLoc] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    useEffect(() => {
        fetch('/locations.json')
            .then(res => res.json())
            .then((data: Venue[]) => setVenues(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            pos => {
                setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => setUserLoc({ lat: IRELAND_CENTER[0], lng: IRELAND_CENTER[1] }),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300_000 }
        );
    }, []);

    const mapCenter = userLoc ?? { lat: IRELAND_CENTER[0], lng: IRELAND_CENTER[1] };

    return (
        <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100vh', width: '100%' }}
            scrollWheelZoom
        >
            <SetViewOnLocation userLoc={userLoc} zoom={DEFAULT_ZOOM} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
                maxZoom={50}

            />
            {userLoc && <UserLocationMarker position={[userLoc.lat, userLoc.lng]} />}
            <MarkerClusterGroup>
                {venues.map(v => {
                    const d = distanceMiles(
                        mapCenter.lat,
                        mapCenter.lng,
                        v.Latitude,
                        v.Longitude
                    );
                    if (d > RADIUS_MILES) return null;

                    const colors: Record<string, string> = {
                        Cafe: '#dc3545',
                        Pub: '#28a745',
                        Restaurant: '#007bff',
                        Coffee: '#dc3545'
                    };

                    return (
                        <CircleMarker
                            key={`${v.Name}-${v.Latitude}`}
                            center={[v.Latitude, v.Longitude]}
                            pathOptions={{
                                color: '#000',
                                fillColor: colors[v.Type] || 'gray',
                                fillOpacity: 0.8
                            }}
                            radius={14}
                        >

                            <Popup>
                                <div className="space-y-2 w-56">
                                    <h3 className="text-lg font-bold">{v.Name}</h3>
                                    <p className="text-gray-700 text-sm">{v.Address}</p>
                                    <div className="flex items-center space-x-2">

                                        {isOpen(v.Hours) === undefined ? null
                                            : isOpen(v.Hours)
                                                ? <span className="badge badge-success">Open now</span>
                                                : <span className="badge badge-error">Closed</span>}


                                    </div>
                                    {v.OutDoorOnly && (
                                        <div className="flex items-center bg-yellow-50 border border-yellow-400 text-yellow-800 text-xs rounded px-2 py-1">
                                            <i className="fas fa-sun mr-1"></i> Outdoor only
                                        </div>
                                    )}
                                    {v.Info && !v.OutDoorOnly && (
                                        <p className="bg-blue-50 text-blue-700 text-xs rounded px-2 py-1">{v.Info}</p>
                                    )}
                                    {v.Link && (
                                        <a
                                            href={v.Link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-sm text-blue-600 underline"
                                        >
                                            Website
                                        </a>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${v.Latitude},${v.Longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm text-blue-600 underline"
                                    >
                                        Directions
                                    </a>
                                    <div className="mt-2 text-xs text-gray-500">
                                        {v.Type} — {v.Location}
                                    </div>
                                </div>
                            </Popup>

                        </CircleMarker>
                    );
                })}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
