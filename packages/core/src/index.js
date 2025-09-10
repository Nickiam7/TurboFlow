import TurboFlow from './turboflow.js'

export default TurboFlow

if (typeof window !== 'undefined' && !window.TurboFlow) {
  const init = () => {
    window.TurboFlow = new TurboFlow()
    window.TurboFlow.init()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
