// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed } from 'vue'
import { mount } from '@vue/test-utils'

// 共享的 ref 与 mock，用于模拟 useConfirm 内部状态
const isOpenRef = ref(true)
const titleRef = ref('提示')
const messageRef = ref('确定要执行此操作吗？')
const typeRef = ref<'info' | 'warning' | 'danger'>('info')
const confirmTextRef = ref('确认')
const cancelTextRef = ref('取消')
const closeOnMaskRef = ref(true)

const handleConfirmMock = vi.fn()
const handleCancelMock = vi.fn()

// BaseModal stub：只渲染默认插槽和 footer 槽位
const BaseModalStub = {
  name: 'BaseModal',
  props: ['modelValue', 'title', 'closeOnMask'],
  emits: ['update:modelValue', 'cancel', 'confirm'],
  template: `
    <div class="base-modal-stub">
      <div class="modal-title">{{ title }}</div>
      <div class="modal-body"><slot /></div>
      <div class="modal-footer"><slot name="footer" /></div>
    </div>
  `
}

// BaseButton stub：记录 variant 并转发 click 事件
const BaseButtonStub = {
  name: 'BaseButton',
  props: ['variant'],
  emits: ['click'],
  template: `<button :data-variant="variant" @click="$emit('click', $event)"><slot/></button>`
}

describe('BaseConfirm', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()

    // 重置状态
    isOpenRef.value = true
    titleRef.value = '提示'
    messageRef.value = '确定要执行此操作吗？'
    typeRef.value = 'info'
    confirmTextRef.value = '确认'
    cancelTextRef.value = '取消'
    closeOnMaskRef.value = true
    handleConfirmMock.mockReset()
    handleCancelMock.mockReset()

    // Nuxt 自动导入的 computed / useConfirm 在测试环境补齐
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useConfirm', () => ({
      isOpen: isOpenRef,
      title: titleRef,
      message: messageRef,
      type: typeRef,
      confirmText: confirmTextRef,
      cancelText: cancelTextRef,
      closeOnMask: closeOnMaskRef,
      handleConfirm: handleConfirmMock,
      handleCancel: handleCancelMock
    }))
  })

  const mountConfirm = async () => {
    const { default: BaseConfirm } = await import('~/components/ui/BaseConfirm.vue')
    return mount(BaseConfirm, {
      global: {
        stubs: {
          BaseModal: BaseModalStub,
          BaseButton: BaseButtonStub
        }
      }
    })
  }

  it('渲染 message 与底部按钮文案', async () => {
    messageRef.value = '确认删除该记录？'
    confirmTextRef.value = '删除'
    cancelTextRef.value = '取消'

    const wrapper = await mountConfirm()

    expect(wrapper.text()).toContain('确认删除该记录？')
    expect(wrapper.text()).toContain('删除')
    expect(wrapper.text()).toContain('取消')
  })

  it('根据 type 计算 confirm 按钮的 variant', async () => {
    typeRef.value = 'danger'
    let wrapper = await mountConfirm()

    let buttons = wrapper.findAllComponents(BaseButtonStub)
    expect(buttons.length).toBe(2)
    // 第二个按钮为确认按钮
    expect(buttons[1].attributes('data-variant')).toBe('danger')

    typeRef.value = 'warning'
    wrapper = await mountConfirm()
    buttons = wrapper.findAllComponents(BaseButtonStub)
    expect(buttons[1].attributes('data-variant')).toBe('primary')

    typeRef.value = 'info'
    wrapper = await mountConfirm()
    buttons = wrapper.findAllComponents(BaseButtonStub)
    expect(buttons[1].attributes('data-variant')).toBe('primary')
  })

  it('点击 footer 上的按钮会调用 handleConfirm / handleCancel', async () => {
    const wrapper = await mountConfirm()
    const buttons = wrapper.findAllComponents(BaseButtonStub)
    expect(buttons.length).toBe(2)

    // 第一个为取消按钮
    await buttons[0].trigger('click')
    expect(handleCancelMock).toHaveBeenCalledTimes(1)

    // 第二个为确认按钮
    await buttons[1].trigger('click')
    expect(handleConfirmMock).toHaveBeenCalledTimes(1)
  })
})

