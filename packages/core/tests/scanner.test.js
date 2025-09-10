import { describe, it, expect, beforeEach } from 'vitest'
import Scanner from '../src/core/scanner.js'

describe('Scanner', () => {
  let scanner

  beforeEach(() => {
    scanner = new Scanner()
    document.body.innerHTML = ''
  })

  it('should scan links with data-turbo-flow', () => {
    document.body.innerHTML = `
      <a href="/page1" data-turbo-flow="slide">Link 1</a>
      <a href="/page2" data-turbo-flow="fade">Link 2</a>
      <a href="/page3">Normal Link</a>
    `
    
    const results = scanner.scan()
    expect(results.links.length).toBe(2)
    expect(results.links[0].transition).toBe('slide')
    expect(results.links[1].transition).toBe('fade')
  })

  it('should scan forms with data-turbo-flow', () => {
    document.body.innerHTML = `
      <form action="/submit" method="post" data-turbo-flow="zoom" data-turbo-flow-success="fade">
        <button type="submit">Submit</button>
      </form>
    `
    
    const results = scanner.scan()
    expect(results.forms.length).toBe(1)
    expect(results.forms[0].transition).toBe('zoom')
    expect(results.forms[0].successTransition).toBe('fade')
  })

  it('should scan turbo-frames with data-turbo-flow', () => {
    document.body.innerHTML = `
      <turbo-frame id="modal" data-turbo-flow="slide">
        Content
      </turbo-frame>
    `
    
    const results = scanner.scan()
    expect(results.frames.length).toBe(1)
    expect(results.frames[0].transition).toBe('slide')
    expect(results.frames[0].id).toBe('modal')
  })

  it('should scan elements with data-turbo-flow-target', () => {
    document.body.innerHTML = `
      <div id="hero" data-turbo-flow-target="morph">Hero Section</div>
      <section id="content" data-turbo-flow-target="fade">Content</section>
    `
    
    const results = scanner.scan()
    expect(results.targets.length).toBe(2)
    expect(results.targets[0].transition).toBe('morph')
    expect(results.targets[1].transition).toBe('fade')
  })

  it('should find transition for an element', () => {
    scanner.setDefaultTransition('fade')
    
    document.body.innerHTML = `
      <a href="/page" data-turbo-flow="slide">Link</a>
    `
    
    const link = document.querySelector('a')
    expect(scanner.findTransition(link)).toBe('slide')
    expect(scanner.findTransition(null)).toBe('fade')
  })

  it('should cache scan results', () => {
    document.body.innerHTML = `
      <a href="/page" data-turbo-flow="slide">Link</a>
    `
    
    scanner.scan()
    const cached = scanner.getCached(document)
    
    expect(cached).toBeDefined()
    expect(cached.links.length).toBe(1)
  })
})