import { describe, it, expect, beforeEach, vi } from 'vitest'
import Config from '../src/core/config.js'

describe('Config', () => {
  let config

  beforeEach(() => {
    config = new Config()
  })

  it('should initialize with default values', () => {
    expect(config.get('defaultTransition')).toBe('fade')
    expect(config.get('duration')).toBe(300)
    expect(config.get('easing')).toBe('ease-out')
    expect(config.get('debug')).toBe(false)
  })

  it('should merge options with defaults', () => {
    config = new Config({
      defaultTransition: 'slide',
      duration: 500
    })
    
    expect(config.get('defaultTransition')).toBe('slide')
    expect(config.get('duration')).toBe(500)
    expect(config.get('easing')).toBe('ease-out')
  })

  it('should get nested config values', () => {
    expect(config.get('streams.append')).toBe('fade-up')
    expect(config.get('streams.remove')).toBe('fade-out')
    expect(config.get('streams.nonexistent')).toBeUndefined()
  })

  it('should set config values', () => {
    config.set('defaultTransition', 'zoom')
    expect(config.get('defaultTransition')).toBe('zoom')
    
    config.set('streams.append', 'slide-up')
    expect(config.get('streams.append')).toBe('slide-up')
  })

  it('should update multiple config values', () => {
    config.update({
      defaultTransition: 'morph',
      duration: 400,
      streams: {
        append: 'zoom-in'
      }
    })
    
    expect(config.get('defaultTransition')).toBe('morph')
    expect(config.get('duration')).toBe(400)
    expect(config.get('streams.append')).toBe('zoom-in')
    expect(config.get('streams.remove')).toBe('fade-out')
  })

  it('should reset config to defaults', () => {
    config.set('defaultTransition', 'zoom')
    config.set('duration', 1000)
    
    config.reset()
    
    expect(config.get('defaultTransition')).toBe('fade')
    expect(config.get('duration')).toBe(300)
  })

  it('should reset with new options', () => {
    config.set('defaultTransition', 'zoom')
    
    config.reset({
      defaultTransition: 'slide'
    })
    
    expect(config.get('defaultTransition')).toBe('slide')
    expect(config.get('duration')).toBe(300)
  })

  it('should get transition for element with data-turbo-flow', () => {
    const element = document.createElement('a')
    element.dataset.turboFlow = 'zoom'
    
    expect(config.getTransitionForElement(element)).toBe('zoom')
  })

  it('should get transition for element with data-turbo-flow-target', () => {
    const element = document.createElement('div')
    element.dataset.turboFlowTarget = 'morph'
    
    expect(config.getTransitionForElement(element)).toBe('morph')
  })

  it('should get frame transition from config', () => {
    config.set('frames.modal', 'zoom')
    
    const frame = document.createElement('turbo-frame')
    frame.id = 'modal'
    
    expect(config.getTransitionForElement(frame)).toBe('zoom')
  })

  it('should return default transition for unknown element', () => {
    const element = document.createElement('div')
    expect(config.getTransitionForElement(element)).toBe('fade')
    expect(config.getTransitionForElement(null)).toBe('fade')
  })

  it('should get stream transition', () => {
    expect(config.getStreamTransition('append')).toBe('fade-up')
    expect(config.getStreamTransition('unknown')).toBe('fade')
  })

  it('should get frame transition', () => {
    config.set('frames.sidebar', 'slide')
    
    expect(config.getFrameTransition('sidebar')).toBe('slide')
    expect(config.getFrameTransition('unknown')).toBe('fade')
  })

  it('should respect prefers-reduced-motion', () => {
    const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
    window.matchMedia = mockMatchMedia
    
    expect(config.shouldAnimate()).toBe(true)
    
    mockMatchMedia.mockReturnValue({ matches: true })
    expect(config.shouldAnimate()).toBe(false)
  })

  it('should force animations when reducedMotion is force', () => {
    const mockMatchMedia = vi.fn().mockReturnValue({ matches: true })
    window.matchMedia = mockMatchMedia
    
    config.set('reducedMotion', 'force')
    expect(config.shouldAnimate()).toBe(true)
  })

  it('should disable animations when reducedMotion is disable', () => {
    config.set('reducedMotion', 'disable')
    expect(config.shouldAnimate()).toBe(false)
  })

  it('should get reduced motion fallback', () => {
    const mockMatchMedia = vi.fn().mockReturnValue({ matches: true })
    window.matchMedia = mockMatchMedia
    
    expect(config.getReducedMotionFallback()).toBe('none')
    
    config.set('prefersReducedMotionFallback', 'fade')
    expect(config.getReducedMotionFallback()).toBe('fade')
    
    mockMatchMedia.mockReturnValue({ matches: false })
    expect(config.getReducedMotionFallback()).toBeNull()
  })

  it('should notify listeners on config change', () => {
    const listener = vi.fn()
    config.addListener(listener)
    
    config.set('defaultTransition', 'slide')
    
    expect(listener).toHaveBeenCalledWith('defaultTransition', 'slide', 'fade')
  })

  it('should remove listeners', () => {
    const listener = vi.fn()
    const unsubscribe = config.addListener(listener)
    
    config.set('defaultTransition', 'slide')
    expect(listener).toHaveBeenCalledTimes(1)
    
    unsubscribe()
    config.set('defaultTransition', 'zoom')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should validate config', () => {
    expect(config.validate()).toBeNull()
    
    config.set('duration', -100)
    const errors = config.validate()
    expect(errors).toContain('Duration must be a positive number')
    
    config.set('duration', 300)
    config.set('reducedMotion', 'invalid')
    const errors2 = config.validate()
    expect(errors2).toContain('Reduced motion must be one of: respect, disable, force')
  })

  it('should export config as JSON', () => {
    const exported = config.export()
    
    expect(exported.defaultTransition).toBe('fade')
    expect(exported.duration).toBe(300)
    expect(typeof exported).toBe('object')
  })

  it('should import valid config', () => {
    const newConfig = {
      defaultTransition: 'zoom',
      duration: 500
    }
    
    config.import(newConfig)
    
    expect(config.get('defaultTransition')).toBe('zoom')
    expect(config.get('duration')).toBe(500)
  })
})