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
