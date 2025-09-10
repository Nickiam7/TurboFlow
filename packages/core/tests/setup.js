import { beforeEach, afterEach } from 'vitest';

global.Turbo = {
  visit: () => {},
  cache: {
    clear: () => {}
  }
};

// Add custom matchers if needed
beforeEach(() => {
  // Clear DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Reset any global state
  delete window.TurboFlow;

  // Clear all styles
  document.querySelectorAll('style[data-turbo-flow]').forEach(el => el.remove());
});

afterEach(() => {
  // Cleanup after each test
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
