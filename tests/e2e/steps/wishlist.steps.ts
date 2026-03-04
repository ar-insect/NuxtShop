import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

When('我点击"加入收藏"按钮', async ({ page }) => {
  const btn = page.getByRole('button', { name: '加入收藏' }).first();
  try {
    await expect(btn).toBeVisible({ timeout: 2000 });
  } catch {
    // 未登录场景，触发登录弹窗
    const loginHintBtn = page.getByRole('button', { name: '立即登录' }).first();
    const hasLoginHint = await loginHintBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasLoginHint) {
      await loginHintBtn.click();
      const modal = page.locator('.modal-mask');
      await expect(modal).toBeVisible({ timeout: 10000 });
      await modal.locator('input[name="username"]').fill('admin');
      await modal.locator('input[name="password"]').fill('123456');
      await modal.locator('button[type="submit"]').click();
      await expect(page.locator('button', { hasText: '退出登录' })).toBeVisible({ timeout: 15000 });
    }
    await expect(btn).toBeVisible({ timeout: 10000 });
  }
  await btn.click();
});

Then('收藏夹图标上的数字应该增加', async ({ page }) => {
  const badge = page.locator('a[href="/wishlist"] span').first();
  await expect(badge).toBeVisible();
  await expect
    .poll(async () => {
      const text = await badge.textContent();
      return Number((text || '').trim() || 0);
    })
    .toBeGreaterThan(0);
});

When('我点击顶部导航栏的"收藏夹"图标', async ({ page }) => {
  await page.locator('a[href="/wishlist"]').first().click();
});

Then('我应该在收藏夹页面看到该商品', async ({ page }) => {
  await expect(page).toHaveURL('/wishlist');
  await expect(page.locator('h1', { hasText: '我的收藏' })).toBeVisible();
  const main = page.getByRole('main');
  await expect(main.locator('a[href^="/products/"]').first()).toBeVisible();
});

Given('我在收藏夹页面', async ({ page }) => {
  await page.goto('/wishlist');
  await expect(page.locator('h1', { hasText: '我的收藏' })).toBeVisible();
});

Given('收藏夹中已有商品', async ({ page }) => {
  const emptyState = page.locator('text=您的收藏夹是空的');
  const main = page.getByRole('main');

  await expect(page.locator('h1', { hasText: '我的收藏' })).toBeVisible();

  await expect
    .poll(async () => {
      if (await emptyState.isVisible()) return 'empty';
      if ((await main.locator('a[href^="/products/"]').count()) > 0) return 'has-items';
      return 'none';
    })
    .not.toBe('none');

  if (await emptyState.isVisible()) {
    await page.goto('/');
    const recommendedSection = page.locator('section', { has: page.locator('h2', { hasText: '推荐商品' }) });
    await expect(recommendedSection.locator('.grid').first()).toBeVisible();
    await recommendedSection.locator('a[href^="/products/"]').first().click();
    await page.getByRole('button', { name: '加入收藏' }).first().click();
    await page.goto('/wishlist');
    await expect(page.locator('h1', { hasText: '我的收藏' })).toBeVisible();
  }

  await expect(emptyState).not.toBeVisible({ timeout: 15000 });
  const itemLinks = main.locator('a[href^="/products/"]');
  await expect(itemLinks.first()).toBeVisible({ timeout: 15000 });

  // 为了让“移除商品”场景可预测：确保收藏夹里只有 1 个商品
  // 如果存在多个商品，先移除多余的，保留 1 个
  const removeButtons = main.locator('button').filter({ hasNotText: '加入购物车' });
  await expect
    .poll(async () => itemLinks.count())
    .toBeGreaterThan(0);

  while ((await itemLinks.count()) > 1) {
    await removeButtons.first().click();
    await expect
      .poll(async () => itemLinks.count())
      .toBeLessThanOrEqual(1);
  }
});

When('我点击商品的"移除"按钮', async ({ page }) => {
  await expect(page.locator('h1', { hasText: '我的收藏' })).toBeVisible();
  const main = page.getByRole('main');
  const removeBtn = main.locator('button').filter({ hasNotText: '加入购物车' }).first();
  await expect(removeBtn).toBeVisible();
  await removeBtn.click();
});

Then('该商品应该从收藏夹中消失', async ({ page }) => {
  const emptyState = page.locator('text=您的收藏夹是空的');
  await expect(emptyState).toBeVisible({ timeout: 15000 });
});
