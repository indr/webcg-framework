import Parser from './Parser.js'

class WebCG {
  constructor (window) {
    this._listeners = {}

    window.play = this.play.bind(this)
    window.stop = this.stop.bind(this)
    window.next = this.next.bind(this)
    window.update = this.update.bind(this)

    // Aliases
    this.on = this.addEventListener
    this.off = this.removeEventListener
  }

  addEventListener (type, listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function')
    const listeners = this._listeners[type] = this._listeners[type] || []
    listeners.push(listener)
  }

  removeEventListener (type, listener) {
    const listeners = this._getListeners(type)
    const idx = listeners.indexOf(listener)
    if (idx >= 0) {
      listeners.splice(idx, 1)
    }
  }

  play () {
    this._dispatch('play')
  }

  stop () {
    this._dispatch('stop')
  }

  next () {
    this._dispatch('next')
  }

  update (data) {
    const handled = this._dispatch('update', data)
    if (!handled) {
      const parsed = new Parser().parse(data)
      this._dispatch('data', parsed)
    }
  }

  _getListeners (type) {
    this._listeners[type] = this._listeners[type] || []
    return this._listeners[type]
  }

  _dispatch (type, detail) {
    const event = new window.CustomEvent(type, Object.assign({}, {
      cancelable: true
    }, { detail }))
    const listeners = this._getListeners(type)
    let handled = false
    for (let i = listeners.length - 1; i >= 0 && handled === false; i--) {
      const listener = listeners[i]
      if (typeof listener === 'function') {
        handled = !!listener(event)
      }
    }
    return handled
  }
}

export default WebCG
