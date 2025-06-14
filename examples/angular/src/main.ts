import { bootstrapApplication } from '@angular/platform-browser';
import { initFrameworkImport } from '@unuse/angular';
import { App } from './app/app';
import { appConfig } from './app/app.config';

initFrameworkImport('angular')
  .then(() => bootstrapApplication(App, appConfig))
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error: unknown) => console.error(error));
