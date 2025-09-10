class TurboFlow {
  constructor(config = {}) {
    this.config = {
      defaultTransition: 'fade',
      duration: 300,
      easing: 'ease-out',
      debug: false,
      ...config
    }
    
    this.initialized = false
  }

  init() {
    if (this.initialized) {
      console.warn('TurboFlow already initialized')
      return
    }

    if (this.config.debug) {
      console.log('TurboFlow initializing with config:', this.config)
    }

    this.initialized = true
    
    return this
  }

  configure(config) {
    this.config = { ...this.config, ...config }
    return this
  }

  registerAnimation(name, animation) {
    console.log(`Registering animation: ${name}`)
    return this
  }

  destroy() {
    this.initialized = false
    return this
  }
}

export default TurboFlow