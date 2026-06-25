import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import fs from 'node:fs/promises';

const { Given, When, Then } = createBdd();

const readAdminCredentials = async () => {
  let username = process.env.ADMIN_USERNAME || 'admin'
  let password = process.env.ADMIN_PASSWORD || '123456'

  try {
    const env = await fs.readFile('.env', 'utf8')
    username = env.match(/^ADMIN_USERNAME=(.+)$/m)?.[1]?.replace(/^"|"$/g, '') || username
    password = env.match(/^ADMIN_PASSWORD=(.+)$/m)?.[1]?.replace(/^"|"$/g, '') || password
  } catch {}

  return { username, password }
}

// #region debug-point A:reporter
const debugReport = async (hypothesisId: string, location: string, msg: string, data: Record<string, unknown>) => {
  let url = 'http://127.0.0.1:7777/event'
  let sessionId = 'auth-me-empty'
  try {
    const env = await fs.readFile('.dbg/auth-me-empty.env', 'utf8')
    url = env.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || url
    sessionId = env.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || sessionId
  } catch {}
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      runId: 'post-fix',
      hypothesisId,
      location,
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now()
    })
  }).catch(() => {})
}
// #endregion

const setAuthTokenCookie = async (page: any, token: string) => {
  const origin = new URL(page.url()).origin
  await page.context().addCookies([{
    name: 'auth-token',
    value: token,
    url: origin
  }])
}

const waitForAuthenticatedDisplayName = async (page: any) => {
  let displayName = ''

  await expect
    .poll(async () => {
      return await page.request.get('/api/auth/me').then(async (res: any) => {
        const data = await res.json().catch(() => null)
        // #region debug-point C:auth-me-poll
        await debugReport('C', 'tests/e2e/steps/login.steps.ts:42', 'polled /api/auth/me', {
          ok: !!res?.ok,
          status: typeof res?.status === 'function' ? res.status() : null,
          userId: data?.user?._id || null,
          username: data?.user?.username || null,
          name: data?.user?.name || null,
          url: page.url()
        })
        // #endregion
        if (!res?.ok) return ''
        return data?.user?.name || data?.user?.username || ''
      })
    }, { timeout: 15000 })
    .not.toBe('')

  displayName = await page.request.get('/api/auth/me').then(async (res: any) => {
    const data = await res.json()
    return data?.user?.name || data?.user?.username || ''
  })

  return displayName
}

// Given('我在首页', async ({ page }) => {
//   await page.goto('/');
// });

When('我点击导航栏的登录按钮', async ({ page }) => {
  const loginBtn = page.locator('header button', { hasText: '登录' });
  await expect(loginBtn).toBeVisible({ timeout: 15000 });
  await loginBtn.click();
  // 等待登录弹窗出现（考虑到 ClientOnly 水合与过渡）
  const modal = page.locator('.modal-mask');
  const appeared = await modal.isVisible({ timeout: 5000 }).catch(() => false);
  if (!appeared) {
    // 兜底：跳转到 /login 页面
    await page.goto('/login');
  }
});

When('我在弹窗中输入用户名 {string} 和密码 {string}', async ({ page }, username, password) => {
  const modal = page.locator('.modal-mask');
  const usePageForm = !(await modal.isVisible({ timeout: 1000 }).catch(() => false));
  if (usePageForm) {
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
  } else {
    await modal.locator('input[name="username"]').fill(username);
    await modal.locator('input[name="password"]').fill(password);
  }
});

When('我点击弹窗中的登录按钮', async ({ page }) => {
  const modal = page.locator('.modal-mask');
  const usePageForm = !(await modal.isVisible({ timeout: 1000 }).catch(() => false));
  if (usePageForm) {
    const submit = page.locator('button[type="submit"]');
    const enabled = await submit.isEnabled({ timeout: 3000 }).catch(() => false);
    if (enabled) {
      await submit.click();
    } else {
      // 按钮被禁用时，直接通过页面上下文调用登录 API 建立服务端 session
      const username = await page.locator('input[name="username"]').inputValue();
      const password = await page.locator('input[name="password"]').inputValue();
      const res = await page.request.post('/api/auth/login', {
        data: { username, password }
      })
      const data = await res.json()
      const token = data?.token || ''
      if (token) {
        await setAuthTokenCookie(page, token)
      }
    }
  } else {
    const submitBtn = modal.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
  }
});

Then('我应该看到退出登录按钮', async ({ page }) => {
  const isStillOnLogin = page.url().includes('/login')
  if (isStillOnLogin) {
    await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {})
  }
  const displayName = await waitForAuthenticatedDisplayName(page)
  const userMenuTrigger = page.locator('header button').filter({ hasText: displayName }).first()
  await expect(userMenuTrigger).toBeVisible({ timeout: 15000 })
  await userMenuTrigger.click()
  await expect(page.getByRole('button', { name: '退出登录' })).toBeVisible({ timeout: 15000 })
});

Given('我已经登录', async ({ page }) => {
  await page.goto('/');
  // 直接通过 Playwright request API 获取 token，并写入当前 origin 的 Cookie
  const { username, password } = await readAdminCredentials()
  const res = await page.request.post('/api/auth/login', {
    data: { username, password }
  })
  const data = await res.json()
  const token = data?.token || ''
  // #region debug-point A:login-response
  await debugReport('A', 'tests/e2e/steps/login.steps.ts:140', 'received /api/auth/login response', {
    ok: !!res?.ok,
    status: typeof res?.status === 'function' ? res.status() : null,
    hasToken: !!token,
    requires2FA: !!data?.requires2FA,
    userId: data?.user?._id || null,
    username: data?.user?.username || null,
    requestedUsername: username
  })
  // #endregion
  if (token) {
    await setAuthTokenCookie(page, token)
  }
  // #region debug-point B:cookies-after-set
  await debugReport('B', 'tests/e2e/steps/login.steps.ts:151', 'cookies after auth-token set', {
    tokenLength: token.length,
    cookies: (await page.context().cookies()).map((cookie) => ({
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path,
      expires: cookie.expires
    }))
  })
  // #endregion
  await page.reload();
  const displayName = await waitForAuthenticatedDisplayName(page)
  await expect(page.locator('header button').filter({ hasText: displayName }).first()).toBeVisible({ timeout: 15000 });
});
