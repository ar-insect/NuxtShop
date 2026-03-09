// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSelect from '~/components/ui/BaseSelect.vue'

describe('BaseSelect', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  const options = [
    { label: 'Vue.js', value: 'vue' },
    { label: 'React', value: 'react' },
    { label: 'Svelte', value: 'svelte' }
  ]

  const mountSelect = (props: any = {}) => {
    return mount(BaseSelect, {
      props: {
        modelValue: null,
        options,
        placeholder: '请选择',
        ...props
      }
    })
  }

  it('显示 placeholder，并在选择后发出 update:modelValue 和 change 事件', async () => {
    const wrapper = mountSelect()

    expect(wrapper.text()).toContain('请选择')

    // 直接调用内部方法，避免依赖下拉 DOM 渲染细节
    await (wrapper.vm as any).selectOption(options[0])

    const updateEvents = wrapper.emitted('update:modelValue')
    const changeEvents = wrapper.emitted('change')

    expect(updateEvents).toBeTruthy()
    expect(changeEvents).toBeTruthy()
    expect(updateEvents![0][0]).toBe('vue')
    expect(changeEvents![0][0]).toBe('vue')
  })

  it('multiple 模式下选择选项会返回数组值', async () => {
    const wrapper = mountSelect({
      modelValue: [],
      multiple: true
    })

    await (wrapper.vm as any).selectOption(options[0])

    const updateEvents = wrapper.emitted('update:modelValue')
    expect(updateEvents).toBeTruthy()

    const values = updateEvents![0][0] as string[]
    expect(values).toEqual(['vue'])
  })

  it('点击清除按钮会清空当前值并触发 clear 事件', async () => {
    const wrapper = mountSelect({
      modelValue: 'vue',
      clearable: true
    })

    const clearBtn = wrapper.find('button[type="button"]')
    expect(clearBtn.exists()).toBe(true)

    await clearBtn.trigger('click')

    const updateEvents = wrapper.emitted('update:modelValue')
    const changeEvents = wrapper.emitted('change')
    const clearEvents = wrapper.emitted('clear')

    expect(updateEvents).toBeTruthy()
    expect(changeEvents).toBeTruthy()
    expect(clearEvents).toBeTruthy()
    expect(updateEvents![0][0]).toBeNull()
    expect(changeEvents![0][0]).toBeNull()
  })

  it('disabled 状态下点击不会打开下拉', async () => {
    const wrapper = mountSelect({
      disabled: true
    })

    const container = wrapper.find('.relative.w-full.border')
    await container.trigger('click')

    expect(wrapper.find('[role="listbox"], div[role="option"]').exists()).toBe(false)
  })
})
