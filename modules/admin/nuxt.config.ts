// modules/admin/nuxt.config.ts
// 当前 admin 模块不做组件自动注册，仅作为业务逻辑的 layer 存在。
// Admin 专用组件只能通过显式 import 在 admin 内部使用，避免泄露到前台模块。
export default defineNuxtConfig({})
