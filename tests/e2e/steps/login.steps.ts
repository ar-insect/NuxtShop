import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('我在登录页面', async ({ page }) => {
  await page.goto('/login');
});

When('我输入用户名 {string} 和密码 {string}', async ({ page }, username, password) => {
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
});

When('我点击登录按钮', async ({ page }) => {
  const loginBtn = page.locator('button[type="submit"]');
  await expect(loginBtn).toBeEnabled();
  await loginBtn.click();
});

Then('我应该跳转到首页', async ({ page }) => {
  await expect(page.locator('button', { hasText: '退出登录' })).toBeVisible({ timeout: 15000 });
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
});

Given('我已经登录', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '123456')
  await page.click('button[type="submit"]')
  await expect(page.locator('button', { hasText: '退出登录' })).toBeVisible({ timeout: 15000 })
})
