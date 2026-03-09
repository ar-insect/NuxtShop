// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegionSelect from '~/components/ui/RegionSelect.vue'

// 统一 stub v-region 的 RegionSelects 组件
vi.mock('v-region', () => {
  const FakeRegionSelects = {
    name: 'RegionSelects',
    props: ['modelValue', 'town'],
    emits: ['update:modelValue', 'change'],
    template: `<div class="region-selects-stub"></div>`
  }

  return { RegionSelects: FakeRegionSelects }
})

describe('RegionSelect', () => {
  it('change 事件时会根据 RegionModel 生成「省 市 区」字符串并通过 v-model 向外抛出', async () => {
    const wrapper = mount(RegionSelect, {
      props: {
        modelValue: ''
      }
    })

    const stub = wrapper.findComponent({ name: 'RegionSelects' })
    expect(stub.exists()).toBe(true)

    stub.vm.$emit('change', {
      province: { key: '110000', value: '北京市', name: '北京市' },
      city: { key: '110100', value: '北京市', name: '北京市' },
      area: { key: '110102', value: '西城区', name: '西城区' },
      town: { key: '', value: '', name: '' }
    })

    const updateEvents = wrapper.emitted('update:modelValue')
    const changeEvents = wrapper.emitted('change')

    expect(updateEvents).toBeTruthy()
    expect(changeEvents).toBeTruthy()

    const valueFromUpdate = updateEvents[0][0]
    const valueFromChange = changeEvents[0][0]

    expect(valueFromUpdate).toBe('北京市 北京市 西城区')
    expect(valueFromChange).toBe('北京市 北京市 西城区')
  })

  it('当缺少某一级时，只拼接存在的行政区名称', async () => {
    const wrapper = mount(RegionSelect, {
      props: {
        modelValue: ''
      }
    })

    const stub = wrapper.findComponent({ name: 'RegionSelects' })
    expect(stub.exists()).toBe(true)

    // 只包含省和市，不包含区
    stub.vm.$emit('change', {
      province: { key: '310000', value: '上海市', name: '上海市' },
      city: { key: '310100', value: '上海市', name: '上海市' },
      area: null,
      town: null
    })

    const updateEvents = wrapper.emitted('update:modelValue')
    expect(updateEvents).toBeTruthy()
    expect(updateEvents[0][0]).toBe('上海市 上海市')
  })
})

