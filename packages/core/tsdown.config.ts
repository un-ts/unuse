import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'solid/_framework/index': 'src/_framework/index.solid.ts',
    'solid/unResolve/index': 'src/unResolve/index.solid.ts',
  },
  exports: true,
  platform: 'neutral',
  publint: true,
});
