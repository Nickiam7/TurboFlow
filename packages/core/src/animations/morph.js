export default {
  name: 'morph',
  duration: 400,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',

  viewTransitions: {
    old: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    new: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },

  directions: {
    forward: null,
    back: null,
    none: null,
  },

  requiresElement: true,
  usesViewTransitionName: true,
}
