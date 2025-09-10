export default {
  name: 'zoom',
  duration: 300,
  easing: 'ease-out',

  viewTransitions: {
    old: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(1.1)', opacity: 0 },
    },
    new: {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
  },

  directions: {
    forward: {
      old: {
        from: { transform: 'scale(1)', opacity: 1 },
        to: { transform: 'scale(0.8)', opacity: 0 },
      },
      new: {
        from: { transform: 'scale(1.2)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
      },
    },
    back: {
      old: {
        from: { transform: 'scale(1)', opacity: 1 },
        to: { transform: 'scale(1.2)', opacity: 0 },
      },
      new: {
        from: { transform: 'scale(0.8)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
      },
    },
    none: null,
  },
}
