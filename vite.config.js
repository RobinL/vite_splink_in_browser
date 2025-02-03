import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],

  build: {
    target: 'esnext',
    cssCodeSplit: false,
    minify: false,
    rollupOptions: {
      output: { inlineDynamicImports: true },

    },

  }
});