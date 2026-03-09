import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const loginViaModalIfNeeded = async (page: any) => {
  const loginHintBtn = page.getByRole('button', { name: '立即登录' }).first()
  const needsLogin = await loginHintBtn.isVisible({ timeout: 1000 }).catch(() => false)
  if (!needsLogin) return

  await loginHintBtn.click()
  const modal = page.locator('.modal-mask')
  await expect(modal).toBeVisible({ timeout: 10000 })
  await modal.locator('input[name="username"]').fill('admin')
  await modal.locator('input[name="password"]').fill('123456')
  await modal.locator('button[type="submit"]').click()
  await expect(modal).toBeHidden({ timeout: 15000 })
  await expect(page.getByRole('button', { name: '退出登录' })).toBeVisible({ timeout: 15000 })
}

const getDetailWishlistButton = (page: any) => {
  return page.locator('[data-testid="product-wishlist-toggle"]').first()
}

const clickWithDetachRetry = async (locator: any, page: any) => {
  for (let i = 0; i < 3; i++) {
    try {
      await locator.scrollIntoViewIfNeeded().catch(() => {})
      await locator.click({ force: true, timeout: 10000 })
      return
    } catch {
      await page.waitForTimeout(300)
    }
  }
  await locator.click({ force: true })
}

const addWishlistFromDetail = async (page: any) => {
  const btn = getDetailWishlistButton(page)
  await expect(btn).toBeVisible({ timeout: 15000 })

  for (let i = 0; i < 5; i++) {
    try {
      await btn.scrollIntoViewIfNeeded().catch(() => {})
      await btn.click({ force: true, timeout: 10000 })
    } catch {}
    await page.waitForTimeout(250)
    const label = await btn.getAttribute('aria-label').catch(() => '')
    if (label === '取消收藏') return
  }

  throw new Error('Failed to add wishlist item from product detail')
}

When('我点击"加入收藏"按钮', async ({ page }) => {
  await loginViaModalIfNeeded(page)
  await addWishlistFromDetail(page)
});

Then('收藏夹图标上的数字应该增加', async ({ page }) => {
  await expect
    .poll(async () => {
      const badge = page.locator('a[href="/wishlist"] span').first()
      const text = await badge.textContent().catch(() => '')
      return Number((text || '').trim() || 0)
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
  await expect(main.locator('h3').first()).toBeVisible();
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
      if ((await main.locator('h3').count()) > 0) return 'has-items';
      return 'none';
    })
    .not.toBe('none');

  // 稳定分支：如为空则从首页进入详情页并添加一件收藏
  if (await emptyState.isVisible().catch(() => false)) {
    await page.goto('/');
    const homeSection = page.locator('section', { has: page.locator('h2', { hasText: '推荐商品' }) });
    await expect(homeSection.locator('.grid').first()).toBeVisible({ timeout: 15000 });
    await homeSection.locator('.grid').first().locator('div.group').first().click()
    await page.waitForURL(/\/products\/\d+/, { timeout: 15000 })
    await loginViaModalIfNeeded(page)
    await addWishlistFromDetail(page)
    await page.goto('/wishlist');
    await expect(page.locator('h1', { hasText: '我的收藏' })).toBeVisible({ timeout: 15000 });
    return;
  }

  if (await emptyState.isVisible()) {
    await page.goto('/');
    const homeSection = page.locator('section', { has: page.locator('h2', { hasText: '推荐商品' }) });
    await expect(homeSection.locator('.grid').first()).toBeVisible({ timeout: 15000 });
    await homeSection.locator('.grid').first().locator('div.group').first().click()
    await loginViaModalIfNeeded(page)
    await addWishlistFromDetail(page)
    await page.goto('/wishlist');
    await expect(page.locator('h1', { hasText: '我的收藏' })).toBeVisible();
  }

  await expect(emptyState).not.toBeVisible({ timeout: 15000 });
  const itemLinks = main.locator('a[href^="/products/"]');
  await expect(itemLinks.first()).toBeVisible({ timeout: 15000 });

  // 为了让“移除商品”场景可预测：确保收藏夹里只有 1 个商品
  // 如果存在多个商品，先移除多余的，保留 1 个
  const removeButtons = main.getByRole('button', { name: '移除收藏' });
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
  const removeBtn = main.getByRole('button', { name: '移除收藏' }).first();
  await expect(removeBtn).toBeVisible({ timeout: 15000 });
  await removeBtn.click({ force: true });
  await expect
    .poll(async () => main.locator('a[href^="/products/"]').count(), { timeout: 15000 })
    .toBe(0);
});

Then('该商品应该从收藏夹中消失', async ({ page }) => {
  const emptyState = page.locator('text=您的收藏夹是空的')
  const main = page.getByRole('main')
  await expect
    .poll(async () => {
      if (await emptyState.isVisible().catch(() => false)) return 'empty'
      const count = await main.locator('a[href^="/products/"]').count().catch(() => 0)
      if (count === 0) return 'empty'
      return 'not-empty'
    })
    .toBe('empty')
});
