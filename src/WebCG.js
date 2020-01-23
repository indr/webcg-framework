import Parser from './Parser.js'

const FUNCTIONS = ['play', 'stop', 'next', 'update']

const State = Object.freeze({ stopped: 0, playing: 1 })

class WebCG {
  constructor (window) {
    this._listeners = {}
    this._window = window
    FUNCTIONS.forEach(each => {
      this._window[each] = this[each].bind(this)
      this._window[each].webcg = true
    })
    this._state = State.stopped
    this._bufferCommands = false
  }

  addEventListener (type, listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function')
    const listeners = this._listeners[type] = this._listeners[type] || []
    listeners.push(listener)
    this._addWindowFunction(type)
  }

  once (type, listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function')
    const onceWrapper = function () {
      this.removeEventListener(type, onceWrapper)
      return listener.apply(null, arguments)
    }.bind(this)
    this.addEventListener(type, onceWrapper)
  }

  _addWindowFunction (name) {
    if (typeof this._window[name] === 'function' && this._window[name].webcg) return

    this._window[name] = this.invokeFunction.bind(this, name)
    this._window[name].webcg = true
  }

  invokeFunction (name) {
    if (this._bufferCommand.apply(this, ['_dispatch'].concat(Array.prototype.slice.call(arguments, 0)))) return
    this._dispatch.apply(this, arguments)
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

  _removeWindowFunction (name) {
    if (FUNCTIONS.indexOf(name) >= 0) return
    if (typeof this._window[name] !== 'function' || !this._window[name].webcg) return
    delete this._window[name]
  }

  bufferCommands () {
    this._bufferCommands = true
    this._commandQueue = []
  }

  flushCommands () {
    this._bufferCommands = false
    this._commandQueue.forEach(each => {
      this[each.name].apply(this, each.args)
    })
    this._commandQueue = []
  }

  play () {
    if (this._bufferCommand('play')) return
    if (this._state !== State.playing) {
      this._dispatch('play')
      this._state = State.playing
    }
  }

  stop () {
    if (this._bufferCommand('stop')) return
    if (this._state === State.playing) {
      this._dispatch('stop')
      this._state = State.stopped
    }
  }

  next () {
    if (this._bufferCommand('next')) return
    this._dispatch('next')
  }

  update (data) {
    if (this._bufferCommand('update', data)) return
    const handled = this._dispatch('update', data)
    if (!handled) {
      const parsed = new Parser().parse(data)
      this._dispatch('data', parsed)
    }
  }

  _bufferCommand (name) {
    if (!this._bufferCommands) return false
    const args = Array.prototype.slice.call(arguments, 1)
    this._commandQueue.push({ name, args })
    return true
  }

  _dispatch (type) {
    const listeners = this._getListeners(type)
    const args = Array.prototype.slice.call(arguments, 1)
    let handled = false
    for (let i = listeners.length - 1; i >= 0 && handled === false; i--) {
      const listener = listeners[i]
      if (typeof listener !== 'function') continue
      try {
        handled = !!listener.apply(null, args)
      } catch (error) {
        console.warn(`[webcg-framework] ${type} event listener threw ${error.constructor.name}: ${error.message}`)
        handled = false
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
