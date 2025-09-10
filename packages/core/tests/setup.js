import { beforeEach, afterEach } from 'vitest'

global.Turbo = {
  visit: () => {},
  cache: {
    clear: () => {}
  }
}

beforeEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''


  delete window.TurboFlow

  document.querySelectorAll('style[data-turbo-flow]').forEach(el => el.remove())
})

afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})
