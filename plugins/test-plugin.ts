export default defineNuxtPlugin(() => {
  // 插件逻辑在应用初始化时执行
  
  console.log('[插件] 测试插件已初始化！')

  // 我们可以通过 provide 注入全局辅助函数或属性
  // 在组件中可以通过 useNuxtApp().$myHelper 访问
  // 在模板中可以直接通过 $myHelper 访问
  return {
    provide: {
      myHelper: (msg: string) => {
        // 在服务端渲染时使用固定时间字符串，避免水合不匹配
        // 在客户端重新执行时会显示当前时间，但首次水合需一致
        const time = import.meta.client ? new Date().toLocaleTimeString() : 'Server Time'
        return `[插件助手] ${msg} - 处理于 ${time}`
      }
    }
  }
})

