import { initWebCg, initDevTools } from '../src/main.js'
import WebCG from '../src/WebCG.js'

describe('initWebCg', () => {
  it('should create window.webcg', () => {
    const window = {}
    initWebCg(window)
    expect(window.webcg).to.an.instanceOf(WebCG)
  })
})

describe('initWebCg', () => {
  let window, appended

  beforeEach(() => {
    appended = []
    window = {
      document: {
        currentScript: {
          src: ''
        },
        createElement: () => { return {} },
        head: {}
      },
      location: {
        search: '?debug=true'
      }
    }
    window.document.head.append = (elem) => { appended.push(elem) }
  })

  it('should add webcg-devtools.umd.js', () => {
    initDevTools(window)
    const scripts = []
    appended.forEach(each => {
      scripts.push(each.src)
    })
    expect(scripts).to.include('webcg-devtools.umd.js')
  })

  it('should add webcg-devtools.umd.js with path', () => {
    window.document.currentScript = {src: 'path/to/webcg-framework.umd.js'}
    initDevTools(window)
    const scripts = []
    appended.forEach(each => {
      scripts.push(each.src)
    })
    expect(scripts).to.include('path/to/webcg-devtools.umd.js')
  })
})
