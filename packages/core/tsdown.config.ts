import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'typeOverrides/react': 'typeOverrides/react.ts',
    'typeOverrides/vue': 'typeOverrides/vue.ts',
  },
  platform: 'neutral',
  publint: true,
});
