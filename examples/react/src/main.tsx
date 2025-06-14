import { initFrameworkImport } from '@unuse/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const root = document.querySelector('#root');

const app = createRoot(root as HTMLElement);

initFrameworkImport('react')
  .then(() => {
    app.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error: unknown) => {
    console.error('Failed to initialize framework import:', error);
  });
