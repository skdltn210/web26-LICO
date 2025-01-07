/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import type { PreRenderedAsset } from 'rollup';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'dist',

    sourcemap: mode === 'development',

    assetsInlineLimit: 0,

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    rollupOptions: {
      output: {
        entryFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name].js',
        chunkFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name].js',
        assetFileNames: (assetInfo: PreRenderedAsset): string => {
          if (assetInfo.source && /\.(svg)$/.test(assetInfo.name || '')) {
            return 'assets/icons/[name][extname]';
          }
          return mode === 'production' ? 'assets/[hash][extname]' : 'assets/[name]-[hash][extname]';
        },
      },
    },
  },

  // Plugin configuration
  plugins: [react()],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@apis': path.resolve(__dirname, 'src/apis'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@mocks': path.resolve(__dirname, 'src/mocks'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },

  // Development server configuration
  server: {
    host: true,
    port: 3000,
  },
}));
