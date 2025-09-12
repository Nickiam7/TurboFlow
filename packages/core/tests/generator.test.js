import { describe, it, expect, beforeEach } from 'vitest'
import Generator from '../src/core/generator.js'
import AnimationRegistry from '../src/core/animation-registry.js'
import { fade, slide, zoom } from '../src/animations/index.js'

describe('Generator', () => {
  let generator
  let registry

  beforeEach(() => {
    registry = new AnimationRegistry()
    registry.register('fade', fade)
    registry.register('slide', slide)
    registry.register('zoom', zoom)
    generator = new Generator(registry)
  })

  it('should generate CSS for link transitions', () => {
    const transitions = {
      links: [
        { href: '/page1', transition: 'fade' },
        { href: '/page2', transition: 'slide' }
      ]
    }

    const css = generator.generate(transitions)
    
    expect(css).toContain('@keyframes')
    expect(css).toContain('::view-transition-old(root)')
    expect(css).toContain('::view-transition-new(root)')
    expect(css).toContain('html.turboflow-fade')
    expect(css).toContain('html.turboflow-slide')
  })

  it('should generate CSS for form transitions', () => {
    const transitions = {
      forms: [
        { 
          action: '/submit', 
          transition: 'zoom',
          successTransition: 'fade'
        }
      ]
    }

    const css = generator.generate(transitions)
    
    expect(css).toContain('turbo-flow-zoom')
    expect(css).toContain('turbo-flow-fade')
    expect(css).toContain('scale')
    expect(css).toContain('opacity')
  })

  it('should generate directional CSS for animations', () => {
    const transitions = {
      links: [{ href: '/page', transition: 'slide' }]
    }

    const css = generator.generate(transitions)
    
    expect(css).toContain('[data-turbo-visit-direction="forward"]')
    expect(css).toContain('[data-turbo-visit-direction="back"]')
    expect(css).toContain('translateX')
  })

  it('should generate CSS for element transitions', () => {
    const transitions = {
      targets: [
        { id: 'hero', transition: 'fade' },
        { id: 'sidebar', transition: 'slide' }
      ]
    }

    const css = generator.generate(transitions)
    
    expect(css).toContain('#hero')
    expect(css).toContain('#sidebar')
    expect(css).toContain('view-transition-name: turbo-flow-element-hero')
    expect(css).toContain('view-transition-name: turbo-flow-element-sidebar')
  })

  it('should generate CSS for frame transitions', () => {
    const transitions = {
      frames: [
        { id: 'modal', transition: 'zoom' }
      ]
    }

    const css = generator.generate(transitions)
    
    expect(css).toContain('html.turboflow-zoom')
    expect(css).toContain('scale')
  })

  it('should not duplicate CSS for same animation', () => {
    const transitions = {
      links: [
        { href: '/page1', transition: 'fade' },
        { href: '/page2', transition: 'fade' },
        { href: '/page3', transition: 'fade' }
      ]
    }

    const css = generator.generate(transitions)
    const fadeCount = (css.match(/@keyframes turbo-flow-fade-old-none/g) || []).length
    
    expect(fadeCount).toBe(1)
  })

  it('should handle missing animations gracefully', () => {
    const transitions = {
      links: [
        { href: '/page', transition: 'nonexistent' }
      ]
    }

    const css = generator.generate(transitions)
    
    expect(css).not.toContain('@keyframes')
  })

  it('should convert camelCase to kebab-case', () => {
    expect(generator.kebabCase('backgroundColor')).toBe('background-color')
    expect(generator.kebabCase('transformOrigin')).toBe('transform-origin')
    expect(generator.kebabCase('opacity')).toBe('opacity')
  })

  it('should clear generated CSS and names', () => {
    const transitions = {
      targets: [{ id: 'hero', transition: 'fade' }]
    }

    generator.generate(transitions)
    expect(generator.viewTransitionNames.size).toBeGreaterThan(0)
    
    generator.clear()
    expect(generator.viewTransitionNames.size).toBe(0)
    expect(generator.generated.size).toBe(0)
  })
})