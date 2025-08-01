// pages/index.tsx
import dynamic from 'next/dynamic';
import Head from 'next/head';
import LoadingScreen from '../components/ui/LoadingScreen';
import React from 'react';
import 'leaflet/dist/leaflet.css';

import { useRef } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const faviconPath = `${basePath}/favicon.png`;
const LeafletMap = dynamic(() => import('../components/map/LeafletMap'), {
    ssr: false,
    loading: () => <LoadingScreen message="Loading map…" />
});

export default function HomePage() {
    const mapRef = useRef(null);
    return (
        <>
            <Head>
                <title>Find Doggie Venues Near Me</title>
                <meta name="description" content="Discover cafés, pubs, and restaurants within 100 miles." />
                <link rel="icon" href={faviconPath} />

            </Head>
            {/*<Header/>*/}
            <LeafletMap />
        </>
    );
}
