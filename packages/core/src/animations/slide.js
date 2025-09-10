export default {
  name: 'slide',
  duration: 300,
  easing: 'ease-out',
  
  viewTransitions: {
    old: {
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(-100%)' }
    },
    new: {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' }
    }
  },
  
  directions: {
    forward: {
      old: {
        from: { transform: 'translateX(0)' },
        to: { transform: 'translateX(-100%)' }
      },
      new: {
        from: { transform: 'translateX(100%)' },
        to: { transform: 'translateX(0)' }
      }
    },
    back: {
      old: {
        from: { transform: 'translateX(0)' },
        to: { transform: 'translateX(100%)' }
      },
      new: {
        from: { transform: 'translateX(-100%)' },
        to: { transform: 'translateX(0)' }
      }
    },
    none: {
      old: {
        from: { transform: 'translateX(0)', opacity: 1 },
        to: { transform: 'translateX(-50%)', opacity: 0 }
      },
      new: {
        from: { transform: 'translateX(50%)', opacity: 0 },
        to: { transform: 'translateX(0)', opacity: 1 }
      }
    }
  }
}