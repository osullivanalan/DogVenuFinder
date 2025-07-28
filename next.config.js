// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  // Optional: if you want static HTML export + GitHub Pages
  output: 'export',

  basePath: '/DogVenuFinder',
  assetPrefix: '/DogVenuFinder/',

  images: {
    unoptimized: true // GitHub Pages cannot serve image optimizer
  }
};
