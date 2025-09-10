import { describe, it, expect, beforeEach } from 'vitest'
import AnimationRegistry from '../src/core/animation-registry.js'
import { fade, slide } from '../src/animations/index.js'

describe('AnimationRegistry', () => {
  let registry

  beforeEach(() => {
    registry = new AnimationRegistry()
  })

  it('should register an animation', () => {
    registry.register('fade', fade)
    expect(registry.has('fade')).toBe(true)
    expect(registry.get('fade').name).toBe('fade')
  })

  it('should generate CSS for an animation', () => {
    registry.register('fade', fade)
    const { keyframeCSS, animationCSS } = registry.generateCSS('fade')
    
    expect(keyframeCSS).toContain('@keyframes')
    expect(keyframeCSS).toContain('opacity')
    expect(animationCSS).toContain('300ms ease-out')
  })

  it('should generate view transition CSS', () => {
    registry.register('slide', slide)
    const css = registry.generateViewTransitionCSS('slide', 'forward')
    
    expect(css).toContain('::view-transition-old')
    expect(css).toContain('::view-transition-new')
    expect(css).toContain('translateX')
  })

  it('should handle directional animations', () => {
    registry.register('slide', slide)
    const forwardCSS = registry.generateViewTransitionCSS('slide', 'forward')
    const backCSS = registry.generateViewTransitionCSS('slide', 'back')
    
    expect(forwardCSS).toContain('translateX(-100%)')
    expect(backCSS).toContain('translateX(100%)')
  })

  it('should list all registered animations', () => {
    registry.register('fade', fade)
    registry.register('slide', slide)
    
    const list = registry.list()
    expect(list).toContain('fade')
    expect(list).toContain('slide')
    expect(list.length).toBe(2)
  })
})