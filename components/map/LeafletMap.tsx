import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { distanceMiles, MILES_TO_KM } from '../../lib/geo';
import * as React from 'react';
import { Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import RecenterButton from './RecenterButton';   // ← add
import type { MarkerClusterGroupProps } from 'react-leaflet-markercluster';
import FilterLegend, { VenueType } from '../ui/FilterLegend';

const DEFAULT_ZOOM = 12;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';



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


const MarkerClusterGroup = dynamic<MarkerClusterGroupProps>(
    () => import('react-leaflet-markercluster').then(mod => mod.default),
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
    Link?: string;
    State?: string;
    Phone?: string,
    Rating?: number,
    Indoor?: boolean,
    Outdoor?: boolean,
    GooglePlaceId?: string,
    ZipCode?: string,
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

const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    let c = ' marker-cluster-';

    // Density-based classification
    if (count < 10) {
        c += 'small'; // Green for low density
    } else if (count < 100) {
        c += 'medium'; // Orange for medium density  
    } else {
        c += 'large'; // Red for high density
    }

    const L = (window as any).L;
    return L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className: 'marker-cluster' + c,
        iconSize: new L.Point(40, 40)
    });
};


// Venue type definitions - MUST match exactly with your data
const VENUE_GROUPS: Record<string, { color: string; aliases: string[], emoji: string }> = {
    'Cafe': {
        color: '#dc3545',
        aliases: ['cafe', 'coffee'],
        emoji: '☕'

    },
    'Eat': {
        color: '#007bff',
        aliases: ['restaurant', 'diner'],
        emoji: '🍽️'
    },
    'Pub': {
        color: '#ffc107',
        aliases: ['pub', 'bar'],
        emoji: '🍺'
    },
    'Park': {
        color: '#28a745',
        aliases: ['park', 'campground', 'venue'],
        emoji: '🌳'
    },
};

// Helper function to get venue group
function getVenueGroup(venueType: string): string | null {
    const lowerType = venueType.toLowerCase();
    for (const [groupName, group] of Object.entries(VENUE_GROUPS)) {
        if (group.aliases.some(alias => lowerType.includes(alias))) {
            return groupName;
        }
    }
    return null;
}

// Helper function to get venue color
function getVenueColor(venueType: string): string {
    const group = getVenueGroup(venueType);
    return group ? VENUE_GROUPS[group].color : '#666666';
}

