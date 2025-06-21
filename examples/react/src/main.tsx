import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const root = document.querySelector('#root');

const app = createRoot(root as HTMLElement);

app.render(
  <StrictMode>
    <App />
  </StrictMode>
);
