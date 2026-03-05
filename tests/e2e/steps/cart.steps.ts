import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('我在首页', async ({ page }) => {
  await page.goto('/');
});

When('我点击第一个推荐商品进入详情页', async ({ page }) => {
  // 等待推荐商品区域加载
  const recommendedSection = page.locator('section', { has: page.locator('h2', { hasText: '推荐商品' }) });
  await expect(recommendedSection.locator('.grid').first()).toBeVisible();
  
  // 点击第一个商品
  const firstProductTitle = recommendedSection.locator('h3').first();
  await firstProductTitle.click();
});

When('我点击"加入购物车"按钮', async ({ page }) => {
  const addToCartBtn = page.locator('button:has-text("加入购物车")').first();
  try {
    await expect(addToCartBtn).toBeVisible({ timeout: 2000 });
  } catch {
    // 未登录时，先走登录弹窗
    const loginHintBtn = page.getByRole('button', { name: '立即登录' }).first();
    const hasLoginHint = await loginHintBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasLoginHint) {
      await loginHintBtn.click();
      const modal = page.locator('.modal-mask');
      await expect(modal).toBeVisible({ timeout: 10000 });
      await modal.locator('input[name="username"]').fill('admin');
      await modal.locator('input[name="password"]').fill('123456');
      await modal.locator('button[type="submit"]').click();
      // 等待登录完成
      await expect(page.locator('button', { hasText: '退出登录' })).toBeVisible({ timeout: 15000 });
    }
    // 登录后再找按钮
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
  }
  await addToCartBtn.click();
  await page.waitForTimeout(800);
});

Then('我应该在购物车页面看到该商品', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.locator('h1', { hasText: '购物车' })).toBeVisible();
  const cartList = page.locator('ul[role="list"]');
  await expect(cartList).toBeVisible();
  const cartItems = cartList.locator('li');
  await expect(cartItems.first()).toBeVisible();
});

Then('购物车中应该显示"订单总计"', async ({ page }) => {
  await expect(page.locator('text=订单总计')).toBeVisible();
});
