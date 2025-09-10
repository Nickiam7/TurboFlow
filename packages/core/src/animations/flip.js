export default {
  name: 'flip',
  duration: 400,
  easing: 'ease-in-out',
  
  viewTransitions: {
    old: {
      from: { 
        transform: 'perspective(600px) rotateY(0deg)',
        opacity: 1
      },
      to: { 
        transform: 'perspective(600px) rotateY(-90deg)',
        opacity: 0
      }
    },
    new: {
      from: { 
        transform: 'perspective(600px) rotateY(90deg)',
        opacity: 0
      },
      to: { 
        transform: 'perspective(600px) rotateY(0deg)',
        opacity: 1
      }
    }
  },
  
  directions: {
    forward: null,
    back: {
      old: {
        from: { 
          transform: 'perspective(600px) rotateY(0deg)',
          opacity: 1
        },
        to: { 
          transform: 'perspective(600px) rotateY(90deg)',
          opacity: 0
        }
      },
      new: {
        from: { 
          transform: 'perspective(600px) rotateY(-90deg)',
          opacity: 0
        },
        to: { 
          transform: 'perspective(600px) rotateY(0deg)',
          opacity: 1
        }
      }
    },
    none: null
  }
}