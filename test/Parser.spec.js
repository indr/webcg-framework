import Parser from '../src/Parser'

describe('Parser', () => {
  it('should parse templateData XML', () => {
    const parser = new Parser()
    const data = parser.parse('<templateData><componentData id="f0"><data id="text" value="textValue"/></componentData></templateData>')
    expect(data).to.deep.equal({
      f0: {
        text: 'textValue'
      }
    })
  })

  it('should parse empty templateData XML', () => {
    const parser = new Parser()
    const data = parser.parse('<templateData></templateData>')
    expect(data).to.deep.equal({})
  })

  it('should parse JSON string', () => {
    const parser = new Parser()
    const data = parser.parse('{"f0":"value"}')
    expect(data).to.deep.equal({
      f0: 'value'
    })
  })

  it('should accept object', () => {
    const parser = new Parser()
    const data = parser.parse({ f0: 'value' })
    expect(data).to.deep.equal({
      f0: 'value'
    })
  })
})
