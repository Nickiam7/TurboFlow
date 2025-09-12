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
    this.currentTransition = null
    this.navigationHistory = new Map()

    this.registerDefaultAnimations()
  }

  init() {
    if (this.initialized) {
      console.warn('TurboFlow already initialized')
      return this
    }

    this.scanner.setDefaultTransition(this.config.get('defaultTransition'))
    this.setupEventListeners()
    this.injectBaseStyles()
    this.initialized = true

    return this
  }

  configure(options) {
    this.config.update(options)
    this.scanner.setDefaultTransition(this.config.get('defaultTransition'))
    this.injectBaseStyles()
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

  injectBaseStyles() {
    // Don't inject all animations upfront - causes specificity conflicts
    // CSS will be injected on-demand when transitions are used
  }

  setupEventListeners() {
    document.addEventListener('turbo:click', this.handleClick.bind(this))
    document.addEventListener('turbo:before-visit', this.handleBeforeVisit.bind(this))
    document.addEventListener('turbo:visit', this.handleVisit.bind(this))
    document.addEventListener('turbo:before-render', this.handleBeforeRender.bind(this))
    document.addEventListener('turbo:render', this.handleRender.bind(this))
    document.addEventListener('turbo:load', this.handleLoad.bind(this))
    document.addEventListener('turbo:before-frame-render', this.handleBeforeFrameRender.bind(this))
    document.addEventListener(
      'turbo:before-stream-render',
      this.handleBeforeStreamRender.bind(this)
    )
  }

  handleRender() {
    if (this.config.get('debug')) {
      console.log('TurboFlow: Render event fired')
      console.log('TurboFlow: Current HTML classes during render:', document.documentElement.className)
      console.log('TurboFlow: data-turbo-visit-direction:', document.documentElement.getAttribute('data-turbo-visit-direction'))
    }
  }

  handleClick(event) {
    const link = event.target.closest('a[data-turbo-flow]')
    if (link) {
      this.currentTransition = link.dataset.turboFlow
      if (this.config.get('debug')) {
        console.log('TurboFlow: Click detected, transition:', this.currentTransition)
      }
    }
  }

  handleBeforeVisit(event) {
    if (!this.config.shouldAnimate()) return

    let transition = this.currentTransition

    if (!transition) {
      const clickedLink = document.querySelector(`a[href="${event.detail.url}"]`)

      if (clickedLink?.dataset.turboFlow) {
        transition = clickedLink.dataset.turboFlow
      } else {
        transition = this.config.get('defaultTransition')
      }
    }

    this.pendingTransition = transition
    this.pendingUrl = event.detail.url
    this.currentUrl = window.location.href

    if (this.config.get('debug')) {
      console.log('TurboFlow: Before visit, storing transition:', transition || this.config.get('defaultTransition'))
    }
  }

  handleVisit(event) {
    if (!this.config.shouldAnimate()) return

    if (!this.pendingTransition) {
      const direction = event.detail.action

      if (direction === 'restore') {
        const currentUrl = window.location.href
        const storedTransition = this.navigationHistory.get(currentUrl)

        if (storedTransition) {
          this.pendingTransition = storedTransition
          this.pendingUrl = event.detail.url

          if (this.config.get('debug')) {
            console.log('TurboFlow: Restore navigation detected, using stored transition:', storedTransition)
          }
        } else {
          this.pendingTransition = this.config.get('defaultTransition')
          this.pendingUrl = event.detail.url

          if (this.config.get('debug')) {
            console.log('TurboFlow: Restore navigation, no stored transition, using default')
          }
        }
      }
    }
  }

  handleBeforeRender(event) {
    if (this.pendingTransition) {
      const direction = document.documentElement.getAttribute('data-turbo-visit-direction')
      let transition = this.pendingTransition

      if (direction === 'back') {
        const destinationUrl = this.pendingUrl
        const storedTransition = this.navigationHistory.get(destinationUrl)
        if (storedTransition) {
          transition = storedTransition
          if (this.config.get('debug')) {
            console.log('TurboFlow: Back navigation, using stored transition:', storedTransition)
          }
        }
      } else if (this.currentUrl) {
        this.navigationHistory.set(this.currentUrl, transition)

        if (this.navigationHistory.size > 50) {
          const firstKey = this.navigationHistory.keys().next().value
          this.navigationHistory.delete(firstKey)
        }

        if (this.config.get('debug')) {
          console.log('TurboFlow: Stored transition for leaving URL:', this.currentUrl, '→', transition)
        }
      }

      const css = this.generator.generate({ links: [{ transition }] })
      if (css) {
        this.injector.inject(css, 'turboflow-active-transition')
        if (this.config.get('debug')) {
          console.log('TurboFlow: Injected CSS for transition:', transition)
        }
      }

      const classes = this.registry.list().map(n => `turboflow-${n}`)
      document.documentElement.classList.remove(...classes)

      document.documentElement.classList.add(`turboflow-${transition}`)

      if (this.config.get('debug')) {
        console.log('TurboFlow: Before render - Added class:', `turboflow-${transition}`)
        console.log('TurboFlow: data-turbo-visit-direction:', direction)
        console.log('TurboFlow: Navigation history size:', this.navigationHistory.size)
      }

      this.pendingTransition = null
      this.pendingUrl = null
      this.currentUrl = null
    }

    setTimeout(() => {
      document.documentElement.classList.remove(...this.registry.list().map(n => `turboflow-${n}`))
      if (this.config.get('debug')) {
        console.log('TurboFlow: Cleaned up classes')
      }
    }, 1000)
  }

  handleLoad() {
    this.currentTransition = null
    this.scanner.clearCache()

    const scanResults = this.scanner.scan(document.body)

    if (scanResults.targets && scanResults.targets.length > 0) {
      const validTargets = scanResults.targets.filter(target => {
        return target.id && target.transition && (target.transition === 'morph' || this.registry.get(target.transition))
      })

      if (validTargets.length > 0) {
        const css = this.generator.generate({ targets: validTargets })
        if (css) {
          this.injector.inject(css, 'element-transitions')
          if (this.config.get('debug')) {
            console.log('TurboFlow: Generated CSS for element transitions:', validTargets.map(t => `${t.id}:${t.transition}`))
          }
        }
      }
    }

    if (this.config.get('debug')) {
      console.log('TurboFlow: Page loaded, found elements:', scanResults)
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
    document.removeEventListener('turbo:click', this.handleClick)
    document.removeEventListener('turbo:before-visit', this.handleBeforeVisit)
    document.removeEventListener('turbo:visit', this.handleVisit)
    document.removeEventListener('turbo:before-render', this.handleBeforeRender)
    document.removeEventListener('turbo:load', this.handleLoad)
    document.removeEventListener('turbo:before-frame-render', this.handleBeforeFrameRender)
    document.removeEventListener('turbo:before-stream-render', this.handleBeforeStreamRender)

    this.injector.clear()
    this.scanner.clearCache()
    this.generator.clear()
    this.navigationHistory.clear()
    this.initialized = false

    return this
  }
}

export default TurboFlow
