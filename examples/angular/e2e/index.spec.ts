import { expect, test } from '@playwright/test';

test('smoke', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.goto('/');

  await expect(page).toHaveTitle('Angular unuse Example');

  await expect(page.locator('html')).toMatchAriaSnapshot(`
- document:
  - heading "Angular App" [level=1]
  - paragraph: This is a simple Angular application.
  - paragraph: "Angular Value: Hello, World!"
  - paragraph: "Is a real Angular Signal: Yes"
`);

  expect(logs).toContain('Resolved Angular Signal: Hello, World!');
});
