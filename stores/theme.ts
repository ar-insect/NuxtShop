import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'system'
export type FontSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ThemeConfig {
  mode: ThemeMode
  fontSize: FontSize
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderRadius: string
}

const LIGHT_COLORS = {
  backgroundColor: '#f9fafb', // gray-50
  textColor: '#111827', // gray-900
  cardBackgroundColor: '#ffffff',
  inputBackgroundColor: '#ffffff',
  borderColor: '#e5e7eb', // gray-200
  secondaryTextColor: '#6b7280', // gray-500
  hoverBackgroundColor: 'rgba(0, 0, 0, 0.04)',
  mutedBackgroundColor: 'rgba(0, 0, 0, 0.03)',
  modalMaskColor: 'rgba(0, 0, 0, 0.5)',
  loadingOverlayColor: 'rgba(255, 255, 255, 0.75)',
}

const DARK_COLORS = {
  backgroundColor: '#0b1220', // very dark blue/gray
  textColor: '#f3f4f6', // gray-100
  cardBackgroundColor: '#1f2937', // gray-800
  inputBackgroundColor: '#374151', // gray-700
  borderColor: '#4b5563', // gray-600
  secondaryTextColor: '#9ca3af', // gray-400
  hoverBackgroundColor: 'rgba(255, 255, 255, 0.06)',
  mutedBackgroundColor: 'rgba(255, 255, 255, 0.04)',
  modalMaskColor: 'rgba(0, 0, 0, 0.65)',
  loadingOverlayColor: 'rgba(0, 0, 0, 0.45)',
}

const FONT_SIZES: Record<FontSize, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
}

const DEFAULT_THEME: ThemeConfig = {
  mode: 'system',
  fontSize: 'md',
  primaryColor: '#3b82f6', // blue-500
  backgroundColor: LIGHT_COLORS.backgroundColor,
  textColor: LIGHT_COLORS.textColor,
  borderRadius: '0.5rem',
}

