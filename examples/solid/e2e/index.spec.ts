import { expect, test } from '@playwright/test';

test('smoke', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.goto('/');

  await expect(page).toHaveTitle('Solid unuse Example');

  await expect(page.locator('html')).toMatchAriaSnapshot(`
- document:
  - heading "Solid App" [level=1]
  - paragraph: This is a simple Solid application.
  - paragraph: "Signal Value: Hello, World!"
  - paragraph: "Is a real Solid Signal: Yes"
`);

  expect(logs).toContain('Resolved Solid Signal: [, ]');
});
