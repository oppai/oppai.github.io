import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  resolve: {
    alias: {
      'uuid/v1': fileURLToPath(new URL('./js/uuid-v1.js', import.meta.url)),
    },
  },
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) {
            return 'vendor-three';
          }
        }
      }
    }
  },
  plugins: [
    visualizer({
      open: false,
      filename: 'stats.html',
    }),
  ]
}); 
