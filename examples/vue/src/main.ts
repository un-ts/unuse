import { initFrameworkImport } from 'unuse';
import 'unuse/vue';
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

initFrameworkImport('vue')
  .then(() => {
    app.mount('#app');
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error: unknown) => {
    console.error('Failed to initialize framework import:', error);
  });
