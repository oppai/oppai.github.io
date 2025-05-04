import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
        }
      }
    }
  },
  plugins: [
    visualizer({
      open: true,
      filename: 'stats.html',
    }),
  ]
}); 
