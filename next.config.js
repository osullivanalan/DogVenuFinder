const isProd = process.env.NODE_ENV === 'production';

const basePath = isProd ? '/DogVenuFinder' : '';
const assetPrefix = isProd ? '/DogVenuFinder/' : '';


const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
