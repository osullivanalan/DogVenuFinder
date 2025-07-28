// pages/_app.tsx

import '../styles/style.css'; // Your global CSS, must come first!

import type { AppProps } from 'next/app';
import React from 'react';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
