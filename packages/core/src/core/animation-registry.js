class AnimationRegistry {
  constructor() {
    this.animations = new Map()
    this.keyframes = new Map()
  }

  register(name, animation) {
    if (!name || !animation) {
      throw new Error('Animation name and definition are required')
    }

    this.animations.set(name, {
      ...animation,
      name,
      keyframes: animation.keyframes || {},
      duration: animation.duration || 300,
      easing: animation.easing || 'ease-out',
    })

    return this
  }

  get(name) {
    return this.animations.get(name)
  }

  has(name) {
    return this.animations.has(name)
  }

  generateCSS(name, options = {}) {
    const animation = this.get(name)
    if (!animation) {
      console.warn(`Animation "${name}" not found`)
      return ''
    }

    const duration = options.duration || animation.duration
    const easing = options.easing || animation.easing
    const keyframeName = `turbo-flow-${name}-${Date.now()}`

    const keyframeCSS = this.generateKeyframes(keyframeName, animation.keyframes)
    const animationCSS = `${keyframeName} ${duration}ms ${easing}`

    return {
      keyframeCSS,
      animationCSS,
      keyframeName,
    }
  }

  generateKeyframes(name, keyframes) {
    const frames = Object.entries(keyframes)
      .map(([key, value]) => {
        const properties = Object.entries(value)
          .map(([prop, val]) => `${this.kebabCase(prop)}: ${val};`)
          .join(' ')
        return `${key} { ${properties} }`
      })
      .join(' ')

    return `@keyframes ${name} { ${frames} }`
  }

  generateViewTransitionCSS(name, direction = 'forward') {
    const animation = this.get(name)
    if (!animation) return ''

    let transitions = animation.viewTransitions
    
    if (animation.directions && animation.directions[direction]) {
      transitions = animation.directions[direction]
    }
    
    const { old, new: newTransition } = transitions || {}
    if (!old || !newTransition) return ''

    const oldKeyframes = this.generateKeyframes(`turbo-flow-${name}-old-${direction}`, old)
    const newKeyframes = this.generateKeyframes(`turbo-flow-${name}-new-${direction}`, newTransition)

    return `
      ${oldKeyframes}
      ${newKeyframes}
      ::view-transition-old(turbo-flow-${name}) {
        animation: turbo-flow-${name}-old-${direction} ${animation.duration}ms ${animation.easing};
      }
      ::view-transition-new(turbo-flow-${name}) {
        animation: turbo-flow-${name}-new-${direction} ${animation.duration}ms ${animation.easing};
      }
    `
  }

  kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  list() {
    return Array.from(this.animations.keys())
  }

  clear() {
    this.animations.clear()
    this.keyframes.clear()
  }
}

export default AnimationRegistry