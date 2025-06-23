import { expect, test } from '@playwright/test';

test('smoke', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.goto('/');

  await expect(page).toHaveTitle('React unuse Example');

  await expect(page.locator('html')).toMatchAriaSnapshot(`
- document:
  - heading "React App" [level=1]
  - paragraph: This is a simple React application.
  - paragraph: "React Value: Hello, World!"
  - paragraph: "Is a real React State: Yes"
`);

  expect(logs).toContain('Resolved React State: [Hello, World!, ]');
});
