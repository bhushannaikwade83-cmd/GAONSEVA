import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [
    react({
      // This tells Vite to process .js and .jsx files as JSX
      include: ['**/*.{js,jsx,ts,tsx}'],
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    svgr({
      svgrOptions: {
        // svgr options
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: {
      // Add any path aliases here if needed
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(js|jsx)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      jsx: 'automatic',
    },
  },
  define: {
    'process.env': {}
  },
});
