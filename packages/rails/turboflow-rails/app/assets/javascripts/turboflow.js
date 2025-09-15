class Config {
  constructor(options = {}) {
    this.defaults = {
      defaultTransition: "fade",
      duration: 300,
      easing: "ease-out",
      debug: false,
      autoInject: true,
      reducedMotion: "respect",
      prefersReducedMotionFallback: "none",
      cleanupInterval: 5e3,
      frames: {},
      streams: {
        append: "fade-up",
        prepend: "fade-down",
        replace: "morph",
        update: "morph",
        remove: "fade-out",
        before: "slide-right",
        after: "slide-left"
      },
      targets: {},
      customAnimations: {}
    };
    this.config = this.merge(this.defaults, options);
    this.listeners = /* @__PURE__ */ new Set();
  }
  merge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this.merge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  get(key = null) {
    if (!key) return this.config;
    const keys = key.split(".");
    let value = this.config;
    for (const k of keys) {
      value = value[k];
      if (value === void 0) return void 0;
    }
    return value;
  }
  set(key, value) {
    const keys = key.split(".");
    const lastKey = keys.pop();
    let target = this.config;
    for (const k of keys) {
      if (!target[k] || typeof target[k] !== "object") {
        target[k] = {};
      }
      target = target[k];
    }
    const oldValue = target[lastKey];
    target[lastKey] = value;
    this.notifyListeners(key, value, oldValue);
    return this;
  }
  update(options) {
    const oldConfig = { ...this.config };
    this.config = this.merge(this.config, options);
    this.notifyListeners("*", this.config, oldConfig);
    return this;
  }
  reset(options = {}) {
    const oldConfig = { ...this.config };
    this.config = this.merge(this.defaults, options);
    this.notifyListeners("reset", this.config, oldConfig);
    return this;
  }
  getTransitionForElement(element) {
    if (!element) return this.config.defaultTransition;
    if (element.dataset.turboFlow) {
      return element.dataset.turboFlow;
    }
    if (element.dataset.turboFlowTarget) {
      return element.dataset.turboFlowTarget;
    }
    if (element.tagName === "TURBO-FRAME" && element.id) {
      return this.config.frames[element.id] || this.config.defaultTransition;
    }
    return this.config.defaultTransition;
  }
  getStreamTransition(action) {
    return this.config.streams[action] || this.config.defaultTransition;
  }
  getFrameTransition(frameId) {
    return this.config.frames[frameId] || this.config.defaultTransition;
  }
  shouldAnimate() {
    if (!this.config.autoInject) return false;
    if (this.config.reducedMotion === "respect") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      return !prefersReduced;
    }
    return this.config.reducedMotion !== "disable";
  }
  getReducedMotionFallback() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced && this.config.reducedMotion === "respect") {
      return this.config.prefersReducedMotionFallback;
    }
    return null;
  }
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  removeListener(callback) {
    this.listeners.delete(callback);
  }
  notifyListeners(key, newValue, oldValue) {
    this.listeners.forEach((callback) => {
      try {
        callback(key, newValue, oldValue);
      } catch (error) {
        if (this.config.debug) {
          console.error("Config listener error:", error);
        }
      }
    });
  }
  validate() {
    const errors = [];
    if (typeof this.config.duration !== "number" || this.config.duration < 0) {
      errors.push("Duration must be a positive number");
    }
    if (typeof this.config.cleanupInterval !== "number" || this.config.cleanupInterval < 0) {
      errors.push("Cleanup interval must be a positive number");
    }
    const validReducedMotion = ["respect", "disable", "force"];
    if (!validReducedMotion.includes(this.config.reducedMotion)) {
      errors.push(`Reduced motion must be one of: ${validReducedMotion.join(", ")}`);
    }
    return errors.length > 0 ? errors : null;
  }
  export() {
    return JSON.parse(JSON.stringify(this.config));
  }
  import(config) {
    const errors = this.validate();
    if (errors) {
      throw new Error(`Invalid configuration: ${errors.join("; ")}`);
    }
    this.update(config);
    return this;
  }
}
class AnimationRegistry {
  constructor() {
    this.animations = /* @__PURE__ */ new Map();
    this.keyframes = /* @__PURE__ */ new Map();
  }
  register(name, animation) {
    if (!name || !animation) {
      throw new Error("Animation name and definition are required");
    }
    this.animations.set(name, {
      ...animation,
      name,
      keyframes: animation.keyframes || {},
      duration: animation.duration || 300,
      easing: animation.easing || "ease-out"
    });
    return this;
  }
  get(name) {
    return this.animations.get(name);
  }
  has(name) {
    return this.animations.has(name);
  }
  generateCSS(name, options = {}) {
    var _a;
    const animation = this.get(name);
    if (!animation) {
      console.warn(`Animation "${name}" not found`);
      return "";
    }
    const duration = options.duration || animation.duration;
    const easing = options.easing || animation.easing;
    const keyframeName = `turbo-flow-${name}-${Date.now()}`;
    const keyframes = ((_a = animation.viewTransitions) == null ? void 0 : _a.new) || { from: {}, to: {} };
    const keyframeCSS = this.generateKeyframes(keyframeName, keyframes);
    const animationCSS = `${keyframeName} ${duration}ms ${easing}`;
    return {
      keyframeCSS,
      animationCSS,
      keyframeName
    };
  }
  generateKeyframes(name, keyframes) {
    const frames = Object.entries(keyframes).map(([key, value]) => {
      const properties = Object.entries(value).map(([prop, val]) => `${this.kebabCase(prop)}: ${val};`).join(" ");
      return `${key} { ${properties} }`;
    }).join(" ");
    return `@keyframes ${name} { ${frames} }`;
  }
  generateViewTransitionCSS(name, direction = "forward") {
    const animation = this.get(name);
    if (!animation) return "";
    let transitions = animation.viewTransitions;
    if (animation.directions && animation.directions[direction]) {
      transitions = animation.directions[direction];
    }
    const { old, new: newTransition } = transitions || {};
    if (!old || !newTransition) return "";
    const oldKeyframes = this.generateKeyframes(`turbo-flow-${name}-old-${direction}`, old);
    const newKeyframes = this.generateKeyframes(
      `turbo-flow-${name}-new-${direction}`,
      newTransition
    );
    return `
      ${oldKeyframes}
      ${newKeyframes}
      ::view-transition-old(turbo-flow-${name}) {
        animation: turbo-flow-${name}-old-${direction} ${animation.duration}ms ${animation.easing};
      }
      ::view-transition-new(turbo-flow-${name}) {
        animation: turbo-flow-${name}-new-${direction} ${animation.duration}ms ${animation.easing};
      }
    `;
  }
  kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
  list() {
    return Array.from(this.animations.keys());
  }
  clear() {
    this.animations.clear();
    this.keyframes.clear();
  }
}
class Scanner {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.defaultTransition = null;
  }
  scan(root = document) {
    const elements = {
      links: [],
      forms: [],
      frames: [],
      targets: []
    };
    const links = root.querySelectorAll("a[data-turbo-flow], a[data-turbo-flow-target]");
    links.forEach((link) => {
      const transition = link.dataset.turboFlow;
      const targetTransition = link.dataset.turboFlowTarget;
      if (transition) {
        elements.links.push({
          element: link,
          transition,
          href: link.href
        });
      }
      if (targetTransition) {
        elements.targets.push({
          element: link,
          transition: targetTransition,
          id: link.id
        });
      }
    });
    const forms = root.querySelectorAll("form[data-turbo-flow]");
    forms.forEach((form) => {
      elements.forms.push({
        element: form,
        transition: form.dataset.turboFlow,
        successTransition: form.dataset.turboFlowSuccess,
        errorTransition: form.dataset.turboFlowError,
        action: form.action,
        method: form.method
      });
    });
    const frames = root.querySelectorAll("turbo-frame[data-turbo-flow]");
    frames.forEach((frame) => {
      elements.frames.push({
        element: frame,
        transition: frame.dataset.turboFlow,
        id: frame.id
      });
    });
    const targets = root.querySelectorAll("[data-turbo-flow-target]");
    targets.forEach((el) => {
      if (!el.matches("a, form, turbo-frame")) {
        elements.targets.push({
          element: el,
          transition: el.dataset.turboFlowTarget,
          id: el.id
        });
      }
    });
    this.cache.set(root, elements);
    return elements;
  }
  findTransition(element) {
    var _a;
    if (!element) return this.defaultTransition;
    const turboFlow = (_a = element.dataset) == null ? void 0 : _a.turboFlow;
    if (turboFlow) return turboFlow;
    const link = element.closest("a[data-turbo-flow]");
    if (link) return link.dataset.turboFlow;
    const form = element.closest("form[data-turbo-flow]");
    if (form) return form.dataset.turboFlow;
    return this.defaultTransition;
  }
  attachListeners() {
    const handleClick = (event) => {
      const link = event.target.closest("a[data-turbo-flow]");
      if (link) {
        const transition = link.dataset.turboFlow;
        this.notifyListeners("link:click", { element: link, transition, event });
      }
    };
    const handleSubmit = (event) => {
      const form = event.target;
      if (form.matches("form[data-turbo-flow]")) {
        const transition = form.dataset.turboFlow;
        this.notifyListeners("form:submit", { element: form, transition, event });
      }
    };
    const handleTurboBeforeRender = (event) => {
      const transition = this.findTransition(event.target);
      this.notifyListeners("turbo:before-render", { transition, event });
    };
    const handleTurboBeforeFrameRender = (event) => {
      var _a;
      const frame = event.target;
      const transition = ((_a = frame.dataset) == null ? void 0 : _a.turboFlow) || this.defaultTransition;
      this.notifyListeners("turbo:before-frame-render", { element: frame, transition, event });
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("turbo:before-render", handleTurboBeforeRender);
    document.addEventListener("turbo:before-frame-render", handleTurboBeforeFrameRender);
    this.cleanup = () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
      document.removeEventListener("turbo:before-render", handleTurboBeforeRender);
      document.removeEventListener("turbo:before-frame-render", handleTurboBeforeFrameRender);
    };
  }
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      var _a;
      (_a = this.listeners.get(event)) == null ? void 0 : _a.delete(callback);
    };
  }
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
  setDefaultTransition(transition) {
    this.defaultTransition = transition;
  }
  clearCache() {
    this.cache.clear();
  }
  clear() {
    this.cache.clear();
    this.listeners.clear();
    if (this.cleanup) {
      this.cleanup();
    }
  }
  getCached(root = document) {
    return this.cache.get(root);
  }
}
class Generator {
  constructor(registry) {
    this.registry = registry;
    this.generated = /* @__PURE__ */ new Map();
    this.viewTransitionNames = /* @__PURE__ */ new Set();
  }
  generate(transitions) {
    const css = [];
    const processedAnimations = /* @__PURE__ */ new Set();
    if (transitions.links) {
      transitions.links.forEach((link) => {
        this.generateTransitionCSS(link.transition, css, processedAnimations);
      });
    }
    if (transitions.forms) {
      transitions.forms.forEach((form) => {
        this.generateTransitionCSS(form.transition, css, processedAnimations);
        if (form.successTransition) {
          this.generateTransitionCSS(form.successTransition, css, processedAnimations);
        }
      });
    }
    if (transitions.frames) {
      transitions.frames.forEach((frame) => {
        this.generateTransitionCSS(frame.transition, css, processedAnimations, frame.id);
      });
    }
    if (transitions.targets) {
      transitions.targets.forEach((target) => {
        this.generateElementTransitionCSS(target, css);
      });
    }
    return css.join("\n");
  }
  generateTransitionCSS(animationName, css, processedAnimations, scopeId = null) {
    if (!animationName || processedAnimations.has(animationName)) return;
    const animation = this.registry.get(animationName);
    if (!animation) return;
    processedAnimations.add(animationName);
    const directions = animation.directions || {};
    const hasDirections = directions.forward || directions.back || directions.none;
    if (directions.forward) {
      css.push(this.generateDirectionalCSS(animationName, "forward", directions.forward, animation));
    }
    if (directions.back) {
      css.push(this.generateDirectionalCSS(animationName, "back", directions.back, animation));
    }
    if (directions.none) {
      css.push(this.generateDirectionalCSS(animationName, "none", directions.none, animation));
    }
    if (animation.viewTransitions && !hasDirections) {
      css.push(
        this.generateDirectionalCSS(animationName, "none", animation.viewTransitions, animation)
      );
    }
  }
  generateDirectionalCSS(animationName, direction, transitions, animation) {
    const { old, new: newTransition } = transitions;
    if (!old || !newTransition) return "";
    const oldKeyframeName = `turbo-flow-${animationName}-old-${direction}`;
    const newKeyframeName = `turbo-flow-${animationName}-new-${direction}`;
    const oldKeyframes = this.generateKeyframes(oldKeyframeName, old);
    const newKeyframes = this.generateKeyframes(newKeyframeName, newTransition);
    const duration = animation.duration || 300;
    const easing = animation.easing || "ease-out";
    let selector = "";
    if (direction === "forward") {
      selector = `html.turboflow-${animationName}[data-turbo-visit-direction="forward"]`;
    } else if (direction === "back") {
      selector = `html.turboflow-${animationName}[data-turbo-visit-direction="back"]`;
    } else {
      selector = `html.turboflow-${animationName}:not([data-turbo-visit-direction])`;
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
    `;
  }
  generateElementTransitionCSS(target, css) {
    if (!target.id || !target.transition) return;
    if (target.transition === "morph") {
      const viewTransitionName2 = `turbo-flow-morph-${target.id}`;
      this.viewTransitionNames.add(viewTransitionName2);
      css.push(`
        #${target.id} {
          view-transition-name: ${viewTransitionName2};
        }
      `);
      return;
    }
    const animation = this.registry.get(target.transition);
    if (!animation) return;
    const viewTransitionName = `turbo-flow-element-${target.id}`;
    this.viewTransitionNames.add(viewTransitionName);
    css.push(`
      #${target.id} {
        view-transition-name: ${viewTransitionName};
      }
    `);
    if (animation.viewTransitions) {
      const { old, new: newTransition } = animation.viewTransitions;
      if (!old || !newTransition) return;
      const oldKeyframeName = `${viewTransitionName}-old`;
      const newKeyframeName = `${viewTransitionName}-new`;
      const oldKeyframes = this.generateKeyframes(oldKeyframeName, old);
      const newKeyframes = this.generateKeyframes(newKeyframeName, newTransition);
      const duration = animation.duration || 300;
      const easing = animation.easing || "ease-out";
      css.push(`
        ${oldKeyframes}
        ${newKeyframes}
        ::view-transition-old(${viewTransitionName}) {
          animation: ${oldKeyframeName} ${duration}ms ${easing};
        }
        ::view-transition-new(${viewTransitionName}) {
          animation: ${newKeyframeName} ${duration}ms ${easing};
        }
      `);
    }
  }
  generateKeyframes(name, keyframes) {
    const frames = Object.entries(keyframes).map(([key, value]) => {
      const properties = Object.entries(value).map(([prop, val]) => `${this.kebabCase(prop)}: ${val};`).join(" ");
      return `${key} { ${properties} }`;
    }).join(" ");
    return `@keyframes ${name} { ${frames} }`;
  }
  kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
  clear() {
    this.generated.clear();
    this.viewTransitionNames.clear();
  }
}
class Injector {
  constructor() {
    this.styleElement = null;
    this.styleId = "turbo-flow-styles";
    this.injectedCSS = /* @__PURE__ */ new Map();
  }
  inject(css, id = null) {
    if (!css) return;
    const styleId = id ? `${this.styleId}-${id}` : this.styleId;
    if (this.injectedCSS.has(styleId)) {
      const existingCSS = this.injectedCSS.get(styleId);
      if (existingCSS === css) return;
    }
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.setAttribute("data-turbo-flow", "true");
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
    this.injectedCSS.set(styleId, css);
    if (!id) {
      this.styleElement = styleElement;
    }
    return styleElement;
  }
  append(css, id = null) {
    const styleId = id ? `${this.styleId}-${id}` : this.styleId;
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      return this.inject(css, id);
    }
    const existingCSS = this.injectedCSS.get(styleId) || "";
    const newCSS = existingCSS + "\n" + css;
    styleElement.textContent = newCSS;
    this.injectedCSS.set(styleId, newCSS);
    return styleElement;
  }
  remove(id = null) {
    const styleId = id ? `${this.styleId}-${id}` : this.styleId;
    const styleElement = document.getElementById(styleId);
    if (styleElement) {
      styleElement.remove();
      this.injectedCSS.delete(styleId);
      if (!id && this.styleElement === styleElement) {
        this.styleElement = null;
      }
    }
  }
  clear() {
    const styleElements = document.querySelectorAll('style[data-turbo-flow="true"]');
    styleElements.forEach((element) => element.remove());
    this.injectedCSS.clear();
    this.styleElement = null;
  }
  getInjectedCSS(id = null) {
    const styleId = id ? `${this.styleId}-${id}` : this.styleId;
    return this.injectedCSS.get(styleId) || null;
  }
  hasInjectedCSS(id = null) {
    const styleId = id ? `${this.styleId}-${id}` : this.styleId;
    return this.injectedCSS.has(styleId);
  }
  update(css, id = null) {
    return this.inject(css, id);
  }
  createMediaQueryWrapper(css, query) {
    return `@media ${query} {
${css}
}`;
  }
  injectForReducedMotion(css) {
    const wrappedCSS = this.createMediaQueryWrapper(css, "(prefers-reduced-motion: reduce)");
    return this.inject(wrappedCSS, "reduced-motion");
  }
  cleanup() {
    const unusedStyles = [];
    this.injectedCSS.forEach((css, styleId) => {
      const element = document.getElementById(styleId);
      if (!element) {
        unusedStyles.push(styleId);
      }
    });
    unusedStyles.forEach((styleId) => {
      this.injectedCSS.delete(styleId);
    });
  }
}
const fade = {
  name: "fade",
  duration: 300,
  easing: "ease-out",
  viewTransitions: {
    old: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },
    new: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    }
  },
  directions: {
    forward: null,
    back: null,
    none: null
  }
};
const slide = {
  name: "slide",
  duration: 300,
  easing: "ease-out",
  viewTransitions: {
    old: {
      from: { transform: "translateX(0)", opacity: 1 },
      to: { transform: "translateX(-100%)", opacity: 0 }
    },
    new: {
      from: { transform: "translateX(100%)", opacity: 0 },
      to: { transform: "translateX(0)", opacity: 1 }
    }
  },
  directions: {
    forward: {
      old: {
        from: { transform: "translateX(0)", opacity: 1 },
        to: { transform: "translateX(-100%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateX(100%)", opacity: 0 },
        to: { transform: "translateX(0)", opacity: 1 }
      }
    },
    back: {
      old: {
        from: { transform: "translateX(0)", opacity: 1 },
        to: { transform: "translateX(100%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateX(-100%)", opacity: 0 },
        to: { transform: "translateX(0)", opacity: 1 }
      }
    },
    none: {
      old: {
        from: { transform: "translateX(0)", opacity: 1 },
        to: { transform: "translateX(-50%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateX(50%)", opacity: 0 },
        to: { transform: "translateX(0)", opacity: 1 }
      }
    }
  }
};
const slideUp = {
  name: "slide-up",
  duration: 300,
  easing: "ease-out",
  viewTransitions: {
    old: {
      from: { transform: "translateY(0)", opacity: 1 },
      to: { transform: "translateY(-100%)", opacity: 0 }
    },
    new: {
      from: { transform: "translateY(100%)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 }
    }
  },
  directions: {
    forward: {
      old: {
        from: { transform: "translateY(0)", opacity: 1 },
        to: { transform: "translateY(-100%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateY(100%)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 }
      }
    },
    back: {
      old: {
        from: { transform: "translateY(0)", opacity: 1 },
        to: { transform: "translateY(100%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateY(-100%)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 }
      }
    },
    none: {
      old: {
        from: { transform: "translateY(0)", opacity: 1 },
        to: { transform: "translateY(-50%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateY(50%)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 }
      }
    }
  }
};
const slideDown = {
  name: "slide-down",
  duration: 300,
  easing: "ease-out",
  viewTransitions: {
    old: {
      from: { transform: "translateY(0)", opacity: 1 },
      to: { transform: "translateY(100%)", opacity: 0 }
    },
    new: {
      from: { transform: "translateY(-100%)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 }
    }
  },
  directions: {
    forward: {
      old: {
        from: { transform: "translateY(0)", opacity: 1 },
        to: { transform: "translateY(100%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateY(-100%)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 }
      }
    },
    back: {
      old: {
        from: { transform: "translateY(0)", opacity: 1 },
        to: { transform: "translateY(-100%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateY(100%)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 }
      }
    },
    none: {
      old: {
        from: { transform: "translateY(0)", opacity: 1 },
        to: { transform: "translateY(50%)", opacity: 0 }
      },
      new: {
        from: { transform: "translateY(-50%)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 }
      }
    }
  }
};
const zoom = {
  name: "zoom",
  duration: 300,
  easing: "ease-out",
  viewTransitions: {
    old: {
      from: { transform: "scale(1)", opacity: 1 },
      to: { transform: "scale(1.1)", opacity: 0 }
    },
    new: {
      from: { transform: "scale(0.9)", opacity: 0 },
      to: { transform: "scale(1)", opacity: 1 }
    }
  },
  directions: {
    forward: {
      old: {
        from: { transform: "scale(1)", opacity: 1 },
        to: { transform: "scale(0.8)", opacity: 0 }
      },
      new: {
        from: { transform: "scale(1.2)", opacity: 0 },
        to: { transform: "scale(1)", opacity: 1 }
      }
    },
    back: {
      old: {
        from: { transform: "scale(1)", opacity: 1 },
        to: { transform: "scale(1.2)", opacity: 0 }
      },
      new: {
        from: { transform: "scale(0.8)", opacity: 0 },
        to: { transform: "scale(1)", opacity: 1 }
      }
    },
    none: {
      old: {
        from: { transform: "scale(1)", opacity: 1 },
        to: { transform: "scale(0.95)", opacity: 0 }
      },
      new: {
        from: { transform: "scale(1.05)", opacity: 0 },
        to: { transform: "scale(1)", opacity: 1 }
      }
    }
  }
};
const flip = {
  name: "flip",
  duration: 400,
  easing: "ease-in-out",
  viewTransitions: {
    old: {
      from: {
        transform: "perspective(600px) rotateY(0deg)",
        opacity: 1
      },
      to: {
        transform: "perspective(600px) rotateY(-90deg)",
        opacity: 0
      }
    },
    new: {
      from: {
        transform: "perspective(600px) rotateY(90deg)",
        opacity: 0
      },
      to: {
        transform: "perspective(600px) rotateY(0deg)",
        opacity: 1
      }
    }
  },
  directions: {
    forward: {
      old: {
        from: {
          transform: "perspective(600px) rotateY(0deg)",
          opacity: 1
        },
        to: {
          transform: "perspective(600px) rotateY(-90deg)",
          opacity: 0
        }
      },
      new: {
        from: {
          transform: "perspective(600px) rotateY(90deg)",
          opacity: 0
        },
        to: {
          transform: "perspective(600px) rotateY(0deg)",
          opacity: 1
        }
      }
    },
    back: {
      old: {
        from: {
          transform: "perspective(600px) rotateY(0deg)",
          opacity: 1
        },
        to: {
          transform: "perspective(600px) rotateY(90deg)",
          opacity: 0
        }
      },
      new: {
        from: {
          transform: "perspective(600px) rotateY(-90deg)",
          opacity: 0
        },
        to: {
          transform: "perspective(600px) rotateY(0deg)",
          opacity: 1
        }
      }
    },
    none: {
      old: {
        from: {
          transform: "perspective(600px) rotateY(0deg)",
          opacity: 1
        },
        to: {
          transform: "perspective(600px) rotateY(-45deg)",
          opacity: 0
        }
      },
      new: {
        from: {
          transform: "perspective(600px) rotateY(45deg)",
          opacity: 0
        },
        to: {
          transform: "perspective(600px) rotateY(0deg)",
          opacity: 1
        }
      }
    }
  }
};
const morph = {
  name: "morph",
  duration: 400,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  viewTransitions: {
    old: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },
    new: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    }
  },
  directions: {
    forward: null,
    back: null,
    none: null
  },
  requiresElement: true,
  usesViewTransitionName: true
};
const animations = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  fade,
  flip,
  morph,
  slide,
  slideDown,
  slideUp,
  zoom
}, Symbol.toStringTag, { value: "Module" }));
class TurboFlow {
  constructor(options = {}) {
    this.config = new Config(options);
    this.registry = new AnimationRegistry();
    this.scanner = new Scanner();
    this.generator = new Generator(this.registry);
    this.injector = new Injector();
    this.initialized = false;
    this.currentTransition = null;
    this.navigationHistory = /* @__PURE__ */ new Map();
    this.registerDefaultAnimations();
  }
  init() {
    if (this.initialized) {
      console.warn("TurboFlow already initialized");
      return this;
    }
    this.scanner.setDefaultTransition(this.config.get("defaultTransition"));
    this.setupEventListeners();
    this.injectBaseStyles();
    this.initialized = true;
    return this;
  }
  configure(options) {
    this.config.update(options);
    this.scanner.setDefaultTransition(this.config.get("defaultTransition"));
    this.injectBaseStyles();
    return this;
  }
  registerAnimation(name, animation) {
    this.registry.register(name, animation);
    return this;
  }
  registerDefaultAnimations() {
    Object.entries(animations).forEach(([name, animation]) => {
      this.registry.register(name, animation);
    });
  }
  injectBaseStyles() {
  }
  setupEventListeners() {
    document.addEventListener("turbo:click", this.handleClick.bind(this));
    document.addEventListener("turbo:before-visit", this.handleBeforeVisit.bind(this));
    document.addEventListener("turbo:visit", this.handleVisit.bind(this));
    document.addEventListener("turbo:before-render", this.handleBeforeRender.bind(this));
    document.addEventListener("turbo:render", this.handleRender.bind(this));
    document.addEventListener("turbo:load", this.handleLoad.bind(this));
    document.addEventListener("turbo:before-frame-render", this.handleBeforeFrameRender.bind(this));
    document.addEventListener(
      "turbo:before-stream-render",
      this.handleBeforeStreamRender.bind(this)
    );
  }
  handleRender() {
    if (this.config.get("debug")) {
      console.log("TurboFlow: Render event fired");
      console.log("TurboFlow: Current HTML classes during render:", document.documentElement.className);
      console.log("TurboFlow: data-turbo-visit-direction:", document.documentElement.getAttribute("data-turbo-visit-direction"));
    }
  }
  handleClick(event) {
    const link = event.target.closest("a[data-turbo-flow]");
    if (link) {
      this.currentTransition = link.dataset.turboFlow;
      if (this.config.get("debug")) {
        console.log("TurboFlow: Click detected, transition:", this.currentTransition);
      }
    }
  }
  handleBeforeVisit(event) {
    if (!this.config.shouldAnimate()) return;
    let transition = this.currentTransition;
    if (!transition) {
      const clickedLink = document.querySelector(`a[href="${event.detail.url}"]`);
      if (clickedLink == null ? void 0 : clickedLink.dataset.turboFlow) {
        transition = clickedLink.dataset.turboFlow;
      } else {
        transition = this.config.get("defaultTransition");
      }
    }
    this.pendingTransition = transition;
    this.pendingUrl = event.detail.url;
    this.currentUrl = window.location.href;
    if (this.config.get("debug")) {
      console.log("TurboFlow: Before visit, storing transition:", transition || this.config.get("defaultTransition"));
    }
  }
  handleVisit(event) {
    if (!this.config.shouldAnimate()) return;
    if (!this.pendingTransition) {
      const direction = event.detail.action;
      if (direction === "restore") {
        const currentUrl = window.location.href;
        const storedTransition = this.navigationHistory.get(currentUrl);
        if (storedTransition) {
          this.pendingTransition = storedTransition;
          this.pendingUrl = event.detail.url;
          if (this.config.get("debug")) {
            console.log("TurboFlow: Restore navigation detected, using stored transition:", storedTransition);
          }
        } else {
          this.pendingTransition = this.config.get("defaultTransition");
          this.pendingUrl = event.detail.url;
          if (this.config.get("debug")) {
            console.log("TurboFlow: Restore navigation, no stored transition, using default");
          }
        }
      }
    }
  }
  handleBeforeRender(event) {
    if (this.pendingTransition) {
      const direction = document.documentElement.getAttribute("data-turbo-visit-direction");
      let transition = this.pendingTransition;
      if (direction === "back") {
        const destinationUrl = this.pendingUrl;
        const storedTransition = this.navigationHistory.get(destinationUrl);
        if (storedTransition) {
          transition = storedTransition;
          if (this.config.get("debug")) {
            console.log("TurboFlow: Back navigation, using stored transition:", storedTransition);
          }
        }
      } else if (this.currentUrl) {
        this.navigationHistory.set(this.currentUrl, transition);
        if (this.navigationHistory.size > 50) {
          const firstKey = this.navigationHistory.keys().next().value;
          this.navigationHistory.delete(firstKey);
        }
        if (this.config.get("debug")) {
          console.log("TurboFlow: Stored transition for leaving URL:", this.currentUrl, "→", transition);
        }
      }
      const css = this.generator.generate({ links: [{ transition }] });
      if (css) {
        this.injector.inject(css, "turboflow-active-transition");
        if (this.config.get("debug")) {
          console.log("TurboFlow: Injected CSS for transition:", transition);
        }
      }
      const classes = this.registry.list().map((n) => `turboflow-${n}`);
      document.documentElement.classList.remove(...classes);
      document.documentElement.classList.add(`turboflow-${transition}`);
      if (this.config.get("debug")) {
        console.log("TurboFlow: Before render - Added class:", `turboflow-${transition}`);
        console.log("TurboFlow: data-turbo-visit-direction:", direction);
        console.log("TurboFlow: Navigation history size:", this.navigationHistory.size);
      }
      this.pendingTransition = null;
      this.pendingUrl = null;
      this.currentUrl = null;
    }
    setTimeout(() => {
      document.documentElement.classList.remove(...this.registry.list().map((n) => `turboflow-${n}`));
      if (this.config.get("debug")) {
        console.log("TurboFlow: Cleaned up classes");
      }
    }, 1e3);
  }
  handleLoad() {
    this.currentTransition = null;
    this.scanner.clearCache();
    const scanResults = this.scanner.scan(document.body);
    if (scanResults.targets && scanResults.targets.length > 0) {
      const validTargets = scanResults.targets.filter((target) => {
        return target.id && target.transition && (target.transition === "morph" || this.registry.get(target.transition));
      });
      if (validTargets.length > 0) {
        const css = this.generator.generate({ targets: validTargets });
        if (css) {
          this.injector.inject(css, "element-transitions");
          if (this.config.get("debug")) {
            console.log("TurboFlow: Generated CSS for element transitions:", validTargets.map((t) => `${t.id}:${t.transition}`));
          }
        }
      }
    }
    if (this.config.get("debug")) {
      console.log("TurboFlow: Page loaded, found elements:", scanResults);
    }
  }
  handleBeforeFrameRender(event) {
    if (!this.config.shouldAnimate()) return;
    const frame = event.target;
    const transition = this.config.getFrameTransition(frame.id);
    if (transition) {
      const css = this.generator.generate({
        frames: [{ id: frame.id, transition }]
      });
      if (css) {
        this.injector.inject(css, `frame-${frame.id}`);
      }
    }
  }
  handleBeforeStreamRender(event) {
    if (!this.config.shouldAnimate()) return;
    const action = event.detail.action;
    const transition = this.config.getStreamTransition(action);
    if (transition) {
      const css = this.generator.generate({
        streams: [{ action, transition }]
      });
      if (css) {
        this.injector.inject(css, `stream-${action}`);
      }
    }
  }
  destroy() {
    document.removeEventListener("turbo:click", this.handleClick);
    document.removeEventListener("turbo:before-visit", this.handleBeforeVisit);
    document.removeEventListener("turbo:visit", this.handleVisit);
    document.removeEventListener("turbo:before-render", this.handleBeforeRender);
    document.removeEventListener("turbo:load", this.handleLoad);
    document.removeEventListener("turbo:before-frame-render", this.handleBeforeFrameRender);
    document.removeEventListener("turbo:before-stream-render", this.handleBeforeStreamRender);
    this.injector.clear();
    this.scanner.clearCache();
    this.generator.clear();
    this.navigationHistory.clear();
    this.initialized = false;
    return this;
  }
}
if (typeof window !== "undefined" && !window.TurboFlow) {
  const init = () => {
    window.TurboFlow = new TurboFlow();
    window.TurboFlow.init();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
// TurboFlow initialized automatically when script loads
