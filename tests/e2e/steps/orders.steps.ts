import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('我已清空数据', async ({ page }) => {
  // 先确保购物车为空（本地与远端）
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
  // 先确保购物车为空
  await page.evaluate(() => {
    localStorage.removeItem('nuxt-shop-cart')
  })
  
  // 添加一个商品到购物车（假设购物车为空）
  await page.goto('/products')
  // 等待商品列表加载
  await page.waitForSelector('.grid', { state: 'visible', timeout: 30000 })
  // 点击第一个商品链接
  await page.locator('.grid a').first().click()
  
  // 商品详情页：等待按钮可见且可用
  const addToCartBtn = page.locator('button:has-text("加入购物车")')
  await addToCartBtn.waitFor({ state: 'visible', timeout: 30000 })
  // 适当等待后点击
  await page.waitForTimeout(1000)
  await addToCartBtn.click()
  // 等待片刻确保已加入
  await page.waitForTimeout(1000)
  
  // 前往购物车/结算
  await page.goto('/cart')
  // 等待购物车页面加载（有商品或空状态）
  try {
    // 尝试等待“去结算”按钮出现，若暂时未出现则不立即失败
    await page.waitForSelector('button:has-text("去结算")', { state: 'visible', timeout: 5000 })
  } catch {
    // 若“去结算”按钮不可见，可能是购物车状态未正确持久化/加载，或页面仍在加载中；先检查是否为空
    const emptyCart = await page.isVisible('text=您的购物车是空的')
    if (emptyCart) {
      // 若添加失败则重试加入购物车
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
  
  // 确保按钮可点击
  await page.waitForTimeout(500)
  await page.click('button:has-text("去结算")')
  
  // 如需要则填写地址（可能是新地址模式或默认地址）
  // 等待跳转到结算页
  await page.waitForURL('**/checkout', { timeout: 30000 })
  
  // 等待地址表单或已保存地址渲染
  // 兼容已保存地址或“填写新地址”两种情况
  try {
    // 竞态：等待“收货地址”标题或“填写新地址”文本出现
    await Promise.race([
      page.waitForSelector('h3:has-text("收货地址")', { state: 'visible', timeout: 30000 }),
      page.waitForSelector('text=填写新地址', { state: 'visible', timeout: 30000 }),
      // 同时等待“支付方式”区域，确保页面主要内容已加载
      page.waitForSelector('h3:has-text("支付方式")', { state: 'visible', timeout: 30000 })
    ])
  } catch {
    console.log('Timeout waiting for checkout page elements, reloading...')
    // 可能需要刷新
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

  // 确认支付
  // 等待按钮出现以避免超时
  const payBtn = page.locator('button:has-text("确认支付")')
  await payBtn.waitFor({ state: 'visible', timeout: 30000 })
  // 确保按钮可用
  await expect(payBtn).toBeEnabled({ timeout: 10000 })
  await payBtn.click()
  
  // 等待跳转到订单页
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
  // 等待订单列表加载/渲染
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
  // 点击订单卡片上的删除按钮
  await page.locator('button:has-text("删除订单")').first().click()
  
  // 等待自定义确认弹窗出现
  await expect(page.locator('text=确定要删除这个订单吗')).toBeVisible()
  
  // 点击弹窗确认按钮（文案为“删除”）
  // 使用更精确的定位，避免与其他“删除”按钮产生歧义
  // 弹窗 footer 中通常是操作按钮
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