const resolveMode = (mode: ThemeMode) => {
  if (mode !== 'system') return mode
  if (!import.meta.client) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveColors = (mode: ThemeMode) => {
  const effective = resolveMode(mode)
  return effective === 'dark' ? DARK_COLORS : LIGHT_COLORS
}

let systemMql: MediaQueryList | null = null
let systemMqlListener: ((event: MediaQueryListEvent) => void) | null = null

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: { ...DEFAULT_THEME } as ThemeConfig,
    isLoading: false
  }),

  actions: {
    applyTheme() {
      const colors = resolveColors(this.theme.mode)
      const fontSize = FONT_SIZES[this.theme.fontSize] ?? FONT_SIZES.md
      const effectiveMode = resolveMode(this.theme.mode)

      if (import.meta.client) {
        const root = document.documentElement
        root.style.setProperty('--primary-color', this.theme.primaryColor)
        root.style.setProperty('--bg-color', colors.backgroundColor)
        root.style.setProperty('--text-color', colors.textColor)
        root.style.setProperty('--card-bg', colors.cardBackgroundColor)
        root.style.setProperty('--input-bg', colors.inputBackgroundColor)
        root.style.setProperty('--border-color', colors.borderColor)
        root.style.setProperty('--text-secondary', colors.secondaryTextColor)
        root.style.setProperty('--hover-bg', colors.hoverBackgroundColor)
        root.style.setProperty('--muted-bg', colors.mutedBackgroundColor)
        root.style.setProperty('--modal-mask-bg', colors.modalMaskColor)
        root.style.setProperty('--loading-overlay-bg', colors.loadingOverlayColor)
        root.style.setProperty('--border-radius', this.theme.borderRadius)
        root.style.setProperty('--font-size', fontSize)
        root.style.fontSize = fontSize
        root.style.colorScheme = effectiveMode
        return
      }

      const baseCss = `:root {
  --primary-color: ${this.theme.primaryColor};
  --bg-color: ${colors.backgroundColor};
  --text-color: ${colors.textColor};
  --card-bg: ${colors.cardBackgroundColor};
  --input-bg: ${colors.inputBackgroundColor};
  --border-color: ${colors.borderColor};
  --text-secondary: ${colors.secondaryTextColor};
  --hover-bg: ${colors.hoverBackgroundColor};
  --muted-bg: ${colors.mutedBackgroundColor};
  --modal-mask-bg: ${colors.modalMaskColor};
  --loading-overlay-bg: ${colors.loadingOverlayColor};
  --border-radius: ${this.theme.borderRadius};
  --font-size: ${fontSize};
  color-scheme: ${effectiveMode};
}
html { font-size: var(--font-size); }
body { background-color: var(--bg-color); color: var(--text-color); }`

      if (this.theme.mode !== 'system') {
        useHead({ style: [{ innerHTML: baseCss }] })
        return
      }

      const systemCss = `${baseCss}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: ${DARK_COLORS.backgroundColor};
    --text-color: ${DARK_COLORS.textColor};
    --card-bg: ${DARK_COLORS.cardBackgroundColor};
    --input-bg: ${DARK_COLORS.inputBackgroundColor};
    --border-color: ${DARK_COLORS.borderColor};
    --text-secondary: ${DARK_COLORS.secondaryTextColor};
    --hover-bg: ${DARK_COLORS.hoverBackgroundColor};
    --muted-bg: ${DARK_COLORS.mutedBackgroundColor};
    --modal-mask-bg: ${DARK_COLORS.modalMaskColor};
    --loading-overlay-bg: ${DARK_COLORS.loadingOverlayColor};
    color-scheme: dark;
  }
}`

      useHead({ style: [{ innerHTML: systemCss }] })
    },

    // 从服务端加载配置
    async fetchTheme(userId?: string) {
      if (!userId) return

      this.isLoading = true
      try {
        const data = await $fetch<ThemeConfig>('/api/theme', {
          params: { userId }
        })
        
        if (data) {
          this.theme = { ...DEFAULT_THEME, ...data }
          this.applyTheme()
          this.syncSystemModeListener()
        }
      } catch (e) {
        console.error('Failed to fetch theme:', e)
      } finally {
        this.isLoading = false
      }
    },

    // 更新并保存配置
    async updateTheme(newConfig: Partial<ThemeConfig>, userId?: string) {
      const nextTheme: ThemeConfig = { ...this.theme, ...newConfig }
      if (newConfig.mode) {
        const colors = resolveColors(newConfig.mode)
        nextTheme.backgroundColor = colors.backgroundColor
        nextTheme.textColor = colors.textColor
      }
      this.theme = nextTheme
      this.applyTheme()
      this.syncSystemModeListener()

      if (userId) {
        try {
          await $fetch('/api/theme', {
            method: 'POST',
            body: {
              userId,
              config: this.theme
            }
          })
        } catch (e) {
          console.error('Failed to save theme:', e)
        }
      }
    },

    resetTheme(userId?: string) {
      this.theme = { ...DEFAULT_THEME }
      this.applyTheme()
      this.syncSystemModeListener()

      if (userId) {
        $fetch('/api/theme', {
          method: 'POST',
          body: {
            userId,
            config: this.theme
          }
        }).catch(() => {})
      }
    },

    syncSystemModeListener() {
      if (!import.meta.client) return
      if (this.theme.mode === 'system') {
        this.startSystemModeWatcher()
        return
      }
      this.stopSystemModeWatcher()
    },

    startSystemModeWatcher() {
      if (!import.meta.client) return
      if (systemMql) return

      systemMql = window.matchMedia('(prefers-color-scheme: dark)')
      systemMqlListener = () => {
        if (this.theme.mode === 'system') {
          this.applyTheme()
        }
      }

      if ('addEventListener' in systemMql) {
        systemMql.addEventListener('change', systemMqlListener)
      } else {
        ;(systemMql as unknown as { addListener: (cb: (event: MediaQueryListEvent) => void) => void }).addListener(systemMqlListener)
      }
    },

    stopSystemModeWatcher() {
      if (!import.meta.client) return
      if (!systemMql || !systemMqlListener) return

      if ('removeEventListener' in systemMql) {
        systemMql.removeEventListener('change', systemMqlListener)
      } else {
        ;(systemMql as unknown as { removeListener: (cb: (event: MediaQueryListEvent) => void) => void }).removeListener(systemMqlListener)
      }

      systemMql = null
      systemMqlListener = null
    }
  }
})
