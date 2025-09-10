class Config {
  constructor(options = {}) {
    this.defaults = {
      defaultTransition: 'fade',
      duration: 300,
      easing: 'ease-out',
      debug: false,
      autoInject: true,
      reducedMotion: 'respect',
      prefersReducedMotionFallback: 'none',
      cleanupInterval: 5000,
      frames: {},
      streams: {
        append: 'fade-up',
        prepend: 'fade-down',
        replace: 'morph',
        update: 'morph',
        remove: 'fade-out',
        before: 'slide-right',
        after: 'slide-left',
      },
      targets: {},
      customAnimations: {},
    }

    this.config = this.merge(this.defaults, options)
    this.listeners = new Set()
  }

  merge(target, source) {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.merge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  get(key = null) {
    if (!key) return this.config

    const keys = key.split('.')
    let value = this.config

    for (const k of keys) {
      value = value[k]
      if (value === undefined) return undefined
    }

    return value
  }

  set(key, value) {
    const keys = key.split('.')
    const lastKey = keys.pop()
    let target = this.config

    for (const k of keys) {
      if (!target[k] || typeof target[k] !== 'object') {
        target[k] = {}
      }
      target = target[k]
    }

    const oldValue = target[lastKey]
    target[lastKey] = value

    this.notifyListeners(key, value, oldValue)

    return this
  }

  update(options) {
    const oldConfig = { ...this.config }
    this.config = this.merge(this.config, options)

    this.notifyListeners('*', this.config, oldConfig)

    return this
  }

  reset(options = {}) {
    const oldConfig = { ...this.config }
    this.config = this.merge(this.defaults, options)

    this.notifyListeners('reset', this.config, oldConfig)

    return this
  }

  getTransitionForElement(element) {
    if (!element) return this.config.defaultTransition

    if (element.dataset.turboFlow) {
      return element.dataset.turboFlow
    }

    if (element.dataset.turboFlowTarget) {
      return element.dataset.turboFlowTarget
    }

    if (element.tagName === 'TURBO-FRAME' && element.id) {
      return this.config.frames[element.id] || this.config.defaultTransition
    }

    return this.config.defaultTransition
  }

  getStreamTransition(action) {
    return this.config.streams[action] || this.config.defaultTransition
  }

  getFrameTransition(frameId) {
    return this.config.frames[frameId] || this.config.defaultTransition
  }

  shouldAnimate() {
    if (!this.config.autoInject) return false

    if (this.config.reducedMotion === 'respect') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return !prefersReduced
    }

    return this.config.reducedMotion !== 'disable'
  }

  getReducedMotionFallback() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced && this.config.reducedMotion === 'respect') {
      return this.config.prefersReducedMotionFallback
    }

    return null
  }

  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }

  notifyListeners(key, newValue, oldValue) {
    this.listeners.forEach((callback) => {
      try {
        callback(key, newValue, oldValue)
      } catch (error) {
        if (this.config.debug) {
          console.error('Config listener error:', error)
        }
      }
    })
  }

  validate() {
    const errors = []

    if (typeof this.config.duration !== 'number' || this.config.duration < 0) {
      errors.push('Duration must be a positive number')
    }

    if (typeof this.config.cleanupInterval !== 'number' || this.config.cleanupInterval < 0) {
      errors.push('Cleanup interval must be a positive number')
    }

    const validReducedMotion = ['respect', 'disable', 'force']
    if (!validReducedMotion.includes(this.config.reducedMotion)) {
      errors.push(`Reduced motion must be one of: ${validReducedMotion.join(', ')}`)
    }

    return errors.length > 0 ? errors : null
  }

  export() {
    return JSON.parse(JSON.stringify(this.config))
  }

  import(config) {
    const errors = this.validate()
    if (errors) {
      throw new Error(`Invalid configuration: ${errors.join('; ')}`)
    }

    this.update(config)
    return this
  }
}

export default Config
