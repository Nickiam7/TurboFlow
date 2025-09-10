class Injector {
  constructor() {
    this.styleElement = null
    this.styleId = 'turbo-flow-styles'
    this.injectedCSS = new Map()
  }

  inject(css, id = null) {
    if (!css) return

    const styleId = id ? `${this.styleId}-${id}` : this.styleId

    if (this.injectedCSS.has(styleId)) {
      const existingCSS = this.injectedCSS.get(styleId)
      if (existingCSS === css) return
    }

    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.setAttribute('data-turbo-flow', 'true')
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = css
    this.injectedCSS.set(styleId, css)

    if (!id) {
      this.styleElement = styleElement
    }

    return styleElement
  }

  append(css, id = null) {
    const styleId = id ? `${this.styleId}-${id}` : this.styleId
    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      return this.inject(css, id)
    }

    const existingCSS = this.injectedCSS.get(styleId) || ''
    const newCSS = existingCSS + '\n' + css

    styleElement.textContent = newCSS
    this.injectedCSS.set(styleId, newCSS)

    return styleElement
  }

  remove(id = null) {
    const styleId = id ? `${this.styleId}-${id}` : this.styleId
    const styleElement = document.getElementById(styleId)

    if (styleElement) {
      styleElement.remove()
      this.injectedCSS.delete(styleId)

      if (!id && this.styleElement === styleElement) {
        this.styleElement = null
      }
    }
  }

  clear() {
    const styleElements = document.querySelectorAll('style[data-turbo-flow="true"]')
    styleElements.forEach((element) => element.remove())

    this.injectedCSS.clear()
    this.styleElement = null
  }

  getInjectedCSS(id = null) {
    const styleId = id ? `${this.styleId}-${id}` : this.styleId
    return this.injectedCSS.get(styleId) || null
  }

  hasInjectedCSS(id = null) {
    const styleId = id ? `${this.styleId}-${id}` : this.styleId
    return this.injectedCSS.has(styleId)
  }

  update(css, id = null) {
    return this.inject(css, id)
  }

  createMediaQueryWrapper(css, query) {
    return `@media ${query} {\n${css}\n}`
  }

  injectForReducedMotion(css) {
    const wrappedCSS = this.createMediaQueryWrapper(css, '(prefers-reduced-motion: reduce)')
    return this.inject(wrappedCSS, 'reduced-motion')
  }

  cleanup() {
    const unusedStyles = []

    this.injectedCSS.forEach((css, styleId) => {
      const element = document.getElementById(styleId)
      if (!element) {
        unusedStyles.push(styleId)
      }
    })

    unusedStyles.forEach((styleId) => {
      this.injectedCSS.delete(styleId)
    })
  }
}

export default Injector
