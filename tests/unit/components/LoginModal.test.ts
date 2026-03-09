// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import LoginModal from '~/components/auth/LoginModal.vue'

// 用于控制弹窗打开状态的 ref，模拟 useLoginModal 内部的 isOpen
const isOpenRef = ref(true)
// 用于断言的 login mock
const loginMock = vi.fn()

// 简单的 BaseModal stub：只渲染默认插槽与 footer 插槽
const BaseModalStub = {
  template: '<div><slot /><slot name="footer" /></div>',
  props: ['modelValue', 'title', 'closeOnMask']
}

// 简单的 BaseInput stub：渲染一个原生 input，并正确处理 v-model
const BaseInputStub = {
  props: ['modelValue', 'id', 'type', 'label', 'name'],
  emits: ['update:modelValue'],
  template: `
    <div>
      <label v-if="label" :for="id">{{ label }}</label>
      <input
        :id="id"
        :name="name"
        :type="type || 'text'"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </div>
  `
}

describe('LoginModal', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    isOpenRef.value = true
    loginMock.mockReset()

    // Nuxt 中 ref 会被自动导入，这里在测试环境补一个全局的 ref
    vi.stubGlobal('ref', ref)

    vi.stubGlobal('useLoginModal', () => ({ isOpen: isOpenRef }))
    vi.stubGlobal('useAuth', () => ({ login: loginMock }))
    vi.stubGlobal('useToast', () => ({
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    }))
  })

  const mountModal = () => {
    return mount(LoginModal, {
      global: {
        stubs: {
          BaseModal: BaseModalStub,
          BaseInput: BaseInputStub,
          NuxtLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })
  }

  it('渲染登录表单', () => {
    const wrapper = mountModal()

    // 有用户名和密码输入框
    expect(wrapper.find('input#username').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    // 有“登录”按钮文案
    expect(wrapper.text()).toContain('登录')
  })

  it('用户名或密码为空时，不会调用 login', async () => {
    const wrapper = mountModal()

    // 不填任何内容直接提交
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
    await form.trigger('submit.prevent')

    expect(loginMock).not.toHaveBeenCalled()
  })

  it('输入正确的用户名和密码时会调用 login，并关闭弹窗', async () => {
    loginMock.mockResolvedValue(true)
    const wrapper = mountModal()

    const usernameInput = wrapper.find('input#username')
    const passwordInput = wrapper.find('input#password')
    expect(usernameInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)

    await usernameInput.setValue('admin')
    await passwordInput.setValue('123456')

    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
    await form.trigger('submit.prevent')

    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(loginMock).toHaveBeenCalledWith('admin', '123456', { redirect: false })
    // 登录成功后弹窗应关闭
    expect(isOpenRef.value).toBe(false)
  })
})
