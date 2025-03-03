import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@objects': resolve(__dirname, 'src/objects'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  // Ensure proper handling of Phaser
  optimizeDeps: {
    include: ['phaser']
  },
  // Copy assets during build
  publicDir: 'public',
  // Add support for copying static assets
  plugins: [
    {
      name: 'copy-assets',
      apply: 'build',
      enforce: 'post',
      generateBundle() {
        // Assets will be copied from public dir automatically
        console.log('Assets copied to dist folder');
      }
    }
  ]
});