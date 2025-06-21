import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = resolve(import.meta.dirname, '..', 'dist');

export async function detectInstalledFramework() {
  const pathToPackageJson = import.meta.resolve(
    `file://${pathToFileURL(resolve('./package.json', process.cwd())).pathname}/package.json`
  );

  const { default: pkg } = await import(pathToPackageJson, {
    with: { type: 'json' },
  });

  const directDependencies = Object.keys(pkg.dependencies || {});

  const hasAngular = directDependencies.includes('@angular/core');
  const hasReact = directDependencies.includes('react');
  const hasSolid = directDependencies.includes('solid-js');
  const hasVue = directDependencies.includes('vue');

  if ([hasAngular, hasReact, hasSolid, hasVue].filter(Boolean).length > 1) {
    console.warn(
      'Multiple frameworks detected. Please specify the framework explicitly.'
    );
    return null;
  }

  if (hasAngular) {
    return 'angular';
  }

  if (hasReact) {
    return 'react';
  }

  if (hasSolid) {
    return 'solid';
  }

  if (hasVue) {
    return 'vue';
  }

  return null;
}

function patchDistCode(method, framework) {
  const src = join(dir, framework, method, 'index.js');
  const dest = join(dir, 'index.js');

  let sourceIndexContent = readFileSync(src, 'utf8');
  let distIndexContent = readFileSync(dest, 'utf8');

  // unlink for pnpm, #92
  try {
    unlinkSync(dest);
  } catch (error) {
    console.error(error);
  }

  const regionSrcStart = sourceIndexContent.indexOf(
    `//#region src/${method}/index.${framework}.ts`
  );
  const regionSrcEnd =
    sourceIndexContent.indexOf('//#endregion', regionSrcStart) +
    '//#endregion'.length;

  const sourceIndexContentCode = sourceIndexContent.slice(
    regionSrcStart,
    regionSrcEnd
  );

  // Replace the content between `//#region src/unResolve/index.ts` and `//#endregion` with the content of `src/unResolve/index.solid.ts`
  const regionDistStart = distIndexContent.indexOf(
    `//#region src/${method}/index.ts`
  );
  const regionDistEnd =
    distIndexContent.indexOf('//#endregion', regionDistStart) +
    '//#endregion'.length;

  distIndexContent =
    distIndexContent.slice(0, regionDistStart) +
    sourceIndexContentCode +
    distIndexContent.slice(regionDistEnd);

  if (method === '_framework') {
    // Get first line of the sourceIndexContent and prepend it to the distIndexContent
    // It's the framework import statement
    const firstLine = sourceIndexContent.split('\n')[0];
    distIndexContent = `${firstLine}\n${distIndexContent}`;
  }

  writeFileSync(dest, distIndexContent, 'utf8');
}

export function switchFramework(framework) {
  patchDistCode('_framework', framework);
  patchDistCode('unResolve', framework);
  // rewriteCode('index.d.ts', framework);
}
