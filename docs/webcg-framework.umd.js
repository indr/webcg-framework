(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  var version = "1.2.0";

  var Parser = (function () {
    function Parser () {}

    Parser.prototype.parse = function parse (raw) {
      if (typeof raw === 'object') { return raw }
      if (typeof raw !== 'string') { return null }
      if (raw.length <= 0) { return null }
      if (raw[0] === '<') {
        return this._parseXml(raw)
      }
      if (raw[0] === '{') {
        return JSON.parse(raw)
      }
    };

    Parser.prototype._parseXml = function _parseXml (xmlString) {
      var xmlDoc = this._loadXmlDoc(xmlString);
      var result = {};
      var componentDataElements = xmlDoc.getElementsByTagName('componentData');
      for (var i = 0; i < componentDataElements.length; i++) {
        var componentId = componentDataElements[i].getAttribute('id');
        result[componentId] = {};
        var dataElements = componentDataElements[i].getElementsByTagName('data');
        for (var ii = 0; ii < dataElements.length; ii++) {
          var dataElement = dataElements[ii];
          result[componentId][dataElement.getAttribute('id')] = dataElement.getAttribute('value');
        }
      }
      return result
    };

    Parser.prototype._loadXmlDoc = function _loadXmlDoc (xmlString) {
      if (window && window.DOMParser && typeof XMLDocument !== 'undefined') {
        return new window.DOMParser().parseFromString(xmlString, 'text/xml')
      } else {
        // Internet Explorer
        // eslint-disable-next-line no-undef
        var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlString);
        return xmlDoc
      }
    };

    return Parser;
  }());

  var WebCG = function WebCG (window) {
    this._listeners = {};

    window.play = this.play.bind(this);
    window.stop = this.stop.bind(this);
    window.next = this.next.bind(this);
    window.update = this.update.bind(this);

    // Aliases
    this.on = this.addEventListener;
    this.off = this.removeEventListener;
  };

  WebCG.prototype.addEventListener = function addEventListener (type, listener) {
    if (typeof listener !== 'function') { throw new TypeError('listener must be a function') }
    var listeners = this._listeners[type] = this._listeners[type] || [];
    listeners.push(listener);
  };

  WebCG.prototype.removeEventListener = function removeEventListener (type, listener) {
    var listeners = this._getListeners(type);
    var idx = listeners.indexOf(listener);
    if (idx >= 0) {
      listeners.splice(idx, 1);
    }
  };

  WebCG.prototype.play = function play () {
    this._dispatch('play');
  };

  WebCG.prototype.stop = function stop () {
    this._dispatch('stop');
  };

  WebCG.prototype.next = function next () {
    this._dispatch('next');
  };

  WebCG.prototype.update = function update (data) {
    var event = this._dispatch('update', {detail: data});
    if (!event.defaultPrevented) {
      var parsed = new Parser().parse(data);
      this._dispatch('data', {detail: parsed});
    }
  };

  WebCG.prototype._getListeners = function _getListeners (type) {
    this._listeners[type] = this._listeners[type] || [];
    return this._listeners[type]
  };

  WebCG.prototype._dispatch = function _dispatch (type, customEventInit) {
    var event = new window.CustomEvent(type, Object.assign({}, {
      cancelable: true
    }, customEventInit));
    var listeners = this._getListeners(type);
    for (var i = listeners.length - 1; i >= 0; i--) {
      var listener = listeners[i];
      if (typeof listener === 'function') {
        listener(event);
      }
    }
    return event
  };

  var initWebCg = function (window) {
    window.webcg = new WebCG(window);
  };

  var getCurrentScriptPathWithTrailingSlash = function (document) {
    if (!document || typeof document !== 'object') { return '' }
    if (!document.currentScript) { return '' }
    if (!document.currentScript.src || typeof document.currentScript.src !== 'string') { return '' }
    var src = document.currentScript.src;
    return src.substring(0, src.lastIndexOf('webcg-framework.umd.js'))
  };

  var initDevTools = function (window) {
    var debug = (window.location.search.match(/[?&]debug=([^&$]+)/) || [])[1] === 'true';
    if (!debug) { return }

    var document = window.document;
    var script = document.createElement('script');
    script.src = getCurrentScriptPathWithTrailingSlash(document) + 'webcg-devtools.umd.js';
    console.log('[webcg-framework] injecting ' + script.src);
    document.head.append(script);
  };

  var boot = function (window) {
    initWebCg(window);
    initDevTools(window);
  };

  /**
   * When required globally
   */
  if (typeof (window) !== 'undefined') {
    console.log('[webcg-framework] version %s', version);
    boot(window);
  }

})));
