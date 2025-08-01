// pages/_app.tsx


import '../styles/globals.css'; // Tailwind CSS - MUST come first
import 'leaflet/dist/leaflet.css'; // Leaflet CSS only
import '../styles/style.css'; // Import Leaflet CSS

import type { AppProps } from 'next/app';
import React from 'react';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
