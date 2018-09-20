import WebCG from '../src/WebCG.js'

describe('WebCG', () => {
  let webcg
  let window

  beforeEach(() => {
    window = {}
    window.play = window.stop = window.next = window.update = function noop () {}
    webcg = new WebCG(window)
  })

  it('throws when adding an invalid event listener', () => {
    expect(() => webcg.addEventListener('play', ''))
      .to.throw(TypeError, 'listener must be a function')
  })

  it('triggers play on window.play', done => {
    webcg.addEventListener('play', () => {
      done()
    })
    window.play()
  })

  it('triggers stop on window.stop', done => {
    webcg.addEventListener('stop', () => {
      done()
    })
    window.stop()
  })

  it('triggers next on window.next', done => {
    webcg.addEventListener('next', () => {
      done()
    })
    window.next()
  })

  it('triggers update on window.update', done => {
    webcg.addEventListener('update', () => {
      done()
    })
    window.update()
  })

  it('triggers update with data', done => {
    webcg.addEventListener('update', data => {
      expect(data).to.equal('value')
      done()
    })
    window.update('value')
  })

  it('triggers data with first argument', done => {
    webcg.addEventListener('data', data => {
      expect(data).to.deep.equal({ f0: 'v0' })
      done()
    })
    window.update({ f0: 'v0' })
  })

  it('triggers data with parsed JSON', done => {
    webcg.addEventListener('data', data => {
      expect(data).to.deep.equal({ f0: 'v0' })
      done()
    })
    window.update(JSON.stringify({ f0: 'v0' }))
  })

  it('triggers data with parsed templateData XML', done => {
    webcg.addEventListener('data', data => {
      expect(data).to.deep.equal({})
      done()
    })
    window.update('<templateData></templateData>')
  })

  it('does not trigger data when update handler returns handled=true', done => {
    webcg.addEventListener('data', () => {
      done('unexpected call to data')
    })
    webcg.addEventListener('update', () => {
      setTimeout(done, 500)
      return true // handled, e.preventDefault()
    })
    window.update('value')
  })

  it('triggers listeners in reverse order', done => {
    let counter = 0
    webcg.addEventListener('play', () => {
      expect(++counter).to.equal(2)
      done()
    })
    webcg.addEventListener('play', () => {
      expect(++counter).to.equal(1)
    })
    window.play()
  })

  it('does not trigger next listener when handler returns handled=true', done => {
    webcg.addEventListener('play', () => {
      done('unexpected call to play')
    })
    webcg.addEventListener('play', () => {
      setTimeout(done, 500)
      return true // handled
    })
    window.play()
  })

  it('aliases on for addEventListener', () => {
    expect(webcg.on).to.equal(webcg.addEventListener)
  })

  it('aliases off for removeEventListener', () => {
    expect(webcg.off).to.equal(webcg.removeEventListener)
  })

  it('adds window function when adding a listener', () => {
    webcg.addEventListener('test', () => { })
    expect(typeof window.test).to.equal('function')
  })

  it('removes window function when removing last listener', () => {
    const listener1 = () => {}
    const listener2 = () => {}
    webcg.addEventListener('test', listener1)
    webcg.addEventListener('test', listener2)
    expect(typeof window.test).to.equal('function')
    webcg.removeEventListener('test', listener1)
    expect(typeof window.test).to.equal('function')
    webcg.removeEventListener('test', listener2)
    expect(typeof window.test).to.equal('undefined')
  })

  it('does not remove play when removing last listener', () => {
    const listener = () => {}
    expect(typeof window.play).to.equal('function')
    webcg.addEventListener('play', listener)
    webcg.removeEventListener('play', listener)
    expect(typeof window.play).to.equal('function')
  })

  it('can invoke custom function with multiple arguments', done => {
    const that = {}
    webcg.addEventListener('test', function (arg1, arg2, arg3) {
      expect(arg1).to.equal('one')
      expect(arg2).to.equal(2)
      expect(arg3).to.equal('three')
      expect(this).to.equal(that)
      done()
    }.bind(that))
    window.test('one', 2, 'three')
  })
})
