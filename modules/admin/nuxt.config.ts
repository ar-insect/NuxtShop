// modules/admin/nuxt.config.ts
// 当前 admin 模块还没有独立的组件/插件配置，这里保留一个空的 layer 配置，
// 方便后续在模块内部增加按需加载的 components/composables 等。
export default defineNuxtConfig({
  // 例如未来可以在这里注册 admin 专用组件：
  // components: [{ path: resolve(currentDir, 'components'), prefix: 'Admin', pathPrefix: false }]
})
