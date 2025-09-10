import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Injector from '../src/core/injector.js'

describe('Injector', () => {
  let injector

  beforeEach(() => {
    injector = new Injector()
    document.head.innerHTML = ''
  })

  afterEach(() => {
    injector.clear()
  })

  it('should inject CSS into the document head', () => {
    const css = '.test { color: red; }'
    injector.inject(css)

    const styleElement = document.getElementById('turbo-flow-styles')
    expect(styleElement).toBeDefined()
    expect(styleElement.textContent).toBe(css)
    expect(styleElement.getAttribute('data-turbo-flow')).toBe('true')
  })

  it('should not duplicate CSS if already injected', () => {
    const css = '.test { color: red; }'
    injector.inject(css)
    injector.inject(css)

    const styleElements = document.querySelectorAll('#turbo-flow-styles')
    expect(styleElements.length).toBe(1)
  })

  it('should update CSS if different', () => {
    const css1 = '.test { color: red; }'
    const css2 = '.test { color: blue; }'
    
    injector.inject(css1)
    expect(injector.getInjectedCSS()).toBe(css1)
    
    injector.inject(css2)
    expect(injector.getInjectedCSS()).toBe(css2)
  })

  it('should inject CSS with custom ID', () => {
    const css = '.frame { opacity: 0; }'
    injector.inject(css, 'modal')

    const styleElement = document.getElementById('turbo-flow-styles-modal')
    expect(styleElement).toBeDefined()
    expect(styleElement.textContent).toBe(css)
  })

  it('should append CSS to existing styles', () => {
    const css1 = '.test1 { color: red; }'
    const css2 = '.test2 { color: blue; }'
    
    injector.inject(css1)
    injector.append(css2)
    
    const expected = css1 + '\n' + css2
    expect(injector.getInjectedCSS()).toBe(expected)
  })

  it('should remove injected CSS', () => {
    const css = '.test { color: red; }'
    injector.inject(css)
    
    expect(document.getElementById('turbo-flow-styles')).toBeDefined()
    
    injector.remove()
    
    expect(document.getElementById('turbo-flow-styles')).toBeNull()
    expect(injector.hasInjectedCSS()).toBe(false)
  })

  it('should remove CSS with specific ID', () => {
    injector.inject('.main { color: red; }')
    injector.inject('.modal { color: blue; }', 'modal')
    
    injector.remove('modal')
    
    expect(document.getElementById('turbo-flow-styles')).toBeDefined()
    expect(document.getElementById('turbo-flow-styles-modal')).toBeNull()
  })

  it('should clear all injected styles', () => {
    injector.inject('.main { color: red; }')
    injector.inject('.modal { color: blue; }', 'modal')
    injector.inject('.frame { color: green; }', 'frame')
    
    injector.clear()
    
    expect(document.querySelectorAll('style[data-turbo-flow="true"]').length).toBe(0)
    expect(injector.injectedCSS.size).toBe(0)
  })

  it('should check if CSS has been injected', () => {
    expect(injector.hasInjectedCSS()).toBe(false)
    
    injector.inject('.test { color: red; }')
    expect(injector.hasInjectedCSS()).toBe(true)
    
    expect(injector.hasInjectedCSS('modal')).toBe(false)
    injector.inject('.modal { color: blue; }', 'modal')
    expect(injector.hasInjectedCSS('modal')).toBe(true)
  })

  it('should create media query wrapper', () => {
    const css = '.test { color: red; }'
    const wrapped = injector.createMediaQueryWrapper(css, '(min-width: 768px)')
    
    expect(wrapped).toBe('@media (min-width: 768px) {\n.test { color: red; }\n}')
  })

  it('should inject CSS for reduced motion', () => {
    const css = '.animate { transition: none; }'
    injector.injectForReducedMotion(css)
    
    const styleElement = document.getElementById('turbo-flow-styles-reduced-motion')
    expect(styleElement).toBeDefined()
    expect(styleElement.textContent).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styleElement.textContent).toContain(css)
  })

  it('should cleanup orphaned CSS entries', () => {
    injector.inject('.test { color: red; }', 'test')
    
    const styleElement = document.getElementById('turbo-flow-styles-test')
    styleElement.remove()
    
    expect(injector.hasInjectedCSS('test')).toBe(true)
    
    injector.cleanup()
    
    expect(injector.hasInjectedCSS('test')).toBe(false)
  })
})