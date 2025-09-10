class TurboFlow {
  constructor(config = {}) {
    this.config = {
      defaultTransition: 'fade',
      duration: 300,
      easing: 'ease-out',
      debug: false,
      ...config,
    }

    this.initialized = false
  }

  init() {
    if (this.initialized) {
      console.warn('TurboFlow already initialized')
      return
    }

    this.initialized = true

    return this
  }

  configure(config) {
    this.config = { ...this.config, ...config }
    return this
  }

  registerAnimation(_name, _animation) {
    return this
  }

  destroy() {
    this.initialized = false
    return this
  }
}

export default TurboFlow
