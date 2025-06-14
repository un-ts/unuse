import { initFrameworkImport } from '@unuse/solid';
import { render } from 'solid-js/web';
import App from './App';

const root = document.querySelector('#root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  );
}

initFrameworkImport('solid')
  .then(() => {
    render(() => <App />, root as HTMLElement);
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error: unknown) => {
    console.error('Failed to initialize framework import:', error);
  });
