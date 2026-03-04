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
  const firstProductLink = recommendedSection.locator('a[href^="/products/"]').first();
  await firstProductLink.click();
});

When('我点击"加入购物车"按钮', async ({ page }) => {
  const addToCartBtn = page.locator('button:has-text("加入购物车")').first();
  await expect(addToCartBtn).toBeVisible();
  await addToCartBtn.click();
  // 等待可能的状态更新
  await page.waitForTimeout(1000);
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
