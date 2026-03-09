// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '~/components/ui/BaseButton.vue'

describe('BaseButton', () => {
  it('渲染插槽内容', () => {
    const wrapper = mount(BaseButton, {
      props: {
        variant: 'primary'
      },
      slots: {
        default: '提交'
      }
    })

    expect(wrapper.text()).toContain('提交')
  })

  it('点击时会触发 click 事件', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        variant: 'primary'
      },
      slots: {
        default: '点击我'
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')!.length).toBe(1)
  })

  it('在 disabled 状态下不会触发 click 事件', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        variant: 'primary',
        disabled: true
      },
      slots: {
        default: '禁用按钮'
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
  })
})

