/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // target: ['chrome64', 'edge79', 'safari11.1', 'firefox67', 'opera51', 'ios12'],
    lib: {
      entry: resolve(__dirname, './src/main.js'),
      name: 'LeadersProgram',
      fileName: 'leaders',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
