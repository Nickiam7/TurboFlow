import Config from './core/config.js'
import AnimationRegistry from './core/animation-registry.js'
import Scanner from './core/scanner.js'
import Generator from './core/generator.js'
import Injector from './core/injector.js'
import * as animations from './animations/index.js'

class TurboFlow {
  constructor(options = {}) {
    this.config = new Config(options)
    this.registry = new AnimationRegistry()
    this.scanner = new Scanner()
    this.generator = new Generator(this.registry)
    this.injector = new Injector()
    this.initialized = false

    this.registerDefaultAnimations()
  }

  init() {
    if (this.initialized) {
      console.warn('TurboFlow already initialized')
      return this
    }

    this.scanner.setDefaultTransition(this.config.get('defaultTransition'))
    this.setupEventListeners()
    this.initialized = true

    return this
  }

  configure(options) {
    this.config.update(options)
    this.scanner.setDefaultTransition(this.config.get('defaultTransition'))
    return this
  }

  registerAnimation(name, animation) {
    this.registry.register(name, animation)
    return this
  }

  registerDefaultAnimations() {
    Object.entries(animations).forEach(([name, animation]) => {
      this.registry.register(name, animation)
    })
  }

  setupEventListeners() {
    document.addEventListener('turbo:before-render', this.handleBeforeRender.bind(this))
    document.addEventListener('turbo:before-frame-render', this.handleBeforeFrameRender.bind(this))
    document.addEventListener(
      'turbo:before-stream-render',
      this.handleBeforeStreamRender.bind(this)
    )
  }

  handleBeforeRender(event) {
    if (!this.config.shouldAnimate()) return

    const scanResults = this.scanner.scan(event.detail.newBody)
    const css = this.generator.generate(scanResults)

    if (css) {
      this.injector.inject(css)
    }
  }

  handleBeforeFrameRender(event) {
    if (!this.config.shouldAnimate()) return

    const frame = event.target
    const transition = this.config.getFrameTransition(frame.id)

    if (transition) {
      const css = this.generator.generate({
        frames: [{ id: frame.id, transition }],
      })

      if (css) {
        this.injector.inject(css, `frame-${frame.id}`)
      }
    }
  }

  handleBeforeStreamRender(event) {
    if (!this.config.shouldAnimate()) return

    const action = event.detail.action
    const transition = this.config.getStreamTransition(action)

    if (transition) {
      const css = this.generator.generate({
        streams: [{ action, transition }],
      })

      if (css) {
        this.injector.inject(css, `stream-${action}`)
      }
    }
  }

  destroy() {
    document.removeEventListener('turbo:before-render', this.handleBeforeRender)
    document.removeEventListener('turbo:before-frame-render', this.handleBeforeFrameRender)
    document.removeEventListener('turbo:before-stream-render', this.handleBeforeStreamRender)

    this.injector.clear()
    this.scanner.clearCache()
    this.generator.clear()
    this.initialized = false

    return this
  }
}

export default TurboFlow
