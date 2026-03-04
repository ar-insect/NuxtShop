import { createBdd } from 'playwright-bdd';

const { Then } = createBdd();

Then('我截图保存为 {string}', async ({ page }, name: string) => {
  await page.screenshot({ path: `tests/e2e/screenshots/${name}.png` });
});

Then('我全屏截图保存为 {string}', async ({ page }, name: string) => {
  await page.screenshot({ path: `tests/e2e/screenshots/${name}.png`, fullPage: true });
});
