import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env': {
      UNUSE_FRAMEWORK: 'vue',
    },
  },
});
