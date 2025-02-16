import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import AutoImport from 'unplugin-auto-import/vite';
import { unheadComposablesImports } from 'unhead';

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [vue(), nodePolyfills({
    include: [
      'async_hooks',
      'buffer',
      'crypto',
      'fs',
      'http',
      'path',
      'process',
      'querystring',
      'stream',
      'vm',
      'zlib'
    ],
    protocolImports: true
  }), AutoImport({
    imports: [
      unheadComposablesImports[0],
    ],
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
});
