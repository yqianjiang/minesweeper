import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
