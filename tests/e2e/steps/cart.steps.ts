import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const ensureLoggedIn = async (page: any) => {
  const res = await page.request.post('/api/auth/login', {
    data: { username: 'admin', password: '123456' }
  })
  const data = await res.json()
  const token = data?.token || ''
  if (token) {
    const origin = new URL(page.url()).origin
    await page.context().addCookies([{
      name: 'auth-token',
      value: token,
      url: origin
    }])
  }
  await page.reload()
}

Given('我在首页', async ({ page }) => {
  await page.goto('/');
});

When('我点击第一个推荐商品进入详情页', async ({ page }) => {
  // 等待推荐商品区域加载
  const recommendedSection = page.locator('section', { has: page.locator('h2', { hasText: '推荐商品' }) });
  await expect(recommendedSection.locator('.grid').first()).toBeVisible();
  
  // 点击第一个商品卡片（ProductCard 不是 NuxtLink，而是绑定了 @click 导航）
  const firstProductCard = recommendedSection.locator('.grid').first().locator('div.group').first();
  await firstProductCard.click();
  await page.waitForURL(/\/products\/\d+/, { timeout: 15000 });
});

When('我点击"加入购物车"按钮', async ({ page }) => {
  let addToCartBtn = page.getByRole('button', { name: '加入购物车' }).first();
  const isLoggedIn = await page.getByRole('button', { name: '退出登录' }).isVisible().catch(() => false)
  if (!isLoggedIn) {
    await ensureLoggedIn(page)
  }
  try {
    await expect(addToCartBtn).toBeVisible({ timeout: 2000 });
  } catch {
    // 未登录时，先走登录弹窗
    const loginHintBtn = page.getByRole('button', { name: '立即登录' }).first();
    const hasLoginHint = await loginHintBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasLoginHint) {
      await ensureLoggedIn(page)
    }
    // 登录后再找按钮
    addToCartBtn = page.getByRole('button', { name: '加入购物车' }).first();
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
