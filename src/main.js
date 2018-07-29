import WebCG from './WebCG'

const initWebCg = function (window) {
  window.webcg = new WebCG(window)
}

const initDevTools = function (window) {
  const debug = (window.location.search.match(/[?&]debug=([^&$]+)/) || [])[1] === 'true'
  if (!debug) return

  const document = window.document
  const script = document.createElement('script')
  script.src = 'webcg-devtools.umd.js'
  console.log('[webcg-framework] injecting ' + script.src)
  document.head.append(script)
}

const boot = function (window) {
  initWebCg(window)
  initDevTools(window)
}

export { boot, initWebCg, initDevTools }
