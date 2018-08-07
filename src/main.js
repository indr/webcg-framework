import WebCG from './WebCG'

const initWebCg = function (window) {
  window.webcg = new WebCG(window)
}

const getCurrentScriptPathWithTrailingSlash = function (document) {
  if (!document || typeof document !== 'object') return ''
  if (!document.currentScript) return ''
  if (!document.currentScript.src || typeof document.currentScript.src !== 'string') return ''
  const src = document.currentScript.src
  return src.substring(0, src.lastIndexOf('/') + 1)
}

const initDevTools = function (window) {
  const debug = (window.location.search.match(/[?&]debug=([^&$]+)/) || [])[1] === 'true'
  if (!debug) return

  const document = window.document
  const script = document.createElement('script')
  script.src = getCurrentScriptPathWithTrailingSlash(document) + 'webcg-devtools.umd.js'
  console.log('[webcg-framework] injecting ' + script.src)
  document.head.append(script)
}

const boot = function (window) {
  initWebCg(window)
  initDevTools(window)
}

export { boot, initWebCg, initDevTools }
