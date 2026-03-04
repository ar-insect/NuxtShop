import { test, expect } from '@playwright/test';

test.describe('购物车功能', () => {
  test('购物车流程：添加商品并验证', async ({ page }) => {
    // 1. 访问首页
    await page.goto('/');
    
    // 2. 定位推荐商品区域
    const recommendedSection = page.locator('section', { has: page.locator('h2', { hasText: '推荐商品' }) });
    await expect(recommendedSection.locator('.grid')).toBeVisible();

    // 3. 点击第一个商品进入详情
    const firstProductLink = recommendedSection.locator('a[href^="/products/"]').first();
    // 获取商品标题用于后续验证（可选）
    // const productTitle = await firstProductLink.textContent();
    await firstProductLink.click();
    
    // 4. 在详情页点击“加入购物车”
    // 使用 .first() 以确保点击的是详情页的主按钮，而不是底部推荐列表中的按钮
    const addToCartBtn = page.locator('button:has-text("加入购物车")').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    
    // 5. 等待状态更新
    await page.waitForTimeout(1000);
    
    // 6. 访问购物车页面
    await page.goto('/cart');
    
    // 7. 验证页面标题
    await expect(page.locator('h1', { hasText: '购物车' })).toBeVisible();
    
    // 8. 验证商品是否在列表中
    // 购物车列表通常是一个 ul
    const cartList = page.locator('ul[role="list"]');
    await expect(cartList).toBeVisible();
    
    const cartItems = cartList.locator('li');
    await expect(cartItems.first()).toBeVisible();
    
    // 9. 验证订单摘要
    await expect(page.locator('text=订单总计')).toBeVisible();
  });
});
