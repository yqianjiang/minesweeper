import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://webgames.fun/minesweeper/",
  plugins: [
    viteCompression({
      //生成压缩包.gz/.br
      verbose: true,
      disable: false,
      threshold: 1024,
      algorithm: 'gzip',
      ext: '.gz',
      // algorithm: 'brotliCompress',
      // ext: '.br',
    }),
  ]
});
