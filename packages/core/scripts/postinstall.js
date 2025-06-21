import { detectInstalledFramework, switchFramework } from './utils.js';

const framework = await detectInstalledFramework();

if (framework) {
  switchFramework(framework);
}
