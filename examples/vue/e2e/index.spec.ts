import { expect, test } from '@playwright/test';

test('smoke', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(msg.text()));

  await page.goto('/');

  await expect(page).toHaveTitle('Vue unuse Example');

  await expect(page.locator('html')).toMatchAriaSnapshot(`
- document:
  - heading "Vue App" [level=1]
  - paragraph: This is a simple Vue application.
  - paragraph: "Signal Value: Hello, World!"
  - paragraph: "Is a real Vue Ref: Yes"
`);

  expect(logs).toContain('Resolved Vue Ref: RefImpl');
});
