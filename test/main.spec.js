import { initWebCg } from '../src/main.js'
import WebCG from '../src/WebCG.js'

describe('initWebCg', () => {
  it('should create window.webcg', () => {
    const window = {}
    initWebCg(window)
    expect(window.webcg).to.an.instanceOf(WebCG)
  })
})
