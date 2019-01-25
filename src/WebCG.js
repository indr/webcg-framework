import Parser from './Parser.js'

const FUNCTIONS = ['play', 'stop', 'next', 'update']

const State = Object.freeze({ 'stopped': 0, 'playing': 1 })

class WebCG {
  constructor (window) {
    this._listeners = {}
    this._window = window
    FUNCTIONS.forEach(each => {
      this._window[each] = this[each].bind(this)
      this._window[each].webcg = true
    })
    this._state = State.stopped
  }

  addEventListener (type, listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function')
    const listeners = this._listeners[type] = this._listeners[type] || []
    listeners.push(listener)
    this._addWindowFunction(type)
  }

  removeEventListener (type, listener) {
    const listeners = this._getListeners(type)
    const idx = listeners.indexOf(listener)
    if (idx >= 0) {
      listeners.splice(idx, 1)
    }

    if (listeners.length === 0) {
      this._removeWindowFunction(type)
    }
  }

  _addWindowFunction (name) {
    if (typeof this._window[name] === 'function' && this._window[name].webcg) return

    this._window[name] = this.dispatch.bind(this, name)
    this._window[name].webcg = true
  }

  _removeWindowFunction (name) {
    if (FUNCTIONS.indexOf(name) >= 0) return
    if (typeof this._window[name] !== 'function' || !this._window[name].webcg) return
    delete this._window[name]
  }

  play () {
    if (this._state !== State.playing) {
      this.dispatch('play')
      this._state = State.playing
    }
  }

  stop () {
    if (this._state === State.playing) {
      this.dispatch('stop')
      this._state = State.stopped
    }
  }

  next () {
    this.dispatch('next')
  }

  update (data) {
    const handled = this.dispatch('update', data)
    if (!handled) {
      const parsed = new Parser().parse(data)
      this.dispatch('data', parsed)
    }
  }

  dispatch (type, arg) {
    Array.prototype.slice.call(arguments, 1)
    const listeners = this._getListeners(type)
    let handled = false
    for (let i = listeners.length - 1; i >= 0 && handled === false; i--) {
      const listener = listeners[i]
      if (typeof listener === 'function') {
        handled = !!listener.apply(null, Array.prototype.slice.call(arguments, 1))
      }
    }
    return handled
  }

  _getListeners (type) {
    this._listeners[type] = this._listeners[type] || []
    return this._listeners[type]
  }
}

// Aliases
WebCG.prototype.on = WebCG.prototype.addEventListener
WebCG.prototype.off = WebCG.prototype.removeEventListener

export default WebCG
