import fs from 'node:fs/promises'
import { expect } from '@playwright/test'
import { createBdd, DataTable } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

// #region debug-point A:reporter
const debugReport = async (hypothesisId: string, location: string, msg: string, data: Record<string, unknown>) => {
  let url = 'http://127.0.0.1:7777/event'
  let sessionId = 'address-region-dom'
  try {
    const env = await fs.readFile('.dbg/address-region-dom.env', 'utf8')
    url = env.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || url
    sessionId = env.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || sessionId
  } catch {}
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      runId: 'pre-fix',
      hypothesisId,
      location,
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now()
    })
  }).catch(() => {})
}
// #endregion

const fillAddressRegion = async (page: any, region: string) => {
  const parts = region.split(/\s+/).filter(Boolean)
  const [province = '', city = '', area = ''] = parts

  const selectOption = async (index: number, label: string) => {
    const modal = page.locator('.modal-content, [role="dialog"]').filter({ hasText: '新增地址' }).first()
    // #region debug-point B:region-dom-summary
    await debugReport('B', 'tests/e2e/steps/address.steps.ts:30', 'captured region widget summary before option select', await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"], .modal-content')
      const regionLabel = Array.from(dialog?.querySelectorAll('label') || []).find(label => label.textContent?.includes('所在地区'))
      const regionContainer = regionLabel?.parentElement || dialog
      return {
        dialogFound: !!dialog,
        regionLabelText: regionLabel?.textContent?.trim() || null,
        dataTestIds: Array.from(dialog?.querySelectorAll('[data-testid]') || []).map(node => node.getAttribute('data-testid')),
        selectCountInDialog: dialog?.querySelectorAll('select').length || 0,
        comboboxCountInDialog: dialog?.querySelectorAll('[role="combobox"]').length || 0,
        clickableDivCountInRegion: regionContainer?.querySelectorAll('div.cursor-pointer').length || 0,
        selectHtml: Array.from(regionContainer?.querySelectorAll('select') || []).map(node => (node as HTMLSelectElement).outerHTML.slice(0, 500)),
        comboboxHtml: Array.from(regionContainer?.querySelectorAll('[role="combobox"]') || []).map(node => (node as HTMLElement).outerHTML.slice(0, 500)),
        regionHtml: regionContainer instanceof HTMLElement ? regionContainer.innerHTML.slice(0, 4000) : null
      }
    }))
    // #endregion

    const trigger = modal.locator('.rg-selects button').nth(index)
    await expect(trigger).toBeVisible({ timeout: 15000 })
    await trigger.click()

    const dropdown = page.locator('li').filter({ hasText: label }).last()
    // #region debug-point C:dropdown-dom-summary
    await debugReport('C', 'tests/e2e/steps/address.steps.ts:49', 'captured dropdown summary after trigger click', await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"], .modal-content')
      const floatingDropdowns = Array.from(document.querySelectorAll('body [class*="absolute"], body [role="listbox"], body [class*="dropdown"]'))
        .map(node => (node as HTMLElement).outerHTML.slice(0, 500))
        .slice(0, 5)
      return {
        dialogHtml: dialog instanceof HTMLElement ? dialog.innerHTML.slice(0, 2500) : null,
        floatingDropdowns,
        activeElement: document.activeElement instanceof HTMLElement ? {
          tag: document.activeElement.tagName,
          text: document.activeElement.textContent?.trim()?.slice(0, 100) || '',
          className: document.activeElement.className
        } : null
      }
    }))
    // #endregion
    await expect(dropdown).toBeVisible({ timeout: 10000 })
    const clicked = await page.evaluate((targetLabel: string) => {
      const options = Array.from(document.querySelectorAll('li')).filter((node) => {
        if (!(node instanceof HTMLElement)) return false
        const rect = node.getBoundingClientRect()
        return node.textContent?.trim() === targetLabel && rect.width > 0 && rect.height > 0
      }) as HTMLElement[]
      const option = options.at(-1)
      option?.click()
      return !!option
    }, label)
    expect(clicked).toBe(true)
    await expect(trigger).toContainText(label, { timeout: 10000 })
  }

  if (province) {
    await selectOption(0, province)
  }
  if (city) {
    await selectOption(1, city)
  }
  if (area) {
    await selectOption(2, area)
  }
}

