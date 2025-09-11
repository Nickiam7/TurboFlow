class Generator {
  constructor(registry) {
    this.registry = registry
    this.generated = new Map()
    this.viewTransitionNames = new Set()
  }

  generate(transitions) {
    const css = []
    const processedAnimations = new Set()

    if (transitions.links) {
      transitions.links.forEach((link) => {
        this.generateTransitionCSS(link.transition, css, processedAnimations)
      })
    }

    if (transitions.forms) {
      transitions.forms.forEach((form) => {
        this.generateTransitionCSS(form.transition, css, processedAnimations)
        if (form.successTransition) {
          this.generateTransitionCSS(form.successTransition, css, processedAnimations)
        }
      })
    }

    if (transitions.frames) {
      transitions.frames.forEach((frame) => {
        this.generateTransitionCSS(frame.transition, css, processedAnimations, frame.id)
      })
    }

    if (transitions.targets) {
      transitions.targets.forEach((target) => {
        this.generateElementTransitionCSS(target, css)
      })
    }

    return css.join('\n')
  }

  generateTransitionCSS(animationName, css, processedAnimations, scopeId = null) {
    if (!animationName || processedAnimations.has(animationName)) return

    const animation = this.registry.get(animationName)
    if (!animation) return

    processedAnimations.add(animationName)

    const directions = animation.directions || {}
    const hasDirections = directions.forward || directions.back || directions.none
    
    // Generate CSS for each direction with html class selector
    if (directions.forward) {
      css.push(this.generateDirectionalCSS(animationName, 'forward', directions.forward, animation))
    }

    if (directions.back) {
      css.push(this.generateDirectionalCSS(animationName, 'back', directions.back, animation))
    }
    
    if (directions.none) {
      css.push(this.generateDirectionalCSS(animationName, 'none', directions.none, animation))
    }

    // Only generate default (non-directional) CSS if NO directions are defined
    if (animation.viewTransitions && !hasDirections) {
      css.push(
        this.generateDirectionalCSS(animationName, 'none', animation.viewTransitions, animation)
      )
    }
  }

  generateDirectionalCSS(animationName, direction, transitions, animation) {
    const { old, new: newTransition } = transitions
    if (!old || !newTransition) return ''

    const oldKeyframeName = `turbo-flow-${animationName}-old-${direction}`
    const newKeyframeName = `turbo-flow-${animationName}-new-${direction}`

    const oldKeyframes = this.generateKeyframes(oldKeyframeName, old)
    const newKeyframes = this.generateKeyframes(newKeyframeName, newTransition)

    const duration = animation.duration || 300
    const easing = animation.easing || 'ease-out'

    // Use combination of class and direction selectors
    let selector = ''
    if (direction === 'forward') {
      selector = `html.turboflow-${animationName}[data-turbo-visit-direction="forward"]`
    } else if (direction === 'back') {
      selector = `html.turboflow-${animationName}[data-turbo-visit-direction="back"]`
    } else {
      // For 'none' direction - use :not selector to avoid overriding directional CSS
      selector = `html.turboflow-${animationName}:not([data-turbo-visit-direction])`
    }

    return `
      ${oldKeyframes}
      ${newKeyframes}
      ${selector}::view-transition-old(root) {
        animation: ${oldKeyframeName} ${duration}ms ${easing};
      }
      ${selector}::view-transition-new(root) {
        animation: ${newKeyframeName} ${duration}ms ${easing};
      }
    `
  }

  generateElementTransitionCSS(target, css) {
    if (!target.id || !target.transition) return

    const animation = this.registry.get(target.transition)
    if (!animation) return

    const viewTransitionName = `turbo-flow-element-${target.id}`

    css.push(`
      #${target.id} {
        view-transition-name: ${viewTransitionName};
      }
    `)

    if (animation.viewTransitions) {
      const { old, new: newTransition } = animation.viewTransitions
      if (!old || !newTransition) return

      const oldKeyframeName = `${viewTransitionName}-old`
      const newKeyframeName = `${viewTransitionName}-new`

      const oldKeyframes = this.generateKeyframes(oldKeyframeName, old)
      const newKeyframes = this.generateKeyframes(newKeyframeName, newTransition)

      const duration = animation.duration || 300
      const easing = animation.easing || 'ease-out'

      css.push(`
        ${oldKeyframes}
        ${newKeyframes}
        #${target.id}::view-transition-old(${viewTransitionName}) {
          animation: ${oldKeyframeName} ${duration}ms ${easing};
        }
        #${target.id}::view-transition-new(${viewTransitionName}) {
          animation: ${newKeyframeName} ${duration}ms ${easing};
        }
      `)
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

  kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  clear() {
    this.generated.clear()
    this.viewTransitionNames.clear()
  }
}

export default Generator