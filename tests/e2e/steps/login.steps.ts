import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

// Given('我在首页', async ({ page }) => {
//   await page.goto('/');
// });

When('我点击导航栏的登录按钮', async ({ page }) => {
  const loginBtn = page.locator('header button', { hasText: '登录' });
  await expect(loginBtn).toBeVisible({ timeout: 15000 });
  await loginBtn.click();
  // 等待登录弹窗出现（考虑到 ClientOnly 水合与过渡）
  await expect(page.locator('.modal-mask')).toBeVisible({ timeout: 15000 });
});

When('我在弹窗中输入用户名 {string} 和密码 {string}', async ({ page }, username, password) => {
  const modal = page.locator('.modal-mask');
  await modal.locator('input[name="username"]').fill(username);
  await modal.locator('input[name="password"]').fill(password);
});

When('我点击弹窗中的登录按钮', async ({ page }) => {
  const modal = page.locator('.modal-mask');
  const submitBtn = modal.locator('button[type="submit"]');
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();
});

Then('我应该看到退出登录按钮', async ({ page }) => {
  await expect(page.locator('button', { hasText: '退出登录' })).toBeVisible({ timeout: 15000 });
});

Given('我已经登录', async ({ page }) => {
  await page.goto('/');
  await page.locator('header button', { hasText: '登录' }).click();
  const modal = page.locator('.modal-mask');
  await modal.locator('input[name="username"]').fill('admin');
  await modal.locator('input[name="password"]').fill('123456');
  await modal.locator('button[type="submit"]').click();
  await expect(page.locator('button', { hasText: '退出登录' })).toBeVisible({ timeout: 15000 });
});
