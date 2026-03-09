// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BaseDropdown from '~/components/ui/BaseDropdown.vue'

describe('BaseDropdown', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  const mountDropdown = (extraProps = {}, extraSlots = {}) => {
    return mount(BaseDropdown, {
      props: {
        label: '操作',
        ...extraProps
      },
      slots: {
        default: `<button class="menu-item">菜单项</button>`,
        ...extraSlots
      }
    })
  }

  it('点击默认 trigger 可以打开下拉菜单', async () => {
    const wrapper = mountDropdown()

    const triggerBtn = wrapper.find('button')
    expect(triggerBtn.exists()).toBe(true)

    // 初始关闭
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    // 点击一次：打开
    await triggerBtn.trigger('click')
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
  })

  it('点击组件外部会关闭下拉菜单', async () => {
    const wrapper = mountDropdown()

    const triggerBtn = wrapper.find('button')
    await triggerBtn.trigger('click')
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    // 在组件外部触发一次点击
    document.body.click()
    await nextTick()

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })
})