export default function LeafletMap() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [userLoc, setUserLoc] = useState<{
        lat: number;
        lng: number;
    } | null>(null);


    // Filter state - all selected by default
    const [selectedTypes, setSelectedTypes] = useState<string[]>(() =>
        Object.keys(VENUE_GROUPS)
    );

    // Build legend data with CORRECT counts
    const legendTypes: VenueType[] = Object.entries(VENUE_GROUPS).map(([groupName, group]) => {
        // Count venues that match this group's aliases
        const count = venues.filter(venue => {
            const venueType = venue.Type?.toLowerCase() || '';
            return group.aliases.some(alias => venueType.includes(alias));
        }).length;

        return {
            id: groupName,
            label: groupName,
            emoji: group.emoji, // Add this
            color: group.color,
            count: count
        };
    });

    // Filter functions
    const toggleType = (typeId: string) =>
        setSelectedTypes(current =>
            current.includes(typeId)
                ? current.filter(id => id !== typeId)
                : [...current, typeId]
        );

    const selectAll = () => setSelectedTypes(Object.keys(VENUE_GROUPS));
    const selectNone = () => setSelectedTypes([]);

    useEffect(() => {
        fetch(`${basePath}/locations.json`)

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
        <div className="flex flex-col h-full ">
            {/* LEGEND */}
            <FilterLegend
                types={legendTypes}
                selected={selectedTypes}
                toggle={toggleType}
                selectAll={selectAll}
                selectNone={selectNone}
            />

            <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100vh', width: '100%' }}
                scrollWheelZoom
            >
                <RecenterButton />
                <SetViewOnLocation userLoc={userLoc} zoom={DEFAULT_ZOOM} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                    maxZoom={50}

                />
                {userLoc && (
                    <CircleMarker
                        center={[userLoc.lat, userLoc.lng]}
                        pathOptions={{ color: '#fff', fillColor: '#ffffff', fillOpacity: 0.4 }}
                        radius={11}>
                        <Tooltip
                            direction="center"   // keeps it centred
                            permanent            // always visible
                            className="outdoor-flag"
                            offset={[0, 0]}      // no offset
                        >
                            📍</Tooltip>
                    </CircleMarker>

                )}

                <MarkerClusterGroup
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={80}            // Optimal clustering radius
                    disableClusteringAtZoom={16}     // Stop clustering at high zoom
                    //removeOutsideVisibleBounds={false} // Critical: prevents zoom issues
                    animate={true}                   // Smooth animations
                    animateAddingMarkers={true}      // Animate new markers
                >
                    {venues.map(v => {

                        const venueGroup = getVenueGroup(v.Type || '');
                        // Skip if venue group is not selected
                        if (!venueGroup || !selectedTypes.includes(venueGroup)) {
                            return null;
                        }

                        const d = distanceMiles(
                            mapCenter.lat,
                            mapCenter.lng,
                            v.Latitude,
                            v.Longitude
                        );
                        if (d > RADIUS_MILES) return null;

                        const color = getVenueColor(v.Type || '');

                        return (

                            <CircleMarker
                                key={v.GooglePlaceId ?? `${v.Latitude - v.Longitude}`}
                                center={[v.Latitude, v.Longitude]}
                                pathOptions={{
                                    color: '#fff',
                                    fillColor: color,
                                    fillOpacity: 0.9,
                                    weight: 2
                                }}
                                radius={12}

                            >
                                {v.OutDoorOnly && (
                                    <Tooltip
                                        direction="center"   // keeps it centred
                                        permanent            // always visible
                                        className="outdoor-flag"
                                        offset={[0, 0]}      // no offset
                                    >
                                        T
                                    </Tooltip>
                                )}
                                <Popup>
                                    <div className="venue-popup">
                                        <h3 className="venue-popup__title">{v.Name}</h3>
                                        <p className="venue-popup__address">{v.Address}</p>

                                        {isOpen(v.Hours) !== undefined && (
                                            <div
                                                className={`venue-popup__badge ${isOpen(v.Hours) ? "venue-popup__badge--open" : "venue-popup__badge--closed"
                                                    }`}
                                            >
                                                <span className={isOpen(v.Hours) ? "venue-popup__status-dot" : ""}>⬤</span>
                                                {isOpen(v.Hours) ? "Open" : "Closed"}
                                            </div>
                                        )}

                                        {v.OutDoorOnly && (
                                            <div className="venue-popup__badge venue-popup__outdoor-badge">
                                                <span>🌞</span>
                                                Outdoor only
                                            </div>
                                        )}
                                        {v.Info && !v.OutDoorOnly && (
                                            <p className="venue-popup__info">{v.Info}</p>
                                        )}

                                        {v.Link && (
                                            <a
                                                href={v.Link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="venue-popup__action-link"
                                            >
                                                Website ↗
                                            </a>
                                        )}
                                        {v.Phone && (
                                            <a
                                                href={`tel:${v.Phone}`}
                                                className="venue-popup__action-link"
                                            >
                                                Call: {v.Phone}
                                            </a>
                                        )}
                                        {(v.GooglePlaceId || (v.Latitude && v.Longitude)) && (
                                            <a
                                                href={
                                                    v.GooglePlaceId
                                                        ? `https://www.google.com/maps/place/?q=place_id:${v.GooglePlaceId}`
                                                        : `https://www.google.com/maps/search/?api=1&query=${v.Latitude},${v.Longitude}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="venue-popup__action-link"
                                            >
                                                Directions ↗
                                            </a>
                                        )}

                                        <div className="venue-popup__footer">
                                            {v.Type} — {v.State}
                                        </div>
                                    </div>
                                </Popup>


                            </CircleMarker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>

        </div>
    );
}
