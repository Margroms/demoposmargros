import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint config moved to separate config file or removed (no longer supported in next.config)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Tesseract.js and other Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
      };
    }

    // Removed worker-loader config as it may cause build issues in Next.js 16
    // If you need workers, use Next.js built-in worker support

    return config;
  },
  // Fix lockfile warning
  outputFileTracingRoot: path.join(__dirname),
  // Empty turbopack config to silence warning when using webpack
  turbopack: {},
  // Removed experimental.esmExternals as it's not supported by Turbopack
  // and is not recommended to be modified
}

export default nextConfig