Given('我访问"个人中心"页面', async ({ page }) => {
  await page.goto('/profile')
  await page.waitForURL('**/profile', { timeout: 15000 })
  await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible({ timeout: 15000 })
})

Given('我切换到{string}标签', async ({ page }, tabName: string) => {
  const clickTab = async () => {
    await page.waitForFunction((name) => {
      return Array.from(document.querySelectorAll('a')).some((link) => link.textContent?.includes(name))
    }, tabName, { timeout: 15000 })

    const clicked = await page.evaluate((name) => {
      const tab = Array.from(document.querySelectorAll('a')).find((link) => link.textContent?.includes(name)) as HTMLAnchorElement | undefined
      tab?.click()
      return !!tab
    }, tabName)

    expect(clicked).toBe(true)
  }

  if (tabName === '收货地址') {
    const addressHeading = page.locator('h3').filter({ hasText: /^收货地址$/ }).first()
    for (let attempt = 0; attempt < 3; attempt++) {
      await clickTab()
      const visible = await addressHeading.isVisible({ timeout: 5000 }).catch(() => false)
      if (visible) break
    }
    await expect(addressHeading).toBeVisible({ timeout: 15000 })
    await expect(page.locator('button').filter({ hasText: '新增地址' }).first()).toBeVisible({ timeout: 15000 })
    return
  }

  await clickTab()
})

When('我在收货地址区域点击{string}按钮', async ({ page }, buttonName: string) => {
  const button = page.getByRole('button', { name: buttonName }).first()
  await expect(button).toBeVisible({ timeout: 15000 })
  await expect(button).toBeEnabled({ timeout: 15000 })
  await button.click()
})

When('我填写收货地址表单', async ({ page }, dataTable: DataTable) => {
  const formData = dataTable.rowsHash()

  const modal = page.locator('.modal-content, [role="dialog"]').filter({ hasText: '新增地址' }).first()
  await expect(modal).toBeVisible({ timeout: 15000 })
  // #region debug-point D:modal-open
  await debugReport('D', 'tests/e2e/steps/address.steps.ts:93', 'address modal became visible', {
    url: page.url(),
    region: formData['所在地区'] || null
  })
  // #endregion

  if (formData['收货人']) {
    await page.locator('input').nth(0).fill(formData['收货人'])
  }
  if (formData['手机号']) {
    await page.locator('input').nth(1).fill(formData['手机号'])
  }
  if (formData['所在地区']) {
    await fillAddressRegion(page, formData['所在地区'])
  }
  if (formData['详细地址']) {
    await page.locator('input').nth(2).fill(formData['详细地址'])
  }
  if (formData['设为默认地址']?.toLowerCase() === 'true') {
    const checkbox = page.locator('#is-default')
    if (!(await checkbox.isChecked())) {
      await checkbox.check()
    }
  }
})

Then('我应该看到{string}的提示', async ({ page }, message: string) => {
  await expect(page.locator('.toast-item .message').filter({ hasText: message }).first()).toBeVisible({ timeout: 15000 })
})

Then('收货地址列表中应该包含刚刚新增的地址', async ({ page }) => {
  const addressCard = page.locator('div.border').filter({ hasText: '张三' }).filter({ hasText: '13800138000' }).filter({ hasText: '上海市 上海市 浦东新区 陆家嘴环路1000号' }).last()
  await expect(addressCard).toBeVisible({ timeout: 15000 })
  await expect(addressCard).toContainText('默认')
})
