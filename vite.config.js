import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  optimizeDeps: { include: ['three-nebula/build/three-nebula.js'] },
  build: {
    outDir: 'docs',
    // Cached HTML can still reference chunks from an earlier Pages deployment.
    emptyOutDir: false,
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
