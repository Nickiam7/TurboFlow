export default {
  name: 'fade',
  duration: 300,
  easing: 'ease-out',
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
}
