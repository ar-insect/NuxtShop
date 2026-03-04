import { test, expect } from '@playwright/test';

test.describe('用户认证流程', () => {
  test('使用正确凭据登录', async ({ page }) => {
    await page.goto('/login');
    
    // 1. 输入用户名和密码
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', '123456');
    
    // 2. 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 3. 验证跳转
    // 等待 URL 变化，不应再是 /login
    await page.waitForURL((url) => !url.toString().includes('/login'));
    
    // 4. 验证登录状态
    // 这里我们可以检查是否有 Cookie，或者页面上是否有用户信息
    // 比如检查 Header 上是否有“退出”或者用户头像
    // 也可以检查 localStorage
    // const token = await page.evaluate(() => localStorage.getItem('token'));
    // expect(token).toBeTruthy();
  });

  test('使用错误凭据登录失败', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    
    await page.click('button[type="submit"]');
    
    // 验证是否仍然在登录页
    expect(page.url()).toContain('/login');
    
    // 验证是否有错误提示 (假设有 Alert 或 Toast)
    // await expect(page.locator('.error-message')).toBeVisible();
  });
});
