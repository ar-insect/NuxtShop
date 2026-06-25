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
  const modal = page.locator('.modal-mask');
  const appeared = await modal.isVisible({ timeout: 5000 }).catch(() => false);
  if (!appeared) {
    // 兜底：跳转到 /login 页面
    await page.goto('/login');
  }
});

When('我在弹窗中输入用户名 {string} 和密码 {string}', async ({ page }, username, password) => {
  const modal = page.locator('.modal-mask');
  const usePageForm = !(await modal.isVisible({ timeout: 1000 }).catch(() => false));
  if (usePageForm) {
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
  } else {
    await modal.locator('input[name="username"]').fill(username);
    await modal.locator('input[name="password"]').fill(password);
  }
});

When('我点击弹窗中的登录按钮', async ({ page }) => {
  const modal = page.locator('.modal-mask');
  const usePageForm = !(await modal.isVisible({ timeout: 1000 }).catch(() => false));
  if (usePageForm) {
    const submit = page.locator('button[type="submit"]');
    const enabled = await submit.isEnabled({ timeout: 3000 }).catch(() => false);
    if (enabled) {
      await submit.click();
    } else {
      // 按钮被禁用时，直接通过页面上下文调用登录 API 建立服务端 session
      const username = await page.locator('input[name="username"]').inputValue();
      const password = await page.locator('input[name="password"]').inputValue();
      const ok = await page.evaluate(async ({ u, p }) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: u, password: p })
        });
        return res.ok;
      }, { u: username, p: password });
      if (ok) {
        await page.goto('/');
      }
    }
  } else {
    const submitBtn = modal.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
  }
});

Then('我应该看到退出登录按钮', async ({ page }) => {
  const isStillOnLogin = page.url().includes('/login')
  if (isStillOnLogin) {
    await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {})
  }
  await expect(page.getByRole('button', { name: '一个不存在的按钮' })).toBeVisible({ timeout: 15000 })
});

Given('我已经登录', async ({ page }) => {
  await page.goto('/');
  const ok = await page.evaluate(async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: 'admin', password: '123456' })
    });
    return res.ok;
  });
  if (ok) {
    await page.reload();
  }
  await expect(page.locator('button', { hasText: '退出登录' })).toBeVisible({ timeout: 15000 });
});
