import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'unuse',
  description: 'Documentation Website for unuse',

  themeConfig: {
    nav: [{ text: 'Home', link: '/' }],

    editLink: {
      pattern: 'https://github.com/un-ts/unuse/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/un-ts/unuse' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/unuse' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present unuse.',
    },
  },
});
