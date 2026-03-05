import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('我已清空数据', async ({ page }) => {
  // Ensure cart is empty first (local and remote)
  await page.evaluate(() => {
    localStorage.removeItem('nuxt-shop-cart')
    localStorage.removeItem('nuxt-shop-orders')
  })
  try {
    await page.request.delete('/api/cart')
    await page.request.delete('/api/orders?clear=true')
  } catch (e) {
    console.log('Failed to clear remote cart/orders', e)
  }
})

Given('我已经创建了一个订单', async ({ page }) => {
  // Ensure cart is empty first
  await page.evaluate(() => {
    localStorage.removeItem('nuxt-shop-cart')
  })
  
  // Add a product to cart (Assuming cart is empty or we just add one)
  await page.goto('/products')
  // Wait for products to load
  await page.waitForSelector('.grid', { state: 'visible', timeout: 30000 })
  // Click on the first product link
  await page.locator('.grid a').first().click()
  
  // Product detail page
  // Wait for button to be visible and enabled
  const addToCartBtn = page.locator('button:has-text("加入购物车")')
  await addToCartBtn.waitFor({ state: 'visible', timeout: 30000 })
  // Force click or wait a bit
  await page.waitForTimeout(1000)
  await addToCartBtn.click()
  // Wait for a moment to ensure item is added
  await page.waitForTimeout(1000)
  
  // Go to checkout
  await page.goto('/cart')
  // Wait for cart to be loaded (either items or empty state)
  try {
    // Try to wait for the checkout button, but don't fail immediately if it's not there yet
    await page.waitForSelector('button:has-text("去结算")', { state: 'visible', timeout: 5000 })
  } catch {
    // If checkout button is not visible, it might be because the cart state wasn't persisted/loaded correctly
    // or the page is still loading. Let's verify if we have items.
    const emptyCart = await page.isVisible('text=您的购物车是空的')
    if (emptyCart) {
      // Retry adding to cart if failed
      console.log('Cart empty, retrying adding product...')
      await page.goto('/products')
      await page.waitForSelector('.grid', { state: 'visible', timeout: 30000 })
      await page.locator('.grid a').first().click()
      const addToCartBtnRetry = page.locator('button:has-text("加入购物车")')
      await addToCartBtnRetry.waitFor({ state: 'visible', timeout: 30000 })
      await page.waitForTimeout(1000)
      await addToCartBtnRetry.click()
      await page.waitForTimeout(1000)
      await page.goto('/cart')
      await page.waitForSelector('button:has-text("去结算")', { state: 'visible', timeout: 5000 })
    }
  }
  
  // Ensure the button is clickable
  await page.waitForTimeout(500)
  await page.click('button:has-text("去结算")')
  
  // Fill address if needed (assuming new address mode or default)
  // We might need to wait for navigation to checkout
  await page.waitForURL('**/checkout', { timeout: 30000 })
  
  // Wait for address form or saved addresses
  // We check for either saved addresses OR the new address form
  try {
    // Race condition: wait for either "收货地址" header OR "填写新地址" text
    await Promise.race([
      page.waitForSelector('h3:has-text("收货地址")', { state: 'visible', timeout: 30000 }),
      page.waitForSelector('text=填写新地址', { state: 'visible', timeout: 30000 }),
      // Also wait for the payment section to ensure page is loaded
      page.waitForSelector('h3:has-text("支付方式")', { state: 'visible', timeout: 30000 })
    ])
  } catch {
    console.log('Timeout waiting for checkout page elements, reloading...')
    // maybe we need to reload
    await page.reload()
    await page.waitForSelector('h3:has-text("收货地址")', { state: 'visible', timeout: 30000 })
  }
  
  const isNewAddress = await page.isVisible('text=填写新地址')
  if (isNewAddress) {
    await page.fill('input[placeholder="例如：张"]', 'Test')
    await page.fill('input[placeholder="例如：三"]', 'User')
    await page.fill('input[placeholder="街道、门牌号等"]', 'Test Address')
    await page.fill('input[placeholder="例如：上海"]', 'Shanghai')
    await page.fill('input[placeholder="例如：200000"]', '200000')
    await page.fill('input[placeholder="用于接收配送通知"]', '13800000000')
  }

  // Confirm payment
  // Wait for button to prevent timeout
  const payBtn = page.locator('button:has-text("确认支付")')
  await payBtn.waitFor({ state: 'visible', timeout: 30000 })
  // Ensure button is enabled
  await expect(payBtn).toBeEnabled({ timeout: 10000 })
  await payBtn.click()
  
  // Wait for navigation to orders page
  await page.waitForURL('**/orders', { timeout: 30000 })
})

Given('我没有任何订单', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.removeItem('nuxt-shop-orders')
  })
})

When('我访问"我的订单"页面', async ({ page }) => {
  await page.goto('/orders')
})

Then('我应该看到订单列表中包含刚刚创建的订单', async ({ page }) => {
  // Wait for orders to load/render
  await page.waitForSelector('h2:has-text("我的订单")', { state: 'visible', timeout: 30000 })
  await page.waitForSelector('dl', { state: 'visible', timeout: 30000 })
  const orders = page.locator('dl').first()
  await expect(orders).toBeVisible()
  await expect(page.locator('text=处理中')).toBeVisible()
})

Then('我应该看到"暂无订单"的提示信息', async ({ page }) => {
  await page.waitForSelector('h3:has-text("暂无订单")', { state: 'visible', timeout: 30000 })
  await expect(page.locator('text=暂无订单')).toBeVisible()
  await expect(page.locator('text=您还没有购买过任何商品')).toBeVisible()
})

When('我点击"删除订单"按钮', async ({ page }) => {
  // Click the delete button on the order card
  await page.locator('button:has-text("删除订单")').first().click()
  
  // Wait for the custom confirm modal
  await expect(page.locator('text=确定要删除这个订单吗')).toBeVisible()
  
  // Click the confirm button in the modal (text is "删除")
  // Use a specific locator to avoid ambiguity if multiple "删除" exist (though unlikely)
  // The modal footer usually has the action buttons.
  await page.locator('.modal-footer button:has-text("删除")').click()
})

Then('我应该看到订单被成功删除', async ({ page }) => {
  // 优先等待空状态；若未及时渲染，刷新页面再验
  const emptyState = page.locator('text=暂无订单')
  const visible = await emptyState.isVisible({ timeout: 5000 }).catch(() => false)
  if (!visible) {
    await page.reload()
  }
  await expect(emptyState).toBeVisible({ timeout: 15000 })
})
