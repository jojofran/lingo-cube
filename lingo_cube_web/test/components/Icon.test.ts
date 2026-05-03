import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Icon from '@/components/common/Icon.vue'

describe('Icon.vue', () => {
  it('renders search icon when name="search"', () => {
    const wrapper = mount(Icon, { props: { name: 'search' } })
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('renders close icon when name="close"', () => {
    const wrapper = mount(Icon, { props: { name: 'close' } })
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('renders speaker icon when name="speaker"', () => {
    const wrapper = mount(Icon, { props: { name: 'speaker' } })
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('applies custom size prop', () => {
    const wrapper = mount(Icon, { props: { name: 'search', size: 24 } })
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('24')
    expect(svg.attributes('height')).toBe('24')
  })
})
