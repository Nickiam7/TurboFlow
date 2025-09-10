export default {
  name: 'fade',
  duration: 300,
  easing: 'ease-out',
  
  // For all directions - simple fade
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
  
  // Direction-specific overrides (optional)
  directions: {
    forward: null, // Uses default viewTransitions
    back: null,    // Uses default viewTransitions
    none: null     // Uses default viewTransitions
  }
}