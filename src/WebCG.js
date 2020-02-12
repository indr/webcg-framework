import Parser from './Parser'

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
    this._transitioning = false
    this._bufferCommands = false
    this._commandQueue = []
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
    if (this._bufferCommand.apply(this, ['invokeFunction'].concat(Array.from(arguments)))) return
    this._transitioning = true
    this._dispatch.apply(this, arguments).finally(() => {
      this._transitioning = false
      this._shiftCommand()
    })
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
    this._shiftCommand()
  }

  _shiftCommand () {
    if (this._commandQueue.length) {
      const command = this._commandQueue.shift()
      this[command.name].apply(this, command.args)
    }
  }

  play () {
    if (this._bufferCommand('play')) return
    if (this._state !== State.playing) {
      this._transitioning = true
      this._dispatch('play').finally(() => {
        this._transitioning = false
        this._state = State.playing
        this._shiftCommand()
      })
    }
  }

  stop () {
    if (this._bufferCommand('stop')) return
    if (this._state === State.playing) {
      this._transitioning = true
      this._dispatch('stop').finally(() => {
        this._transitioning = false
        this._state = State.stopped
        this._shiftCommand()
      })
    }
  }

  next () {
    if (this._bufferCommand('next')) return
    this._transitioning = true
    this._dispatch('next').finally(() => {
      this._transitioning = false
      this._shiftCommand()
    })
  }

  update (data) {
    if (this._bufferCommand('update', data)) return
    this._transitioning = true
    this._dispatch('update', data).then(handled => {
      this._transitioning = false
      if (handled) {
        this._shiftCommand()
      } else {
        const parsed = new Parser().parse(data)
        this._transitioning = true
        this._dispatch('data', parsed).finally(() => {
          this._transitioning = false
          this._shiftCommand()
        })
      }
    }).catch(() => {
      this._transitioning = false
      this._shiftCommand()
    })
  }

  _bufferCommand (name) {
    if (!this._transitioning && !this._bufferCommands) {
      return false
    }
    const args = Array.prototype.slice.call(arguments, 1)
    this._commandQueue.push({ name, args })
    return true
  }

  _dispatch (type) {
    const listeners = this._getListeners(type)
    const args = Array.prototype.slice.call(arguments, 1)

    const promises = listeners
      .filter(listener => typeof listener === 'function')
      .map(listener => {
        return new Promise((resolve, reject) => {
          try {
            const result = listener.apply(null, args)
            if (result && typeof result === 'object' && Object.getPrototypeOf(result).constructor === Promise) {
              result.then(handled => {
                resolve(!!handled)
              }).catch(error => {
                console.warn(`[webcg-framework] ${type} event listener threw ${error.constructor.name}: ${error.message}`)
                resolve(false)
              })
            } else {
              resolve(!!result)
            }
          } catch (error) {
            console.warn(`[webcg-framework] ${type} event listener threw ${error.constructor.name}: ${error.message}`)
            resolve(false)
          }
        })
      })

    return Promise.all(promises).then(values => {
      return values.reduce((aggr, curr) => {
        return aggr || curr
      }, false)
    })
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
