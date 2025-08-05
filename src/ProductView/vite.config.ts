import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..', '../..', './public']
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'indexProduct.html'),
        water: resolve(__dirname, 'public/WATER.html')
      }
    },
    esbuildOptions: {
      target: 'esnext'
    }
  },
  optimizeDeps: {
    include: ['three'],
    exclude: ['lucide-react']
  },
  resolve: {
    alias: {
      'three': resolve(__dirname, '../../node_modules/three'),
      'three/addons': resolve(__dirname, '../../node_modules/three/examples/jsm'),
      'three/nodes': resolve(__dirname, '../../node_modules/three/examples/jsm/nodes/Nodes.js')
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.png', '**/*.jpg', '**/*.svg']
});