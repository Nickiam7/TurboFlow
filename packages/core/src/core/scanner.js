class Scanner {
  constructor() {
    this.cache = new Map()
    this.listeners = new Map()
    this.defaultTransition = null
  }

  scan(root = document) {
    const elements = {
      links: [],
      forms: [],
      frames: [],
      targets: [],
    }

    const links = root.querySelectorAll('a[data-turbo-flow], a[data-turbo-flow-target]')
    links.forEach((link) => {
      const transition = link.dataset.turboFlow
      const targetTransition = link.dataset.turboFlowTarget

      if (transition) {
        elements.links.push({
          element: link,
          transition,
          href: link.href,
        })
      }

      if (targetTransition) {
        elements.targets.push({
          element: link,
          transition: targetTransition,
          id: link.id,
        })
      }
    })

    const forms = root.querySelectorAll('form[data-turbo-flow]')
    forms.forEach((form) => {
      elements.forms.push({
        element: form,
        transition: form.dataset.turboFlow,
        successTransition: form.dataset.turboFlowSuccess,
        errorTransition: form.dataset.turboFlowError,
        action: form.action,
        method: form.method,
      })
    })

    const frames = root.querySelectorAll('turbo-frame[data-turbo-flow]')
    frames.forEach((frame) => {
      elements.frames.push({
        element: frame,
        transition: frame.dataset.turboFlow,
        id: frame.id,
      })
    })

    const targets = root.querySelectorAll('[data-turbo-flow-target]')
    targets.forEach((el) => {
      if (!el.matches('a, form, turbo-frame')) {
        elements.targets.push({
          element: el,
          transition: el.dataset.turboFlowTarget,
          id: el.id,
        })
      }
    })

    this.cache.set(root, elements)
    return elements
  }

  findTransition(element) {
    if (!element) return this.defaultTransition

    const turboFlow = element.dataset?.turboFlow
    if (turboFlow) return turboFlow

    const link = element.closest('a[data-turbo-flow]')
    if (link) return link.dataset.turboFlow

    const form = element.closest('form[data-turbo-flow]')
    if (form) return form.dataset.turboFlow

    return this.defaultTransition
  }

  attachListeners() {
    const handleClick = (event) => {
      const link = event.target.closest('a[data-turbo-flow]')
      if (link) {
        const transition = link.dataset.turboFlow
        this.notifyListeners('link:click', { element: link, transition, event })
      }
    }

    const handleSubmit = (event) => {
      const form = event.target
      if (form.matches('form[data-turbo-flow]')) {
        const transition = form.dataset.turboFlow
        this.notifyListeners('form:submit', { element: form, transition, event })
      }
    }

    const handleTurboBeforeRender = (event) => {
      const transition = this.findTransition(event.target)
      this.notifyListeners('turbo:before-render', { transition, event })
    }

    const handleTurboBeforeFrameRender = (event) => {
      const frame = event.target
      const transition = frame.dataset?.turboFlow || this.defaultTransition
      this.notifyListeners('turbo:before-frame-render', { element: frame, transition, event })
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('submit', handleSubmit)
    document.addEventListener('turbo:before-render', handleTurboBeforeRender)
    document.addEventListener('turbo:before-frame-render', handleTurboBeforeFrameRender)

    this.cleanup = () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('submit', handleSubmit)
      document.removeEventListener('turbo:before-render', handleTurboBeforeRender)
      document.removeEventListener('turbo:before-frame-render', handleTurboBeforeFrameRender)
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  setDefaultTransition(transition) {
    this.defaultTransition = transition
  }

  clearCache() {
    this.cache.clear()
  }

  clear() {
    this.cache.clear()
    this.listeners.clear()
    if (this.cleanup) {
      this.cleanup()
    }
  }

  getCached(root = document) {
    return this.cache.get(root)
  }
}

export default Scanner
