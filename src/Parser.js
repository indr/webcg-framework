const Parser = class {
  parse (raw) {
    if (typeof raw === 'object') return raw
    if (typeof raw !== 'string') return null
    if (raw.length <= 0) return null
    if (raw[0] === '<') {
      return this._parseXml(raw)
    }
    if (raw[0] === '{') {
      return JSON.parse(raw)
    }
  }

  _parseXml (xmlString) {
    const xmlDoc = this._loadXmlDoc(xmlString)
    const result = {}
    const componentDataElements = xmlDoc.getElementsByTagName('componentData')
    for (let i = 0; i < componentDataElements.length; i++) {
      const componentId = componentDataElements[i].getAttribute('id')
      result[componentId] = {}
      const dataElements = componentDataElements[i].getElementsByTagName('data')
      for (let ii = 0; ii < dataElements.length; ii++) {
        const dataElement = dataElements[ii]
        result[componentId][dataElement.getAttribute('id')] = dataElement.getAttribute('value')
      }
    }
    return result
  }

  _loadXmlDoc (xmlString) {
    if (window && window.DOMParser && typeof XMLDocument !== 'undefined') {
      return new window.DOMParser().parseFromString(xmlString, 'text/xml')
    } else {
      // Internet Explorer
      // eslint-disable-next-line no-undef
      var xmlDoc = new ActiveXObject('Microsoft.XMLDOM')
      xmlDoc.async = false
      xmlDoc.loadXML(xmlString)
      return xmlDoc
    }
  }
}

export default Parser
