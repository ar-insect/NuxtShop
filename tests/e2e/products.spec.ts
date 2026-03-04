import { test, expect } from '@playwright/test';

test.describe('商品浏览功能', () => {
  test('首页应显示商品列表', async ({ page }) => {
    await page.goto('/');
    
    // 等待推荐商品区域加载
    // 使用更具体的定位方式：查找包含“推荐商品”标题的 section 下的 grid
    const recommendedSection = page.locator('section', { has: page.locator('h2', { hasText: '推荐商品' }) });
    const productGrid = recommendedSection.locator('.grid');
    
    await expect(productGrid).toBeVisible();
    
    // 检查是否有商品图片
    const images = productGrid.locator('img');
    await expect(images.first()).toBeVisible();
  });

  test('点击商品应跳转到详情页', async ({ page }) => {
    await page.goto('/');
    
    const recommendedSection = page.locator('section', { has: page.locator('h2', { hasText: '推荐商品' }) });
    
    // 等待商品加载
    await expect(recommendedSection.locator('.grid')).toBeVisible();

    // 查找第一个商品链接并点击
    // 商品卡片本身可能就是链接，或者是其中的 NuxtLink
    const firstProductLink = recommendedSection.locator('a[href^="/products/"]').first();
    await firstProductLink.click();
    
    // 验证 URL 是否包含 /products/
    await expect(page).toHaveURL(/\/products\/\d+/);
    
    // 验证详情页元素
    // 使用 .first() 以避免匹配到页面底部可能存在的推荐商品中的按钮
    await expect(page.locator('button:has-text("加入购物车")').first()).toBeVisible();
  });
});
