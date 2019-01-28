(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  var version = "1.4.1";

  /*!
   * Vue.js v2.5.17
   * (c) 2014-2018 Evan You
   * Released under the MIT License.
   */
  /*  */

  var emptyObject = Object.freeze({});

  // these helpers produces better vm code in JS engines due to their
  // explicitness and function inlining
  function isUndef (v) {
    return v === undefined || v === null
  }

  function isDef (v) {
    return v !== undefined && v !== null
  }

  function isTrue (v) {
    return v === true
  }

  function isFalse (v) {
    return v === false
  }

  /**
   * Check if value is primitive
   */
  function isPrimitive (value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      // $flow-disable-line
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }

  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }

  /**
   * Get the raw type string of a value e.g. [object Object]
   */
  var _toString = Object.prototype.toString;

  function toRawType (value) {
    return _toString.call(value).slice(8, -1)
  }

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }

  function isRegExp (v) {
    return _toString.call(v) === '[object RegExp]'
  }

  /**
   * Check if val is a valid array index.
   */
  function isValidArrayIndex (val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }

  /**
   * Convert a value to a string that is actually rendered.
   */
  function toString (val) {
    return val == null
      ? ''
      : typeof val === 'object'
        ? JSON.stringify(val, null, 2)
        : String(val)
  }

  /**
   * Convert a input value to a number for persistence.
   * If the conversion fails, return original string.
   */
  function toNumber (val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  }

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   */
  function makeMap (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
  }

  /**
   * Check if a tag is a built-in tag.
   */
  var isBuiltInTag = makeMap('slot,component', true);

  /**
   * Check if a attribute is a reserved attribute.
   */
  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

  /**
   * Remove an item from an array
   */
  function remove (arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
  }

  /**
   * Check whether the object has the property.
   */
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  /**
   * Create a cached version of a pure function.
   */
  function cached (fn) {
    var cache = Object.create(null);
    return (function cachedFn (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }

  /**
   * Camelize a hyphen-delimited string.
   */
  var camelizeRE = /-(\w)/g;
  var camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
  });

  /**
   * Capitalize a string.
   */
  var capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  /**
   * Hyphenate a camelCase string.
   */
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });

  /**
   * Simple bind polyfill for environments that do not support it... e.g.
   * PhantomJS 1.x. Technically we don't need this anymore since native bind is
   * now more performant in most browsers, but removing it would be breaking for
   * code that was able to run in PhantomJS 1.x, so this must be kept for
   * backwards compatibility.
   */

  /* istanbul ignore next */
  function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }

    boundFn._length = fn.length;
    return boundFn
  }

  function nativeBind (fn, ctx) {
    return fn.bind(ctx)
  }

  var bind = Function.prototype.bind
    ? nativeBind
    : polyfillBind;

  /**
   * Convert an Array-like object to a real Array.
   */
  function toArray (list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret
  }

  /**
   * Mix properties into target object.
   */
  function extend (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }

  /**
   * Merge an Array of Objects into a single Object.
   */
  function toObject (arr) {
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]);
      }
    }
    return res
  }

  /**
   * Perform no operation.
   * Stubbing args to make Flow happy without leaving useless transpiled code
   * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
   */
  function noop (a, b, c) {}

  /**
   * Always return false.
   */
  var no = function (a, b, c) { return false; };

  /**
   * Return same value
   */
  var identity = function (_) { return _; };

  /**
   * Generate a static keys string from compiler modules.
   */


  /**
   * Check if two values are loosely equal - that is,
   * if they are plain objects, do they have the same shape?
   */
  function looseEqual (a, b) {
    if (a === b) { return true }
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual(e, b[i])
          })
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual(a[key], b[key])
          })
        } else {
          /* istanbul ignore next */
          return false
        }
      } catch (e) {
        /* istanbul ignore next */
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }

  function looseIndexOf (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val)) { return i }
    }
    return -1
  }

  /**
   * Ensure a function is called only once.
   */
  function once (fn) {
    var called = false;
    return function () {
      if (!called) {
        called = true;
        fn.apply(this, arguments);
      }
    }
  }

  var SSR_ATTR = 'data-server-rendered';

  var ASSET_TYPES = [
    'component',
    'directive',
    'filter'
  ];

  var LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured'
  ];

  /*  */

  var config = ({
    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to suppress warnings.
     */
    silent: false,

    /**
     * Show production mode tip message on boot?
     */
    productionTip: "production" !== 'production',

    /**
     * Whether to enable devtools
     */
    devtools: "production" !== 'production',

    /**
     * Whether to record perf
     */
    performance: false,

    /**
     * Error handler for watcher errors
     */
    errorHandler: null,

    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,

    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],

    /**
     * Custom user key aliases for v-on
     */
    // $flow-disable-line
    keyCodes: Object.create(null),

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,

    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: LIFECYCLE_HOOKS
  });

  /*  */

  /**
   * Check if a string starts with $ or _
   */
  function isReserved (str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F
  }

  /**
   * Define a property.
   */
  function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * Parse simple path.
   */
  var bailRE = /[^\w.$]/;
  function parsePath (path) {
    if (bailRE.test(path)) {
      return
    }
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }

  /*  */

  // can we use __proto__?
  var hasProto = '__proto__' in {};

  // Browser environment sniffing
  var inBrowser = typeof window !== 'undefined';
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

  // Firefox has a "watch" function on Object.prototype...
  var nativeWatch = ({}).watch;

  var supportsPassive = false;
  if (inBrowser) {
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get: function get () {
          /* istanbul ignore next */
          supportsPassive = true;
        }
      })); // https://github.com/facebook/flow/issues/285
      window.addEventListener('test-passive', null, opts);
    } catch (e) {}
  }

  // this needs to be lazy-evaled because vue may be required before
  // vue-server-renderer can set VUE_ENV
  var _isServer;
  var isServerRendering = function () {
    if (_isServer === undefined) {
      /* istanbul ignore if */
      if (!inBrowser && !inWeex && typeof global !== 'undefined') {
        // detect presence of vue-server-renderer and avoid
        // Webpack shimming the process
        _isServer = global['process'].env.VUE_ENV === 'server';
      } else {
        _isServer = false;
      }
    }
    return _isServer
  };

  // detect devtools
  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

  /* istanbul ignore next */
  function isNative (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }

  var hasSymbol =
    typeof Symbol !== 'undefined' && isNative(Symbol) &&
    typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

  var _Set;
  /* istanbul ignore if */ // $flow-disable-line
  if (typeof Set !== 'undefined' && isNative(Set)) {
    // use native Set when available.
    _Set = Set;
  } else {
    // a non-standard Set polyfill that only works with primitive keys.
    _Set = (function () {
      function Set () {
        this.set = Object.create(null);
      }
      Set.prototype.has = function has (key) {
        return this.set[key] === true
      };
      Set.prototype.add = function add (key) {
        this.set[key] = true;
      };
      Set.prototype.clear = function clear () {
        this.set = Object.create(null);
      };

      return Set;
    }());
  }

  /*  */

  var warn = noop;

  /*  */


  var uid = 0;

  /**
   * A dep is an observable that can have multiple
   * directives subscribing to it.
   */
  var Dep = function Dep () {
    this.id = uid++;
    this.subs = [];
  };

  Dep.prototype.addSub = function addSub (sub) {
    this.subs.push(sub);
  };

  Dep.prototype.removeSub = function removeSub (sub) {
    remove(this.subs, sub);
  };

  Dep.prototype.depend = function depend () {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  };

  Dep.prototype.notify = function notify () {
    // stabilize the subscriber list first
    var subs = this.subs.slice();
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  };

  // the current target watcher being evaluated.
  // this is globally unique because there could be only one
  // watcher being evaluated at any time.
  Dep.target = null;
  var targetStack = [];

  function pushTarget (_target) {
    if (Dep.target) { targetStack.push(Dep.target); }
    Dep.target = _target;
  }

  function popTarget () {
    Dep.target = targetStack.pop();
  }

  /*  */

  var VNode = function VNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  };

  var prototypeAccessors = { child: { configurable: true } };

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  prototypeAccessors.child.get = function () {
    return this.componentInstance
  };

  Object.defineProperties( VNode.prototype, prototypeAccessors );

  var createEmptyVNode = function (text) {
    if ( text === void 0 ) { text = ''; }

    var node = new VNode();
    node.text = text;
    node.isComment = true;
    return node
  };

  function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
  }

  // optimized shallow clone
  // used for static nodes and slot nodes because they may be reused across
  // multiple renders, cloning them avoids errors when DOM manipulations rely
  // on their elm reference.
  function cloneVNode (vnode) {
    var cloned = new VNode(
      vnode.tag,
      vnode.data,
      vnode.children,
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.isCloned = true;
    return cloned
  }

  /*
   * not type checking this file because flow doesn't play well with
   * dynamically accessing methods on Array prototype
   */

  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);

  var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];

  /**
   * Intercept mutating methods and emit events
   */
  methodsToPatch.forEach(function (method) {
    // cache original method
    var original = arrayProto[method];
    def(arrayMethods, method, function mutator () {
      var arguments$1 = arguments;

      var args = [], len = arguments.length;
      while ( len-- ) { args[ len ] = arguments$1[ len ]; }

      var result = original.apply(this, args);
      var ob = this.__ob__;
      var inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) { ob.observeArray(inserted); }
      // notify change
      ob.dep.notify();
      return result
    });
  });

  /*  */

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  var shouldObserve = true;

  function toggleObserving (value) {
    shouldObserve = value;
  }

  /**
   * Observer class that is attached to each observed
   * object. Once attached, the observer converts the target
   * object's property keys into getter/setters that
   * collect dependencies and dispatch updates.
   */
  var Observer = function Observer (value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      var augment = hasProto
        ? protoAugment
        : copyAugment;
      augment(value, arrayMethods, arrayKeys);
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  };

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  Observer.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  };

  /**
   * Observe a list of Array items.
   */
  Observer.prototype.observeArray = function observeArray (items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  };

  // helpers

  /**
   * Augment an target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment (target, src, keys) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
  }

  /**
   * Augment an target Object or Array by defining
   * hidden properties.
   */
  /* istanbul ignore next */
  function copyAugment (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def(target, key, src[key]);
    }
  }

  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  function observe (value, asRootData) {
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer(value);
    }
    if (asRootData && ob) {
      ob.vmCount++;
    }
    return ob
  }

  /**
   * Define a reactive property on an Object.
   */
  function defineReactive (
    obj,
    key,
    val,
    customSetter,
    shallow
  ) {
    var dep = new Dep();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return
    }

    // cater for pre-defined getter/setters
    var getter = property && property.get;
    if (!getter && arguments.length === 2) {
      val = obj[key];
    }
    var setter = property && property.set;

    var childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        var value = getter ? getter.call(obj) : val;
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        var value = getter ? getter.call(obj) : val;
        /* eslint-disable no-self-compare */
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = !shallow && observe(newVal);
        dep.notify();
      }
    });
  }

  /**
   * Set a property on an object. Adds the new property and
   * triggers change notification if the property doesn't
   * already exist.
   */
  function set (target, key, val) {
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val
    }
    if (key in target && !(key in Object.prototype)) {
      target[key] = val;
      return val
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
      return val
    }
    if (!ob) {
      target[key] = val;
      return val
    }
    defineReactive(ob.value, key, val);
    ob.dep.notify();
    return val
  }

  /**
   * Delete a property and trigger change if necessary.
   */
  function del (target, key) {
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1);
      return
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
      return
    }
    if (!hasOwn(target, key)) {
      return
    }
    delete target[key];
    if (!ob) {
      return
    }
    ob.dep.notify();
  }

  /**
   * Collect dependencies on array elements when the array is touched, since
   * we cannot intercept array element access like property getters.
   */
  function dependArray (value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
      e = value[i];
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        dependArray(e);
      }
    }
  }

  /*  */

  /**
   * Option overwriting strategies are functions that handle
   * how to merge a parent option value and a child option
   * value into the final value.
   */
  var strats = config.optionMergeStrategies;

  /**
   * Helper that recursively merges two data objects together.
   */
  function mergeData (to, from) {
    if (!from) { return to }
    var key, toVal, fromVal;
    var keys = Object.keys(from);
    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      toVal = to[key];
      fromVal = from[key];
      if (!hasOwn(to, key)) {
        set(to, key, fromVal);
      } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
        mergeData(toVal, fromVal);
      }
    }
    return to
  }

  /**
   * Data
   */
  function mergeDataOrFn (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      // in a Vue.extend merge, both should be functions
      if (!childVal) {
        return parentVal
      }
      if (!parentVal) {
        return childVal
      }
      // when parentVal & childVal are both present,
      // we need to return a function that returns the
      // merged result of both functions... no need to
      // check if parentVal is a function here because
      // it has to be a function to pass previous merges.
      return function mergedDataFn () {
        return mergeData(
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
        )
      }
    } else {
      return function mergedInstanceDataFn () {
        // instance merge
        var instanceData = typeof childVal === 'function'
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function'
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) {
          return mergeData(instanceData, defaultData)
        } else {
          return defaultData
        }
      }
    }
  }

  strats.data = function (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') {

        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal)
    }

    return mergeDataOrFn(parentVal, childVal, vm)
  };

  /**
   * Hooks and props are merged as arrays.
   */
  function mergeHook (
    parentVal,
    childVal
  ) {
    return childVal
      ? parentVal
        ? parentVal.concat(childVal)
        : Array.isArray(childVal)
          ? childVal
          : [childVal]
      : parentVal
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  /**
   * Assets
   *
   * When a vm is present (instance creation), we need to do
   * a three-way merge between constructor options, instance
   * options and parent options.
   */
  function mergeAssets (
    parentVal,
    childVal,
    vm,
    key
  ) {
    var res = Object.create(parentVal || null);
    if (childVal) {
      return extend(res, childVal)
    } else {
      return res
    }
  }

  ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = mergeAssets;
  });

  /**
   * Watchers.
   *
   * Watchers hashes should not overwrite one
   * another, so we merge them as arrays.
   */
  strats.watch = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    // work around Firefox's Object.prototype.watch...
    if (parentVal === nativeWatch) { parentVal = undefined; }
    if (childVal === nativeWatch) { childVal = undefined; }
    /* istanbul ignore if */
    if (!childVal) { return Object.create(parentVal || null) }
    if (!parentVal) { return childVal }
    var ret = {};
    extend(ret, parentVal);
    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  /**
   * Other object hashes.
   */
  strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    if (childVal && "production" !== 'production') {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = Object.create(null);
    extend(ret, parentVal);
    if (childVal) { extend(ret, childVal); }
    return ret
  };
  strats.provide = mergeDataOrFn;

  /**
   * Default strategy.
   */
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };

  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps (options, vm) {
    var props = options.props;
    if (!props) { return }
    var res = {};
    var i, val, name;
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize(val);
          res[name] = { type: null };
        }
      }
    } else if (isPlainObject(props)) {
      for (var key in props) {
        val = props[key];
        name = camelize(key);
        res[name] = isPlainObject(val)
          ? val
          : { type: val };
      }
    }
    options.props = res;
  }

  /**
   * Normalize all injections into Object-based format
   */
  function normalizeInject (options, vm) {
    var inject = options.inject;
    if (!inject) { return }
    var normalized = options.inject = {};
    if (Array.isArray(inject)) {
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] };
      }
    } else if (isPlainObject(inject)) {
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject(val)
          ? extend({ from: key }, val)
          : { from: val };
      }
    }
  }

  /**
   * Normalize raw function directives into object format.
   */
  function normalizeDirectives (options) {
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def = dirs[key];
        if (typeof def === 'function') {
          dirs[key] = { bind: def, update: def };
        }
      }
    }
  }

  function assertObjectType (name, value, vm) {
    if (!isPlainObject(value)) {
      warn(
        "Invalid value for option \"" + name + "\": expected an Object, " +
        "but got " + (toRawType(value)) + ".",
        vm
      );
    }
  }

  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions (
    parent,
    child,
    vm
  ) {

    if (typeof child === 'function') {
      child = child.options;
    }

    normalizeProps(child, vm);
    normalizeInject(child, vm);
    normalizeDirectives(child);
    var extendsFrom = child.extends;
    if (extendsFrom) {
      parent = mergeOptions(parent, extendsFrom, vm);
    }
    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
    var options = {};
    var key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField (key) {
      var strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset (
    options,
    type,
    id,
    warnMissing
  ) {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
      return
    }
    var assets = options[type];
    // check local registration variations first
    if (hasOwn(assets, id)) { return assets[id] }
    var camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
    var PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
    // fallback to prototype chain
    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    return res
  }

  /*  */

  function validateProp (
    key,
    propOptions,
    propsData,
    vm
  ) {
    var prop = propOptions[key];
    var absent = !hasOwn(propsData, key);
    var value = propsData[key];
    // boolean casting
    var booleanIndex = getTypeIndex(Boolean, prop.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn(prop, 'default')) {
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        var stringIndex = getTypeIndex(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    // check default value
    if (value === undefined) {
      value = getPropDefaultValue(vm, prop, key);
      // since the default value is a fresh copy,
      // make sure to observe it.
      var prevShouldObserve = shouldObserve;
      toggleObserving(true);
      observe(value);
      toggleObserving(prevShouldObserve);
    }
    return value
  }

  /**
   * Get the default value of a prop.
   */
  function getPropDefaultValue (vm, prop, key) {
    // no default, return undefined
    if (!hasOwn(prop, 'default')) {
      return undefined
    }
    var def = prop.default;
    // the raw prop value was also undefined from previous render,
    // return previous default value to avoid unnecessary watcher trigger
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined &&
      vm._props[key] !== undefined
    ) {
      return vm._props[key]
    }
    // call factory function for non-Function types
    // a value is Function if its prototype is function even across different execution context
    return typeof def === 'function' && getType(prop.type) !== 'Function'
      ? def.call(vm)
      : def
  }

  /**
   * Use function string name to check built-in types,
   * because a simple equality check will fail when running
   * across different vms / iframes.
   */
  function getType (fn) {
    var match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : ''
  }

  function isSameType (a, b) {
    return getType(a) === getType(b)
  }

  function getTypeIndex (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
      return isSameType(expectedTypes, type) ? 0 : -1
    }
    for (var i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType(expectedTypes[i], type)) {
        return i
      }
    }
    return -1
  }

  /*  */

  function handleError (err, vm, info) {
    if (vm) {
      var cur = vm;
      while ((cur = cur.$parent)) {
        var hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (var i = 0; i < hooks.length; i++) {
            try {
              var capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) { return }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  }

  function globalHandleError (err, vm, info) {
    if (config.errorHandler) {
      try {
        return config.errorHandler.call(null, err, vm, info)
      } catch (e) {
        logError(e, null, 'config.errorHandler');
      }
    }
    logError(err, vm, info);
  }

  function logError (err, vm, info) {
    /* istanbul ignore else */
    if ((inBrowser || inWeex) && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }

  /*  */
  /* globals MessageChannel */

  var callbacks = [];
  var pending = false;

  function flushCallbacks () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // Here we have async deferring wrappers using both microtasks and (macro) tasks.
  // In < 2.4 we used microtasks everywhere, but there are some scenarios where
  // microtasks have too high a priority and fire in between supposedly
  // sequential events (e.g. #4521, #6690) or even between bubbling of the same
  // event (#6566). However, using (macro) tasks everywhere also has subtle problems
  // when state is changed right before repaint (e.g. #6813, out-in transitions).
  // Here we use microtask by default, but expose a way to force (macro) task when
  // needed (e.g. in event handlers attached by v-on).
  var microTimerFunc;
  var macroTimerFunc;
  var useMacroTask = false;

  // Determine (macro) task defer implementation.
  // Technically setImmediate should be the ideal choice, but it's only available
  // in IE. The only polyfill that consistently queues the callback after all DOM
  // events triggered in the same loop is by using MessageChannel.
  /* istanbul ignore if */
  if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    macroTimerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else if (typeof MessageChannel !== 'undefined' && (
    isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]'
  )) {
    var channel = new MessageChannel();
    var port = channel.port2;
    channel.port1.onmessage = flushCallbacks;
    macroTimerFunc = function () {
      port.postMessage(1);
    };
  } else {
    /* istanbul ignore next */
    macroTimerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }

  // Determine microtask defer implementation.
  /* istanbul ignore next, $flow-disable-line */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    microTimerFunc = function () {
      p.then(flushCallbacks);
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else {
    // fallback to macro
    microTimerFunc = macroTimerFunc;
  }

  /**
   * Wrap a function so that if any code inside triggers state change,
   * the changes are queued using a (macro) task instead of a microtask.
   */
  function withMacroTask (fn) {
    return fn._withTask || (fn._withTask = function () {
      useMacroTask = true;
      var res = fn.apply(null, arguments);
      useMacroTask = false;
      return res
    })
  }

  function nextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      if (useMacroTask) {
        macroTimerFunc();
      } else {
        microTimerFunc();
      }
    }
    // $flow-disable-line
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }

  /*  */

  var seenObjects = new _Set();

  /**
   * Recursively traverse an object to evoke all converted
   * getters, so that every nested property inside the object
   * is collected as a "deep" dependency.
   */
  function traverse (val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
  }

  function _traverse (val, seen) {
    var i, keys;
    var isA = Array.isArray(val);
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
      return
    }
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return
      }
      seen.add(depId);
    }
    if (isA) {
      i = val.length;
      while (i--) { _traverse(val[i], seen); }
    } else {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) { _traverse(val[keys[i]], seen); }
    }
  }

  /*  */

  var normalizeEvent = cached(function (name) {
    var passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
    name = once$$1 ? name.slice(1) : name;
    var capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
      name: name,
      once: once$$1,
      capture: capture,
      passive: passive
    }
  });

  function createFnInvoker (fns) {
    function invoker () {
      var arguments$1 = arguments;

      var fns = invoker.fns;
      if (Array.isArray(fns)) {
        var cloned = fns.slice();
        for (var i = 0; i < cloned.length; i++) {
          cloned[i].apply(null, arguments$1);
        }
      } else {
        // return handler return value for single handlers
        return fns.apply(null, arguments)
      }
    }
    invoker.fns = fns;
    return invoker
  }

  function updateListeners (
    on,
    oldOn,
    add,
    remove$$1,
    vm
  ) {
    var name, def, cur, old, event;
    for (name in on) {
      def = cur = on[name];
      old = oldOn[name];
      event = normalizeEvent(name);
      /* istanbul ignore if */
      if (isUndef(cur)) ; else if (isUndef(old)) {
        if (isUndef(cur.fns)) {
          cur = on[name] = createFnInvoker(cur);
        }
        add(event.name, cur, event.once, event.capture, event.passive, event.params);
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (isUndef(on[name])) {
        event = normalizeEvent(name);
        remove$$1(event.name, oldOn[name], event.capture);
      }
    }
  }

  /*  */

  function mergeVNodeHook (def, hookKey, hook) {
    if (def instanceof VNode) {
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey];

    function wrappedHook () {
      hook.apply(this, arguments);
      // important: remove merged hook to ensure it's called only once
      // and prevent memory leak
      remove(invoker.fns, wrappedHook);
    }

    if (isUndef(oldHook)) {
      // no existing hook
      invoker = createFnInvoker([wrappedHook]);
    } else {
      /* istanbul ignore if */
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
        // already a merged invoker
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        // existing plain hook
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }

    invoker.merged = true;
    def[hookKey] = invoker;
  }

  /*  */

  function extractPropsFromVNodeData (
    data,
    Ctor,
    tag
  ) {
    // we are only extracting raw values here.
    // validation and default values are handled in the child
    // component itself.
    var propOptions = Ctor.options.props;
    if (isUndef(propOptions)) {
      return
    }
    var res = {};
    var attrs = data.attrs;
    var props = data.props;
    if (isDef(attrs) || isDef(props)) {
      for (var key in propOptions) {
        var altKey = hyphenate(key);
        checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  function checkProp (
    res,
    hash,
    key,
    altKey,
    preserve
  ) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  /*  */

  // The template compiler attempts to minimize the need for normalization by
  // statically analyzing the template at compile time.
  //
  // For plain HTML markup, normalization can be completely skipped because the
  // generated render function is guaranteed to return Array<VNode>. There are
  // two cases where extra normalization is needed:

  // 1. When the children contains components - because a functional component
  // may return an Array instead of a single root. In this case, just a simple
  // normalization is needed - if any child is an Array, we flatten the whole
  // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
  // because functional components already normalize their own children.
  function simpleNormalizeChildren (children) {
    for (var i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)
      }
    }
    return children
  }

  // 2. When the children contains constructs that always generated nested Arrays,
  // e.g. <template>, <slot>, v-for, or when the children is provided by user
  // with hand-written render functions / JSX. In such cases a full normalization
  // is needed to cater to all possible types of children values.
  function normalizeChildren (children) {
    return isPrimitive(children)
      ? [createTextVNode(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren(children)
        : undefined
  }

  function isTextNode (node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
  }

  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1;
      last = res[lastIndex];
      //  nested
      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
          // merge adjacent text nodes
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + (c[0]).text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        if (isTextNode(last)) {
          // merge adjacent text nodes
          // this is necessary for SSR hydration because text nodes are
          // essentially merged when rendered to HTML strings
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          // merge adjacent text nodes
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else {
          // default key for nested array children (likely generated by v-for)
          if (isTrue(children._isVList) &&
            isDef(c.tag) &&
            isUndef(c.key) &&
            isDef(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }

  /*  */

  function ensureCtor (comp, base) {
    if (
      comp.__esModule ||
      (hasSymbol && comp[Symbol.toStringTag] === 'Module')
    ) {
      comp = comp.default;
    }
    return isObject(comp)
      ? base.extend(comp)
      : comp
  }

  function createAsyncPlaceholder (
    factory,
    data,
    context,
    children,
    tag
  ) {
    var node = createEmptyVNode();
    node.asyncFactory = factory;
    node.asyncMeta = { data: data, context: context, children: children, tag: tag };
    return node
  }

  function resolveAsyncComponent (
    factory,
    baseCtor,
    context
  ) {
    if (isTrue(factory.error) && isDef(factory.errorComp)) {
      return factory.errorComp
    }

    if (isDef(factory.resolved)) {
      return factory.resolved
    }

    if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
      return factory.loadingComp
    }

    if (isDef(factory.contexts)) {
      // already pending
      factory.contexts.push(context);
    } else {
      var contexts = factory.contexts = [context];
      var sync = true;

      var forceRender = function () {
        for (var i = 0, l = contexts.length; i < l; i++) {
          contexts[i].$forceUpdate();
        }
      };

      var resolve = once(function (res) {
        // cache resolved
        factory.resolved = ensureCtor(res, baseCtor);
        // invoke callbacks only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          forceRender();
        }
      });

      var reject = once(function (reason) {
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender();
        }
      });

      var res = factory(resolve, reject);

      if (isObject(res)) {
        if (typeof res.then === 'function') {
          // () => Promise
          if (isUndef(factory.resolved)) {
            res.then(resolve, reject);
          }
        } else if (isDef(res.component) && typeof res.component.then === 'function') {
          res.component.then(resolve, reject);

          if (isDef(res.error)) {
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }

          if (isDef(res.loading)) {
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              setTimeout(function () {
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender();
                }
              }, res.delay || 200);
            }
          }

          if (isDef(res.timeout)) {
            setTimeout(function () {
              if (isUndef(factory.resolved)) {
                reject(
                  null
                );
              }
            }, res.timeout);
          }
        }
      }

      sync = false;
      // return in case resolved synchronously
      return factory.loading
        ? factory.loadingComp
        : factory.resolved
    }
  }

  /*  */

  function isAsyncPlaceholder (node) {
    return node.isComment && node.asyncFactory
  }

  /*  */

  function getFirstComponentChild (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c
        }
      }
    }
  }

  /*  */

  /*  */

  function initEvents (vm) {
    vm._events = Object.create(null);
    vm._hasHookEvent = false;
    // init parent attached events
    var listeners = vm.$options._parentListeners;
    if (listeners) {
      updateComponentListeners(vm, listeners);
    }
  }

  var target;

  function add (event, fn, once) {
    if (once) {
      target.$once(event, fn);
    } else {
      target.$on(event, fn);
    }
  }

  function remove$1 (event, fn) {
    target.$off(event, fn);
  }

  function updateComponentListeners (
    vm,
    listeners,
    oldListeners
  ) {
    target = vm;
    updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
    target = undefined;
  }

  function eventsMixin (Vue) {
    var hookRE = /^hook:/;
    Vue.prototype.$on = function (event, fn) {
      var this$1 = this;

      var vm = this;
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          this$1.$on(event[i], fn);
        }
      } else {
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        // optimize hook:event cost by using a boolean flag marked at registration
        // instead of a hash lookup
        if (hookRE.test(event)) {
          vm._hasHookEvent = true;
        }
      }
      return vm
    };

    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on () {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm
    };

    Vue.prototype.$off = function (event, fn) {
      var this$1 = this;

      var vm = this;
      // all
      if (!arguments.length) {
        vm._events = Object.create(null);
        return vm
      }
      // array of events
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          this$1.$off(event[i], fn);
        }
        return vm
      }
      // specific event
      var cbs = vm._events[event];
      if (!cbs) {
        return vm
      }
      if (!fn) {
        vm._events[event] = null;
        return vm
      }
      if (fn) {
        // specific handler
        var cb;
        var i$1 = cbs.length;
        while (i$1--) {
          cb = cbs[i$1];
          if (cb === fn || cb.fn === fn) {
            cbs.splice(i$1, 1);
            break
          }
        }
      }
      return vm
    };

    Vue.prototype.$emit = function (event) {
      var vm = this;
      var cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        var args = toArray(arguments, 1);
        for (var i = 0, l = cbs.length; i < l; i++) {
          try {
            cbs[i].apply(vm, args);
          } catch (e) {
            handleError(e, vm, ("event handler for \"" + event + "\""));
          }
        }
      }
      return vm
    };
  }

  /*  */



  /**
   * Runtime helper for resolving raw children VNodes into a slot object.
   */
  function resolveSlots (
    children,
    context
  ) {
    var slots = {};
    if (!children) {
      return slots
    }
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      // remove slot attribute if the node is resolved as a Vue slot node
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    // ignore slots that contains only whitespace
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace)) {
        delete slots[name$1];
      }
    }
    return slots
  }

  function isWhitespace (node) {
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  function resolveScopedSlots (
    fns, // see flow/vnode
    res
  ) {
    res = res || {};
    for (var i = 0; i < fns.length; i++) {
      if (Array.isArray(fns[i])) {
        resolveScopedSlots(fns[i], res);
      } else {
        res[fns[i].key] = fns[i].fn;
      }
    }
    return res
  }

  /*  */

  var activeInstance = null;

  function initLifecycle (vm) {
    var options = vm.$options;

    // locate first non-abstract parent
    var parent = options.parent;
    if (parent && !options.abstract) {
      while (parent.$options.abstract && parent.$parent) {
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }

    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null;
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }

  function lifecycleMixin (Vue) {
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate');
      }
      var prevEl = vm.$el;
      var prevVnode = vm._vnode;
      var prevActiveInstance = activeInstance;
      activeInstance = vm;
      vm._vnode = vnode;
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      if (!prevVnode) {
        // initial render
        vm.$el = vm.__patch__(
          vm.$el, vnode, hydrating, false /* removeOnly */,
          vm.$options._parentElm,
          vm.$options._refElm
        );
        // no need for the ref nodes after initial patch
        // this prevents keeping a detached DOM tree in memory (#5851)
        vm.$options._parentElm = vm.$options._refElm = null;
      } else {
        // updates
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      activeInstance = prevActiveInstance;
      // update __vue__ reference
      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      // if parent is an HOC, update its $el as well
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
        vm.$parent.$el = vm.$el;
      }
      // updated hook is called by the scheduler to ensure that children are
      // updated in a parent's updated hook.
    };

    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
    };

    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) {
        return
      }
      callHook(vm, 'beforeDestroy');
      vm._isBeingDestroyed = true;
      // remove self from parent
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm);
      }
      // teardown watchers
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      // remove reference from data ob
      // frozen object may not have observer.
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      // call the last hook...
      vm._isDestroyed = true;
      // invoke destroy hooks on current rendered tree
      vm.__patch__(vm._vnode, null);
      // fire destroyed hook
      callHook(vm, 'destroyed');
      // turn off all instance listeners.
      vm.$off();
      // remove __vue__ reference
      if (vm.$el) {
        vm.$el.__vue__ = null;
      }
      // release circular reference (#6759)
      if (vm.$vnode) {
        vm.$vnode.parent = null;
      }
    };
  }

  function mountComponent (
    vm,
    el,
    hydrating
  ) {
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
    }
    callHook(vm, 'beforeMount');

    var updateComponent;
    /* istanbul ignore if */
    {
      updateComponent = function () {
        vm._update(vm._render(), hydrating);
      };
    }

    // we set this to vm._watcher inside the watcher's constructor
    // since the watcher's initial patch may call $forceUpdate (e.g. inside child
    // component's mounted hook), which relies on vm._watcher being already defined
    new Watcher(vm, updateComponent, noop, null, true /* isRenderWatcher */);
    hydrating = false;

    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook(vm, 'mounted');
    }
    return vm
  }

  function updateChildComponent (
    vm,
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {

    // determine whether component has slot children
    // we need to do this before overwriting $options._renderChildren
    var hasChildren = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      parentVnode.data.scopedSlots || // has new scoped slots
      vm.$scopedSlots !== emptyObject // has old scoped slots
    );

    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render

    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;

    // update $attrs and $listeners hash
    // these are also reactive so they may trigger child update if the child
    // used them during render
    vm.$attrs = parentVnode.data.attrs || emptyObject;
    vm.$listeners = listeners || emptyObject;

    // update props
    if (propsData && vm.$options.props) {
      toggleObserving(false);
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props; // wtf flow?
        props[key] = validateProp(key, propOptions, propsData, vm);
      }
      toggleObserving(true);
      // keep a copy of raw propsData
      vm.$options.propsData = propsData;
    }

    // update listeners
    listeners = listeners || emptyObject;
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);

    // resolve slots + force update if has children
    if (hasChildren) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }
  }

  function isInInactiveTree (vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive) { return true }
    }
    return false
  }

  function activateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree(vm)) {
        return
      }
    } else if (vm._directInactive) {
      return
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (var i = 0; i < vm.$children.length; i++) {
        activateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'activated');
    }
  }

  function deactivateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree(vm)) {
        return
      }
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (var i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'deactivated');
    }
  }

  function callHook (vm, hook) {
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget();
    var handlers = vm.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        try {
          handlers[i].call(vm);
        } catch (e) {
          handleError(e, vm, (hook + " hook"));
        }
      }
    }
    if (vm._hasHookEvent) {
      vm.$emit('hook:' + hook);
    }
    popTarget();
  }

  var queue = [];
  var activatedChildren = [];
  var has = {};
  var waiting = false;
  var flushing = false;
  var index = 0;

  /**
   * Reset the scheduler's state.
   */
  function resetSchedulerState () {
    index = queue.length = activatedChildren.length = 0;
    has = {};
    waiting = flushing = false;
  }

  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue () {
    flushing = true;
    var watcher, id;

    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child)
    // 2. A component's user watchers are run before its render watcher (because
    //    user watchers are created before the render watcher)
    // 3. If a component is destroyed during a parent component's watcher run,
    //    its watchers can be skipped.
    queue.sort(function (a, b) { return a.id - b.id; });

    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index];
      id = watcher.id;
      has[id] = null;
      watcher.run();
    }

    // keep copies of post queues before resetting state
    var activatedQueue = activatedChildren.slice();
    var updatedQueue = queue.slice();

    resetSchedulerState();

    // call component updated and activated hooks
    callActivatedHooks(activatedQueue);
    callUpdatedHooks(updatedQueue);

    // devtool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
  }

  function callUpdatedHooks (queue) {
    var i = queue.length;
    while (i--) {
      var watcher = queue[i];
      var vm = watcher.vm;
      if (vm._watcher === watcher && vm._isMounted) {
        callHook(vm, 'updated');
      }
    }
  }

  /**
   * Queue a kept-alive component that was activated during patch.
   * The queue will be processed after the entire tree has been patched.
   */
  function queueActivatedComponent (vm) {
    // setting _inactive to false here so that a render function can
    // rely on checking whether it's in an inactive tree (e.g. router-view)
    vm._inactive = false;
    activatedChildren.push(vm);
  }

  function callActivatedHooks (queue) {
    for (var i = 0; i < queue.length; i++) {
      queue[i]._inactive = true;
      activateChildComponent(queue[i], true /* true */);
    }
  }

  /**
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
   */
  function queueWatcher (watcher) {
    var id = watcher.id;
    if (has[id] == null) {
      has[id] = true;
      if (!flushing) {
        queue.push(watcher);
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        var i = queue.length - 1;
        while (i > index && queue[i].id > watcher.id) {
          i--;
        }
        queue.splice(i + 1, 0, watcher);
      }
      // queue the flush
      if (!waiting) {
        waiting = true;
        nextTick(flushSchedulerQueue);
      }
    }
  }

  /*  */

  var uid$1 = 0;

  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   */
  var Watcher = function Watcher (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid$1; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    this.expression = '';
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = function () {};
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get();
  };

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  Watcher.prototype.get = function get () {
    pushTarget(this);
    var value;
    var vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value
  };

  /**
   * Add a dependency to this directive.
   */
  Watcher.prototype.addDep = function addDep (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };

  /**
   * Clean up for dependency collection.
   */
  Watcher.prototype.cleanupDeps = function cleanupDeps () {
      var this$1 = this;

    var i = this.deps.length;
    while (i--) {
      var dep = this$1.deps[i];
      if (!this$1.newDepIds.has(dep.id)) {
        dep.removeSub(this$1);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  Watcher.prototype.update = function update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  };

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  Watcher.prototype.run = function run () {
    if (this.active) {
      var value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  Watcher.prototype.evaluate = function evaluate () {
    this.value = this.get();
    this.dirty = false;
  };

  /**
   * Depend on all deps collected by this watcher.
   */
  Watcher.prototype.depend = function depend () {
      var this$1 = this;

    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].depend();
    }
  };

  /**
   * Remove self from all dependencies' subscriber list.
   */
  Watcher.prototype.teardown = function teardown () {
      var this$1 = this;

    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) {
        this$1.deps[i].removeSub(this$1);
      }
      this.active = false;
    }
  };

  /*  */

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
  };

  function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    if (opts.methods) { initMethods(vm, opts.methods); }
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }

  function initProps (vm, propsOptions) {
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    var keys = vm.$options._propKeys = [];
    var isRoot = !vm.$parent;
    // root instance props should be converted
    if (!isRoot) {
      toggleObserving(false);
    }
    var loop = function ( key ) {
      keys.push(key);
      var value = validateProp(key, propsOptions, propsData, vm);
      /* istanbul ignore else */
      {
        defineReactive(props, key, value);
      }
      // static props are already proxied on the component's prototype
      // during Vue.extend(). We only need to proxy props defined at
      // instantiation here.
      if (!(key in vm)) {
        proxy(vm, "_props", key);
      }
    };

    for (var key in propsOptions) { loop( key ); }
    toggleObserving(true);
  }

  function initData (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) {
      data = {};
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      if (props && hasOwn(props, key)) ; else if (!isReserved(key)) {
        proxy(vm, "_data", key);
      }
    }
    // observe data
    observe(data, true /* asRootData */);
  }

  function getData (data, vm) {
    // #7573 disable dep collection when invoking data getters
    pushTarget();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget();
    }
  }

  var computedWatcherOptions = { lazy: true };

  function initComputed (vm, computed) {
    // $flow-disable-line
    var watchers = vm._computedWatchers = Object.create(null);
    // computed properties are just getters during SSR
    var isSSR = isServerRendering();

    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === 'function' ? userDef : userDef.get;

      if (!isSSR) {
        // create internal watcher for the computed property.
        watchers[key] = new Watcher(
          vm,
          getter || noop,
          noop,
          computedWatcherOptions
        );
      }

      // component-defined computed properties are already defined on the
      // component prototype. We only need to define computed properties defined
      // at instantiation here.
      if (!(key in vm)) {
        defineComputed(vm, key, userDef);
      }
    }
  }

  function defineComputed (
    target,
    key,
    userDef
  ) {
    var shouldCache = !isServerRendering();
    if (typeof userDef === 'function') {
      sharedPropertyDefinition.get = shouldCache
        ? createComputedGetter(key)
        : userDef;
      sharedPropertyDefinition.set = noop;
    } else {
      sharedPropertyDefinition.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key)
          : userDef.get
        : noop;
      sharedPropertyDefinition.set = userDef.set
        ? userDef.set
        : noop;
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function createComputedGetter (key) {
    return function computedGetter () {
      var watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          watcher.depend();
        }
        return watcher.value
      }
    }
  }

  function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
    }
  }

  function initWatch (vm, watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher (
    vm,
    expOrFn,
    handler,
    options
  ) {
    if (isPlainObject(handler)) {
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options)
  }

  function stateMixin (Vue) {
    // flow somehow has problems with directly declared definition object
    // when using Object.defineProperty, so we have to procedurally build up
    // the object here.
    var dataDef = {};
    dataDef.get = function () { return this._data };
    var propsDef = {};
    propsDef.get = function () { return this._props };
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);

    Vue.prototype.$set = set;
    Vue.prototype.$delete = del;

    Vue.prototype.$watch = function (
      expOrFn,
      cb,
      options
    ) {
      var vm = this;
      if (isPlainObject(cb)) {
        return createWatcher(vm, expOrFn, cb, options)
      }
      options = options || {};
      options.user = true;
      var watcher = new Watcher(vm, expOrFn, cb, options);
      if (options.immediate) {
        cb.call(vm, watcher.value);
      }
      return function unwatchFn () {
        watcher.teardown();
      }
    };
  }

  /*  */

  function initProvide (vm) {
    var provide = vm.$options.provide;
    if (provide) {
      vm._provided = typeof provide === 'function'
        ? provide.call(vm)
        : provide;
    }
  }

  function initInjections (vm) {
    var result = resolveInject(vm.$options.inject, vm);
    if (result) {
      toggleObserving(false);
      Object.keys(result).forEach(function (key) {
        /* istanbul ignore else */
        {
          defineReactive(vm, key, result[key]);
        }
      });
      toggleObserving(true);
    }
  }

  function resolveInject (inject, vm) {
    if (inject) {
      // inject is :any because flow is not smart enough to figure out cached
      var result = Object.create(null);
      var keys = hasSymbol
        ? Reflect.ownKeys(inject).filter(function (key) {
          /* istanbul ignore next */
          return Object.getOwnPropertyDescriptor(inject, key).enumerable
        })
        : Object.keys(inject);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var provideKey = inject[key].from;
        var source = vm;
        while (source) {
          if (source._provided && hasOwn(source._provided, provideKey)) {
            result[key] = source._provided[provideKey];
            break
          }
          source = source.$parent;
        }
        if (!source) {
          if ('default' in inject[key]) {
            var provideDefault = inject[key].default;
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm)
              : provideDefault;
          }
        }
      }
      return result
    }
  }

  /*  */

  /**
   * Runtime helper for rendering v-for lists.
   */
  function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
    if (isDef(ret)) {
      (ret)._isVList = true;
    }
    return ret
  }

  /*  */

  /**
   * Runtime helper for rendering <slot>
   */
  function renderSlot (
    name,
    fallback,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    var nodes;
    if (scopedSlotFn) { // scoped slot
      props = props || {};
      if (bindObject) {
        props = extend(extend({}, bindObject), props);
      }
      nodes = scopedSlotFn(props) || fallback;
    } else {
      var slotNodes = this.$slots[name];
      // warn duplicate slot usage
      if (slotNodes) {
        slotNodes._rendered = true;
      }
      nodes = slotNodes || fallback;
    }

    var target = props && props.slot;
    if (target) {
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  /*  */

  /**
   * Runtime helper for resolving filters
   */
  function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  /*  */

  function isKeyNotMatch (expect, actual) {
    if (Array.isArray(expect)) {
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual
    }
  }

  /**
   * Runtime helper for checking keyCodes from config.
   * exposed as Vue.prototype._k
   * passing in eventKeyName as last argument separately for backwards compat
   */
  function checkKeyCodes (
    eventKeyCode,
    key,
    builtInKeyCode,
    eventKeyName,
    builtInKeyName
  ) {
    var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
      return isKeyNotMatch(builtInKeyName, eventKeyName)
    } else if (mappedKeyCode) {
      return isKeyNotMatch(mappedKeyCode, eventKeyCode)
    } else if (eventKeyName) {
      return hyphenate(eventKeyName) !== key
    }
  }

  /*  */

  /**
   * Runtime helper for merging v-bind="object" into a VNode's data.
   */
  function bindObjectProps (
    data,
    tag,
    value,
    asProp,
    isSync
  ) {
    if (value) {
      if (!isObject(value)) ; else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        var hash;
        var loop = function ( key ) {
          if (
            key === 'class' ||
            key === 'style' ||
            isReservedAttribute(key)
          ) {
            hash = data;
          } else {
            var type = data.attrs && data.attrs.type;
            hash = asProp || config.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
          }
          if (!(key in hash)) {
            hash[key] = value[key];

            if (isSync) {
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) {
                value[key] = $event;
              };
            }
          }
        };

        for (var key in value) { loop( key ); }
      }
    }
    return data
  }

  /*  */

  /**
   * Runtime helper for rendering static trees.
   */
  function renderStatic (
    index,
    isInFor
  ) {
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree.
    if (tree && !isInFor) {
      return tree
    }
    // otherwise, render a fresh tree.
    tree = cached[index] = this.$options.staticRenderFns[index].call(
      this._renderProxy,
      null,
      this // for render fns generated for functional component templates
    );
    markStatic(tree, ("__static__" + index), false);
    return tree
  }

  /**
   * Runtime helper for v-once.
   * Effectively it means marking the node as static with a unique key.
   */
  function markOnce (
    tree,
    index,
    key
  ) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  }

  function markStatic (
    tree,
    key,
    isOnce
  ) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  /*  */

  function bindObjectListeners (data, value) {
    if (value) {
      if (!isPlainObject(value)) ; else {
        var on = data.on = data.on ? extend({}, data.on) : {};
        for (var key in value) {
          var existing = on[key];
          var ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data
  }

  /*  */

  function installRenderHelpers (target) {
    target._o = markOnce;
    target._n = toNumber;
    target._s = toString;
    target._l = renderList;
    target._t = renderSlot;
    target._q = looseEqual;
    target._i = looseIndexOf;
    target._m = renderStatic;
    target._f = resolveFilter;
    target._k = checkKeyCodes;
    target._b = bindObjectProps;
    target._v = createTextVNode;
    target._e = createEmptyVNode;
    target._u = resolveScopedSlots;
    target._g = bindObjectListeners;
  }

  /*  */

  function FunctionalRenderContext (
    data,
    props,
    children,
    parent,
    Ctor
  ) {
    var options = Ctor.options;
    // ensure the createElement function in functional components
    // gets a unique context - this is necessary for correct named slot check
    var contextVm;
    if (hasOwn(parent, '_uid')) {
      contextVm = Object.create(parent);
      // $flow-disable-line
      contextVm._original = parent;
    } else {
      // the context vm passed in is a functional context as well.
      // in this case we want to make sure we are able to get a hold to the
      // real context instance.
      contextVm = parent;
      // $flow-disable-line
      parent = parent._original;
    }
    var isCompiled = isTrue(options._compiled);
    var needNormalization = !isCompiled;

    this.data = data;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options.inject, parent);
    this.slots = function () { return resolveSlots(children, parent); };

    // support for compiled functional template
    if (isCompiled) {
      // exposing $options for renderStatic()
      this.$options = options;
      // pre-resolve slots for renderSlot()
      this.$slots = this.slots();
      this.$scopedSlots = data.scopedSlots || emptyObject;
    }

    if (options._scopeId) {
      this._c = function (a, b, c, d) {
        var vnode = createElement(contextVm, a, b, c, d, needNormalization);
        if (vnode && !Array.isArray(vnode)) {
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else {
      this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
    }
  }

  installRenderHelpers(FunctionalRenderContext.prototype);

  function createFunctionalComponent (
    Ctor,
    propsData,
    data,
    contextVm,
    children
  ) {
    var options = Ctor.options;
    var props = {};
    var propOptions = options.props;
    if (isDef(propOptions)) {
      for (var key in propOptions) {
        props[key] = validateProp(key, propOptions, propsData || emptyObject);
      }
    } else {
      if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
      if (isDef(data.props)) { mergeProps(props, data.props); }
    }

    var renderContext = new FunctionalRenderContext(
      data,
      props,
      children,
      contextVm,
      Ctor
    );

    var vnode = options.render.call(null, renderContext._c, renderContext);

    if (vnode instanceof VNode) {
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options)
    } else if (Array.isArray(vnode)) {
      var vnodes = normalizeChildren(vnode) || [];
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options);
      }
      return res
    }
  }

  function cloneAndMarkFunctionalResult (vnode, data, contextVm, options) {
    // #7817 clone node before setting fnContext, otherwise if the node is reused
    // (e.g. it was from a cached normal slot) the fnContext causes named slots
    // that should not be matched to match.
    var clone = cloneVNode(vnode);
    clone.fnContext = contextVm;
    clone.fnOptions = options;
    if (data.slot) {
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  function mergeProps (to, from) {
    for (var key in from) {
      to[camelize(key)] = from[key];
    }
  }

  /*  */




  // Register the component hook to weex native render engine.
  // The hook will be triggered by native, not javascript.


  // Updates the state of the component to weex native render engine.

  /*  */

  // https://github.com/Hanks10100/weex-native-directive/tree/master/component

  // listening on native callback

  /*  */

  /*  */

  // inline hooks to be invoked on component VNodes during patch
  var componentVNodeHooks = {
    init: function init (
      vnode,
      hydrating,
      parentElm,
      refElm
    ) {
      if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) {
        // kept-alive components, treat as a patch
        var mountedNode = vnode; // work around flow
        componentVNodeHooks.prepatch(mountedNode, mountedNode);
      } else {
        var child = vnode.componentInstance = createComponentInstanceForVnode(
          vnode,
          activeInstance,
          parentElm,
          refElm
        );
        child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      }
    },

    prepatch: function prepatch (oldVnode, vnode) {
      var options = vnode.componentOptions;
      var child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(
        child,
        options.propsData, // updated props
        options.listeners, // updated listeners
        vnode, // new parent vnode
        options.children // new children
      );
    },

    insert: function insert (vnode) {
      var context = vnode.context;
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook(componentInstance, 'mounted');
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          // vue-router#1212
          // During updates, a kept-alive component's child components may
          // change, so directly walking the tree here may call activated hooks
          // on incorrect children. Instead we push them into a queue which will
          // be processed after the whole patch process ended.
          queueActivatedComponent(componentInstance);
        } else {
          activateChildComponent(componentInstance, true /* direct */);
        }
      }
    },

    destroy: function destroy (vnode) {
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          componentInstance.$destroy();
        } else {
          deactivateChildComponent(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge = Object.keys(componentVNodeHooks);

  function createComponent (
    Ctor,
    data,
    context,
    children,
    tag
  ) {
    if (isUndef(Ctor)) {
      return
    }

    var baseCtor = context.$options._base;

    // plain options object: turn it into a constructor
    if (isObject(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    // if at this stage it's not a constructor or an async component factory,
    // reject.
    if (typeof Ctor !== 'function') {
      return
    }

    // async component
    var asyncFactory;
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
      if (Ctor === undefined) {
        // return a placeholder node for async component, which is rendered
        // as a comment node but preserves all the raw information for the node.
        // the information will be used for async server-rendering and hydration.
        return createAsyncPlaceholder(
          asyncFactory,
          data,
          context,
          children,
          tag
        )
      }
    }

    data = data || {};

    // resolve constructor options in case global mixins are applied after
    // component constructor creation
    resolveConstructorOptions(Ctor);

    // transform component v-model data into props & events
    if (isDef(data.model)) {
      transformModel(Ctor.options, data);
    }

    // extract props
    var propsData = extractPropsFromVNodeData(data, Ctor, tag);

    // functional component
    if (isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children)
    }

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    var listeners = data.on;
    // replace with listeners with .native modifier
    // so it gets processed during parent component patch.
    data.on = data.nativeOn;

    if (isTrue(Ctor.options.abstract)) {
      // abstract components do not keep anything
      // other than props & listeners & slot

      // work around flow
      var slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }

    // install component management hooks onto the placeholder node
    installComponentHooks(data);

    // return a placeholder vnode
    var name = Ctor.options.name || tag;
    var vnode = new VNode(
      ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
      data, undefined, undefined, undefined, context,
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
      asyncFactory
    );

    // Weex specific: invoke recycle-list optimized @render function for
    // extracting cell-slot template.
    // https://github.com/Hanks10100/weex-native-directive/tree/master/component
    /* istanbul ignore if */
    return vnode
  }

  function createComponentInstanceForVnode (
    vnode, // we know it's MountedComponentVNode but flow doesn't
    parent, // activeInstance in lifecycle state
    parentElm,
    refElm
  ) {
    var options = {
      _isComponent: true,
      parent: parent,
      _parentVnode: vnode,
      _parentElm: parentElm || null,
      _refElm: refElm || null
    };
    // check inline-template render functions
    var inlineTemplate = vnode.data.inlineTemplate;
    if (isDef(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options)
  }

  function installComponentHooks (data) {
    var hooks = data.hook || (data.hook = {});
    for (var i = 0; i < hooksToMerge.length; i++) {
      var key = hooksToMerge[i];
      hooks[key] = componentVNodeHooks[key];
    }
  }

  // transform component v-model info (value and callback) into
  // prop and event handler respectively.
  function transformModel (options, data) {
    var prop = (options.model && options.model.prop) || 'value';
    var event = (options.model && options.model.event) || 'input';(data.props || (data.props = {}))[prop] = data.model.value;
    var on = data.on || (data.on = {});
    if (isDef(on[event])) {
      on[event] = [data.model.callback].concat(on[event]);
    } else {
      on[event] = data.model.callback;
    }
  }

  /*  */

  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2;

  // wrapper function for providing a more flexible interface
  // without getting yelled at by flow
  function createElement (
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
  ) {
    if (Array.isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType)
  }

  function _createElement (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef(data) && isDef((data).__ob__)) {
      return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return createEmptyVNode()
    }
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') {
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        // platform built-in elements
        vnode = new VNode(
          config.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // component
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode(
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else {
      // direct component options / constructor
      vnode = createComponent(tag, data, context, children);
    }
    if (Array.isArray(vnode)) {
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); }
      if (isDef(data)) { registerDeepBindings(data); }
      return vnode
    } else {
      return createEmptyVNode()
    }
  }

  function applyNS (vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === 'foreignObject') {
      // use default namespace inside foreignObject
      ns = undefined;
      force = true;
    }
    if (isDef(vnode.children)) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        if (isDef(child.tag) && (
          isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
          applyNS(child, ns, force);
        }
      }
    }
  }

  // ref #5318
  // necessary to ensure parent re-render when deep bindings like :style and
  // :class are used on slot nodes
  function registerDeepBindings (data) {
    if (isObject(data.style)) {
      traverse(data.style);
    }
    if (isObject(data.class)) {
      traverse(data.class);
    }
  }

  /*  */

  function initRender (vm) {
    vm._vnode = null; // the root of the child tree
    vm._staticTrees = null; // v-once cached trees
    var options = vm.$options;
    var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
    var renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolveSlots(options._renderChildren, renderContext);
    vm.$scopedSlots = emptyObject;
    // bind the createElement fn to this instance
    // so that we get proper render context inside it.
    // args order: tag, data, children, normalizationType, alwaysNormalize
    // internal version is used by render functions compiled from templates
    vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

    // $attrs & $listeners are exposed for easier HOC creation.
    // they need to be reactive so that HOCs using them are always updated
    var parentData = parentVnode && parentVnode.data;

    /* istanbul ignore else */
    {
      defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true);
      defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true);
    }
  }

  function renderMixin (Vue) {
    // install runtime convenience helpers
    installRenderHelpers(Vue.prototype);

    Vue.prototype.$nextTick = function (fn) {
      return nextTick(fn, this)
    };

    Vue.prototype._render = function () {
      var vm = this;
      var ref = vm.$options;
      var render = ref.render;
      var _parentVnode = ref._parentVnode;

      if (_parentVnode) {
        vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject;
      }

      // set parent vnode. this allows render functions to have access
      // to the data on the placeholder node.
      vm.$vnode = _parentVnode;
      // render self
      var vnode;
      try {
        vnode = render.call(vm._renderProxy, vm.$createElement);
      } catch (e) {
        handleError(e, vm, "render");
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        {
          vnode = vm._vnode;
        }
      }
      // return empty vnode in case the render function errored out
      if (!(vnode instanceof VNode)) {
        vnode = createEmptyVNode();
      }
      // set parent
      vnode.parent = _parentVnode;
      return vnode
    };
  }

  /*  */

  var uid$3 = 0;

  function initMixin (Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid$3++;

      // a flag to avoid this being observed
      vm._isVue = true;
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options);
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        );
      }
      /* istanbul ignore else */
      {
        vm._renderProxy = vm;
      }
      // expose real self
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm);
      callHook(vm, 'beforeCreate');
      initInjections(vm); // resolve injections before data/props
      initState(vm);
      initProvide(vm); // resolve provide after data/props
      callHook(vm, 'created');

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
  }

  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;
    opts._parentElm = options._parentElm;
    opts._refElm = options._refElm;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  function resolveConstructorOptions (Ctor) {
    var options = Ctor.options;
    if (Ctor.super) {
      var superOptions = resolveConstructorOptions(Ctor.super);
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        // super option changed,
        // need to resolve new options.
        Ctor.superOptions = superOptions;
        // check if there are any late-modified/attached options (#4976)
        var modifiedOptions = resolveModifiedOptions(Ctor);
        // update base extend options
        if (modifiedOptions) {
          extend(Ctor.extendOptions, modifiedOptions);
        }
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
        if (options.name) {
          options.components[options.name] = Ctor;
        }
      }
    }
    return options
  }

  function resolveModifiedOptions (Ctor) {
    var modified;
    var latest = Ctor.options;
    var extended = Ctor.extendOptions;
    var sealed = Ctor.sealedOptions;
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) { modified = {}; }
        modified[key] = dedupe(latest[key], extended[key], sealed[key]);
      }
    }
    return modified
  }

  function dedupe (latest, extended, sealed) {
    // compare latest and sealed to ensure lifecycle hooks won't be duplicated
    // between merges
    if (Array.isArray(latest)) {
      var res = [];
      sealed = Array.isArray(sealed) ? sealed : [sealed];
      extended = Array.isArray(extended) ? extended : [extended];
      for (var i = 0; i < latest.length; i++) {
        // push original options and not sealed options to exclude duplicated options
        if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
          res.push(latest[i]);
        }
      }
      return res
    } else {
      return latest
    }
  }

  function Vue (options) {
    this._init(options);
  }

  initMixin(Vue);
  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  /*  */

  function initUse (Vue) {
    Vue.use = function (plugin) {
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
      if (installedPlugins.indexOf(plugin) > -1) {
        return this
      }

      // additional parameters
      var args = toArray(arguments, 1);
      args.unshift(this);
      if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args);
      } else if (typeof plugin === 'function') {
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin);
      return this
    };
  }

  /*  */

  function initMixin$1 (Vue) {
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this
    };
  }

  /*  */

  function initExtend (Vue) {
    /**
     * Each instance constructor, including Vue, has a unique
     * cid. This enables us to create wrapped "child
     * constructors" for prototypal inheritance and cache them.
     */
    Vue.cid = 0;
    var cid = 1;

    /**
     * Class inheritance
     */
    Vue.extend = function (extendOptions) {
      extendOptions = extendOptions || {};
      var Super = this;
      var SuperId = Super.cid;
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
      if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
      }

      var name = extendOptions.name || Super.options.name;

      var Sub = function VueComponent (options) {
        this._init(options);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions(
        Super.options,
        extendOptions
      );
      Sub['super'] = Super;

      // For props and computed properties, we define the proxy getters on
      // the Vue instances at extension time, on the extended prototype. This
      // avoids Object.defineProperty calls for each instance created.
      if (Sub.options.props) {
        initProps$1(Sub);
      }
      if (Sub.options.computed) {
        initComputed$1(Sub);
      }

      // allow further extension/mixin/plugin usage
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;

      // create asset registers, so extended classes
      // can have their private assets too.
      ASSET_TYPES.forEach(function (type) {
        Sub[type] = Super[type];
      });
      // enable recursive self-lookup
      if (name) {
        Sub.options.components[name] = Sub;
      }

      // keep a reference to the super options at extension time.
      // later at instantiation we can check if Super's options have
      // been updated.
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend({}, Sub.options);

      // cache constructor
      cachedCtors[SuperId] = Sub;
      return Sub
    };
  }

  function initProps$1 (Comp) {
    var props = Comp.options.props;
    for (var key in props) {
      proxy(Comp.prototype, "_props", key);
    }
  }

  function initComputed$1 (Comp) {
    var computed = Comp.options.computed;
    for (var key in computed) {
      defineComputed(Comp.prototype, key, computed[key]);
    }
  }

  /*  */

  function initAssetRegisters (Vue) {
    /**
     * Create asset registration methods.
     */
    ASSET_TYPES.forEach(function (type) {
      Vue[type] = function (
        id,
        definition
      ) {
        if (!definition) {
          return this.options[type + 's'][id]
        } else {
          if (type === 'component' && isPlainObject(definition)) {
            definition.name = definition.name || id;
            definition = this.options._base.extend(definition);
          }
          if (type === 'directive' && typeof definition === 'function') {
            definition = { bind: definition, update: definition };
          }
          this.options[type + 's'][id] = definition;
          return definition
        }
      };
    });
  }

  /*  */

  function getComponentName (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  function matches (pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
      return pattern.test(name)
    }
    /* istanbul ignore next */
    return false
  }

  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _vnode = keepAliveInstance._vnode;
    for (var key in cache) {
      var cachedNode = cache[key];
      if (cachedNode) {
        var name = getComponentName(cachedNode.componentOptions);
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _vnode);
        }
      }
    }
  }

  function pruneCacheEntry (
    cache,
    key,
    keys,
    current
  ) {
    var cached$$1 = cache[key];
    if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
      cached$$1.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
  }

  var patternTypes = [String, RegExp, Array];

  var KeepAlive = {
    name: 'keep-alive',
    abstract: true,

    props: {
      include: patternTypes,
      exclude: patternTypes,
      max: [String, Number]
    },

    created: function created () {
      this.cache = Object.create(null);
      this.keys = [];
    },

    destroyed: function destroyed () {
      var this$1 = this;

      for (var key in this$1.cache) {
        pruneCacheEntry(this$1.cache, key, this$1.keys);
      }
    },

    mounted: function mounted () {
      var this$1 = this;

      this.$watch('include', function (val) {
        pruneCache(this$1, function (name) { return matches(val, name); });
      });
      this.$watch('exclude', function (val) {
        pruneCache(this$1, function (name) { return !matches(val, name); });
      });
    },

    render: function render () {
      var slot = this.$slots.default;
      var vnode = getFirstComponentChild(slot);
      var componentOptions = vnode && vnode.componentOptions;
      if (componentOptions) {
        // check pattern
        var name = getComponentName(componentOptions);
        var ref = this;
        var include = ref.include;
        var exclude = ref.exclude;
        if (
          // not included
          (include && (!name || !matches(include, name))) ||
          // excluded
          (exclude && name && matches(exclude, name))
        ) {
          return vnode
        }

        var ref$1 = this;
        var cache = ref$1.cache;
        var keys = ref$1.keys;
        var key = vnode.key == null
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
        if (cache[key]) {
          vnode.componentInstance = cache[key].componentInstance;
          // make current key freshest
          remove(keys, key);
          keys.push(key);
        } else {
          cache[key] = vnode;
          keys.push(key);
          // prune oldest entry
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode);
          }
        }

        vnode.data.keepAlive = true;
      }
      return vnode || (slot && slot[0])
    }
  };

  var builtInComponents = {
    KeepAlive: KeepAlive
  };

  /*  */

  function initGlobalAPI (Vue) {
    // config
    var configDef = {};
    configDef.get = function () { return config; };
    Object.defineProperty(Vue, 'config', configDef);

    // exposed util methods.
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    Vue.util = {
      warn: warn,
      extend: extend,
      mergeOptions: mergeOptions,
      defineReactive: defineReactive
    };

    Vue.set = set;
    Vue.delete = del;
    Vue.nextTick = nextTick;

    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(function (type) {
      Vue.options[type + 's'] = Object.create(null);
    });

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    Vue.options._base = Vue;

    extend(Vue.options.components, builtInComponents);

    initUse(Vue);
    initMixin$1(Vue);
    initExtend(Vue);
    initAssetRegisters(Vue);
  }

  initGlobalAPI(Vue);

  Object.defineProperty(Vue.prototype, '$isServer', {
    get: isServerRendering
  });

  Object.defineProperty(Vue.prototype, '$ssrContext', {
    get: function get () {
      /* istanbul ignore next */
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  // expose FunctionalRenderContext for ssr runtime helper installation
  Object.defineProperty(Vue, 'FunctionalRenderContext', {
    value: FunctionalRenderContext
  });

  Vue.version = '2.5.17';

  /*  */

  // these are reserved for web because they are directly compiled away
  // during template compilation
  var isReservedAttr = makeMap('style,class');

  // attributes that should be using props for binding
  var acceptValue = makeMap('input,textarea,option,select,progress');
  var mustUseProp = function (tag, type, attr) {
    return (
      (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
      (attr === 'selected' && tag === 'option') ||
      (attr === 'checked' && tag === 'input') ||
      (attr === 'muted' && tag === 'video')
    )
  };

  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

  var isBooleanAttr = makeMap(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,translate,' +
    'truespeed,typemustmatch,visible'
  );

  var xlinkNS = 'http://www.w3.org/1999/xlink';

  var isXlink = function (name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  };

  var getXlinkProp = function (name) {
    return isXlink(name) ? name.slice(6, name.length) : ''
  };

  var isFalsyAttrValue = function (val) {
    return val == null || val === false
  };

  /*  */

  function genClassForVnode (vnode) {
    var data = vnode.data;
    var parentNode = vnode;
    var childNode = vnode;
    while (isDef(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data);
      }
    }
    while (isDef(parentNode = parentNode.parent)) {
      if (parentNode && parentNode.data) {
        data = mergeClassData(data, parentNode.data);
      }
    }
    return renderClass(data.staticClass, data.class)
  }

  function mergeClassData (child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: isDef(child.class)
        ? [child.class, parent.class]
        : parent.class
    }
  }

  function renderClass (
    staticClass,
    dynamicClass
  ) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass))
    }
    /* istanbul ignore next */
    return ''
  }

  function concat (a, b) {
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  function stringifyClass (value) {
    if (Array.isArray(value)) {
      return stringifyArray(value)
    }
    if (isObject(value)) {
      return stringifyObject(value)
    }
    if (typeof value === 'string') {
      return value
    }
    /* istanbul ignore next */
    return ''
  }

  function stringifyArray (value) {
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  function stringifyObject (value) {
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  /*  */

  var namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  var isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  var isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );



  var isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag)
  };

  function getTagNamespace (tag) {
    if (isSVG(tag)) {
      return 'svg'
    }
    // basic support for MathML
    // note it doesn't support other MathML elements being component roots
    if (tag === 'math') {
      return 'math'
    }
  }

  var unknownElementCache = Object.create(null);
  function isUnknownElement (tag) {
    /* istanbul ignore if */
    if (!inBrowser) {
      return true
    }
    if (isReservedTag(tag)) {
      return false
    }
    tag = tag.toLowerCase();
    /* istanbul ignore if */
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag]
    }
    var el = document.createElement(tag);
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return (unknownElementCache[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  var isTextInputType = makeMap('text,number,password,search,email,tel,url');

  /*  */

  /**
   * Query an element selector if it's not an element already.
   */
  function query (el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el);
      if (!selected) {
        return document.createElement('div')
      }
      return selected
    } else {
      return el
    }
  }

  /*  */

  function createElement$1 (tagName, vnode) {
    var elm = document.createElement(tagName);
    if (tagName !== 'select') {
      return elm
    }
    // false or null will remove the attribute but undefined will not
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }

  function createElementNS (namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName)
  }

  function createTextNode (text) {
    return document.createTextNode(text)
  }

  function createComment (text) {
    return document.createComment(text)
  }

  function insertBefore (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild (node, child) {
    node.removeChild(child);
  }

  function appendChild (node, child) {
    node.appendChild(child);
  }

  function parentNode (node) {
    return node.parentNode
  }

  function nextSibling (node) {
    return node.nextSibling
  }

  function tagName (node) {
    return node.tagName
  }

  function setTextContent (node, text) {
    node.textContent = text;
  }

  function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '');
  }


  var nodeOps = Object.freeze({
  	createElement: createElement$1,
  	createElementNS: createElementNS,
  	createTextNode: createTextNode,
  	createComment: createComment,
  	insertBefore: insertBefore,
  	removeChild: removeChild,
  	appendChild: appendChild,
  	parentNode: parentNode,
  	nextSibling: nextSibling,
  	tagName: tagName,
  	setTextContent: setTextContent,
  	setStyleScope: setStyleScope
  });

  /*  */

  var ref = {
    create: function create (_, vnode) {
      registerRef(vnode);
    },
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef(oldVnode, true);
        registerRef(vnode);
      }
    },
    destroy: function destroy (vnode) {
      registerRef(vnode, true);
    }
  };

  function registerRef (vnode, isRemoval) {
    var key = vnode.data.ref;
    if (!isDef(key)) { return }

    var vm = vnode.context;
    var ref = vnode.componentInstance || vnode.elm;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref);
      } else if (refs[key] === ref) {
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) {
        if (!Array.isArray(refs[key])) {
          refs[key] = [ref];
        } else if (refs[key].indexOf(ref) < 0) {
          // $flow-disable-line
          refs[key].push(ref);
        }
      } else {
        refs[key] = ref;
      }
    }
  }

  /**
   * Virtual DOM patching algorithm based on Snabbdom by
   * Simon Friis Vindum (@paldepind)
   * Licensed under the MIT License
   * https://github.com/paldepind/snabbdom/blob/master/LICENSE
   *
   * modified by Evan You (@yyx990803)
   *
   * Not type-checking this because this file is perf-critical and the cost
   * of making flow understand it is not worth it.
   */

  var emptyNode = new VNode('', {}, []);

  var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

  function sameVnode (a, b) {
    return (
      a.key === b.key && (
        (
          a.tag === b.tag &&
          a.isComment === b.isComment &&
          isDef(a.data) === isDef(b.data) &&
          sameInputType(a, b)
        ) || (
          isTrue(a.isAsyncPlaceholder) &&
          a.asyncFactory === b.asyncFactory &&
          isUndef(b.asyncFactory.error)
        )
      )
    )
  }

  function sameInputType (a, b) {
    if (a.tag !== 'input') { return true }
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
  }

  function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) { map[key] = i; }
    }
    return map
  }

  function createPatchFunction (backend) {
    var i, j;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;

    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = [];
      for (j = 0; j < modules.length; ++j) {
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
      }
    }

    function emptyNodeAt (elm) {
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    function createRmCb (childElm, listeners) {
      function remove () {
        if (--remove.listeners === 0) {
          removeNode(childElm);
        }
      }
      remove.listeners = listeners;
      return remove
    }

    function removeNode (el) {
      var parent = nodeOps.parentNode(el);
      // element may have already been removed due to v-html / v-text
      if (isDef(parent)) {
        nodeOps.removeChild(parent, el);
      }
    }

    function createElm (
      vnode,
      insertedVnodeQueue,
      parentElm,
      refElm,
      nested,
      ownerArray,
      index
    ) {
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // This vnode was used in a previous render!
        // now it's used as a new node, overwriting its elm would cause
        // potential patch errors down the road when it's used as an insertion
        // reference node. Instead, we clone the node on-demand before creating
        // associated DOM element for it.
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      vnode.isRootInsert = !nested; // for transition enter check
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return
      }

      var data = vnode.data;
      var children = vnode.children;
      var tag = vnode.tag;
      if (isDef(tag)) {

        vnode.elm = vnode.ns
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        setScope(vnode);

        /* istanbul ignore if */
        {
          createChildren(vnode, children, insertedVnodeQueue);
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm);
        }
      } else if (isTrue(vnode.isComment)) {
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      } else {
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    }

    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data;
      if (isDef(i)) {
        var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
        if (isDef(i = i.hook) && isDef(i = i.init)) {
          i(vnode, false /* hydrating */, parentElm, refElm);
        }
        // after calling the init hook, if the vnode is a child component
        // it should've created a child instance and mounted it. the child
        // component also has set the placeholder vnode's elm.
        // in that case we can just return the element and be done.
        if (isDef(vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          if (isTrue(isReactivated)) {
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
          }
          return true
        }
      }
    }

    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
        vnode.data.pendingInsert = null;
      }
      vnode.elm = vnode.componentInstance.$el;
      if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
        setScope(vnode);
      } else {
        // empty component root.
        // skip all element-related modules except for ref (#3455)
        registerRef(vnode);
        // make sure to invoke the insert hook
        insertedVnodeQueue.push(vnode);
      }
    }

    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      // hack for #4339: a reactivated component with inner transition
      // does not trigger because the inner node's created hooks are not called
      // again. It's not ideal to involve module-specific logic in here but
      // there doesn't seem to be a better way to do it.
      var innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
          for (i = 0; i < cbs.activate.length; ++i) {
            cbs.activate[i](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break
        }
      }
      // unlike a newly created component,
      // a reactivated keep-alive component doesn't insert itself
      insert(parentElm, vnode.elm, refElm);
    }

    function insert (parent, elm, ref$$1) {
      if (isDef(parent)) {
        if (isDef(ref$$1)) {
          if (ref$$1.parentNode === parent) {
            nodeOps.insertBefore(parent, elm, ref$$1);
          }
        } else {
          nodeOps.appendChild(parent, elm);
        }
      }
    }

    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        for (var i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }

    function isPatchable (vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
      }
      return isDef(vnode.tag)
    }

    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
        cbs.create[i$1](emptyNode, vnode);
      }
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (isDef(i.create)) { i.create(emptyNode, vnode); }
        if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
      }
    }

    // set scope id attribute for scoped CSS.
    // this is implemented as a special case to avoid the overhead
    // of going through the normal attribute patching process.
    function setScope (vnode) {
      var i;
      if (isDef(i = vnode.fnScopeId)) {
        nodeOps.setStyleScope(vnode.elm, i);
      } else {
        var ancestor = vnode;
        while (ancestor) {
          if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent;
        }
      }
      // for slot content they should also get the scopeId from the host instance.
      if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef(i = i.$options._scopeId)
      ) {
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }

    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data;
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
        for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
      }
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else { // Text node
            removeNode(ch.elm);
          }
        }
      }
    }

    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) {
        var i;
        var listeners = cbs.remove.length + 1;
        if (isDef(rm)) {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        } else {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        }
        // recursively invoke hooks on child component root node
        if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }

    function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      var oldStartIdx = 0;
      var newStartIdx = 0;
      var oldEndIdx = oldCh.length - 1;
      var oldStartVnode = oldCh[0];
      var oldEndVnode = oldCh[oldEndIdx];
      var newEndIdx = newCh.length - 1;
      var newStartVnode = newCh[0];
      var newEndVnode = newCh[newEndIdx];
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      // removeOnly is a special flag used only by <transition-group>
      // to ensure removed elements stay in correct relative positions
      // during leaving transitions
      var canMove = !removeOnly;

      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        } else if (isUndef(oldEndVnode)) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld)) { // New element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else {
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) {
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue);
              oldCh[idxInOld] = undefined;
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              // same key but different element. treat as new element
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }

    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef(c) && sameVnode(node, c)) { return i }
      }
    }

    function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
      if (oldVnode === vnode) {
        return
      }

      var elm = vnode.elm = oldVnode.elm;

      if (isTrue(oldVnode.isAsyncPlaceholder)) {
        if (isDef(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return
      }

      // reuse element for static trees.
      // note we only do this if the vnode is cloned -
      // if the new node is not cloned it means the render functions have been
      // reset by the hot-reload-api and we need to do a proper re-render.
      if (isTrue(vnode.isStatic) &&
        isTrue(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
      ) {
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
        i(oldVnode, vnode);
      }

      var oldCh = oldVnode.children;
      var ch = vnode.children;
      if (isDef(data) && isPatchable(vnode)) {
        for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
        if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
      }
      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
        } else if (isDef(ch)) {
          if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          removeVnodes(elm, oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }
      } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
      }
    }

    function invokeInsertHook (vnode, queue, initial) {
      // delay insert hooks for component root nodes, invoke them after the
      // element is really inserted
      if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
      } else {
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }
    // list of modules that can skip create hook during hydration because they
    // are already rendered on the client or has no need for initialization
    // Note: style is excluded because it relies on initial clone for future
    // deep updates (#7063).
    var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

    // Note: this is a browser-only function so we can assume elms are DOM nodes.
    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;
      inVPre = inVPre || (data && data.pre);
      vnode.elm = elm;

      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
        if (isDef(i = vnode.componentInstance)) {
          // child component. it should have hydrated its own tree.
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          // empty element, allow client to pick up and populate children
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            // v-html and domProps: innerHTML
            if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
              if (i !== elm.innerHTML) {
                return false
              }
            } else {
              // iterate and compare children lists
              var childrenMatch = true;
              var childNode = elm.firstChild;
              for (var i$1 = 0; i$1 < children.length; i$1++) {
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break
                }
                childNode = childNode.nextSibling;
              }
              // if childNode is not null, it means the actual childNodes list is
              // longer than the virtual children list.
              if (!childrenMatch || childNode) {
                return false
              }
            }
          }
        }
        if (isDef(data)) {
          var fullInvoke = false;
          for (var key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) {
            // ensure collecting deps for deep class bindings for future updates
            traverse(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true
    }

    return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
      if (isUndef(vnode)) {
        if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
        return
      }

      var isInitialPatch = false;
      var insertedVnodeQueue = [];

      if (isUndef(oldVnode)) {
        // empty mount (likely as component), create new root element
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue, parentElm, refElm);
      } else {
        var isRealElement = isDef(oldVnode.nodeType);
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          // patch existing root node
          patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
        } else {
          if (isRealElement) {
            // mounting to a real element
            // check if this is server-rendered content and if we can perform
            // a successful hydration.
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR);
              hydrating = true;
            }
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              }
            }
            // either not server-rendered, or hydration failed.
            // create an empty node and replace it
            oldVnode = emptyNodeAt(oldVnode);
          }

          // replacing existing element
          var oldElm = oldVnode.elm;
          var parentElm$1 = nodeOps.parentNode(oldElm);

          // create new node
          createElm(
            vnode,
            insertedVnodeQueue,
            // extremely rare edge case: do not insert if old element is in a
            // leaving transition. Only happens when combining transition +
            // keep-alive + HOCs. (#4590)
            oldElm._leaveCb ? null : parentElm$1,
            nodeOps.nextSibling(oldElm)
          );

          // update parent placeholder node element, recursively
          if (isDef(vnode.parent)) {
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, ancestor);
                }
                // #6513
                // invoke insert hooks that may have been merged by create hooks.
                // e.g. for directives that uses the "inserted" hook.
                var insert = ancestor.data.hook.insert;
                if (insert.merged) {
                  // start at index 1 to avoid re-invoking component mounted hook
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else {
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }

          // destroy old node
          if (isDef(parentElm$1)) {
            removeVnodes(parentElm$1, [oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
      return vnode.elm
    }
  }

  /*  */

  var directives = {
    create: updateDirectives,
    update: updateDirectives,
    destroy: function unbindDirectives (vnode) {
      updateDirectives(vnode, emptyNode);
    }
  };

  function updateDirectives (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update(oldVnode, vnode);
    }
  }

  function _update (oldVnode, vnode) {
    var isCreate = oldVnode === emptyNode;
    var isDestroy = vnode === emptyNode;
    var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = [];
    var dirsWithPostpatch = [];

    var key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        // new directive, bind
        callHook$1(dir, 'bind', vnode, oldVnode);
        if (dir.def && dir.def.inserted) {
          dirsWithInsert.push(dir);
        }
      } else {
        // existing directive, update
        dir.oldValue = oldDir.value;
        callHook$1(dir, 'update', vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) {
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
        }
      };
      if (isCreate) {
        mergeVNodeHook(vnode, 'insert', callInsert);
      } else {
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) {
      mergeVNodeHook(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
        }
      });
    }

    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          // no longer present, unbind
          callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }

  var emptyModifiers = Object.create(null);

  function normalizeDirectives$1 (
    dirs,
    vm
  ) {
    var res = Object.create(null);
    if (!dirs) {
      // $flow-disable-line
      return res
    }
    var i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        // $flow-disable-line
        dir.modifiers = emptyModifiers;
      }
      res[getRawDirName(dir)] = dir;
      dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
    }
    // $flow-disable-line
    return res
  }

  function getRawDirName (dir) {
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
      }
    }
  }

  var baseModules = [
    ref,
    directives
  ];

  /*  */

  function updateAttrs (oldVnode, vnode) {
    var opts = vnode.componentOptions;
    if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
      return
    }
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
      return
    }
    var key, cur, old;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend({}, attrs);
    }

    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur);
      }
    }
    // #4391: in IE9, setting type can reset value for input[type=radio]
    // #6666: IE/Edge forces progress value down to 1 before setting a max
    /* istanbul ignore if */
    if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
      setAttr(elm, 'value', attrs.value);
    }
    for (key in oldAttrs) {
      if (isUndef(attrs[key])) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  function setAttr (el, key, value) {
    if (el.tagName.indexOf('-') > -1) {
      baseSetAttr(el, key, value);
    } else if (isBooleanAttr(key)) {
      // set attribute for blank value
      // e.g. <option disabled>Select one</option>
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        // technically allowfullscreen is a boolean attribute for <iframe>,
        // but Flash expects a value of "true" when used on <embed> tag
        value = key === 'allowfullscreen' && el.tagName === 'EMBED'
          ? 'true'
          : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      baseSetAttr(el, key, value);
    }
  }

  function baseSetAttr (el, key, value) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // #7138: IE10 & 11 fires input event when setting placeholder on
      // <textarea>... block the first input event and remove the blocker
      // immediately.
      /* istanbul ignore if */
      if (
        isIE && !isIE9 &&
        el.tagName === 'TEXTAREA' &&
        key === 'placeholder' && !el.__ieph
      ) {
        var blocker = function (e) {
          e.stopImmediatePropagation();
          el.removeEventListener('input', blocker);
        };
        el.addEventListener('input', blocker);
        // $flow-disable-line
        el.__ieph = true; /* IE placeholder patched */
      }
      el.setAttribute(key, value);
    }
  }

  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };

  /*  */

  function updateClass (oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    var oldData = oldVnode.data;
    if (
      isUndef(data.staticClass) &&
      isUndef(data.class) && (
        isUndef(oldData) || (
          isUndef(oldData.staticClass) &&
          isUndef(oldData.class)
        )
      )
    ) {
      return
    }

    var cls = genClassForVnode(vnode);

    // handle transition classes
    var transitionClass = el._transitionClasses;
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass));
    }

    // set the class
    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = {
    create: updateClass,
    update: updateClass
  };

  /*  */

  /*  */









  // add a raw attr (use this in preTransforms)








  // note: this only removes the attr from the Array (attrsList) so that it
  // doesn't get processed by processAttrs.
  // By default it does NOT remove it from the map (attrsMap) because the map is
  // needed during codegen.

  /*  */

  /**
   * Cross-platform code generation for component v-model
   */


  /**
   * Cross-platform codegen helper for generating v-model value assignment code.
   */

  /*  */

  // in some cases, the event used has to be determined at runtime
  // so we used some reserved tokens during compile.
  var RANGE_TOKEN = '__r';
  var CHECKBOX_RADIO_TOKEN = '__c';

  /*  */

  // normalize v-model event tokens that can only be determined at runtime.
  // it's important to place the event as the first in the array because
  // the whole point is ensuring the v-model callback gets called before
  // user-attached handlers.
  function normalizeEvents (on) {
    /* istanbul ignore if */
    if (isDef(on[RANGE_TOKEN])) {
      // IE input[type=range] only supports `change` event
      var event = isIE ? 'change' : 'input';
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
      delete on[RANGE_TOKEN];
    }
    // This was originally intended to fix #4521 but no longer necessary
    // after 2.5. Keeping it for backwards compat with generated code from < 2.4
    /* istanbul ignore if */
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN];
    }
  }

  var target$1;

  function createOnceHandler (handler, event, capture) {
    var _target = target$1; // save current target element in closure
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, onceHandler, capture, _target);
      }
    }
  }

  function add$1 (
    event,
    handler,
    once$$1,
    capture,
    passive
  ) {
    handler = withMacroTask(handler);
    if (once$$1) { handler = createOnceHandler(handler, event, capture); }
    target$1.addEventListener(
      event,
      handler,
      supportsPassive
        ? { capture: capture, passive: passive }
        : capture
    );
  }

  function remove$2 (
    event,
    handler,
    capture,
    _target
  ) {
    (_target || target$1).removeEventListener(
      event,
      handler._withTask || handler,
      capture
    );
  }

  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
      return
    }
    var on = vnode.data.on || {};
    var oldOn = oldVnode.data.on || {};
    target$1 = vnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add$1, remove$2, vnode.context);
    target$1 = undefined;
  }

  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };

  /*  */

  function updateDOMProps (oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
      return
    }
    var key, cur;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.domProps || {};
    var props = vnode.data.domProps || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(props.__ob__)) {
      props = vnode.data.domProps = extend({}, props);
    }

    for (key in oldProps) {
      if (isUndef(props[key])) {
        elm[key] = '';
      }
    }
    for (key in props) {
      cur = props[key];
      // ignore children if the node has textContent or innerHTML,
      // as these will throw away existing DOM nodes and cause removal errors
      // on subsequent patches (#3360)
      if (key === 'textContent' || key === 'innerHTML') {
        if (vnode.children) { vnode.children.length = 0; }
        if (cur === oldProps[key]) { continue }
        // #6601 work around Chrome version <= 55 bug where single textNode
        // replaced by innerHTML/textContent retains its parentNode property
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value') {
        // store value as _value as well since
        // non-string values will be stringified
        elm._value = cur;
        // avoid resetting cursor position when value is the same
        var strCur = isUndef(cur) ? '' : String(cur);
        if (shouldUpdateValue(elm, strCur)) {
          elm.value = strCur;
        }
      } else {
        elm[key] = cur;
      }
    }
  }

  // check platforms/web/util/attrs.js acceptValue


  function shouldUpdateValue (elm, checkVal) {
    return (!elm.composing && (
      elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal)
    ))
  }

  function isNotInFocusAndDirty (elm, checkVal) {
    // return true when textbox (.number and .trim) loses focus and its value is
    // not equal to the updated value
    var notInFocus = true;
    // #6157
    // work around IE bug when accessing document.activeElement in an iframe
    try { notInFocus = document.activeElement !== elm; } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  function isDirtyWithModifiers (elm, newVal) {
    var value = elm.value;
    var modifiers = elm._vModifiers; // injected by v-model runtime
    if (isDef(modifiers)) {
      if (modifiers.lazy) {
        // inputs with lazy should only be updated when not in focus
        return false
      }
      if (modifiers.number) {
        return toNumber(value) !== toNumber(newVal)
      }
      if (modifiers.trim) {
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal
  }

  var domProps = {
    create: updateDOMProps,
    update: updateDOMProps
  };

  /*  */

  var parseStyleText = cached(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
  });

  // merge static and dynamic style data on the same vnode
  function normalizeStyleData (data) {
    var style = normalizeStyleBinding(data.style);
    // static style is pre-processed into an object during compilation
    // and is always a fresh object, so it's safe to merge into it
    return data.staticStyle
      ? extend(data.staticStyle, style)
      : style
  }

  // normalize possible array / string values into Object
  function normalizeStyleBinding (bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject(bindingStyle)
    }
    if (typeof bindingStyle === 'string') {
      return parseStyleText(bindingStyle)
    }
    return bindingStyle
  }

  /**
   * parent component style should be after child's
   * so that parent component's style could override it
   */
  function getStyle (vnode, checkChild) {
    var res = {};
    var styleData;

    if (checkChild) {
      var childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData(childNode.data))
        ) {
          extend(res, styleData);
        }
      }
    }

    if ((styleData = normalizeStyleData(vnode.data))) {
      extend(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) {
      if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
        extend(res, styleData);
      }
    }
    return res
  }

  /*  */

  var cssVarRE = /^--/;
  var importantRE = /\s*!important$/;
  var setProp = function (el, name, val) {
    /* istanbul ignore if */
    if (cssVarRE.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE.test(val)) {
      el.style.setProperty(name, val.replace(importantRE, ''), 'important');
    } else {
      var normalizedName = normalize(name);
      if (Array.isArray(val)) {
        // Support values array created by autoprefixer, e.g.
        // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
        // Set them one by one, and the browser will only set those it can recognize
        for (var i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  var vendorNames = ['Webkit', 'Moz', 'ms'];

  var emptyStyle;
  var normalize = cached(function (prop) {
    emptyStyle = emptyStyle || document.createElement('div').style;
    prop = camelize(prop);
    if (prop !== 'filter' && (prop in emptyStyle)) {
      return prop
    }
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < vendorNames.length; i++) {
      var name = vendorNames[i] + capName;
      if (name in emptyStyle) {
        return name
      }
    }
  });

  function updateStyle (oldVnode, vnode) {
    var data = vnode.data;
    var oldData = oldVnode.data;

    if (isUndef(data.staticStyle) && isUndef(data.style) &&
      isUndef(oldData.staticStyle) && isUndef(oldData.style)
    ) {
      return
    }

    var cur, name;
    var el = vnode.elm;
    var oldStaticStyle = oldData.staticStyle;
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

    // if static style exists, stylebinding already merged into it when doing normalizeStyleData
    var oldStyle = oldStaticStyle || oldStyleBinding;

    var style = normalizeStyleBinding(vnode.data.style) || {};

    // store normalized style under a different key for next diff
    // make sure to clone it if it's reactive, since the user likely wants
    // to mutate it.
    vnode.data.normalizedStyle = isDef(style.__ob__)
      ? extend({}, style)
      : style;

    var newStyle = getStyle(vnode, true);

    for (name in oldStyle) {
      if (isUndef(newStyle[name])) {
        setProp(el, name, '');
      }
    }
    for (name in newStyle) {
      cur = newStyle[name];
      if (cur !== oldStyle[name]) {
        // ie9 setting to null has no effect, must use empty string
        setProp(el, name, cur == null ? '' : cur);
      }
    }
  }

  var style = {
    create: updateStyle,
    update: updateStyle
  };

  /*  */

  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function addClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
      } else {
        el.classList.add(cls);
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  /**
   * Remove class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function removeClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
      } else {
        el.classList.remove(cls);
      }
      if (!el.classList.length) {
        el.removeAttribute('class');
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute('class', cur);
      } else {
        el.removeAttribute('class');
      }
    }
  }

  /*  */

  function resolveTransition (def) {
    if (!def) {
      return
    }
    /* istanbul ignore else */
    if (typeof def === 'object') {
      var res = {};
      if (def.css !== false) {
        extend(res, autoCssTransition(def.name || 'v'));
      }
      extend(res, def);
      return res
    } else if (typeof def === 'string') {
      return autoCssTransition(def)
    }
  }

  var autoCssTransition = cached(function (name) {
    return {
      enterClass: (name + "-enter"),
      enterToClass: (name + "-enter-to"),
      enterActiveClass: (name + "-enter-active"),
      leaveClass: (name + "-leave"),
      leaveToClass: (name + "-leave-to"),
      leaveActiveClass: (name + "-leave-active")
    }
  });

  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';

  // Transition property/event sniffing
  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';
  if (hasTransition) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  // binding to window is necessary to make hot reload work in IE in strict mode
  var raf = inBrowser
    ? window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout
    : /* istanbul ignore next */ function (fn) { return fn(); };

  function nextFrame (fn) {
    raf(function () {
      raf(fn);
    });
  }

  function addTransitionClass (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass(el, cls);
    }
  }

  function removeTransitionClass (el, cls) {
    if (el._transitionClasses) {
      remove(el._transitionClasses, cls);
    }
    removeClass(el, cls);
  }

  function whenTransitionEnds (
    el,
    expectedType,
    cb
  ) {
    var ref = getTransitionInfo(el, expectedType);
    var type = ref.type;
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    if (!type) { return cb() }
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;
    var end = function () {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) {
      if (e.target === el) {
        if (++ended >= propCount) {
          end();
        }
      }
    };
    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }

  var transformRE = /\b(transform|all)(,|$)/;

  function getTransitionInfo (el, expectedType) {
    var styles = window.getComputedStyle(el);
    var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
    var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    var animationDelays = styles[animationProp + 'Delay'].split(', ');
    var animationDurations = styles[animationProp + 'Duration'].split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);

    var type;
    var timeout = 0;
    var propCount = 0;
    /* istanbul ignore if */
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION
          : ANIMATION
        : null;
      propCount = type
        ? type === TRANSITION
          ? transitionDurations.length
          : animationDurations.length
        : 0;
    }
    var hasTransform =
      type === TRANSITION &&
      transformRE.test(styles[transitionProp + 'Property']);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    }
  }

  function getTimeout (delays, durations) {
    /* istanbul ignore next */
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i])
    }))
  }

  function toMs (s) {
    return Number(s.slice(0, -1)) * 1000
  }

  /*  */

  function enter (vnode, toggleDisplay) {
    var el = vnode.elm;

    // call leave callback now
    if (isDef(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data)) {
      return
    }

    /* istanbul ignore if */
    if (isDef(el._enterCb) || el.nodeType !== 1) {
      return
    }

    var css = data.css;
    var type = data.type;
    var enterClass = data.enterClass;
    var enterToClass = data.enterToClass;
    var enterActiveClass = data.enterActiveClass;
    var appearClass = data.appearClass;
    var appearToClass = data.appearToClass;
    var appearActiveClass = data.appearActiveClass;
    var beforeEnter = data.beforeEnter;
    var enter = data.enter;
    var afterEnter = data.afterEnter;
    var enterCancelled = data.enterCancelled;
    var beforeAppear = data.beforeAppear;
    var appear = data.appear;
    var afterAppear = data.afterAppear;
    var appearCancelled = data.appearCancelled;
    var duration = data.duration;

    // activeInstance will always be the <transition> component managing this
    // transition. One edge case to check is when the <transition> is placed
    // as the root node of a child component. In that case we need to check
    // <transition>'s parent for appear check.
    var context = activeInstance;
    var transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) {
      transitionNode = transitionNode.parent;
      context = transitionNode.context;
    }

    var isAppear = !context._isMounted || !vnode.isRootInsert;

    if (isAppear && !appear && appear !== '') {
      return
    }

    var startClass = isAppear && appearClass
      ? appearClass
      : enterClass;
    var activeClass = isAppear && appearActiveClass
      ? appearActiveClass
      : enterActiveClass;
    var toClass = isAppear && appearToClass
      ? appearToClass
      : enterToClass;

    var beforeEnterHook = isAppear
      ? (beforeAppear || beforeEnter)
      : beforeEnter;
    var enterHook = isAppear
      ? (typeof appear === 'function' ? appear : enter)
      : enter;
    var afterEnterHook = isAppear
      ? (afterAppear || afterEnter)
      : afterEnter;
    var enterCancelledHook = isAppear
      ? (appearCancelled || enterCancelled)
      : enterCancelled;

    var explicitEnterDuration = toNumber(
      isObject(duration)
        ? duration.enter
        : duration
    );

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(enterHook);

    var cb = el._enterCb = once(function () {
      if (expectsCSS) {
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });

    if (!vnode.data.show) {
      // remove pending leave element on enter by injecting an insert hook
      mergeVNodeHook(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }

    // start enter transition
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      addTransitionClass(el, activeClass);
      nextFrame(function () {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitEnterDuration)) {
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }

    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  function leave (vnode, rm) {
    var el = vnode.elm;

    // call enter callback now
    if (isDef(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data) || el.nodeType !== 1) {
      return rm()
    }

    /* istanbul ignore if */
    if (isDef(el._leaveCb)) {
      return
    }

    var css = data.css;
    var type = data.type;
    var leaveClass = data.leaveClass;
    var leaveToClass = data.leaveToClass;
    var leaveActiveClass = data.leaveActiveClass;
    var beforeLeave = data.beforeLeave;
    var leave = data.leave;
    var afterLeave = data.afterLeave;
    var leaveCancelled = data.leaveCancelled;
    var delayLeave = data.delayLeave;
    var duration = data.duration;

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(leave);

    var explicitLeaveDuration = toNumber(
      isObject(duration)
        ? duration.leave
        : duration
    );

    var cb = el._leaveCb = once(function () {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave () {
      // the delayed leave may have already been cancelled
      if (cb.cancelled) {
        return
      }
      // record leaving element
      if (!vnode.data.show) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        addTransitionClass(el, leaveActiveClass);
        nextFrame(function () {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
      leave && leave(el, cb);
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }

  function isValidDuration (val) {
    return typeof val === 'number' && !isNaN(val)
  }

  /**
   * Normalize a transition hook's argument length. The hook may be:
   * - a merged hook (invoker) with the original in .fns
   * - a wrapped component method (check ._length)
   * - a plain function (.length)
   */
  function getHookArgumentsLength (fn) {
    if (isUndef(fn)) {
      return false
    }
    var invokerFns = fn.fns;
    if (isDef(invokerFns)) {
      // invoker
      return getHookArgumentsLength(
        Array.isArray(invokerFns)
          ? invokerFns[0]
          : invokerFns
      )
    } else {
      return (fn._length || fn.length) > 1
    }
  }

  function _enter (_, vnode) {
    if (vnode.data.show !== true) {
      enter(vnode);
    }
  }

  var transition = inBrowser ? {
    create: _enter,
    activate: _enter,
    remove: function remove$$1 (vnode, rm) {
      /* istanbul ignore else */
      if (vnode.data.show !== true) {
        leave(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};

  var platformModules = [
    attrs,
    klass,
    events,
    domProps,
    style,
    transition
  ];

  /*  */

  // the directive module should be applied last, after all
  // built-in modules have been applied.
  var modules = platformModules.concat(baseModules);

  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

  /**
   * Not type checking this file because flow doesn't like attaching
   * properties to Elements.
   */

  /* istanbul ignore if */
  if (isIE9) {
    // http://www.matts411.com/post/internet-explorer-9-oninput/
    document.addEventListener('selectionchange', function () {
      var el = document.activeElement;
      if (el && el.vmodel) {
        trigger(el, 'input');
      }
    });
  }

  var directive = {
    inserted: function inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') {
        // #6903
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook(vnode, 'postpatch', function () {
            directive.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected(el, binding, vnode.context);
        }
        el._vOptions = [].map.call(el.options, getValue);
      } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
        el._vModifiers = binding.modifiers;
        if (!binding.modifiers.lazy) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
          // Safari < 10.2 & UIWebView doesn't fire compositionend when
          // switching focus before confirming composition choice
          // this also fixes the issue where some browsers e.g. iOS Chrome
          // fires "change" instead of "input" on autocomplete.
          el.addEventListener('change', onCompositionEnd);
          /* istanbul ignore if */
          if (isIE9) {
            el.vmodel = true;
          }
        }
      }
    },

    componentUpdated: function componentUpdated (el, binding, vnode) {
      if (vnode.tag === 'select') {
        setSelected(el, binding, vnode.context);
        // in case the options rendered by v-for have changed,
        // it's possible that the value is out-of-sync with the rendered options.
        // detect such cases and filter out values that no longer has a matching
        // option in the DOM.
        var prevOptions = el._vOptions;
        var curOptions = el._vOptions = [].map.call(el.options, getValue);
        if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
          // trigger change event if
          // no matching option found for at least one value
          var needReset = el.multiple
            ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
            : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            trigger(el, 'change');
          }
        }
      }
    }
  };

  function setSelected (el, binding, vm) {
    actuallySetSelected(el, binding, vm);
    /* istanbul ignore if */
    if (isIE || isEdge) {
      setTimeout(function () {
        actuallySetSelected(el, binding, vm);
      }, 0);
    }
  }

  function actuallySetSelected (el, binding, vm) {
    var value = binding.value;
    var isMultiple = el.multiple;
    if (isMultiple && !Array.isArray(value)) {
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        selected = looseIndexOf(value, getValue(option)) > -1;
        if (option.selected !== selected) {
          option.selected = selected;
        }
      } else {
        if (looseEqual(getValue(option), value)) {
          if (el.selectedIndex !== i) {
            el.selectedIndex = i;
          }
          return
        }
      }
    }
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
  }

  function hasNoMatchingOption (value, options) {
    return options.every(function (o) { return !looseEqual(o, value); })
  }

  function getValue (option) {
    return '_value' in option
      ? option._value
      : option.value
  }

  function onCompositionStart (e) {
    e.target.composing = true;
  }

  function onCompositionEnd (e) {
    // prevent triggering an input event for no reason
    if (!e.target.composing) { return }
    e.target.composing = false;
    trigger(e.target, 'input');
  }

  function trigger (el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  /*  */

  // recursively search for possible transition defined inside the component root
  function locateNode (vnode) {
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
      ? locateNode(vnode.componentInstance._vnode)
      : vnode
  }

  var show = {
    bind: function bind (el, ref, vnode) {
      var value = ref.value;

      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      var originalDisplay = el.__vOriginalDisplay =
        el.style.display === 'none' ? '' : el.style.display;
      if (value && transition$$1) {
        vnode.data.show = true;
        enter(vnode, function () {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : 'none';
      }
    },

    update: function update (el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      /* istanbul ignore if */
      if (!value === !oldValue) { return }
      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      if (transition$$1) {
        vnode.data.show = true;
        if (value) {
          enter(vnode, function () {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          leave(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
      }
    },

    unbind: function unbind (
      el,
      binding,
      vnode,
      oldVnode,
      isDestroy
    ) {
      if (!isDestroy) {
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };

  var platformDirectives = {
    model: directive,
    show: show
  };

  /*  */

  // Provides transition support for a single element/component.
  // supports transition mode (out-in / in-out)

  var transitionProps = {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object]
  };

  // in case the child is also an abstract component, e.g. <keep-alive>
  // we want to recursively retrieve the real component to be rendered
  function getRealChild (vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children))
    } else {
      return vnode
    }
  }

  function extractTransitionData (comp) {
    var data = {};
    var options = comp.$options;
    // props
    for (var key in options.propsData) {
      data[key] = comp[key];
    }
    // events.
    // extract listeners and pass them directly to the transition methods
    var listeners = options._parentListeners;
    for (var key$1 in listeners) {
      data[camelize(key$1)] = listeners[key$1];
    }
    return data
  }

  function placeholder (h, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h('keep-alive', {
        props: rawChild.componentOptions.propsData
      })
    }
  }

  function hasParentTransition (vnode) {
    while ((vnode = vnode.parent)) {
      if (vnode.data.transition) {
        return true
      }
    }
  }

  function isSameChild (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  var Transition = {
    name: 'transition',
    props: transitionProps,
    abstract: true,

    render: function render (h) {
      var this$1 = this;

      var children = this.$slots.default;
      if (!children) {
        return
      }

      // filter out text nodes (possible whitespaces)
      children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
      /* istanbul ignore if */
      if (!children.length) {
        return
      }

      var mode = this.mode;

      var rawChild = children[0];

      // if this is a component root node and the component's
      // parent container node also has transition, skip.
      if (hasParentTransition(this.$vnode)) {
        return rawChild
      }

      // apply transition data to child
      // use getRealChild() to ignore abstract components e.g. keep-alive
      var child = getRealChild(rawChild);
      /* istanbul ignore if */
      if (!child) {
        return rawChild
      }

      if (this._leaving) {
        return placeholder(h, rawChild)
      }

      // ensure a key that is unique to the vnode type and to this transition
      // component instance. This key will be used to remove pending leaving nodes
      // during entering.
      var id = "__transition-" + (this._uid) + "-";
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
      var oldRawChild = this._vnode;
      var oldChild = getRealChild(oldRawChild);

      // mark v-show
      // so that the transition module can hand over the control to the directive
      if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
        child.data.show = true;
      }

      if (
        oldChild &&
        oldChild.data &&
        !isSameChild(child, oldChild) &&
        !isAsyncPlaceholder(oldChild) &&
        // #6687 component root is a comment node
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) {
        // replace old child transition data with fresh one
        // important for dynamic transitions!
        var oldData = oldChild.data.transition = extend({}, data);
        // handle transition mode
        if (mode === 'out-in') {
          // return placeholder node and queue update when leave finishes
          this._leaving = true;
          mergeVNodeHook(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            this$1.$forceUpdate();
          });
          return placeholder(h, rawChild)
        } else if (mode === 'in-out') {
          if (isAsyncPlaceholder(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);
          mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
        }
      }

      return rawChild
    }
  };

  /*  */

  // Provides transition support for list items.
  // supports move transitions using the FLIP technique.

  // Because the vdom's children update algorithm is "unstable" - i.e.
  // it doesn't guarantee the relative positioning of removed elements,
  // we force transition-group to update its children into two passes:
  // in the first pass, we remove all nodes that need to be removed,
  // triggering their leaving transition; in the second pass, we insert/move
  // into the final desired state. This way in the second pass removed
  // nodes will remain where they should be.

  var props = extend({
    tag: String,
    moveClass: String
  }, transitionProps);

  delete props.mode;

  var TransitionGroup = {
    props: props,

    render: function render (h) {
      var tag = this.tag || this.$vnode.data.tag || 'span';
      var map = Object.create(null);
      var prevChildren = this.prevChildren = this.children;
      var rawChildren = this.$slots.default || [];
      var children = this.children = [];
      var transitionData = extractTransitionData(this);

      for (var i = 0; i < rawChildren.length; i++) {
        var c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            children.push(c);
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData;
          }
        }
      }

      if (prevChildren) {
        var kept = [];
        var removed = [];
        for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
          var c$1 = prevChildren[i$1];
          c$1.data.transition = transitionData;
          c$1.data.pos = c$1.elm.getBoundingClientRect();
          if (map[c$1.key]) {
            kept.push(c$1);
          } else {
            removed.push(c$1);
          }
        }
        this.kept = h(tag, null, kept);
        this.removed = removed;
      }

      return h(tag, null, children)
    },

    beforeUpdate: function beforeUpdate () {
      // force removing pass
      this.__patch__(
        this._vnode,
        this.kept,
        false, // hydrating
        true // removeOnly (!important, avoids unnecessary moves)
      );
      this._vnode = this.kept;
    },

    updated: function updated () {
      var children = this.prevChildren;
      var moveClass = this.moveClass || ((this.name || 'v') + '-move');
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return
      }

      // we divide the work into three loops to avoid mixing DOM reads and writes
      // in each iteration - which helps prevent layout thrashing.
      children.forEach(callPendingCbs);
      children.forEach(recordPosition);
      children.forEach(applyTranslation);

      // force reflow to put everything in position
      // assign to this to avoid being removed in tree-shaking
      // $flow-disable-line
      this._reflow = document.body.offsetHeight;

      children.forEach(function (c) {
        if (c.data.moved) {
          var el = c.elm;
          var s = el.style;
          addTransitionClass(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              removeTransitionClass(el, moveClass);
            }
          });
        }
      });
    },

    methods: {
      hasMove: function hasMove (el, moveClass) {
        /* istanbul ignore if */
        if (!hasTransition) {
          return false
        }
        /* istanbul ignore if */
        if (this._hasMove) {
          return this._hasMove
        }
        // Detect whether an element with the move class applied has
        // CSS transitions. Since the element may be inside an entering
        // transition at this very moment, we make a clone of it and remove
        // all other transition classes applied to ensure only the move class
        // is applied.
        var clone = el.cloneNode();
        if (el._transitionClasses) {
          el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
        }
        addClass(clone, moveClass);
        clone.style.display = 'none';
        this.$el.appendChild(clone);
        var info = getTransitionInfo(clone);
        this.$el.removeChild(clone);
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  function callPendingCbs (c) {
    /* istanbul ignore if */
    if (c.elm._moveCb) {
      c.elm._moveCb();
    }
    /* istanbul ignore if */
    if (c.elm._enterCb) {
      c.elm._enterCb();
    }
  }

  function recordPosition (c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  function applyTranslation (c) {
    var oldPos = c.data.pos;
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left;
    var dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.data.moved = true;
      var s = c.elm.style;
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s';
    }
  }

  var platformComponents = {
    Transition: Transition,
    TransitionGroup: TransitionGroup
  };

  /*  */

  // install platform specific utils
  Vue.config.mustUseProp = mustUseProp;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.isReservedAttr = isReservedAttr;
  Vue.config.getTagNamespace = getTagNamespace;
  Vue.config.isUnknownElement = isUnknownElement;

  // install platform runtime directives & components
  extend(Vue.options.directives, platformDirectives);
  extend(Vue.options.components, platformComponents);

  // install platform patch function
  Vue.prototype.__patch__ = inBrowser ? patch : noop;

  // public mount method
  Vue.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating)
  };

  // devtools global hook
  /* istanbul ignore next */
  if (inBrowser) {
    setTimeout(function () {
      if (config.devtools) {
        if (devtools) {
          devtools.emit('init', Vue);
        }
      }
    }, 0);
  }

  var STORAGE_KEY_PREFIX = 'webcg-devtools';

  function getStorageItem (name, defaultValue) {
    try {
      var result = window.localStorage.getItem(STORAGE_KEY_PREFIX + '.' + name);
      return result !== null ? JSON.parse(result) : defaultValue
    } catch (err) {
      return defaultValue
    }
  }

  function setStorageItem (name, value) {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + '.' + name, JSON.stringify(value));
  }

  var storage = {
    get: getStorageItem,
    set: setStorageItem
  };

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script = {
    name: 'tab-settings',
    props: ['value'],
    data: function data () {
      return {
        localValue: JSON.parse(JSON.stringify(this.value))
      }
    },
    watch: {
      localValue: {
        handler: function (val) {
          this.$emit('input', JSON.parse(JSON.stringify(val)));
        },
        deep: true
      }
    }
  };

  /* script */
              var __vue_script__ = script;
              
  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { staticClass: "modal-body" }, [
      _c("div", { staticClass: "row" }, [
        _c("div", { staticClass: "col-xs-12 col-sm-6" }, [
          _c("h3", [_vm._v("DevTools")]),
          _vm._v(" "),
          _c("div", { staticClass: "form-group" }, [
            _c("div", { staticClass: "form-check" }, [
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model.lazy",
                    value: _vm.localValue.callUpdateBeforePlay,
                    expression: "localValue.callUpdateBeforePlay",
                    modifiers: { lazy: true }
                  }
                ],
                staticClass: "form-check-input",
                attrs: { type: "checkbox", id: "webcgCallUpdateBeforePlay" },
                domProps: {
                  checked: Array.isArray(_vm.localValue.callUpdateBeforePlay)
                    ? _vm._i(_vm.localValue.callUpdateBeforePlay, null) > -1
                    : _vm.localValue.callUpdateBeforePlay
                },
                on: {
                  change: function($event) {
                    var $$a = _vm.localValue.callUpdateBeforePlay,
                      $$el = $event.target,
                      $$c = $$el.checked ? true : false;
                    if (Array.isArray($$a)) {
                      var $$v = null,
                        $$i = _vm._i($$a, $$v);
                      if ($$el.checked) {
                        $$i < 0 &&
                          _vm.$set(
                            _vm.localValue,
                            "callUpdateBeforePlay",
                            $$a.concat([$$v])
                          );
                      } else {
                        $$i > -1 &&
                          _vm.$set(
                            _vm.localValue,
                            "callUpdateBeforePlay",
                            $$a.slice(0, $$i).concat($$a.slice($$i + 1))
                          );
                      }
                    } else {
                      _vm.$set(_vm.localValue, "callUpdateBeforePlay", $$c);
                    }
                  }
                }
              }),
              _vm._v(" "),
              _c(
                "label",
                {
                  staticClass: "form-check-label",
                  attrs: { for: "webcgCallUpdateBeforePlay" }
                },
                [
                  _vm._v(
                    '\n                        Call "update" before "play" like CasparCG\n                    '
                  )
                ]
              )
            ])
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "form-group" }, [
            _c("div", { staticClass: "form-check" }, [
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model.lazy",
                    value: _vm.localValue.showRemoveButton,
                    expression: "localValue.showRemoveButton",
                    modifiers: { lazy: true }
                  }
                ],
                staticClass: "form-check-input",
                attrs: { type: "checkbox", id: "webcgShowRemoveButton" },
                domProps: {
                  checked: Array.isArray(_vm.localValue.showRemoveButton)
                    ? _vm._i(_vm.localValue.showRemoveButton, null) > -1
                    : _vm.localValue.showRemoveButton
                },
                on: {
                  change: function($event) {
                    var $$a = _vm.localValue.showRemoveButton,
                      $$el = $event.target,
                      $$c = $$el.checked ? true : false;
                    if (Array.isArray($$a)) {
                      var $$v = null,
                        $$i = _vm._i($$a, $$v);
                      if ($$el.checked) {
                        $$i < 0 &&
                          _vm.$set(
                            _vm.localValue,
                            "showRemoveButton",
                            $$a.concat([$$v])
                          );
                      } else {
                        $$i > -1 &&
                          _vm.$set(
                            _vm.localValue,
                            "showRemoveButton",
                            $$a.slice(0, $$i).concat($$a.slice($$i + 1))
                          );
                      }
                    } else {
                      _vm.$set(_vm.localValue, "showRemoveButton", $$c);
                    }
                  }
                }
              }),
              _vm._v(" "),
              _c(
                "label",
                {
                  staticClass: "form-check-label",
                  attrs: { for: "webcgShowRemoveButton" }
                },
                [
                  _vm._v(
                    '\n                        Show "Remove" button\n                    '
                  )
                ]
              )
            ])
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "col-xs-12 col-sm-6" }, [
          _c("h3", [_vm._v("Overlay")]),
          _vm._v(" "),
          _c("div", { staticClass: "form-group" }, [
            _c("label", { attrs: { for: "webcgInputOptionBackgroundColor" } }, [
              _vm._v("Background color")
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model.lazy",
                  value: _vm.localValue.backgroundColor,
                  expression: "localValue.backgroundColor",
                  modifiers: { lazy: true }
                }
              ],
              staticClass: "form-control",
              attrs: { type: "text", id: "webcgInputOptionBackgroundColor" },
              domProps: { value: _vm.localValue.backgroundColor },
              on: {
                change: function($event) {
                  _vm.$set(_vm.localValue, "backgroundColor", $event.target.value);
                }
              }
            }),
            _vm._v(" "),
            _c("small", { staticClass: "form-text text-muted" }, [
              _c(
                "a",
                {
                  attrs: { href: "#" },
                  on: {
                    click: function($event) {
                      _vm.localValue.backgroundColor = "#000";
                    }
                  }
                },
                [_vm._v("Black")]
              ),
              _vm._v(" "),
              _c(
                "a",
                {
                  attrs: { href: "#" },
                  on: {
                    click: function($event) {
                      _vm.localValue.backgroundColor = "#fff";
                    }
                  }
                },
                [_vm._v("White")]
              ),
              _vm._v(" "),
              _c(
                "a",
                {
                  attrs: { href: "#" },
                  on: {
                    click: function($event) {
                      _vm.localValue.backgroundColor = "#0f0";
                    }
                  }
                },
                [_vm._v("Green")]
              ),
              _vm._v(" "),
              _c(
                "a",
                {
                  attrs: { href: "#" },
                  on: {
                    click: function($event) {
                      _vm.localValue.backgroundColor = "rgba(0, 0, 0, 0)";
                    }
                  }
                },
                [_vm._v("Transparent")]
              )
            ])
          ])
        ])
      ])
    ])
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    var __vue_inject_styles__ = function (inject) {
      if (!inject) { return }
      inject("data-v-916bab48_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"tab-settings.vue"}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__ = "data-v-916bab48";
    /* module identifier */
    var __vue_module_identifier__ = undefined;
    /* functional template */
    var __vue_is_functional_template__ = false;
    /* component normalizer */
    function __vue_normalize__(
      template, style, script$$1,
      scope, functional, moduleIdentifier,
      createInjector, createInjectorSSR
    ) {
      var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

      // For security concerns, we use only base name in production mode.
      component.__file = "/home/reto/Projects/webcg/webcg-devtools/src/components/tab-settings.vue";

      if (!component.render) {
        component.render = template.render;
        component.staticRenderFns = template.staticRenderFns;
        component._compiled = true;

        if (functional) { component.functional = true; }
      }

      component._scopeId = scope;

      {
        var hook;
        if (style) {
          hook = function(context) {
            style.call(this, createInjector(context));
          };
        }

        if (hook !== undefined) {
          if (component.functional) {
            // register for functional component in vue file
            var originalRender = component.render;
            component.render = function renderWithStyleInjection(h, context) {
              hook.call(context);
              return originalRender(h, context)
            };
          } else {
            // inject component registration as beforeCreate hook
            var existing = component.beforeCreate;
            component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
        }
      }

      return component
    }
    /* style inject */
    function __vue_create_injector__() {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
      var isOldIE =
        typeof navigator !== 'undefined' &&
        /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

      return function addStyle(id, css) {
        if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

        var group = isOldIE ? css.media || 'default' : id;
        var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

        if (!style.ids.includes(id)) {
          var code = css.source;
          var index = style.ids.length;

          style.ids.push(id);

          if (isOldIE) {
            style.element = style.element || document.querySelector('style[data-group=' + group + ']');
          }

          if (!style.element) {
            var el = style.element = document.createElement('style');
            el.type = 'text/css';

            if (css.media) { el.setAttribute('media', css.media); }
            if (isOldIE) {
              el.setAttribute('data-group', group);
              el.setAttribute('data-next-index', '0');
            }

            head.appendChild(el);
          }

          if (isOldIE) {
            index = parseInt(style.element.getAttribute('data-next-index'));
            style.element.setAttribute('data-next-index', index + 1);
          }

          if (style.element.styleSheet) {
            style.parts.push(code);
            style.element.styleSheet.cssText = style.parts
              .filter(Boolean)
              .join('\n');
          } else {
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index]) { style.element.removeChild(nodes[index]); }
            if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
            else { style.element.appendChild(textNode); }
          }
        }
      }
    }
    /* style inject SSR */
    

    
    var TabSettings = __vue_normalize__(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      __vue_create_injector__,
      undefined
    );

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$1 = {
    name: 'edit-data-table',
    props: ['value'],
    data: function data () {
      return {
        newRecord: {},
        records: this.convertObjectToRecords(this.value)
      }
    },
    created: function created () {
      this.resetNewRecord();
    },
    methods: {
      resetNewRecord: function resetNewRecord () {
        var key = this.getNextKey(this.records);
        this.newRecord = {key: key, value: ''};
        if (this.$refs.newRecordInputKey) {
          this.$refs.newRecordInputKey.focus();
        }
      },
      createRecord: function createRecord () {
        var record = Object.assign({}, this.newRecord);
        this.records.push(record);
        this.resetNewRecord();
        this.emitInput();
      },
      autoCreateRecord: function autoCreateRecord () {
        if (this.newRecord['value']) {
          this.createRecord();
        }
      },
      deleteRecord: function deleteRecord (record) {
        var idx = this.records.indexOf(record);
        this.records.splice(idx, 1);
        this.emitInput();
      },
      updateRecord: function updateRecord () {
        this.emitInput();
      },
      getNextKey: function getNextKey (records) {
        var max = -1;
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          var match = record.key.match(/^f(\d+)$/);
          if (match) {
            max = Math.max(max, parseInt(match[1]));
          }
        }
        return 'f' + (max + 1)
      },
      emitInput: function emitInput () {
        var obj = this.convertRecordsToObject(this.records);
        this.$emit('input', obj);
      },
      convertRecordsToObject: function convertRecordsToObject (records) {
        var obj = {};
        for (var i = 0; i < records.length; i++) {
          obj[records[i].key] = records[i].value;
        }
        return obj
      },
      convertObjectToRecords: function convertObjectToRecords (obj) {
        var records = [];
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            records.push({key: key, value: obj[key]});
          }
        }
        return records
      }
    }
  };

  /* script */
              var __vue_script__$1 = script$1;
              
  /* template */
  var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      { staticClass: "form-row", staticStyle: { "flex-grow": "1" } },
      [
        _c(
          "div",
          { staticClass: "form-group col", staticStyle: { display: "flex" } },
          [
            _c(
              "table",
              {
                staticClass: "table table-bordered table-hover table-sm",
                staticStyle: { flex: "1" }
              },
              [
                _vm._m(0),
                _vm._v(" "),
                _c(
                  "tbody",
                  [
                    _vm._l(_vm.records, function(record) {
                      return _c("tr", [
                        _c("td", { staticClass: "inline-edit" }, [
                          _c("input", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: record["key"],
                                expression: "record['key']"
                              }
                            ],
                            staticClass: "inline-input form-control",
                            attrs: { type: "text" },
                            domProps: { value: record["key"] },
                            on: {
                              change: function($event) {
                                _vm.updateRecord(record);
                              },
                              input: function($event) {
                                if ($event.target.composing) {
                                  return
                                }
                                _vm.$set(record, "key", $event.target.value);
                              }
                            }
                          })
                        ]),
                        _vm._v(" "),
                        _c("td", { staticClass: "inline-edit" }, [
                          _c("input", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: record["value"],
                                expression: "record['value']"
                              }
                            ],
                            staticClass: "inline-input form-control",
                            attrs: { type: "text" },
                            domProps: { value: record["value"] },
                            on: {
                              change: function($event) {
                                _vm.updateRecord(record);
                              },
                              input: function($event) {
                                if ($event.target.composing) {
                                  return
                                }
                                _vm.$set(record, "value", $event.target.value);
                              }
                            }
                          })
                        ]),
                        _vm._v(" "),
                        _c("td", { staticClass: "inline-buttons" }, [
                          _c(
                            "button",
                            {
                              staticClass: "btn btn-outline-danger btn-sm",
                              on: {
                                click: function($event) {
                                  _vm.deleteRecord(record);
                                }
                              }
                            },
                            [_vm._v("-")]
                          )
                        ])
                      ])
                    }),
                    _vm._v(" "),
                    _c("tr", [
                      _c("td", { staticClass: "inline-edit" }, [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.newRecord["key"],
                              expression: "newRecord['key']"
                            }
                          ],
                          ref: "newRecordInputKey",
                          staticClass: "inline-input form-control",
                          attrs: { type: "text" },
                          domProps: { value: _vm.newRecord["key"] },
                          on: {
                            input: function($event) {
                              if ($event.target.composing) {
                                return
                              }
                              _vm.$set(_vm.newRecord, "key", $event.target.value);
                            }
                          }
                        })
                      ]),
                      _vm._v(" "),
                      _c("td", { staticClass: "inline-edit" }, [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.newRecord["value"],
                              expression: "newRecord['value']"
                            }
                          ],
                          ref: "newRecordInputValue",
                          staticClass: "inline-input form-control",
                          attrs: { type: "text" },
                          domProps: { value: _vm.newRecord["value"] },
                          on: {
                            blur: function($event) {
                              _vm.autoCreateRecord(_vm.newRecord);
                            },
                            input: function($event) {
                              if ($event.target.composing) {
                                return
                              }
                              _vm.$set(
                                _vm.newRecord,
                                "value",
                                $event.target.value
                              );
                            }
                          }
                        })
                      ]),
                      _vm._v(" "),
                      _c("td", { staticClass: "inline-buttons" }, [
                        _c(
                          "button",
                          {
                            staticClass: "btn btn-outline-success btn-sm",
                            on: {
                              click: function($event) {
                                _vm.createRecord(_vm.newRecord);
                              }
                            }
                          },
                          [_vm._v("+")]
                        )
                      ])
                    ])
                  ],
                  2
                )
              ]
            )
          ]
        )
      ]
    )
  };
  var __vue_staticRenderFns__$1 = [
    function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("thead", [
        _c("tr", [
          _c("th", [_vm._v("Name")]),
          _vm._v(" "),
          _c("th", [_vm._v("Value")]),
          _vm._v(" "),
          _c("th")
        ])
      ])
    }
  ];
  __vue_render__$1._withStripped = true;

    /* style */
    var __vue_inject_styles__$1 = function (inject) {
      if (!inject) { return }
      inject("data-v-3861d950_0", { source: "\n.webcg-devtools table td.inline-edit {\n  padding: 0;\n}\n.webcg-devtools input.inline-input {\n  background-color: transparent;\n  border-width: 0;\n  margin: 1px;\n  border-radius: 0;\n  height: 100%;\n}\n.webcg-devtools input.inline-input:focus {\n    margin: 0;\n    border-width: 1px;\n}\n\n/*# sourceMappingURL=edit-data-table.vue.map */", map: {"version":3,"sources":["/home/reto/Projects/webcg/webcg-devtools/src/components/edit-data-table.vue","edit-data-table.vue"],"names":[],"mappings":";AAsHA;EAEA,WAAA;CACA;AAHA;EAMA,8BAAA;EACA,gBAAA;EACA,YAAA;EACA,iBAAA;EACA,aAAA;CAMA;AAhBA;IAaA,UAAA;IACA,kBAAA;CACA;;ACxHA,+CAA+C","file":"edit-data-table.vue","sourcesContent":[null,".webcg-devtools table td.inline-edit {\n  padding: 0; }\n\n.webcg-devtools input.inline-input {\n  background-color: transparent;\n  border-width: 0;\n  margin: 1px;\n  border-radius: 0;\n  height: 100%; }\n  .webcg-devtools input.inline-input:focus {\n    margin: 0;\n    border-width: 1px; }\n\n/*# sourceMappingURL=edit-data-table.vue.map */"]}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__$1 = undefined;
    /* module identifier */
    var __vue_module_identifier__$1 = undefined;
    /* functional template */
    var __vue_is_functional_template__$1 = false;
    /* component normalizer */
    function __vue_normalize__$1(
      template, style, script,
      scope, functional, moduleIdentifier,
      createInjector, createInjectorSSR
    ) {
      var component = (typeof script === 'function' ? script.options : script) || {};

      // For security concerns, we use only base name in production mode.
      component.__file = "/home/reto/Projects/webcg/webcg-devtools/src/components/edit-data-table.vue";

      if (!component.render) {
        component.render = template.render;
        component.staticRenderFns = template.staticRenderFns;
        component._compiled = true;

        if (functional) { component.functional = true; }
      }

      component._scopeId = scope;

      {
        var hook;
        if (style) {
          hook = function(context) {
            style.call(this, createInjector(context));
          };
        }

        if (hook !== undefined) {
          if (component.functional) {
            // register for functional component in vue file
            var originalRender = component.render;
            component.render = function renderWithStyleInjection(h, context) {
              hook.call(context);
              return originalRender(h, context)
            };
          } else {
            // inject component registration as beforeCreate hook
            var existing = component.beforeCreate;
            component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
        }
      }

      return component
    }
    /* style inject */
    function __vue_create_injector__$1() {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styles = __vue_create_injector__$1.styles || (__vue_create_injector__$1.styles = {});
      var isOldIE =
        typeof navigator !== 'undefined' &&
        /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

      return function addStyle(id, css) {
        if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

        var group = isOldIE ? css.media || 'default' : id;
        var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

        if (!style.ids.includes(id)) {
          var code = css.source;
          var index = style.ids.length;

          style.ids.push(id);

          if (isOldIE) {
            style.element = style.element || document.querySelector('style[data-group=' + group + ']');
          }

          if (!style.element) {
            var el = style.element = document.createElement('style');
            el.type = 'text/css';

            if (css.media) { el.setAttribute('media', css.media); }
            if (isOldIE) {
              el.setAttribute('data-group', group);
              el.setAttribute('data-next-index', '0');
            }

            head.appendChild(el);
          }

          if (isOldIE) {
            index = parseInt(style.element.getAttribute('data-next-index'));
            style.element.setAttribute('data-next-index', index + 1);
          }

          if (style.element.styleSheet) {
            style.parts.push(code);
            style.element.styleSheet.cssText = style.parts
              .filter(Boolean)
              .join('\n');
          } else {
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index]) { style.element.removeChild(nodes[index]); }
            if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
            else { style.element.appendChild(textNode); }
          }
        }
      }
    }
    /* style inject SSR */
    

    
    var EditDataTable = __vue_normalize__$1(
      { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
      __vue_inject_styles__$1,
      __vue_script__$1,
      __vue_scope_id__$1,
      __vue_is_functional_template__$1,
      __vue_module_identifier__$1,
      __vue_create_injector__$1,
      undefined
    );

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$2 = {
    name: 'edit-data-json',
    props: ['value'],
    data: function data () {
      return {
        errorMessage: null,
        localValue: JSON.stringify(this.value, null, 2)
      }
    },
    watch: {
      localValue: function (val) {
        var obj;
        try {
          obj = JSON.parse(val);
        } catch (ex) {
          this.errorMessage = ex.message;
          return
        }
        this.errorMessage = null;
        this.$emit('input', obj);
      }
    }
  };

  /* script */
              var __vue_script__$2 = script$2;
              
  /* template */
  var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { staticClass: "flex-columns" }, [
      _c(
        "div",
        {
          staticClass: "form-row flex-columns",
          staticStyle: { "flex-grow": "1" }
        },
        [
          _c("div", { staticClass: "form-group col flex-columns" }, [
            _c("textarea", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model.lazy",
                  value: _vm.localValue,
                  expression: "localValue",
                  modifiers: { lazy: true }
                }
              ],
              staticClass: "form-control",
              class: { "is-invalid": _vm.errorMessage },
              staticStyle: { flex: "1", resize: "none" },
              domProps: { value: _vm.localValue },
              on: {
                change: function($event) {
                  _vm.localValue = $event.target.value;
                }
              }
            })
          ])
        ]
      ),
      _vm._v(" "),
      _vm.errorMessage
        ? _c("div", { staticClass: "form-row" }, [
            _c("div", { staticClass: "col" }, [
              _c(
                "div",
                { staticClass: "alert alert-danger", attrs: { role: "alert" } },
                [
                  _vm._v(
                    "\n                " +
                      _vm._s(_vm.errorMessage) +
                      "\n            "
                  )
                ]
              )
            ])
          ])
        : _vm._e()
    ])
  };
  var __vue_staticRenderFns__$2 = [];
  __vue_render__$2._withStripped = true;

    /* style */
    var __vue_inject_styles__$2 = function (inject) {
      if (!inject) { return }
      inject("data-v-43cd2f9e_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"edit-data-json.vue"}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__$2 = "data-v-43cd2f9e";
    /* module identifier */
    var __vue_module_identifier__$2 = undefined;
    /* functional template */
    var __vue_is_functional_template__$2 = false;
    /* component normalizer */
    function __vue_normalize__$2(
      template, style, script,
      scope, functional, moduleIdentifier,
      createInjector, createInjectorSSR
    ) {
      var component = (typeof script === 'function' ? script.options : script) || {};

      // For security concerns, we use only base name in production mode.
      component.__file = "/home/reto/Projects/webcg/webcg-devtools/src/components/edit-data-json.vue";

      if (!component.render) {
        component.render = template.render;
        component.staticRenderFns = template.staticRenderFns;
        component._compiled = true;

        if (functional) { component.functional = true; }
      }

      component._scopeId = scope;

      {
        var hook;
        if (style) {
          hook = function(context) {
            style.call(this, createInjector(context));
          };
        }

        if (hook !== undefined) {
          if (component.functional) {
            // register for functional component in vue file
            var originalRender = component.render;
            component.render = function renderWithStyleInjection(h, context) {
              hook.call(context);
              return originalRender(h, context)
            };
          } else {
            // inject component registration as beforeCreate hook
            var existing = component.beforeCreate;
            component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
        }
      }

      return component
    }
    /* style inject */
    function __vue_create_injector__$2() {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styles = __vue_create_injector__$2.styles || (__vue_create_injector__$2.styles = {});
      var isOldIE =
        typeof navigator !== 'undefined' &&
        /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

      return function addStyle(id, css) {
        if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

        var group = isOldIE ? css.media || 'default' : id;
        var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

        if (!style.ids.includes(id)) {
          var code = css.source;
          var index = style.ids.length;

          style.ids.push(id);

          if (isOldIE) {
            style.element = style.element || document.querySelector('style[data-group=' + group + ']');
          }

          if (!style.element) {
            var el = style.element = document.createElement('style');
            el.type = 'text/css';

            if (css.media) { el.setAttribute('media', css.media); }
            if (isOldIE) {
              el.setAttribute('data-group', group);
              el.setAttribute('data-next-index', '0');
            }

            head.appendChild(el);
          }

          if (isOldIE) {
            index = parseInt(style.element.getAttribute('data-next-index'));
            style.element.setAttribute('data-next-index', index + 1);
          }

          if (style.element.styleSheet) {
            style.parts.push(code);
            style.element.styleSheet.cssText = style.parts
              .filter(Boolean)
              .join('\n');
          } else {
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index]) { style.element.removeChild(nodes[index]); }
            if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
            else { style.element.appendChild(textNode); }
          }
        }
      }
    }
    /* style inject SSR */
    

    
    var EditDataJson = __vue_normalize__$2(
      { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
      __vue_inject_styles__$2,
      __vue_script__$2,
      __vue_scope_id__$2,
      __vue_is_functional_template__$2,
      __vue_module_identifier__$2,
      __vue_create_injector__$2,
      undefined
    );

  //

  var script$3 = {
    name: 'edit-data',
    components: {EditDataTable: EditDataTable, EditDataJson: EditDataJson},
    props: ['value'],
    data: function data () {
      var componentType = window.localStorage.getItem('webcg-devtools.edit-data.component-type');
      if (['edit-data-table', 'edit-data-json'].indexOf(componentType) < 0) {
        componentType = 'edit-data-table';
      }
      return {
        localValue: this.value,
        componentType: componentType
      }
    },
    watch: {
      localValue: function (val) {
        this.$emit('input', val);
      },
      componentType: function (val) {
        window.localStorage.setItem('webcg-devtools.edit-data.component-type', val);
      }
    },
    methods: {
      update: function update () {
        this.$emit('update', this.localValue);
      }
    }
  };

  /* script */
              var __vue_script__$3 = script$3;
              
  /* template */
  var __vue_render__$3 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { staticClass: "flex-columns" }, [
      _c(
        "div",
        {
          staticStyle: {
            "flex-grow": "1",
            display: "flex",
            "flex-direction": "column"
          }
        },
        [
          _c(_vm.componentType, {
            tag: "component",
            model: {
              value: _vm.localValue,
              callback: function($$v) {
                _vm.localValue = $$v;
              },
              expression: "localValue"
            }
          })
        ],
        1
      ),
      _vm._v(" "),
      _c("div", { staticClass: "form-row" }, [
        _c("div", { staticClass: "form-group col" }, [
          _c(
            "div",
            {
              staticClass: "btn-group btn-group-toggle",
              attrs: { "data-toggle": "buttons" }
            },
            [
              _c(
                "label",
                {
                  staticClass: "btn btn-outline-secondary",
                  class: { active: _vm.componentType === "edit-data-table" }
                },
                [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.componentType,
                        expression: "componentType"
                      }
                    ],
                    attrs: {
                      type: "radio",
                      name: "view",
                      id: "option2",
                      autocomplete: "off",
                      value: "edit-data-table"
                    },
                    domProps: {
                      checked: _vm._q(_vm.componentType, "edit-data-table")
                    },
                    on: {
                      change: function($event) {
                        _vm.componentType = "edit-data-table";
                      }
                    }
                  }),
                  _vm._v(" Table\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "label",
                {
                  staticClass: "btn btn-outline-secondary",
                  class: { active: _vm.componentType === "edit-data-json" }
                },
                [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.componentType,
                        expression: "componentType"
                      }
                    ],
                    attrs: {
                      type: "radio",
                      name: "view",
                      id: "option1",
                      autocomplete: "off",
                      value: "edit-data-json"
                    },
                    domProps: {
                      checked: _vm._q(_vm.componentType, "edit-data-json")
                    },
                    on: {
                      change: function($event) {
                        _vm.componentType = "edit-data-json";
                      }
                    }
                  }),
                  _vm._v(" JSON\n                ")
                ]
              )
            ]
          )
        ]),
        _vm._v(" "),
        _c(
          "div",
          {
            staticClass: "form-group col",
            staticStyle: { "text-align": "right" }
          },
          [
            _c(
              "button",
              {
                staticClass: "btn btn-primary",
                attrs: { type: "button" },
                on: {
                  click: function($event) {
                    _vm.update();
                  }
                }
              },
              [_vm._v("\n                Update\n            ")]
            )
          ]
        )
      ])
    ])
  };
  var __vue_staticRenderFns__$3 = [];
  __vue_render__$3._withStripped = true;

    /* style */
    var __vue_inject_styles__$3 = function (inject) {
      if (!inject) { return }
      inject("data-v-390db767_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"edit-data.vue"}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__$3 = "data-v-390db767";
    /* module identifier */
    var __vue_module_identifier__$3 = undefined;
    /* functional template */
    var __vue_is_functional_template__$3 = false;
    /* component normalizer */
    function __vue_normalize__$3(
      template, style, script,
      scope, functional, moduleIdentifier,
      createInjector, createInjectorSSR
    ) {
      var component = (typeof script === 'function' ? script.options : script) || {};

      // For security concerns, we use only base name in production mode.
      component.__file = "/home/reto/Projects/webcg/webcg-devtools/src/components/edit-data.vue";

      if (!component.render) {
        component.render = template.render;
        component.staticRenderFns = template.staticRenderFns;
        component._compiled = true;

        if (functional) { component.functional = true; }
      }

      component._scopeId = scope;

      {
        var hook;
        if (style) {
          hook = function(context) {
            style.call(this, createInjector(context));
          };
        }

        if (hook !== undefined) {
          if (component.functional) {
            // register for functional component in vue file
            var originalRender = component.render;
            component.render = function renderWithStyleInjection(h, context) {
              hook.call(context);
              return originalRender(h, context)
            };
          } else {
            // inject component registration as beforeCreate hook
            var existing = component.beforeCreate;
            component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
        }
      }

      return component
    }
    /* style inject */
    function __vue_create_injector__$3() {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styles = __vue_create_injector__$3.styles || (__vue_create_injector__$3.styles = {});
      var isOldIE =
        typeof navigator !== 'undefined' &&
        /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

      return function addStyle(id, css) {
        if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

        var group = isOldIE ? css.media || 'default' : id;
        var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

        if (!style.ids.includes(id)) {
          var code = css.source;
          var index = style.ids.length;

          style.ids.push(id);

          if (isOldIE) {
            style.element = style.element || document.querySelector('style[data-group=' + group + ']');
          }

          if (!style.element) {
            var el = style.element = document.createElement('style');
            el.type = 'text/css';

            if (css.media) { el.setAttribute('media', css.media); }
            if (isOldIE) {
              el.setAttribute('data-group', group);
              el.setAttribute('data-next-index', '0');
            }

            head.appendChild(el);
          }

          if (isOldIE) {
            index = parseInt(style.element.getAttribute('data-next-index'));
            style.element.setAttribute('data-next-index', index + 1);
          }

          if (style.element.styleSheet) {
            style.parts.push(code);
            style.element.styleSheet.cssText = style.parts
              .filter(Boolean)
              .join('\n');
          } else {
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index]) { style.element.removeChild(nodes[index]); }
            if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
            else { style.element.appendChild(textNode); }
          }
        }
      }
    }
    /* style inject SSR */
    

    
    var EditData = __vue_normalize__$3(
      { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
      __vue_inject_styles__$3,
      __vue_script__$3,
      __vue_scope_id__$3,
      __vue_is_functional_template__$3,
      __vue_module_identifier__$3,
      __vue_create_injector__$3,
      undefined
    );

  //

  var script$4 = {
    name: 'tab-tools.vue',
    components: { EditData: EditData },
    props: ['settings'],
    data: function data () {
      return {
        invokeExpr: '',
        invokeErrorMessage: null,
        updateData: {}
      }
    },
    created: function created () {
      this.restoreInputs();
    },
    methods: {
      eval: function eval$1 (expr) {
        if (!expr) { return }
        if (expr.indexOf('(') < 0 && expr.indexOf(')') < 0) {
          expr += '()';
        }
        console.log('[webcg-devtools] calling ' + expr);
        window.eval(expr);
      },
      invoke: function invoke () {
        this.invokeErrorMessage = null;
        this.saveInputs();
        try {
          this.eval(this.invokeExpr || '');
        } catch (ex) {
          // Ignore the exception that is thrown because the function is not defined
          if (ex.name === 'ReferenceError' && /is not defined$/.test(ex.message)) {
            return
          }
          // Display any other error message
          this.invokeErrorMessage = ex.message;
        }
      },
      play: function play () {
        // CasparCG invokes update before the first play command
        if (this.settings.callUpdateBeforePlay && !this.played) {
          this.update(this.updateData);
        }
        this.eval('play');
        this.played = true;
      },
      update: function update (data) {
        this.updateData = data;
        this.saveInputs();
        var stringified = JSON.stringify(this.updateData);
        console.log('[webcg-devtools] calling update ' + stringified);
        // stringify contains a string in this form '{"f0":123}'. but what we want to pass
        // to the update() function has this form '"{\"f0\":123}\"', so we stringify() again.
        window.eval('window[\'update\'](' + JSON.stringify(stringified) + ')');
      },
      saveInputs: function saveInputs () {
        storage.set('invokeExpr', this.invokeExpr || '');
        storage.set('updateData', this.updateData);
      },
      restoreInputs: function restoreInputs () {
        this.invokeExpr = storage.get('invokeExpr', '');
        try {
          this.updateData = storage.get('updateData', JSON.parse(JSON.stringify(window.debugData || {})));
        } catch (err) {
          this.updateData = {};
        }
      }
    }
  };

  /* script */
              var __vue_script__$4 = script$4;
              
  /* template */
  var __vue_render__$4 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      { staticClass: "modal-body" },
      [
        _c("div", { staticClass: "form-row" }, [
          _c("div", { staticClass: "form-group col" }, [
            _c(
              "button",
              {
                staticClass: "btn btn-block btn-primary",
                attrs: { type: "button" },
                on: {
                  click: function($event) {
                    _vm.play();
                  }
                }
              },
              [_vm._v("\n                Play\n            ")]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "form-group col" }, [
            _c(
              "button",
              {
                staticClass: "btn btn-block btn-outline-secondary",
                attrs: { type: "button" },
                on: {
                  click: function($event) {
                    _vm.eval("next");
                  }
                }
              },
              [_vm._v("\n                Next\n            ")]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "form-group col" }, [
            _c(
              "button",
              {
                staticClass: "btn btn-block btn-outline-secondary",
                attrs: { type: "button" },
                on: {
                  click: function($event) {
                    _vm.eval("stop");
                  }
                }
              },
              [_vm._v("\n                Stop\n            ")]
            )
          ]),
          _vm._v(" "),
          _vm.settings.showRemoveButton
            ? _c("div", { staticClass: "form-group col" }, [
                _c(
                  "button",
                  {
                    staticClass: "btn btn-block btn-outline-secondary",
                    attrs: { type: "button" },
                    on: {
                      click: function($event) {
                        _vm.eval("remove");
                      }
                    }
                  },
                  [_vm._v("\n                Remove\n            ")]
                )
              ])
            : _vm._e()
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "form-row" }, [
          _c("div", { staticClass: "form-group col" }, [
            _c("div", { staticClass: "input-group" }, [
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.invokeExpr,
                    expression: "invokeExpr"
                  }
                ],
                staticClass: "form-control",
                class: { "is-invalid": _vm.invokeErrorMessage },
                attrs: { type: "text" },
                domProps: { value: _vm.invokeExpr },
                on: {
                  input: function($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.invokeExpr = $event.target.value;
                  }
                }
              }),
              _vm._v(" "),
              _c("div", { staticClass: "input-group-append" }, [
                _c(
                  "button",
                  {
                    staticClass: "btn btn-outline-secondary",
                    attrs: { type: "button" },
                    on: {
                      click: function($event) {
                        _vm.invoke();
                      }
                    }
                  },
                  [
                    _vm._v(
                      "\n                        Invoke\n                    "
                    )
                  ]
                )
              ])
            ])
          ])
        ]),
        _vm._v(" "),
        _vm.invokeErrorMessage
          ? _c("div", { staticClass: "form-row" }, [
              _c("div", { staticClass: "col" }, [
                _c(
                  "div",
                  { staticClass: "alert alert-danger", attrs: { role: "alert" } },
                  [
                    _vm._v(
                      "\n                " +
                        _vm._s(_vm.invokeErrorMessage) +
                        "\n            "
                    )
                  ]
                )
              ])
            ])
          : _vm._e(),
        _vm._v(" "),
        _c("edit-data", {
          on: { update: _vm.update },
          model: {
            value: _vm.updateData,
            callback: function($$v) {
              _vm.updateData = $$v;
            },
            expression: "updateData"
          }
        })
      ],
      1
    )
  };
  var __vue_staticRenderFns__$4 = [];
  __vue_render__$4._withStripped = true;

    /* style */
    var __vue_inject_styles__$4 = function (inject) {
      if (!inject) { return }
      inject("data-v-1d1d341a_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"tab-tools.vue"}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__$4 = "data-v-1d1d341a";
    /* module identifier */
    var __vue_module_identifier__$4 = undefined;
    /* functional template */
    var __vue_is_functional_template__$4 = false;
    /* component normalizer */
    function __vue_normalize__$4(
      template, style, script,
      scope, functional, moduleIdentifier,
      createInjector, createInjectorSSR
    ) {
      var component = (typeof script === 'function' ? script.options : script) || {};

      // For security concerns, we use only base name in production mode.
      component.__file = "/home/reto/Projects/webcg/webcg-devtools/src/components/tab-tools.vue";

      if (!component.render) {
        component.render = template.render;
        component.staticRenderFns = template.staticRenderFns;
        component._compiled = true;

        if (functional) { component.functional = true; }
      }

      component._scopeId = scope;

      {
        var hook;
        if (style) {
          hook = function(context) {
            style.call(this, createInjector(context));
          };
        }

        if (hook !== undefined) {
          if (component.functional) {
            // register for functional component in vue file
            var originalRender = component.render;
            component.render = function renderWithStyleInjection(h, context) {
              hook.call(context);
              return originalRender(h, context)
            };
          } else {
            // inject component registration as beforeCreate hook
            var existing = component.beforeCreate;
            component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
        }
      }

      return component
    }
    /* style inject */
    function __vue_create_injector__$4() {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styles = __vue_create_injector__$4.styles || (__vue_create_injector__$4.styles = {});
      var isOldIE =
        typeof navigator !== 'undefined' &&
        /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

      return function addStyle(id, css) {
        if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

        var group = isOldIE ? css.media || 'default' : id;
        var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

        if (!style.ids.includes(id)) {
          var code = css.source;
          var index = style.ids.length;

          style.ids.push(id);

          if (isOldIE) {
            style.element = style.element || document.querySelector('style[data-group=' + group + ']');
          }

          if (!style.element) {
            var el = style.element = document.createElement('style');
            el.type = 'text/css';

            if (css.media) { el.setAttribute('media', css.media); }
            if (isOldIE) {
              el.setAttribute('data-group', group);
              el.setAttribute('data-next-index', '0');
            }

            head.appendChild(el);
          }

          if (isOldIE) {
            index = parseInt(style.element.getAttribute('data-next-index'));
            style.element.setAttribute('data-next-index', index + 1);
          }

          if (style.element.styleSheet) {
            style.parts.push(code);
            style.element.styleSheet.cssText = style.parts
              .filter(Boolean)
              .join('\n');
          } else {
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index]) { style.element.removeChild(nodes[index]); }
            if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
            else { style.element.appendChild(textNode); }
          }
        }
      }
    }
    /* style inject SSR */
    

    
    var TabTools = __vue_normalize__$4(
      { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
      __vue_inject_styles__$4,
      __vue_script__$4,
      __vue_scope_id__$4,
      __vue_is_functional_template__$4,
      __vue_module_identifier__$4,
      __vue_create_injector__$4,
      undefined
    );

  //

  var script$5 = {
    name: 'webcg-dev-tools',
    components: { TabSettings: TabSettings, TabTools: TabTools },
    data: function data () {
      return {
        tab: 'tools',
        version: version,
        settings: {}
      }
    },
    created: function created () {
      this.loadSettings(this.settings);
    },
    mounted: function mounted () {
      var $draggable = this.$el.querySelector('.draggable');
      var $resizable = this.$el.querySelector('.resizable');
      this.restoreDimensions($draggable, $resizable);
      this.$draggable({
        ondragged: this.dragged.bind(this)
      });
      this.$resizable({
        targetNode: $resizable,
        onresized: this.resized.bind(this)
      });
    },
    watch: {
      settings: function (settings) {
        this.applySettings(settings);
        this.saveSettings(settings);
      }
    },
    methods: {
      loadSettings: function loadSettings (settings) {
        settings.callUpdateBeforePlay = storage.get('callUpdateBeforePlay', true);
        settings.showRemoveButton = storage.get('showRemoveButton', false);
        settings.backgroundColor = window.getComputedStyle(document.body, null).getPropertyValue('background-color');
      },
      saveSettings: function saveSettings (settings) {
        storage.set('callUpdateBeforePlay', settings.callUpdateBeforePlay);
        storage.set('showRemoveButton', settings.showRemoveButton);
      },
      applySettings: function applySettings (settings) {
        document.body.style.backgroundColor = settings.backgroundColor;
      },
      dragged: function dragged ($el) {
        storage.set('offsetTop', $el.offsetTop);
        storage.set('offsetLeft', $el.offsetLeft);
      },
      resized: function resized ($el) {
        storage.set('offsetWidth', $el.offsetWidth);
        storage.set('offsetHeight', $el.offsetHeight);
      },
      restoreDimensions: function restoreDimensions ($draggable, $resizable) {
        var minWidth = 410;
        var defaultWidth = 410;
        var minHeight = 63;
        var defaultHeight = 380;
        $draggable.style.top = Math.max(0, storage.get('offsetTop') || 200) + 'px';
        $draggable.style.left = Math.max(0, storage.get('offsetLeft') || 200) + 'px';
        $resizable.style.width = Math.max(minWidth, storage.get('offsetWidth') || defaultWidth) + 'px';
        $resizable.style.height = Math.max(minHeight, storage.get('offsetHeight') || defaultHeight) + 'px';
      },

    }
  };

  /* script */
              var __vue_script__$5 = script$5;
              
  /* template */
  var __vue_render__$5 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { staticClass: "webcg-devtools" }, [
      _c(
        "div",
        {
          staticClass: "modal draggable",
          attrs: { tabindex: "-1", role: "dialog" }
        },
        [
          _c(
            "div",
            { staticClass: "modal-content resizable" },
            [
              _c("div", { staticClass: "modal-header drag-handle" }, [
                _c("h5", { staticClass: "modal-title" }, [
                  _vm._v("WebCG DevTools " + _vm._s(_vm.version))
                ])
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "modal-navbar" }, [
                _c(
                  "ul",
                  {
                    staticClass: "nav nav-tabs",
                    attrs: { id: "myTab", role: "tablist" }
                  },
                  [
                    _c("li", { staticClass: "nav-item" }, [
                      _c(
                        "a",
                        {
                          staticClass: "nav-link",
                          class: { active: _vm.tab === "tools" },
                          attrs: {
                            "data-toggle": "tab",
                            href: "#tools",
                            role: "tab",
                            "aria-controls": "tools",
                            "aria-selected": "true"
                          },
                          on: {
                            click: function($event) {
                              _vm.tab = "tools";
                            }
                          }
                        },
                        [_vm._v("Tools")]
                      )
                    ]),
                    _vm._v(" "),
                    _c("li", { staticClass: "nav-item" }, [
                      _c(
                        "a",
                        {
                          staticClass: "nav-link",
                          class: { active: _vm.tab === "settings" },
                          attrs: {
                            "data-toggle": "tab",
                            href: "#settings",
                            role: "tab",
                            "aria-controls": "settings",
                            "aria-selected": "false"
                          },
                          on: {
                            click: function($event) {
                              _vm.tab = "settings";
                            }
                          }
                        },
                        [_vm._v("Settings")]
                      )
                    ])
                  ]
                )
              ]),
              _vm._v(" "),
              _vm.tab === "tools"
                ? _c("tab-tools", { attrs: { settings: _vm.settings } })
                : _vm._e(),
              _vm._v(" "),
              _vm.tab === "settings"
                ? _c("tab-settings", {
                    model: {
                      value: _vm.settings,
                      callback: function($$v) {
                        _vm.settings = $$v;
                      },
                      expression: "settings"
                    }
                  })
                : _vm._e(),
              _vm._v(" "),
              _vm._m(0)
            ],
            1
          )
        ]
      )
    ])
  };
  var __vue_staticRenderFns__$5 = [
    function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("div", { staticClass: "modal-footer" }, [
        _c("a", { attrs: { href: "https://github.com/indr/webcg-devtools" } }, [
          _vm._v("https://github.com/indr/webcg-devtools")
        ])
      ])
    }
  ];
  __vue_render__$5._withStripped = true;

    /* style */
    var __vue_inject_styles__$5 = function (inject) {
      if (!inject) { return }
      inject("data-v-eac4b252_0", { source: "\n.webcg-devtools {\n  /*!\n * Bootstrap v4.1.3 (https://getbootstrap.com/)\n * Copyright 2011-2018 The Bootstrap Authors\n * Copyright 2011-2018 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n */\n}\n.webcg-devtools :root {\n    --blue: #007bff;\n    --indigo: #6610f2;\n    --purple: #6f42c1;\n    --pink: #e83e8c;\n    --red: #dc3545;\n    --orange: #fd7e14;\n    --yellow: #ffc107;\n    --green: #28a745;\n    --teal: #20c997;\n    --cyan: #17a2b8;\n    --white: #fff;\n    --gray: #6c757d;\n    --gray-dark: #343a40;\n    --primary: #007bff;\n    --secondary: #6c757d;\n    --success: #28a745;\n    --info: #17a2b8;\n    --warning: #ffc107;\n    --danger: #dc3545;\n    --light: #f8f9fa;\n    --dark: #343a40;\n    --breakpoint-xs: 0;\n    --breakpoint-sm: 576px;\n    --breakpoint-md: 768px;\n    --breakpoint-lg: 992px;\n    --breakpoint-xl: 1200px;\n    --font-family-sans-serif: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n    --font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\n.webcg-devtools *,\n  .webcg-devtools *::before,\n  .webcg-devtools *::after {\n    box-sizing: border-box;\n}\n.webcg-devtools html {\n    font-family: sans-serif;\n    line-height: 1.15;\n    -webkit-text-size-adjust: 100%;\n    -ms-text-size-adjust: 100%;\n    -ms-overflow-style: scrollbar;\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n@-ms-viewport {\n  width: device-width;\n}\n.webcg-devtools article, .webcg-devtools aside, .webcg-devtools figcaption, .webcg-devtools figure, .webcg-devtools footer, .webcg-devtools header, .webcg-devtools hgroup, .webcg-devtools main, .webcg-devtools nav, .webcg-devtools section {\n    display: block;\n}\n.webcg-devtools body {\n    margin: 0;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n    font-size: 1rem;\n    font-weight: 400;\n    line-height: 1.5;\n    color: #212529;\n    text-align: left;\n    background-color: #fff;\n}\n.webcg-devtools [tabindex=\"-1\"]:focus {\n    outline: 0 !important;\n}\n.webcg-devtools hr {\n    box-sizing: content-box;\n    height: 0;\n    overflow: visible;\n}\n.webcg-devtools h1, .webcg-devtools h2, .webcg-devtools h3, .webcg-devtools h4, .webcg-devtools h5, .webcg-devtools h6 {\n    margin-top: 0;\n    margin-bottom: 0.5rem;\n}\n.webcg-devtools p {\n    margin-top: 0;\n    margin-bottom: 1rem;\n}\n.webcg-devtools abbr[title],\n  .webcg-devtools abbr[data-original-title] {\n    text-decoration: underline;\n    text-decoration: underline dotted;\n    cursor: help;\n    border-bottom: 0;\n}\n.webcg-devtools address {\n    margin-bottom: 1rem;\n    font-style: normal;\n    line-height: inherit;\n}\n.webcg-devtools ol,\n  .webcg-devtools ul,\n  .webcg-devtools dl {\n    margin-top: 0;\n    margin-bottom: 1rem;\n}\n.webcg-devtools ol ol,\n  .webcg-devtools ul ul,\n  .webcg-devtools ol ul,\n  .webcg-devtools ul ol {\n    margin-bottom: 0;\n}\n.webcg-devtools dt {\n    font-weight: 700;\n}\n.webcg-devtools dd {\n    margin-bottom: .5rem;\n    margin-left: 0;\n}\n.webcg-devtools blockquote {\n    margin: 0 0 1rem;\n}\n.webcg-devtools dfn {\n    font-style: italic;\n}\n.webcg-devtools b,\n  .webcg-devtools strong {\n    font-weight: bolder;\n}\n.webcg-devtools small {\n    font-size: 80%;\n}\n.webcg-devtools sub,\n  .webcg-devtools sup {\n    position: relative;\n    font-size: 75%;\n    line-height: 0;\n    vertical-align: baseline;\n}\n.webcg-devtools sub {\n    bottom: -.25em;\n}\n.webcg-devtools sup {\n    top: -.5em;\n}\n.webcg-devtools a {\n    color: #007bff;\n    text-decoration: none;\n    background-color: transparent;\n    -webkit-text-decoration-skip: objects;\n}\n.webcg-devtools a:hover {\n      color: #0056b3;\n      text-decoration: underline;\n}\n.webcg-devtools a:not([href]):not([tabindex]) {\n    color: inherit;\n    text-decoration: none;\n}\n.webcg-devtools a:not([href]):not([tabindex]):hover, .webcg-devtools a:not([href]):not([tabindex]):focus {\n      color: inherit;\n      text-decoration: none;\n}\n.webcg-devtools a:not([href]):not([tabindex]):focus {\n      outline: 0;\n}\n.webcg-devtools pre,\n  .webcg-devtools code,\n  .webcg-devtools kbd,\n  .webcg-devtools samp {\n    font-family: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n    font-size: 1em;\n}\n.webcg-devtools pre {\n    margin-top: 0;\n    margin-bottom: 1rem;\n    overflow: auto;\n    -ms-overflow-style: scrollbar;\n}\n.webcg-devtools figure {\n    margin: 0 0 1rem;\n}\n.webcg-devtools img {\n    vertical-align: middle;\n    border-style: none;\n}\n.webcg-devtools svg {\n    overflow: hidden;\n    vertical-align: middle;\n}\n.webcg-devtools table {\n    border-collapse: collapse;\n}\n.webcg-devtools caption {\n    padding-top: 0.75rem;\n    padding-bottom: 0.75rem;\n    color: #6c757d;\n    text-align: left;\n    caption-side: bottom;\n}\n.webcg-devtools th {\n    text-align: inherit;\n}\n.webcg-devtools label {\n    display: inline-block;\n    margin-bottom: 0.5rem;\n}\n.webcg-devtools button {\n    border-radius: 0;\n}\n.webcg-devtools button:focus {\n    outline: 1px dotted;\n    outline: 5px auto -webkit-focus-ring-color;\n}\n.webcg-devtools input,\n  .webcg-devtools button,\n  .webcg-devtools select,\n  .webcg-devtools optgroup,\n  .webcg-devtools textarea {\n    margin: 0;\n    font-family: inherit;\n    font-size: inherit;\n    line-height: inherit;\n}\n.webcg-devtools button,\n  .webcg-devtools input {\n    overflow: visible;\n}\n.webcg-devtools button,\n  .webcg-devtools select {\n    text-transform: none;\n}\n.webcg-devtools button,\n  .webcg-devtools html [type=\"button\"],\n  .webcg-devtools [type=\"reset\"],\n  .webcg-devtools [type=\"submit\"] {\n    -webkit-appearance: button;\n}\n.webcg-devtools button::-moz-focus-inner,\n  .webcg-devtools [type=\"button\"]::-moz-focus-inner,\n  .webcg-devtools [type=\"reset\"]::-moz-focus-inner,\n  .webcg-devtools [type=\"submit\"]::-moz-focus-inner {\n    padding: 0;\n    border-style: none;\n}\n.webcg-devtools input[type=\"radio\"],\n  .webcg-devtools input[type=\"checkbox\"] {\n    box-sizing: border-box;\n    padding: 0;\n}\n.webcg-devtools input[type=\"date\"],\n  .webcg-devtools input[type=\"time\"],\n  .webcg-devtools input[type=\"datetime-local\"],\n  .webcg-devtools input[type=\"month\"] {\n    -webkit-appearance: listbox;\n}\n.webcg-devtools textarea {\n    overflow: auto;\n    resize: vertical;\n}\n.webcg-devtools fieldset {\n    min-width: 0;\n    padding: 0;\n    margin: 0;\n    border: 0;\n}\n.webcg-devtools legend {\n    display: block;\n    width: 100%;\n    max-width: 100%;\n    padding: 0;\n    margin-bottom: .5rem;\n    font-size: 1.5rem;\n    line-height: inherit;\n    color: inherit;\n    white-space: normal;\n}\n.webcg-devtools progress {\n    vertical-align: baseline;\n}\n.webcg-devtools [type=\"number\"]::-webkit-inner-spin-button,\n  .webcg-devtools [type=\"number\"]::-webkit-outer-spin-button {\n    height: auto;\n}\n.webcg-devtools [type=\"search\"] {\n    outline-offset: -2px;\n    -webkit-appearance: none;\n}\n.webcg-devtools [type=\"search\"]::-webkit-search-cancel-button,\n  .webcg-devtools [type=\"search\"]::-webkit-search-decoration {\n    -webkit-appearance: none;\n}\n.webcg-devtools ::-webkit-file-upload-button {\n    font: inherit;\n    -webkit-appearance: button;\n}\n.webcg-devtools output {\n    display: inline-block;\n}\n.webcg-devtools summary {\n    display: list-item;\n    cursor: pointer;\n}\n.webcg-devtools template {\n    display: none;\n}\n.webcg-devtools [hidden] {\n    display: none !important;\n}\n.webcg-devtools h1, .webcg-devtools h2, .webcg-devtools h3, .webcg-devtools h4, .webcg-devtools h5, .webcg-devtools h6,\n  .webcg-devtools .h1, .webcg-devtools .h2, .webcg-devtools .h3, .webcg-devtools .h4, .webcg-devtools .h5, .webcg-devtools .h6 {\n    margin-bottom: 0.5rem;\n    font-family: inherit;\n    font-weight: 500;\n    line-height: 1.2;\n    color: inherit;\n}\n.webcg-devtools h1, .webcg-devtools .h1 {\n    font-size: 2.5rem;\n}\n.webcg-devtools h2, .webcg-devtools .h2 {\n    font-size: 2rem;\n}\n.webcg-devtools h3, .webcg-devtools .h3 {\n    font-size: 1.75rem;\n}\n.webcg-devtools h4, .webcg-devtools .h4 {\n    font-size: 1.5rem;\n}\n.webcg-devtools h5, .webcg-devtools .h5 {\n    font-size: 1.25rem;\n}\n.webcg-devtools h6, .webcg-devtools .h6 {\n    font-size: 1rem;\n}\n.webcg-devtools .lead {\n    font-size: 1.25rem;\n    font-weight: 300;\n}\n.webcg-devtools .display-1 {\n    font-size: 6rem;\n    font-weight: 300;\n    line-height: 1.2;\n}\n.webcg-devtools .display-2 {\n    font-size: 5.5rem;\n    font-weight: 300;\n    line-height: 1.2;\n}\n.webcg-devtools .display-3 {\n    font-size: 4.5rem;\n    font-weight: 300;\n    line-height: 1.2;\n}\n.webcg-devtools .display-4 {\n    font-size: 3.5rem;\n    font-weight: 300;\n    line-height: 1.2;\n}\n.webcg-devtools hr {\n    margin-top: 1rem;\n    margin-bottom: 1rem;\n    border: 0;\n    border-top: 1px solid rgba(0, 0, 0, 0.1);\n}\n.webcg-devtools small,\n  .webcg-devtools .small {\n    font-size: 80%;\n    font-weight: 400;\n}\n.webcg-devtools mark,\n  .webcg-devtools .mark {\n    padding: 0.2em;\n    background-color: #fcf8e3;\n}\n.webcg-devtools .list-unstyled {\n    padding-left: 0;\n    list-style: none;\n}\n.webcg-devtools .list-inline {\n    padding-left: 0;\n    list-style: none;\n}\n.webcg-devtools .list-inline-item {\n    display: inline-block;\n}\n.webcg-devtools .list-inline-item:not(:last-child) {\n      margin-right: 0.5rem;\n}\n.webcg-devtools .initialism {\n    font-size: 90%;\n    text-transform: uppercase;\n}\n.webcg-devtools .blockquote {\n    margin-bottom: 1rem;\n    font-size: 1.25rem;\n}\n.webcg-devtools .blockquote-footer {\n    display: block;\n    font-size: 80%;\n    color: #6c757d;\n}\n.webcg-devtools .blockquote-footer::before {\n      content: \"\\2014 \\00A0\";\n}\n.webcg-devtools .img-fluid {\n    max-width: 100%;\n    height: auto;\n}\n.webcg-devtools .img-thumbnail {\n    padding: 0.25rem;\n    background-color: #fff;\n    border: 1px solid #dee2e6;\n    border-radius: 0.25rem;\n    max-width: 100%;\n    height: auto;\n}\n.webcg-devtools .figure {\n    display: inline-block;\n}\n.webcg-devtools .figure-img {\n    margin-bottom: 0.5rem;\n    line-height: 1;\n}\n.webcg-devtools .figure-caption {\n    font-size: 90%;\n    color: #6c757d;\n}\n.webcg-devtools code {\n    font-size: 87.5%;\n    color: #e83e8c;\n    word-break: break-word;\n}\na > .webcg-devtools code {\n      color: inherit;\n}\n.webcg-devtools kbd {\n    padding: 0.2rem 0.4rem;\n    font-size: 87.5%;\n    color: #fff;\n    background-color: #212529;\n    border-radius: 0.2rem;\n}\n.webcg-devtools kbd kbd {\n      padding: 0;\n      font-size: 100%;\n      font-weight: 700;\n}\n.webcg-devtools pre {\n    display: block;\n    font-size: 87.5%;\n    color: #212529;\n}\n.webcg-devtools pre code {\n      font-size: inherit;\n      color: inherit;\n      word-break: normal;\n}\n.webcg-devtools .pre-scrollable {\n    max-height: 340px;\n    overflow-y: scroll;\n}\n.webcg-devtools .container {\n    width: 100%;\n    padding-right: 15px;\n    padding-left: 15px;\n    margin-right: auto;\n    margin-left: auto;\n}\n@media (min-width: 576px) {\n.webcg-devtools .container {\n        max-width: 540px;\n}\n}\n@media (min-width: 768px) {\n.webcg-devtools .container {\n        max-width: 720px;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .container {\n        max-width: 960px;\n}\n}\n@media (min-width: 1200px) {\n.webcg-devtools .container {\n        max-width: 1140px;\n}\n}\n.webcg-devtools .container-fluid {\n    width: 100%;\n    padding-right: 15px;\n    padding-left: 15px;\n    margin-right: auto;\n    margin-left: auto;\n}\n.webcg-devtools .row {\n    display: flex;\n    flex-wrap: wrap;\n    margin-right: -15px;\n    margin-left: -15px;\n}\n.webcg-devtools .no-gutters {\n    margin-right: 0;\n    margin-left: 0;\n}\n.webcg-devtools .no-gutters > .col,\n    .webcg-devtools .no-gutters > [class*=\"col-\"] {\n      padding-right: 0;\n      padding-left: 0;\n}\n.webcg-devtools .col-1, .webcg-devtools .col-2, .webcg-devtools .col-3, .webcg-devtools .col-4, .webcg-devtools .col-5, .webcg-devtools .col-6, .webcg-devtools .col-7, .webcg-devtools .col-8, .webcg-devtools .col-9, .webcg-devtools .col-10, .webcg-devtools .col-11, .webcg-devtools .col-12, .webcg-devtools .col,\n  .webcg-devtools .col-auto, .webcg-devtools .col-sm-1, .webcg-devtools .col-sm-2, .webcg-devtools .col-sm-3, .webcg-devtools .col-sm-4, .webcg-devtools .col-sm-5, .webcg-devtools .col-sm-6, .webcg-devtools .col-sm-7, .webcg-devtools .col-sm-8, .webcg-devtools .col-sm-9, .webcg-devtools .col-sm-10, .webcg-devtools .col-sm-11, .webcg-devtools .col-sm-12, .webcg-devtools .col-sm,\n  .webcg-devtools .col-sm-auto, .webcg-devtools .col-md-1, .webcg-devtools .col-md-2, .webcg-devtools .col-md-3, .webcg-devtools .col-md-4, .webcg-devtools .col-md-5, .webcg-devtools .col-md-6, .webcg-devtools .col-md-7, .webcg-devtools .col-md-8, .webcg-devtools .col-md-9, .webcg-devtools .col-md-10, .webcg-devtools .col-md-11, .webcg-devtools .col-md-12, .webcg-devtools .col-md,\n  .webcg-devtools .col-md-auto, .webcg-devtools .col-lg-1, .webcg-devtools .col-lg-2, .webcg-devtools .col-lg-3, .webcg-devtools .col-lg-4, .webcg-devtools .col-lg-5, .webcg-devtools .col-lg-6, .webcg-devtools .col-lg-7, .webcg-devtools .col-lg-8, .webcg-devtools .col-lg-9, .webcg-devtools .col-lg-10, .webcg-devtools .col-lg-11, .webcg-devtools .col-lg-12, .webcg-devtools .col-lg,\n  .webcg-devtools .col-lg-auto, .webcg-devtools .col-xl-1, .webcg-devtools .col-xl-2, .webcg-devtools .col-xl-3, .webcg-devtools .col-xl-4, .webcg-devtools .col-xl-5, .webcg-devtools .col-xl-6, .webcg-devtools .col-xl-7, .webcg-devtools .col-xl-8, .webcg-devtools .col-xl-9, .webcg-devtools .col-xl-10, .webcg-devtools .col-xl-11, .webcg-devtools .col-xl-12, .webcg-devtools .col-xl,\n  .webcg-devtools .col-xl-auto {\n    position: relative;\n    width: 100%;\n    min-height: 1px;\n    padding-right: 15px;\n    padding-left: 15px;\n}\n.webcg-devtools .col {\n    flex-basis: 0;\n    flex-grow: 1;\n    max-width: 100%;\n}\n.webcg-devtools .col-auto {\n    flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.webcg-devtools .col-1 {\n    flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.webcg-devtools .col-2 {\n    flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.webcg-devtools .col-3 {\n    flex: 0 0 25%;\n    max-width: 25%;\n}\n.webcg-devtools .col-4 {\n    flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.webcg-devtools .col-5 {\n    flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.webcg-devtools .col-6 {\n    flex: 0 0 50%;\n    max-width: 50%;\n}\n.webcg-devtools .col-7 {\n    flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.webcg-devtools .col-8 {\n    flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.webcg-devtools .col-9 {\n    flex: 0 0 75%;\n    max-width: 75%;\n}\n.webcg-devtools .col-10 {\n    flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.webcg-devtools .col-11 {\n    flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.webcg-devtools .col-12 {\n    flex: 0 0 100%;\n    max-width: 100%;\n}\n.webcg-devtools .order-first {\n    order: -1;\n}\n.webcg-devtools .order-last {\n    order: 13;\n}\n.webcg-devtools .order-0 {\n    order: 0;\n}\n.webcg-devtools .order-1 {\n    order: 1;\n}\n.webcg-devtools .order-2 {\n    order: 2;\n}\n.webcg-devtools .order-3 {\n    order: 3;\n}\n.webcg-devtools .order-4 {\n    order: 4;\n}\n.webcg-devtools .order-5 {\n    order: 5;\n}\n.webcg-devtools .order-6 {\n    order: 6;\n}\n.webcg-devtools .order-7 {\n    order: 7;\n}\n.webcg-devtools .order-8 {\n    order: 8;\n}\n.webcg-devtools .order-9 {\n    order: 9;\n}\n.webcg-devtools .order-10 {\n    order: 10;\n}\n.webcg-devtools .order-11 {\n    order: 11;\n}\n.webcg-devtools .order-12 {\n    order: 12;\n}\n.webcg-devtools .offset-1 {\n    margin-left: 8.33333%;\n}\n.webcg-devtools .offset-2 {\n    margin-left: 16.66667%;\n}\n.webcg-devtools .offset-3 {\n    margin-left: 25%;\n}\n.webcg-devtools .offset-4 {\n    margin-left: 33.33333%;\n}\n.webcg-devtools .offset-5 {\n    margin-left: 41.66667%;\n}\n.webcg-devtools .offset-6 {\n    margin-left: 50%;\n}\n.webcg-devtools .offset-7 {\n    margin-left: 58.33333%;\n}\n.webcg-devtools .offset-8 {\n    margin-left: 66.66667%;\n}\n.webcg-devtools .offset-9 {\n    margin-left: 75%;\n}\n.webcg-devtools .offset-10 {\n    margin-left: 83.33333%;\n}\n.webcg-devtools .offset-11 {\n    margin-left: 91.66667%;\n}\n@media (min-width: 576px) {\n.webcg-devtools .col-sm {\n      flex-basis: 0;\n      flex-grow: 1;\n      max-width: 100%;\n}\n.webcg-devtools .col-sm-auto {\n      flex: 0 0 auto;\n      width: auto;\n      max-width: none;\n}\n.webcg-devtools .col-sm-1 {\n      flex: 0 0 8.33333%;\n      max-width: 8.33333%;\n}\n.webcg-devtools .col-sm-2 {\n      flex: 0 0 16.66667%;\n      max-width: 16.66667%;\n}\n.webcg-devtools .col-sm-3 {\n      flex: 0 0 25%;\n      max-width: 25%;\n}\n.webcg-devtools .col-sm-4 {\n      flex: 0 0 33.33333%;\n      max-width: 33.33333%;\n}\n.webcg-devtools .col-sm-5 {\n      flex: 0 0 41.66667%;\n      max-width: 41.66667%;\n}\n.webcg-devtools .col-sm-6 {\n      flex: 0 0 50%;\n      max-width: 50%;\n}\n.webcg-devtools .col-sm-7 {\n      flex: 0 0 58.33333%;\n      max-width: 58.33333%;\n}\n.webcg-devtools .col-sm-8 {\n      flex: 0 0 66.66667%;\n      max-width: 66.66667%;\n}\n.webcg-devtools .col-sm-9 {\n      flex: 0 0 75%;\n      max-width: 75%;\n}\n.webcg-devtools .col-sm-10 {\n      flex: 0 0 83.33333%;\n      max-width: 83.33333%;\n}\n.webcg-devtools .col-sm-11 {\n      flex: 0 0 91.66667%;\n      max-width: 91.66667%;\n}\n.webcg-devtools .col-sm-12 {\n      flex: 0 0 100%;\n      max-width: 100%;\n}\n.webcg-devtools .order-sm-first {\n      order: -1;\n}\n.webcg-devtools .order-sm-last {\n      order: 13;\n}\n.webcg-devtools .order-sm-0 {\n      order: 0;\n}\n.webcg-devtools .order-sm-1 {\n      order: 1;\n}\n.webcg-devtools .order-sm-2 {\n      order: 2;\n}\n.webcg-devtools .order-sm-3 {\n      order: 3;\n}\n.webcg-devtools .order-sm-4 {\n      order: 4;\n}\n.webcg-devtools .order-sm-5 {\n      order: 5;\n}\n.webcg-devtools .order-sm-6 {\n      order: 6;\n}\n.webcg-devtools .order-sm-7 {\n      order: 7;\n}\n.webcg-devtools .order-sm-8 {\n      order: 8;\n}\n.webcg-devtools .order-sm-9 {\n      order: 9;\n}\n.webcg-devtools .order-sm-10 {\n      order: 10;\n}\n.webcg-devtools .order-sm-11 {\n      order: 11;\n}\n.webcg-devtools .order-sm-12 {\n      order: 12;\n}\n.webcg-devtools .offset-sm-0 {\n      margin-left: 0;\n}\n.webcg-devtools .offset-sm-1 {\n      margin-left: 8.33333%;\n}\n.webcg-devtools .offset-sm-2 {\n      margin-left: 16.66667%;\n}\n.webcg-devtools .offset-sm-3 {\n      margin-left: 25%;\n}\n.webcg-devtools .offset-sm-4 {\n      margin-left: 33.33333%;\n}\n.webcg-devtools .offset-sm-5 {\n      margin-left: 41.66667%;\n}\n.webcg-devtools .offset-sm-6 {\n      margin-left: 50%;\n}\n.webcg-devtools .offset-sm-7 {\n      margin-left: 58.33333%;\n}\n.webcg-devtools .offset-sm-8 {\n      margin-left: 66.66667%;\n}\n.webcg-devtools .offset-sm-9 {\n      margin-left: 75%;\n}\n.webcg-devtools .offset-sm-10 {\n      margin-left: 83.33333%;\n}\n.webcg-devtools .offset-sm-11 {\n      margin-left: 91.66667%;\n}\n}\n@media (min-width: 768px) {\n.webcg-devtools .col-md {\n      flex-basis: 0;\n      flex-grow: 1;\n      max-width: 100%;\n}\n.webcg-devtools .col-md-auto {\n      flex: 0 0 auto;\n      width: auto;\n      max-width: none;\n}\n.webcg-devtools .col-md-1 {\n      flex: 0 0 8.33333%;\n      max-width: 8.33333%;\n}\n.webcg-devtools .col-md-2 {\n      flex: 0 0 16.66667%;\n      max-width: 16.66667%;\n}\n.webcg-devtools .col-md-3 {\n      flex: 0 0 25%;\n      max-width: 25%;\n}\n.webcg-devtools .col-md-4 {\n      flex: 0 0 33.33333%;\n      max-width: 33.33333%;\n}\n.webcg-devtools .col-md-5 {\n      flex: 0 0 41.66667%;\n      max-width: 41.66667%;\n}\n.webcg-devtools .col-md-6 {\n      flex: 0 0 50%;\n      max-width: 50%;\n}\n.webcg-devtools .col-md-7 {\n      flex: 0 0 58.33333%;\n      max-width: 58.33333%;\n}\n.webcg-devtools .col-md-8 {\n      flex: 0 0 66.66667%;\n      max-width: 66.66667%;\n}\n.webcg-devtools .col-md-9 {\n      flex: 0 0 75%;\n      max-width: 75%;\n}\n.webcg-devtools .col-md-10 {\n      flex: 0 0 83.33333%;\n      max-width: 83.33333%;\n}\n.webcg-devtools .col-md-11 {\n      flex: 0 0 91.66667%;\n      max-width: 91.66667%;\n}\n.webcg-devtools .col-md-12 {\n      flex: 0 0 100%;\n      max-width: 100%;\n}\n.webcg-devtools .order-md-first {\n      order: -1;\n}\n.webcg-devtools .order-md-last {\n      order: 13;\n}\n.webcg-devtools .order-md-0 {\n      order: 0;\n}\n.webcg-devtools .order-md-1 {\n      order: 1;\n}\n.webcg-devtools .order-md-2 {\n      order: 2;\n}\n.webcg-devtools .order-md-3 {\n      order: 3;\n}\n.webcg-devtools .order-md-4 {\n      order: 4;\n}\n.webcg-devtools .order-md-5 {\n      order: 5;\n}\n.webcg-devtools .order-md-6 {\n      order: 6;\n}\n.webcg-devtools .order-md-7 {\n      order: 7;\n}\n.webcg-devtools .order-md-8 {\n      order: 8;\n}\n.webcg-devtools .order-md-9 {\n      order: 9;\n}\n.webcg-devtools .order-md-10 {\n      order: 10;\n}\n.webcg-devtools .order-md-11 {\n      order: 11;\n}\n.webcg-devtools .order-md-12 {\n      order: 12;\n}\n.webcg-devtools .offset-md-0 {\n      margin-left: 0;\n}\n.webcg-devtools .offset-md-1 {\n      margin-left: 8.33333%;\n}\n.webcg-devtools .offset-md-2 {\n      margin-left: 16.66667%;\n}\n.webcg-devtools .offset-md-3 {\n      margin-left: 25%;\n}\n.webcg-devtools .offset-md-4 {\n      margin-left: 33.33333%;\n}\n.webcg-devtools .offset-md-5 {\n      margin-left: 41.66667%;\n}\n.webcg-devtools .offset-md-6 {\n      margin-left: 50%;\n}\n.webcg-devtools .offset-md-7 {\n      margin-left: 58.33333%;\n}\n.webcg-devtools .offset-md-8 {\n      margin-left: 66.66667%;\n}\n.webcg-devtools .offset-md-9 {\n      margin-left: 75%;\n}\n.webcg-devtools .offset-md-10 {\n      margin-left: 83.33333%;\n}\n.webcg-devtools .offset-md-11 {\n      margin-left: 91.66667%;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .col-lg {\n      flex-basis: 0;\n      flex-grow: 1;\n      max-width: 100%;\n}\n.webcg-devtools .col-lg-auto {\n      flex: 0 0 auto;\n      width: auto;\n      max-width: none;\n}\n.webcg-devtools .col-lg-1 {\n      flex: 0 0 8.33333%;\n      max-width: 8.33333%;\n}\n.webcg-devtools .col-lg-2 {\n      flex: 0 0 16.66667%;\n      max-width: 16.66667%;\n}\n.webcg-devtools .col-lg-3 {\n      flex: 0 0 25%;\n      max-width: 25%;\n}\n.webcg-devtools .col-lg-4 {\n      flex: 0 0 33.33333%;\n      max-width: 33.33333%;\n}\n.webcg-devtools .col-lg-5 {\n      flex: 0 0 41.66667%;\n      max-width: 41.66667%;\n}\n.webcg-devtools .col-lg-6 {\n      flex: 0 0 50%;\n      max-width: 50%;\n}\n.webcg-devtools .col-lg-7 {\n      flex: 0 0 58.33333%;\n      max-width: 58.33333%;\n}\n.webcg-devtools .col-lg-8 {\n      flex: 0 0 66.66667%;\n      max-width: 66.66667%;\n}\n.webcg-devtools .col-lg-9 {\n      flex: 0 0 75%;\n      max-width: 75%;\n}\n.webcg-devtools .col-lg-10 {\n      flex: 0 0 83.33333%;\n      max-width: 83.33333%;\n}\n.webcg-devtools .col-lg-11 {\n      flex: 0 0 91.66667%;\n      max-width: 91.66667%;\n}\n.webcg-devtools .col-lg-12 {\n      flex: 0 0 100%;\n      max-width: 100%;\n}\n.webcg-devtools .order-lg-first {\n      order: -1;\n}\n.webcg-devtools .order-lg-last {\n      order: 13;\n}\n.webcg-devtools .order-lg-0 {\n      order: 0;\n}\n.webcg-devtools .order-lg-1 {\n      order: 1;\n}\n.webcg-devtools .order-lg-2 {\n      order: 2;\n}\n.webcg-devtools .order-lg-3 {\n      order: 3;\n}\n.webcg-devtools .order-lg-4 {\n      order: 4;\n}\n.webcg-devtools .order-lg-5 {\n      order: 5;\n}\n.webcg-devtools .order-lg-6 {\n      order: 6;\n}\n.webcg-devtools .order-lg-7 {\n      order: 7;\n}\n.webcg-devtools .order-lg-8 {\n      order: 8;\n}\n.webcg-devtools .order-lg-9 {\n      order: 9;\n}\n.webcg-devtools .order-lg-10 {\n      order: 10;\n}\n.webcg-devtools .order-lg-11 {\n      order: 11;\n}\n.webcg-devtools .order-lg-12 {\n      order: 12;\n}\n.webcg-devtools .offset-lg-0 {\n      margin-left: 0;\n}\n.webcg-devtools .offset-lg-1 {\n      margin-left: 8.33333%;\n}\n.webcg-devtools .offset-lg-2 {\n      margin-left: 16.66667%;\n}\n.webcg-devtools .offset-lg-3 {\n      margin-left: 25%;\n}\n.webcg-devtools .offset-lg-4 {\n      margin-left: 33.33333%;\n}\n.webcg-devtools .offset-lg-5 {\n      margin-left: 41.66667%;\n}\n.webcg-devtools .offset-lg-6 {\n      margin-left: 50%;\n}\n.webcg-devtools .offset-lg-7 {\n      margin-left: 58.33333%;\n}\n.webcg-devtools .offset-lg-8 {\n      margin-left: 66.66667%;\n}\n.webcg-devtools .offset-lg-9 {\n      margin-left: 75%;\n}\n.webcg-devtools .offset-lg-10 {\n      margin-left: 83.33333%;\n}\n.webcg-devtools .offset-lg-11 {\n      margin-left: 91.66667%;\n}\n}\n@media (min-width: 1200px) {\n.webcg-devtools .col-xl {\n      flex-basis: 0;\n      flex-grow: 1;\n      max-width: 100%;\n}\n.webcg-devtools .col-xl-auto {\n      flex: 0 0 auto;\n      width: auto;\n      max-width: none;\n}\n.webcg-devtools .col-xl-1 {\n      flex: 0 0 8.33333%;\n      max-width: 8.33333%;\n}\n.webcg-devtools .col-xl-2 {\n      flex: 0 0 16.66667%;\n      max-width: 16.66667%;\n}\n.webcg-devtools .col-xl-3 {\n      flex: 0 0 25%;\n      max-width: 25%;\n}\n.webcg-devtools .col-xl-4 {\n      flex: 0 0 33.33333%;\n      max-width: 33.33333%;\n}\n.webcg-devtools .col-xl-5 {\n      flex: 0 0 41.66667%;\n      max-width: 41.66667%;\n}\n.webcg-devtools .col-xl-6 {\n      flex: 0 0 50%;\n      max-width: 50%;\n}\n.webcg-devtools .col-xl-7 {\n      flex: 0 0 58.33333%;\n      max-width: 58.33333%;\n}\n.webcg-devtools .col-xl-8 {\n      flex: 0 0 66.66667%;\n      max-width: 66.66667%;\n}\n.webcg-devtools .col-xl-9 {\n      flex: 0 0 75%;\n      max-width: 75%;\n}\n.webcg-devtools .col-xl-10 {\n      flex: 0 0 83.33333%;\n      max-width: 83.33333%;\n}\n.webcg-devtools .col-xl-11 {\n      flex: 0 0 91.66667%;\n      max-width: 91.66667%;\n}\n.webcg-devtools .col-xl-12 {\n      flex: 0 0 100%;\n      max-width: 100%;\n}\n.webcg-devtools .order-xl-first {\n      order: -1;\n}\n.webcg-devtools .order-xl-last {\n      order: 13;\n}\n.webcg-devtools .order-xl-0 {\n      order: 0;\n}\n.webcg-devtools .order-xl-1 {\n      order: 1;\n}\n.webcg-devtools .order-xl-2 {\n      order: 2;\n}\n.webcg-devtools .order-xl-3 {\n      order: 3;\n}\n.webcg-devtools .order-xl-4 {\n      order: 4;\n}\n.webcg-devtools .order-xl-5 {\n      order: 5;\n}\n.webcg-devtools .order-xl-6 {\n      order: 6;\n}\n.webcg-devtools .order-xl-7 {\n      order: 7;\n}\n.webcg-devtools .order-xl-8 {\n      order: 8;\n}\n.webcg-devtools .order-xl-9 {\n      order: 9;\n}\n.webcg-devtools .order-xl-10 {\n      order: 10;\n}\n.webcg-devtools .order-xl-11 {\n      order: 11;\n}\n.webcg-devtools .order-xl-12 {\n      order: 12;\n}\n.webcg-devtools .offset-xl-0 {\n      margin-left: 0;\n}\n.webcg-devtools .offset-xl-1 {\n      margin-left: 8.33333%;\n}\n.webcg-devtools .offset-xl-2 {\n      margin-left: 16.66667%;\n}\n.webcg-devtools .offset-xl-3 {\n      margin-left: 25%;\n}\n.webcg-devtools .offset-xl-4 {\n      margin-left: 33.33333%;\n}\n.webcg-devtools .offset-xl-5 {\n      margin-left: 41.66667%;\n}\n.webcg-devtools .offset-xl-6 {\n      margin-left: 50%;\n}\n.webcg-devtools .offset-xl-7 {\n      margin-left: 58.33333%;\n}\n.webcg-devtools .offset-xl-8 {\n      margin-left: 66.66667%;\n}\n.webcg-devtools .offset-xl-9 {\n      margin-left: 75%;\n}\n.webcg-devtools .offset-xl-10 {\n      margin-left: 83.33333%;\n}\n.webcg-devtools .offset-xl-11 {\n      margin-left: 91.66667%;\n}\n}\n.webcg-devtools .table {\n    width: 100%;\n    margin-bottom: 1rem;\n    background-color: transparent;\n}\n.webcg-devtools .table th,\n    .webcg-devtools .table td {\n      padding: 0.75rem;\n      vertical-align: top;\n      border-top: 1px solid #dee2e6;\n}\n.webcg-devtools .table thead th {\n      vertical-align: bottom;\n      border-bottom: 2px solid #dee2e6;\n}\n.webcg-devtools .table tbody + tbody {\n      border-top: 2px solid #dee2e6;\n}\n.webcg-devtools .table .table {\n      background-color: #fff;\n}\n.webcg-devtools .table-sm th,\n  .webcg-devtools .table-sm td {\n    padding: 0.3rem;\n}\n.webcg-devtools .table-bordered {\n    border: 1px solid #dee2e6;\n}\n.webcg-devtools .table-bordered th,\n    .webcg-devtools .table-bordered td {\n      border: 1px solid #dee2e6;\n}\n.webcg-devtools .table-bordered thead th,\n    .webcg-devtools .table-bordered thead td {\n      border-bottom-width: 2px;\n}\n.webcg-devtools .table-borderless th,\n  .webcg-devtools .table-borderless td,\n  .webcg-devtools .table-borderless thead th,\n  .webcg-devtools .table-borderless tbody + tbody {\n    border: 0;\n}\n.webcg-devtools .table-striped tbody tr:nth-of-type(odd) {\n    background-color: rgba(0, 0, 0, 0.05);\n}\n.webcg-devtools .table-hover tbody tr:hover {\n    background-color: rgba(0, 0, 0, 0.075);\n}\n.webcg-devtools .table-primary,\n  .webcg-devtools .table-primary > th,\n  .webcg-devtools .table-primary > td {\n    background-color: #b8daff;\n}\n.webcg-devtools .table-hover .table-primary:hover {\n    background-color: #9fcdff;\n}\n.webcg-devtools .table-hover .table-primary:hover > td,\n    .webcg-devtools .table-hover .table-primary:hover > th {\n      background-color: #9fcdff;\n}\n.webcg-devtools .table-secondary,\n  .webcg-devtools .table-secondary > th,\n  .webcg-devtools .table-secondary > td {\n    background-color: #d6d8db;\n}\n.webcg-devtools .table-hover .table-secondary:hover {\n    background-color: #c8cbcf;\n}\n.webcg-devtools .table-hover .table-secondary:hover > td,\n    .webcg-devtools .table-hover .table-secondary:hover > th {\n      background-color: #c8cbcf;\n}\n.webcg-devtools .table-success,\n  .webcg-devtools .table-success > th,\n  .webcg-devtools .table-success > td {\n    background-color: #c3e6cb;\n}\n.webcg-devtools .table-hover .table-success:hover {\n    background-color: #b1dfbb;\n}\n.webcg-devtools .table-hover .table-success:hover > td,\n    .webcg-devtools .table-hover .table-success:hover > th {\n      background-color: #b1dfbb;\n}\n.webcg-devtools .table-info,\n  .webcg-devtools .table-info > th,\n  .webcg-devtools .table-info > td {\n    background-color: #bee5eb;\n}\n.webcg-devtools .table-hover .table-info:hover {\n    background-color: #abdde5;\n}\n.webcg-devtools .table-hover .table-info:hover > td,\n    .webcg-devtools .table-hover .table-info:hover > th {\n      background-color: #abdde5;\n}\n.webcg-devtools .table-warning,\n  .webcg-devtools .table-warning > th,\n  .webcg-devtools .table-warning > td {\n    background-color: #ffeeba;\n}\n.webcg-devtools .table-hover .table-warning:hover {\n    background-color: #ffe8a1;\n}\n.webcg-devtools .table-hover .table-warning:hover > td,\n    .webcg-devtools .table-hover .table-warning:hover > th {\n      background-color: #ffe8a1;\n}\n.webcg-devtools .table-danger,\n  .webcg-devtools .table-danger > th,\n  .webcg-devtools .table-danger > td {\n    background-color: #f5c6cb;\n}\n.webcg-devtools .table-hover .table-danger:hover {\n    background-color: #f1b0b7;\n}\n.webcg-devtools .table-hover .table-danger:hover > td,\n    .webcg-devtools .table-hover .table-danger:hover > th {\n      background-color: #f1b0b7;\n}\n.webcg-devtools .table-light,\n  .webcg-devtools .table-light > th,\n  .webcg-devtools .table-light > td {\n    background-color: #fdfdfe;\n}\n.webcg-devtools .table-hover .table-light:hover {\n    background-color: #ececf6;\n}\n.webcg-devtools .table-hover .table-light:hover > td,\n    .webcg-devtools .table-hover .table-light:hover > th {\n      background-color: #ececf6;\n}\n.webcg-devtools .table-dark,\n  .webcg-devtools .table-dark > th,\n  .webcg-devtools .table-dark > td {\n    background-color: #c6c8ca;\n}\n.webcg-devtools .table-hover .table-dark:hover {\n    background-color: #b9bbbe;\n}\n.webcg-devtools .table-hover .table-dark:hover > td,\n    .webcg-devtools .table-hover .table-dark:hover > th {\n      background-color: #b9bbbe;\n}\n.webcg-devtools .table-active,\n  .webcg-devtools .table-active > th,\n  .webcg-devtools .table-active > td {\n    background-color: rgba(0, 0, 0, 0.075);\n}\n.webcg-devtools .table-hover .table-active:hover {\n    background-color: rgba(0, 0, 0, 0.075);\n}\n.webcg-devtools .table-hover .table-active:hover > td,\n    .webcg-devtools .table-hover .table-active:hover > th {\n      background-color: rgba(0, 0, 0, 0.075);\n}\n.webcg-devtools .table .thead-dark th {\n    color: #fff;\n    background-color: #212529;\n    border-color: #32383e;\n}\n.webcg-devtools .table .thead-light th {\n    color: #495057;\n    background-color: #e9ecef;\n    border-color: #dee2e6;\n}\n.webcg-devtools .table-dark {\n    color: #fff;\n    background-color: #212529;\n}\n.webcg-devtools .table-dark th,\n    .webcg-devtools .table-dark td,\n    .webcg-devtools .table-dark thead th {\n      border-color: #32383e;\n}\n.webcg-devtools .table-dark.table-bordered {\n      border: 0;\n}\n.webcg-devtools .table-dark.table-striped tbody tr:nth-of-type(odd) {\n      background-color: rgba(255, 255, 255, 0.05);\n}\n.webcg-devtools .table-dark.table-hover tbody tr:hover {\n      background-color: rgba(255, 255, 255, 0.075);\n}\n@media (max-width: 575.98px) {\n.webcg-devtools .table-responsive-sm {\n      display: block;\n      width: 100%;\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n      -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.webcg-devtools .table-responsive-sm > .table-bordered {\n        border: 0;\n}\n}\n@media (max-width: 767.98px) {\n.webcg-devtools .table-responsive-md {\n      display: block;\n      width: 100%;\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n      -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.webcg-devtools .table-responsive-md > .table-bordered {\n        border: 0;\n}\n}\n@media (max-width: 991.98px) {\n.webcg-devtools .table-responsive-lg {\n      display: block;\n      width: 100%;\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n      -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.webcg-devtools .table-responsive-lg > .table-bordered {\n        border: 0;\n}\n}\n@media (max-width: 1199.98px) {\n.webcg-devtools .table-responsive-xl {\n      display: block;\n      width: 100%;\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n      -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.webcg-devtools .table-responsive-xl > .table-bordered {\n        border: 0;\n}\n}\n.webcg-devtools .table-responsive {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.webcg-devtools .table-responsive > .table-bordered {\n      border: 0;\n}\n.webcg-devtools .form-control {\n    display: block;\n    width: 100%;\n    height: calc(2.25rem + 2px);\n    padding: 0.375rem 0.75rem;\n    font-size: 1rem;\n    line-height: 1.5;\n    color: #495057;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem;\n    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .form-control {\n        transition: none;\n}\n}\n.webcg-devtools .form-control::-ms-expand {\n      background-color: transparent;\n      border: 0;\n}\n.webcg-devtools .form-control:focus {\n      color: #495057;\n      background-color: #fff;\n      border-color: #80bdff;\n      outline: 0;\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.webcg-devtools .form-control::placeholder {\n      color: #6c757d;\n      opacity: 1;\n}\n.webcg-devtools .form-control:disabled, .webcg-devtools .form-control[readonly] {\n      background-color: #e9ecef;\n      opacity: 1;\n}\n.webcg-devtools select.form-control:focus::-ms-value {\n    color: #495057;\n    background-color: #fff;\n}\n.webcg-devtools .form-control-file,\n  .webcg-devtools .form-control-range {\n    display: block;\n    width: 100%;\n}\n.webcg-devtools .col-form-label {\n    padding-top: calc(0.375rem + 1px);\n    padding-bottom: calc(0.375rem + 1px);\n    margin-bottom: 0;\n    font-size: inherit;\n    line-height: 1.5;\n}\n.webcg-devtools .col-form-label-lg {\n    padding-top: calc(0.5rem + 1px);\n    padding-bottom: calc(0.5rem + 1px);\n    font-size: 1.25rem;\n    line-height: 1.5;\n}\n.webcg-devtools .col-form-label-sm {\n    padding-top: calc(0.25rem + 1px);\n    padding-bottom: calc(0.25rem + 1px);\n    font-size: 0.875rem;\n    line-height: 1.5;\n}\n.webcg-devtools .form-control-plaintext {\n    display: block;\n    width: 100%;\n    padding-top: 0.375rem;\n    padding-bottom: 0.375rem;\n    margin-bottom: 0;\n    line-height: 1.5;\n    color: #212529;\n    background-color: transparent;\n    border: solid transparent;\n    border-width: 1px 0;\n}\n.webcg-devtools .form-control-plaintext.form-control-sm, .webcg-devtools .form-control-plaintext.form-control-lg {\n      padding-right: 0;\n      padding-left: 0;\n}\n.webcg-devtools .form-control-sm {\n    height: calc(1.8125rem + 2px);\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    border-radius: 0.2rem;\n}\n.webcg-devtools .form-control-lg {\n    height: calc(2.875rem + 2px);\n    padding: 0.5rem 1rem;\n    font-size: 1.25rem;\n    line-height: 1.5;\n    border-radius: 0.3rem;\n}\n.webcg-devtools select.form-control[size], .webcg-devtools select.form-control[multiple] {\n    height: auto;\n}\n.webcg-devtools textarea.form-control {\n    height: auto;\n}\n.webcg-devtools .form-group {\n    margin-bottom: 1rem;\n}\n.webcg-devtools .form-text {\n    display: block;\n    margin-top: 0.25rem;\n}\n.webcg-devtools .form-row {\n    display: flex;\n    flex-wrap: wrap;\n    margin-right: -5px;\n    margin-left: -5px;\n}\n.webcg-devtools .form-row > .col,\n    .webcg-devtools .form-row > [class*=\"col-\"] {\n      padding-right: 5px;\n      padding-left: 5px;\n}\n.webcg-devtools .form-check {\n    position: relative;\n    display: block;\n    padding-left: 1.25rem;\n}\n.webcg-devtools .form-check-input {\n    position: absolute;\n    margin-top: 0.3rem;\n    margin-left: -1.25rem;\n}\n.webcg-devtools .form-check-input:disabled ~ .form-check-label {\n      color: #6c757d;\n}\n.webcg-devtools .form-check-label {\n    margin-bottom: 0;\n}\n.webcg-devtools .form-check-inline {\n    display: inline-flex;\n    align-items: center;\n    padding-left: 0;\n    margin-right: 0.75rem;\n}\n.webcg-devtools .form-check-inline .form-check-input {\n      position: static;\n      margin-top: 0;\n      margin-right: 0.3125rem;\n      margin-left: 0;\n}\n.webcg-devtools .valid-feedback {\n    display: none;\n    width: 100%;\n    margin-top: 0.25rem;\n    font-size: 80%;\n    color: #28a745;\n}\n.webcg-devtools .valid-tooltip {\n    position: absolute;\n    top: 100%;\n    z-index: 5;\n    display: none;\n    max-width: 100%;\n    padding: 0.25rem 0.5rem;\n    margin-top: .1rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    color: #fff;\n    background-color: rgba(40, 167, 69, 0.9);\n    border-radius: 0.25rem;\n}\n.was-validated .webcg-devtools .form-control:valid, .webcg-devtools .form-control.is-valid, .was-validated\n  .webcg-devtools .custom-select:valid,\n  .webcg-devtools .custom-select.is-valid {\n    border-color: #28a745;\n}\n.was-validated .webcg-devtools .form-control:valid:focus, .webcg-devtools .form-control.is-valid:focus, .was-validated\n    .webcg-devtools .custom-select:valid:focus,\n    .webcg-devtools .custom-select.is-valid:focus {\n      border-color: #28a745;\n      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);\n}\n.was-validated .webcg-devtools .form-control:valid ~ .valid-feedback,\n    .was-validated .webcg-devtools .form-control:valid ~ .valid-tooltip, .webcg-devtools .form-control.is-valid ~ .valid-feedback,\n    .webcg-devtools .form-control.is-valid ~ .valid-tooltip, .was-validated\n    .webcg-devtools .custom-select:valid ~ .valid-feedback,\n    .was-validated\n    .webcg-devtools .custom-select:valid ~ .valid-tooltip,\n    .webcg-devtools .custom-select.is-valid ~ .valid-feedback,\n    .webcg-devtools .custom-select.is-valid ~ .valid-tooltip {\n      display: block;\n}\n.was-validated .webcg-devtools .form-control-file:valid ~ .valid-feedback,\n  .was-validated .webcg-devtools .form-control-file:valid ~ .valid-tooltip, .webcg-devtools .form-control-file.is-valid ~ .valid-feedback,\n  .webcg-devtools .form-control-file.is-valid ~ .valid-tooltip {\n    display: block;\n}\n.was-validated .webcg-devtools .form-check-input:valid ~ .form-check-label, .webcg-devtools .form-check-input.is-valid ~ .form-check-label {\n    color: #28a745;\n}\n.was-validated .webcg-devtools .form-check-input:valid ~ .valid-feedback,\n  .was-validated .webcg-devtools .form-check-input:valid ~ .valid-tooltip, .webcg-devtools .form-check-input.is-valid ~ .valid-feedback,\n  .webcg-devtools .form-check-input.is-valid ~ .valid-tooltip {\n    display: block;\n}\n.was-validated .webcg-devtools .custom-control-input:valid ~ .custom-control-label, .webcg-devtools .custom-control-input.is-valid ~ .custom-control-label {\n    color: #28a745;\n}\n.was-validated .webcg-devtools .custom-control-input:valid ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-valid ~ .custom-control-label::before {\n      background-color: #71dd8a;\n}\n.was-validated .webcg-devtools .custom-control-input:valid ~ .valid-feedback,\n  .was-validated .webcg-devtools .custom-control-input:valid ~ .valid-tooltip, .webcg-devtools .custom-control-input.is-valid ~ .valid-feedback,\n  .webcg-devtools .custom-control-input.is-valid ~ .valid-tooltip {\n    display: block;\n}\n.was-validated .webcg-devtools .custom-control-input:valid:checked ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-valid:checked ~ .custom-control-label::before {\n    background-color: #34ce57;\n}\n.was-validated .webcg-devtools .custom-control-input:valid:focus ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-valid:focus ~ .custom-control-label::before {\n    box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(40, 167, 69, 0.25);\n}\n.was-validated .webcg-devtools .custom-file-input:valid ~ .custom-file-label, .webcg-devtools .custom-file-input.is-valid ~ .custom-file-label {\n    border-color: #28a745;\n}\n.was-validated .webcg-devtools .custom-file-input:valid ~ .custom-file-label::after, .webcg-devtools .custom-file-input.is-valid ~ .custom-file-label::after {\n      border-color: inherit;\n}\n.was-validated .webcg-devtools .custom-file-input:valid ~ .valid-feedback,\n  .was-validated .webcg-devtools .custom-file-input:valid ~ .valid-tooltip, .webcg-devtools .custom-file-input.is-valid ~ .valid-feedback,\n  .webcg-devtools .custom-file-input.is-valid ~ .valid-tooltip {\n    display: block;\n}\n.was-validated .webcg-devtools .custom-file-input:valid:focus ~ .custom-file-label, .webcg-devtools .custom-file-input.is-valid:focus ~ .custom-file-label {\n    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);\n}\n.webcg-devtools .invalid-feedback {\n    display: none;\n    width: 100%;\n    margin-top: 0.25rem;\n    font-size: 80%;\n    color: #dc3545;\n}\n.webcg-devtools .invalid-tooltip {\n    position: absolute;\n    top: 100%;\n    z-index: 5;\n    display: none;\n    max-width: 100%;\n    padding: 0.25rem 0.5rem;\n    margin-top: .1rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    color: #fff;\n    background-color: rgba(220, 53, 69, 0.9);\n    border-radius: 0.25rem;\n}\n.was-validated .webcg-devtools .form-control:invalid, .webcg-devtools .form-control.is-invalid, .was-validated\n  .webcg-devtools .custom-select:invalid,\n  .webcg-devtools .custom-select.is-invalid {\n    border-color: #dc3545;\n}\n.was-validated .webcg-devtools .form-control:invalid:focus, .webcg-devtools .form-control.is-invalid:focus, .was-validated\n    .webcg-devtools .custom-select:invalid:focus,\n    .webcg-devtools .custom-select.is-invalid:focus {\n      border-color: #dc3545;\n      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);\n}\n.was-validated .webcg-devtools .form-control:invalid ~ .invalid-feedback,\n    .was-validated .webcg-devtools .form-control:invalid ~ .invalid-tooltip, .webcg-devtools .form-control.is-invalid ~ .invalid-feedback,\n    .webcg-devtools .form-control.is-invalid ~ .invalid-tooltip, .was-validated\n    .webcg-devtools .custom-select:invalid ~ .invalid-feedback,\n    .was-validated\n    .webcg-devtools .custom-select:invalid ~ .invalid-tooltip,\n    .webcg-devtools .custom-select.is-invalid ~ .invalid-feedback,\n    .webcg-devtools .custom-select.is-invalid ~ .invalid-tooltip {\n      display: block;\n}\n.was-validated .webcg-devtools .form-control-file:invalid ~ .invalid-feedback,\n  .was-validated .webcg-devtools .form-control-file:invalid ~ .invalid-tooltip, .webcg-devtools .form-control-file.is-invalid ~ .invalid-feedback,\n  .webcg-devtools .form-control-file.is-invalid ~ .invalid-tooltip {\n    display: block;\n}\n.was-validated .webcg-devtools .form-check-input:invalid ~ .form-check-label, .webcg-devtools .form-check-input.is-invalid ~ .form-check-label {\n    color: #dc3545;\n}\n.was-validated .webcg-devtools .form-check-input:invalid ~ .invalid-feedback,\n  .was-validated .webcg-devtools .form-check-input:invalid ~ .invalid-tooltip, .webcg-devtools .form-check-input.is-invalid ~ .invalid-feedback,\n  .webcg-devtools .form-check-input.is-invalid ~ .invalid-tooltip {\n    display: block;\n}\n.was-validated .webcg-devtools .custom-control-input:invalid ~ .custom-control-label, .webcg-devtools .custom-control-input.is-invalid ~ .custom-control-label {\n    color: #dc3545;\n}\n.was-validated .webcg-devtools .custom-control-input:invalid ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-invalid ~ .custom-control-label::before {\n      background-color: #efa2a9;\n}\n.was-validated .webcg-devtools .custom-control-input:invalid ~ .invalid-feedback,\n  .was-validated .webcg-devtools .custom-control-input:invalid ~ .invalid-tooltip, .webcg-devtools .custom-control-input.is-invalid ~ .invalid-feedback,\n  .webcg-devtools .custom-control-input.is-invalid ~ .invalid-tooltip {\n    display: block;\n}\n.was-validated .webcg-devtools .custom-control-input:invalid:checked ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-invalid:checked ~ .custom-control-label::before {\n    background-color: #e4606d;\n}\n.was-validated .webcg-devtools .custom-control-input:invalid:focus ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-invalid:focus ~ .custom-control-label::before {\n    box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(220, 53, 69, 0.25);\n}\n.was-validated .webcg-devtools .custom-file-input:invalid ~ .custom-file-label, .webcg-devtools .custom-file-input.is-invalid ~ .custom-file-label {\n    border-color: #dc3545;\n}\n.was-validated .webcg-devtools .custom-file-input:invalid ~ .custom-file-label::after, .webcg-devtools .custom-file-input.is-invalid ~ .custom-file-label::after {\n      border-color: inherit;\n}\n.was-validated .webcg-devtools .custom-file-input:invalid ~ .invalid-feedback,\n  .was-validated .webcg-devtools .custom-file-input:invalid ~ .invalid-tooltip, .webcg-devtools .custom-file-input.is-invalid ~ .invalid-feedback,\n  .webcg-devtools .custom-file-input.is-invalid ~ .invalid-tooltip {\n    display: block;\n}\n.was-validated .webcg-devtools .custom-file-input:invalid:focus ~ .custom-file-label, .webcg-devtools .custom-file-input.is-invalid:focus ~ .custom-file-label {\n    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);\n}\n.webcg-devtools .form-inline {\n    display: flex;\n    flex-flow: row wrap;\n    align-items: center;\n}\n.webcg-devtools .form-inline .form-check {\n      width: 100%;\n}\n@media (min-width: 576px) {\n.webcg-devtools .form-inline label {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        margin-bottom: 0;\n}\n.webcg-devtools .form-inline .form-group {\n        display: flex;\n        flex: 0 0 auto;\n        flex-flow: row wrap;\n        align-items: center;\n        margin-bottom: 0;\n}\n.webcg-devtools .form-inline .form-control {\n        display: inline-block;\n        width: auto;\n        vertical-align: middle;\n}\n.webcg-devtools .form-inline .form-control-plaintext {\n        display: inline-block;\n}\n.webcg-devtools .form-inline .input-group,\n      .webcg-devtools .form-inline .custom-select {\n        width: auto;\n}\n.webcg-devtools .form-inline .form-check {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: auto;\n        padding-left: 0;\n}\n.webcg-devtools .form-inline .form-check-input {\n        position: relative;\n        margin-top: 0;\n        margin-right: 0.25rem;\n        margin-left: 0;\n}\n.webcg-devtools .form-inline .custom-control {\n        align-items: center;\n        justify-content: center;\n}\n.webcg-devtools .form-inline .custom-control-label {\n        margin-bottom: 0;\n}\n}\n.webcg-devtools .btn {\n    display: inline-block;\n    font-weight: 400;\n    text-align: center;\n    white-space: nowrap;\n    vertical-align: middle;\n    user-select: none;\n    border: 1px solid transparent;\n    padding: 0.375rem 0.75rem;\n    font-size: 1rem;\n    line-height: 1.5;\n    border-radius: 0.25rem;\n    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .btn {\n        transition: none;\n}\n}\n.webcg-devtools .btn:hover, .webcg-devtools .btn:focus {\n      text-decoration: none;\n}\n.webcg-devtools .btn:focus, .webcg-devtools .btn.focus {\n      outline: 0;\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.webcg-devtools .btn.disabled, .webcg-devtools .btn:disabled {\n      opacity: 0.65;\n}\n.webcg-devtools .btn:not(:disabled):not(.disabled) {\n      cursor: pointer;\n}\n.webcg-devtools a.btn.disabled,\n  .webcg-devtools fieldset:disabled a.btn {\n    pointer-events: none;\n}\n.webcg-devtools .btn-primary {\n    color: #fff;\n    background-color: #007bff;\n    border-color: #007bff;\n}\n.webcg-devtools .btn-primary:hover {\n      color: #fff;\n      background-color: #0069d9;\n      border-color: #0062cc;\n}\n.webcg-devtools .btn-primary:focus, .webcg-devtools .btn-primary.focus {\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);\n}\n.webcg-devtools .btn-primary.disabled, .webcg-devtools .btn-primary:disabled {\n      color: #fff;\n      background-color: #007bff;\n      border-color: #007bff;\n}\n.webcg-devtools .btn-primary:not(:disabled):not(.disabled):active, .webcg-devtools .btn-primary:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-primary.dropdown-toggle {\n      color: #fff;\n      background-color: #0062cc;\n      border-color: #005cbf;\n}\n.webcg-devtools .btn-primary:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-primary:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-primary.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);\n}\n.webcg-devtools .btn-secondary {\n    color: #fff;\n    background-color: #6c757d;\n    border-color: #6c757d;\n}\n.webcg-devtools .btn-secondary:hover {\n      color: #fff;\n      background-color: #5a6268;\n      border-color: #545b62;\n}\n.webcg-devtools .btn-secondary:focus, .webcg-devtools .btn-secondary.focus {\n      box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);\n}\n.webcg-devtools .btn-secondary.disabled, .webcg-devtools .btn-secondary:disabled {\n      color: #fff;\n      background-color: #6c757d;\n      border-color: #6c757d;\n}\n.webcg-devtools .btn-secondary:not(:disabled):not(.disabled):active, .webcg-devtools .btn-secondary:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-secondary.dropdown-toggle {\n      color: #fff;\n      background-color: #545b62;\n      border-color: #4e555b;\n}\n.webcg-devtools .btn-secondary:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-secondary:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-secondary.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);\n}\n.webcg-devtools .btn-success {\n    color: #fff;\n    background-color: #28a745;\n    border-color: #28a745;\n}\n.webcg-devtools .btn-success:hover {\n      color: #fff;\n      background-color: #218838;\n      border-color: #1e7e34;\n}\n.webcg-devtools .btn-success:focus, .webcg-devtools .btn-success.focus {\n      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);\n}\n.webcg-devtools .btn-success.disabled, .webcg-devtools .btn-success:disabled {\n      color: #fff;\n      background-color: #28a745;\n      border-color: #28a745;\n}\n.webcg-devtools .btn-success:not(:disabled):not(.disabled):active, .webcg-devtools .btn-success:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-success.dropdown-toggle {\n      color: #fff;\n      background-color: #1e7e34;\n      border-color: #1c7430;\n}\n.webcg-devtools .btn-success:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-success:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-success.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);\n}\n.webcg-devtools .btn-info {\n    color: #fff;\n    background-color: #17a2b8;\n    border-color: #17a2b8;\n}\n.webcg-devtools .btn-info:hover {\n      color: #fff;\n      background-color: #138496;\n      border-color: #117a8b;\n}\n.webcg-devtools .btn-info:focus, .webcg-devtools .btn-info.focus {\n      box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5);\n}\n.webcg-devtools .btn-info.disabled, .webcg-devtools .btn-info:disabled {\n      color: #fff;\n      background-color: #17a2b8;\n      border-color: #17a2b8;\n}\n.webcg-devtools .btn-info:not(:disabled):not(.disabled):active, .webcg-devtools .btn-info:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-info.dropdown-toggle {\n      color: #fff;\n      background-color: #117a8b;\n      border-color: #10707f;\n}\n.webcg-devtools .btn-info:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-info:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-info.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5);\n}\n.webcg-devtools .btn-warning {\n    color: #212529;\n    background-color: #ffc107;\n    border-color: #ffc107;\n}\n.webcg-devtools .btn-warning:hover {\n      color: #212529;\n      background-color: #e0a800;\n      border-color: #d39e00;\n}\n.webcg-devtools .btn-warning:focus, .webcg-devtools .btn-warning.focus {\n      box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5);\n}\n.webcg-devtools .btn-warning.disabled, .webcg-devtools .btn-warning:disabled {\n      color: #212529;\n      background-color: #ffc107;\n      border-color: #ffc107;\n}\n.webcg-devtools .btn-warning:not(:disabled):not(.disabled):active, .webcg-devtools .btn-warning:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-warning.dropdown-toggle {\n      color: #212529;\n      background-color: #d39e00;\n      border-color: #c69500;\n}\n.webcg-devtools .btn-warning:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-warning:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-warning.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5);\n}\n.webcg-devtools .btn-danger {\n    color: #fff;\n    background-color: #dc3545;\n    border-color: #dc3545;\n}\n.webcg-devtools .btn-danger:hover {\n      color: #fff;\n      background-color: #c82333;\n      border-color: #bd2130;\n}\n.webcg-devtools .btn-danger:focus, .webcg-devtools .btn-danger.focus {\n      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5);\n}\n.webcg-devtools .btn-danger.disabled, .webcg-devtools .btn-danger:disabled {\n      color: #fff;\n      background-color: #dc3545;\n      border-color: #dc3545;\n}\n.webcg-devtools .btn-danger:not(:disabled):not(.disabled):active, .webcg-devtools .btn-danger:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-danger.dropdown-toggle {\n      color: #fff;\n      background-color: #bd2130;\n      border-color: #b21f2d;\n}\n.webcg-devtools .btn-danger:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-danger:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-danger.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5);\n}\n.webcg-devtools .btn-light {\n    color: #212529;\n    background-color: #f8f9fa;\n    border-color: #f8f9fa;\n}\n.webcg-devtools .btn-light:hover {\n      color: #212529;\n      background-color: #e2e6ea;\n      border-color: #dae0e5;\n}\n.webcg-devtools .btn-light:focus, .webcg-devtools .btn-light.focus {\n      box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5);\n}\n.webcg-devtools .btn-light.disabled, .webcg-devtools .btn-light:disabled {\n      color: #212529;\n      background-color: #f8f9fa;\n      border-color: #f8f9fa;\n}\n.webcg-devtools .btn-light:not(:disabled):not(.disabled):active, .webcg-devtools .btn-light:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-light.dropdown-toggle {\n      color: #212529;\n      background-color: #dae0e5;\n      border-color: #d3d9df;\n}\n.webcg-devtools .btn-light:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-light:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-light.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5);\n}\n.webcg-devtools .btn-dark {\n    color: #fff;\n    background-color: #343a40;\n    border-color: #343a40;\n}\n.webcg-devtools .btn-dark:hover {\n      color: #fff;\n      background-color: #23272b;\n      border-color: #1d2124;\n}\n.webcg-devtools .btn-dark:focus, .webcg-devtools .btn-dark.focus {\n      box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5);\n}\n.webcg-devtools .btn-dark.disabled, .webcg-devtools .btn-dark:disabled {\n      color: #fff;\n      background-color: #343a40;\n      border-color: #343a40;\n}\n.webcg-devtools .btn-dark:not(:disabled):not(.disabled):active, .webcg-devtools .btn-dark:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-dark.dropdown-toggle {\n      color: #fff;\n      background-color: #1d2124;\n      border-color: #171a1d;\n}\n.webcg-devtools .btn-dark:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-dark:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-dark.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5);\n}\n.webcg-devtools .btn-outline-primary {\n    color: #007bff;\n    background-color: transparent;\n    background-image: none;\n    border-color: #007bff;\n}\n.webcg-devtools .btn-outline-primary:hover {\n      color: #fff;\n      background-color: #007bff;\n      border-color: #007bff;\n}\n.webcg-devtools .btn-outline-primary:focus, .webcg-devtools .btn-outline-primary.focus {\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);\n}\n.webcg-devtools .btn-outline-primary.disabled, .webcg-devtools .btn-outline-primary:disabled {\n      color: #007bff;\n      background-color: transparent;\n}\n.webcg-devtools .btn-outline-primary:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-primary:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-primary.dropdown-toggle {\n      color: #fff;\n      background-color: #007bff;\n      border-color: #007bff;\n}\n.webcg-devtools .btn-outline-primary:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-primary:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-primary.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);\n}\n.webcg-devtools .btn-outline-secondary {\n    color: #6c757d;\n    background-color: transparent;\n    background-image: none;\n    border-color: #6c757d;\n}\n.webcg-devtools .btn-outline-secondary:hover {\n      color: #fff;\n      background-color: #6c757d;\n      border-color: #6c757d;\n}\n.webcg-devtools .btn-outline-secondary:focus, .webcg-devtools .btn-outline-secondary.focus {\n      box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);\n}\n.webcg-devtools .btn-outline-secondary.disabled, .webcg-devtools .btn-outline-secondary:disabled {\n      color: #6c757d;\n      background-color: transparent;\n}\n.webcg-devtools .btn-outline-secondary:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-secondary:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-secondary.dropdown-toggle {\n      color: #fff;\n      background-color: #6c757d;\n      border-color: #6c757d;\n}\n.webcg-devtools .btn-outline-secondary:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-secondary:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-secondary.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);\n}\n.webcg-devtools .btn-outline-success {\n    color: #28a745;\n    background-color: transparent;\n    background-image: none;\n    border-color: #28a745;\n}\n.webcg-devtools .btn-outline-success:hover {\n      color: #fff;\n      background-color: #28a745;\n      border-color: #28a745;\n}\n.webcg-devtools .btn-outline-success:focus, .webcg-devtools .btn-outline-success.focus {\n      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);\n}\n.webcg-devtools .btn-outline-success.disabled, .webcg-devtools .btn-outline-success:disabled {\n      color: #28a745;\n      background-color: transparent;\n}\n.webcg-devtools .btn-outline-success:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-success:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-success.dropdown-toggle {\n      color: #fff;\n      background-color: #28a745;\n      border-color: #28a745;\n}\n.webcg-devtools .btn-outline-success:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-success:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-success.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);\n}\n.webcg-devtools .btn-outline-info {\n    color: #17a2b8;\n    background-color: transparent;\n    background-image: none;\n    border-color: #17a2b8;\n}\n.webcg-devtools .btn-outline-info:hover {\n      color: #fff;\n      background-color: #17a2b8;\n      border-color: #17a2b8;\n}\n.webcg-devtools .btn-outline-info:focus, .webcg-devtools .btn-outline-info.focus {\n      box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5);\n}\n.webcg-devtools .btn-outline-info.disabled, .webcg-devtools .btn-outline-info:disabled {\n      color: #17a2b8;\n      background-color: transparent;\n}\n.webcg-devtools .btn-outline-info:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-info:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-info.dropdown-toggle {\n      color: #fff;\n      background-color: #17a2b8;\n      border-color: #17a2b8;\n}\n.webcg-devtools .btn-outline-info:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-info:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-info.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5);\n}\n.webcg-devtools .btn-outline-warning {\n    color: #ffc107;\n    background-color: transparent;\n    background-image: none;\n    border-color: #ffc107;\n}\n.webcg-devtools .btn-outline-warning:hover {\n      color: #212529;\n      background-color: #ffc107;\n      border-color: #ffc107;\n}\n.webcg-devtools .btn-outline-warning:focus, .webcg-devtools .btn-outline-warning.focus {\n      box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5);\n}\n.webcg-devtools .btn-outline-warning.disabled, .webcg-devtools .btn-outline-warning:disabled {\n      color: #ffc107;\n      background-color: transparent;\n}\n.webcg-devtools .btn-outline-warning:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-warning:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-warning.dropdown-toggle {\n      color: #212529;\n      background-color: #ffc107;\n      border-color: #ffc107;\n}\n.webcg-devtools .btn-outline-warning:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-warning:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-warning.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5);\n}\n.webcg-devtools .btn-outline-danger {\n    color: #dc3545;\n    background-color: transparent;\n    background-image: none;\n    border-color: #dc3545;\n}\n.webcg-devtools .btn-outline-danger:hover {\n      color: #fff;\n      background-color: #dc3545;\n      border-color: #dc3545;\n}\n.webcg-devtools .btn-outline-danger:focus, .webcg-devtools .btn-outline-danger.focus {\n      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5);\n}\n.webcg-devtools .btn-outline-danger.disabled, .webcg-devtools .btn-outline-danger:disabled {\n      color: #dc3545;\n      background-color: transparent;\n}\n.webcg-devtools .btn-outline-danger:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-danger:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-danger.dropdown-toggle {\n      color: #fff;\n      background-color: #dc3545;\n      border-color: #dc3545;\n}\n.webcg-devtools .btn-outline-danger:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-danger:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-danger.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5);\n}\n.webcg-devtools .btn-outline-light {\n    color: #f8f9fa;\n    background-color: transparent;\n    background-image: none;\n    border-color: #f8f9fa;\n}\n.webcg-devtools .btn-outline-light:hover {\n      color: #212529;\n      background-color: #f8f9fa;\n      border-color: #f8f9fa;\n}\n.webcg-devtools .btn-outline-light:focus, .webcg-devtools .btn-outline-light.focus {\n      box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5);\n}\n.webcg-devtools .btn-outline-light.disabled, .webcg-devtools .btn-outline-light:disabled {\n      color: #f8f9fa;\n      background-color: transparent;\n}\n.webcg-devtools .btn-outline-light:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-light:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-light.dropdown-toggle {\n      color: #212529;\n      background-color: #f8f9fa;\n      border-color: #f8f9fa;\n}\n.webcg-devtools .btn-outline-light:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-light:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-light.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5);\n}\n.webcg-devtools .btn-outline-dark {\n    color: #343a40;\n    background-color: transparent;\n    background-image: none;\n    border-color: #343a40;\n}\n.webcg-devtools .btn-outline-dark:hover {\n      color: #fff;\n      background-color: #343a40;\n      border-color: #343a40;\n}\n.webcg-devtools .btn-outline-dark:focus, .webcg-devtools .btn-outline-dark.focus {\n      box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5);\n}\n.webcg-devtools .btn-outline-dark.disabled, .webcg-devtools .btn-outline-dark:disabled {\n      color: #343a40;\n      background-color: transparent;\n}\n.webcg-devtools .btn-outline-dark:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-dark:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-dark.dropdown-toggle {\n      color: #fff;\n      background-color: #343a40;\n      border-color: #343a40;\n}\n.webcg-devtools .btn-outline-dark:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-dark:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-dark.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5);\n}\n.webcg-devtools .btn-link {\n    font-weight: 400;\n    color: #007bff;\n    background-color: transparent;\n}\n.webcg-devtools .btn-link:hover {\n      color: #0056b3;\n      text-decoration: underline;\n      background-color: transparent;\n      border-color: transparent;\n}\n.webcg-devtools .btn-link:focus, .webcg-devtools .btn-link.focus {\n      text-decoration: underline;\n      border-color: transparent;\n      box-shadow: none;\n}\n.webcg-devtools .btn-link:disabled, .webcg-devtools .btn-link.disabled {\n      color: #6c757d;\n      pointer-events: none;\n}\n.webcg-devtools .btn-lg, .webcg-devtools .btn-group-lg > .btn {\n    padding: 0.5rem 1rem;\n    font-size: 1.25rem;\n    line-height: 1.5;\n    border-radius: 0.3rem;\n}\n.webcg-devtools .btn-sm, .webcg-devtools .btn-group-sm > .btn {\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    border-radius: 0.2rem;\n}\n.webcg-devtools .btn-block {\n    display: block;\n    width: 100%;\n}\n.webcg-devtools .btn-block + .btn-block {\n      margin-top: 0.5rem;\n}\n.webcg-devtools input[type=\"submit\"].btn-block,\n  .webcg-devtools input[type=\"reset\"].btn-block,\n  .webcg-devtools input[type=\"button\"].btn-block {\n    width: 100%;\n}\n.webcg-devtools .fade {\n    transition: opacity 0.15s linear;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .fade {\n        transition: none;\n}\n}\n.webcg-devtools .fade:not(.show) {\n      opacity: 0;\n}\n.webcg-devtools .collapse:not(.show) {\n    display: none;\n}\n.webcg-devtools .collapsing {\n    position: relative;\n    height: 0;\n    overflow: hidden;\n    transition: height 0.35s ease;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .collapsing {\n        transition: none;\n}\n}\n.webcg-devtools .dropup,\n  .webcg-devtools .dropright,\n  .webcg-devtools .dropdown,\n  .webcg-devtools .dropleft {\n    position: relative;\n}\n.webcg-devtools .dropdown-toggle::after {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-left: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n    border-top: 0.3em solid;\n    border-right: 0.3em solid transparent;\n    border-bottom: 0;\n    border-left: 0.3em solid transparent;\n}\n.webcg-devtools .dropdown-toggle:empty::after {\n    margin-left: 0;\n}\n.webcg-devtools .dropdown-menu {\n    position: absolute;\n    top: 100%;\n    left: 0;\n    z-index: 1000;\n    display: none;\n    float: left;\n    min-width: 10rem;\n    padding: 0.5rem 0;\n    margin: 0.125rem 0 0;\n    font-size: 1rem;\n    color: #212529;\n    text-align: left;\n    list-style: none;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid rgba(0, 0, 0, 0.15);\n    border-radius: 0.25rem;\n}\n.webcg-devtools .dropdown-menu-right {\n    right: 0;\n    left: auto;\n}\n.webcg-devtools .dropup .dropdown-menu {\n    top: auto;\n    bottom: 100%;\n    margin-top: 0;\n    margin-bottom: 0.125rem;\n}\n.webcg-devtools .dropup .dropdown-toggle::after {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-left: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n    border-top: 0;\n    border-right: 0.3em solid transparent;\n    border-bottom: 0.3em solid;\n    border-left: 0.3em solid transparent;\n}\n.webcg-devtools .dropup .dropdown-toggle:empty::after {\n    margin-left: 0;\n}\n.webcg-devtools .dropright .dropdown-menu {\n    top: 0;\n    right: auto;\n    left: 100%;\n    margin-top: 0;\n    margin-left: 0.125rem;\n}\n.webcg-devtools .dropright .dropdown-toggle::after {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-left: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n    border-top: 0.3em solid transparent;\n    border-right: 0;\n    border-bottom: 0.3em solid transparent;\n    border-left: 0.3em solid;\n}\n.webcg-devtools .dropright .dropdown-toggle:empty::after {\n    margin-left: 0;\n}\n.webcg-devtools .dropright .dropdown-toggle::after {\n    vertical-align: 0;\n}\n.webcg-devtools .dropleft .dropdown-menu {\n    top: 0;\n    right: 100%;\n    left: auto;\n    margin-top: 0;\n    margin-right: 0.125rem;\n}\n.webcg-devtools .dropleft .dropdown-toggle::after {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-left: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n}\n.webcg-devtools .dropleft .dropdown-toggle::after {\n    display: none;\n}\n.webcg-devtools .dropleft .dropdown-toggle::before {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-right: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n    border-top: 0.3em solid transparent;\n    border-right: 0.3em solid;\n    border-bottom: 0.3em solid transparent;\n}\n.webcg-devtools .dropleft .dropdown-toggle:empty::after {\n    margin-left: 0;\n}\n.webcg-devtools .dropleft .dropdown-toggle::before {\n    vertical-align: 0;\n}\n.webcg-devtools .dropdown-menu[x-placement^=\"top\"], .webcg-devtools .dropdown-menu[x-placement^=\"right\"], .webcg-devtools .dropdown-menu[x-placement^=\"bottom\"], .webcg-devtools .dropdown-menu[x-placement^=\"left\"] {\n    right: auto;\n    bottom: auto;\n}\n.webcg-devtools .dropdown-divider {\n    height: 0;\n    margin: 0.5rem 0;\n    overflow: hidden;\n    border-top: 1px solid #e9ecef;\n}\n.webcg-devtools .dropdown-item {\n    display: block;\n    width: 100%;\n    padding: 0.25rem 1.5rem;\n    clear: both;\n    font-weight: 400;\n    color: #212529;\n    text-align: inherit;\n    white-space: nowrap;\n    background-color: transparent;\n    border: 0;\n}\n.webcg-devtools .dropdown-item:hover, .webcg-devtools .dropdown-item:focus {\n      color: #16181b;\n      text-decoration: none;\n      background-color: #f8f9fa;\n}\n.webcg-devtools .dropdown-item.active, .webcg-devtools .dropdown-item:active {\n      color: #fff;\n      text-decoration: none;\n      background-color: #007bff;\n}\n.webcg-devtools .dropdown-item.disabled, .webcg-devtools .dropdown-item:disabled {\n      color: #6c757d;\n      background-color: transparent;\n}\n.webcg-devtools .dropdown-menu.show {\n    display: block;\n}\n.webcg-devtools .dropdown-header {\n    display: block;\n    padding: 0.5rem 1.5rem;\n    margin-bottom: 0;\n    font-size: 0.875rem;\n    color: #6c757d;\n    white-space: nowrap;\n}\n.webcg-devtools .dropdown-item-text {\n    display: block;\n    padding: 0.25rem 1.5rem;\n    color: #212529;\n}\n.webcg-devtools .btn-group,\n  .webcg-devtools .btn-group-vertical {\n    position: relative;\n    display: inline-flex;\n    vertical-align: middle;\n}\n.webcg-devtools .btn-group > .btn,\n    .webcg-devtools .btn-group-vertical > .btn {\n      position: relative;\n      flex: 0 1 auto;\n}\n.webcg-devtools .btn-group > .btn:hover,\n      .webcg-devtools .btn-group-vertical > .btn:hover {\n        z-index: 1;\n}\n.webcg-devtools .btn-group > .btn:focus, .webcg-devtools .btn-group > .btn:active, .webcg-devtools .btn-group > .btn.active,\n      .webcg-devtools .btn-group-vertical > .btn:focus,\n      .webcg-devtools .btn-group-vertical > .btn:active,\n      .webcg-devtools .btn-group-vertical > .btn.active {\n        z-index: 1;\n}\n.webcg-devtools .btn-group .btn + .btn,\n    .webcg-devtools .btn-group .btn + .btn-group,\n    .webcg-devtools .btn-group .btn-group + .btn,\n    .webcg-devtools .btn-group .btn-group + .btn-group,\n    .webcg-devtools .btn-group-vertical .btn + .btn,\n    .webcg-devtools .btn-group-vertical .btn + .btn-group,\n    .webcg-devtools .btn-group-vertical .btn-group + .btn,\n    .webcg-devtools .btn-group-vertical .btn-group + .btn-group {\n      margin-left: -1px;\n}\n.webcg-devtools .btn-toolbar {\n    display: flex;\n    flex-wrap: wrap;\n    justify-content: flex-start;\n}\n.webcg-devtools .btn-toolbar .input-group {\n      width: auto;\n}\n.webcg-devtools .btn-group > .btn:first-child {\n    margin-left: 0;\n}\n.webcg-devtools .btn-group > .btn:not(:last-child):not(.dropdown-toggle),\n  .webcg-devtools .btn-group > .btn-group:not(:last-child) > .btn {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n}\n.webcg-devtools .btn-group > .btn:not(:first-child),\n  .webcg-devtools .btn-group > .btn-group:not(:first-child) > .btn {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0;\n}\n.webcg-devtools .dropdown-toggle-split {\n    padding-right: 0.5625rem;\n    padding-left: 0.5625rem;\n}\n.webcg-devtools .dropdown-toggle-split::after,\n    .dropup .webcg-devtools .dropdown-toggle-split::after,\n    .dropright .webcg-devtools .dropdown-toggle-split::after {\n      margin-left: 0;\n}\n.dropleft .webcg-devtools .dropdown-toggle-split::before {\n      margin-right: 0;\n}\n.webcg-devtools .btn-sm + .dropdown-toggle-split, .webcg-devtools .btn-group-sm > .btn + .dropdown-toggle-split {\n    padding-right: 0.375rem;\n    padding-left: 0.375rem;\n}\n.webcg-devtools .btn-lg + .dropdown-toggle-split, .webcg-devtools .btn-group-lg > .btn + .dropdown-toggle-split {\n    padding-right: 0.75rem;\n    padding-left: 0.75rem;\n}\n.webcg-devtools .btn-group-vertical {\n    flex-direction: column;\n    align-items: flex-start;\n    justify-content: center;\n}\n.webcg-devtools .btn-group-vertical .btn,\n    .webcg-devtools .btn-group-vertical .btn-group {\n      width: 100%;\n}\n.webcg-devtools .btn-group-vertical > .btn + .btn,\n    .webcg-devtools .btn-group-vertical > .btn + .btn-group,\n    .webcg-devtools .btn-group-vertical > .btn-group + .btn,\n    .webcg-devtools .btn-group-vertical > .btn-group + .btn-group {\n      margin-top: -1px;\n      margin-left: 0;\n}\n.webcg-devtools .btn-group-vertical > .btn:not(:last-child):not(.dropdown-toggle),\n    .webcg-devtools .btn-group-vertical > .btn-group:not(:last-child) > .btn {\n      border-bottom-right-radius: 0;\n      border-bottom-left-radius: 0;\n}\n.webcg-devtools .btn-group-vertical > .btn:not(:first-child),\n    .webcg-devtools .btn-group-vertical > .btn-group:not(:first-child) > .btn {\n      border-top-left-radius: 0;\n      border-top-right-radius: 0;\n}\n.webcg-devtools .btn-group-toggle > .btn,\n  .webcg-devtools .btn-group-toggle > .btn-group > .btn {\n    margin-bottom: 0;\n}\n.webcg-devtools .btn-group-toggle > .btn input[type=\"radio\"],\n    .webcg-devtools .btn-group-toggle > .btn input[type=\"checkbox\"],\n    .webcg-devtools .btn-group-toggle > .btn-group > .btn input[type=\"radio\"],\n    .webcg-devtools .btn-group-toggle > .btn-group > .btn input[type=\"checkbox\"] {\n      position: absolute;\n      clip: rect(0, 0, 0, 0);\n      pointer-events: none;\n}\n.webcg-devtools .input-group {\n    position: relative;\n    display: flex;\n    flex-wrap: wrap;\n    align-items: stretch;\n    width: 100%;\n}\n.webcg-devtools .input-group > .form-control,\n    .webcg-devtools .input-group > .custom-select,\n    .webcg-devtools .input-group > .custom-file {\n      position: relative;\n      flex: 1 1 auto;\n      width: 1%;\n      margin-bottom: 0;\n}\n.webcg-devtools .input-group > .form-control + .form-control,\n      .webcg-devtools .input-group > .form-control + .custom-select,\n      .webcg-devtools .input-group > .form-control + .custom-file,\n      .webcg-devtools .input-group > .custom-select + .form-control,\n      .webcg-devtools .input-group > .custom-select + .custom-select,\n      .webcg-devtools .input-group > .custom-select + .custom-file,\n      .webcg-devtools .input-group > .custom-file + .form-control,\n      .webcg-devtools .input-group > .custom-file + .custom-select,\n      .webcg-devtools .input-group > .custom-file + .custom-file {\n        margin-left: -1px;\n}\n.webcg-devtools .input-group > .form-control:focus,\n    .webcg-devtools .input-group > .custom-select:focus,\n    .webcg-devtools .input-group > .custom-file .custom-file-input:focus ~ .custom-file-label {\n      z-index: 3;\n}\n.webcg-devtools .input-group > .custom-file .custom-file-input:focus {\n      z-index: 4;\n}\n.webcg-devtools .input-group > .form-control:not(:last-child),\n    .webcg-devtools .input-group > .custom-select:not(:last-child) {\n      border-top-right-radius: 0;\n      border-bottom-right-radius: 0;\n}\n.webcg-devtools .input-group > .form-control:not(:first-child),\n    .webcg-devtools .input-group > .custom-select:not(:first-child) {\n      border-top-left-radius: 0;\n      border-bottom-left-radius: 0;\n}\n.webcg-devtools .input-group > .custom-file {\n      display: flex;\n      align-items: center;\n}\n.webcg-devtools .input-group > .custom-file:not(:last-child) .custom-file-label,\n      .webcg-devtools .input-group > .custom-file:not(:last-child) .custom-file-label::after {\n        border-top-right-radius: 0;\n        border-bottom-right-radius: 0;\n}\n.webcg-devtools .input-group > .custom-file:not(:first-child) .custom-file-label {\n        border-top-left-radius: 0;\n        border-bottom-left-radius: 0;\n}\n.webcg-devtools .input-group-prepend,\n  .webcg-devtools .input-group-append {\n    display: flex;\n}\n.webcg-devtools .input-group-prepend .btn,\n    .webcg-devtools .input-group-append .btn {\n      position: relative;\n      z-index: 2;\n}\n.webcg-devtools .input-group-prepend .btn + .btn,\n    .webcg-devtools .input-group-prepend .btn + .input-group-text,\n    .webcg-devtools .input-group-prepend .input-group-text + .input-group-text,\n    .webcg-devtools .input-group-prepend .input-group-text + .btn,\n    .webcg-devtools .input-group-append .btn + .btn,\n    .webcg-devtools .input-group-append .btn + .input-group-text,\n    .webcg-devtools .input-group-append .input-group-text + .input-group-text,\n    .webcg-devtools .input-group-append .input-group-text + .btn {\n      margin-left: -1px;\n}\n.webcg-devtools .input-group-prepend {\n    margin-right: -1px;\n}\n.webcg-devtools .input-group-append {\n    margin-left: -1px;\n}\n.webcg-devtools .input-group-text {\n    display: flex;\n    align-items: center;\n    padding: 0.375rem 0.75rem;\n    margin-bottom: 0;\n    font-size: 1rem;\n    font-weight: 400;\n    line-height: 1.5;\n    color: #495057;\n    text-align: center;\n    white-space: nowrap;\n    background-color: #e9ecef;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .input-group-text input[type=\"radio\"],\n    .webcg-devtools .input-group-text input[type=\"checkbox\"] {\n      margin-top: 0;\n}\n.webcg-devtools .input-group-lg > .form-control,\n  .webcg-devtools .input-group-lg > .input-group-prepend > .input-group-text,\n  .webcg-devtools .input-group-lg > .input-group-append > .input-group-text,\n  .webcg-devtools .input-group-lg > .input-group-prepend > .btn,\n  .webcg-devtools .input-group-lg > .input-group-append > .btn {\n    height: calc(2.875rem + 2px);\n    padding: 0.5rem 1rem;\n    font-size: 1.25rem;\n    line-height: 1.5;\n    border-radius: 0.3rem;\n}\n.webcg-devtools .input-group-sm > .form-control,\n  .webcg-devtools .input-group-sm > .input-group-prepend > .input-group-text,\n  .webcg-devtools .input-group-sm > .input-group-append > .input-group-text,\n  .webcg-devtools .input-group-sm > .input-group-prepend > .btn,\n  .webcg-devtools .input-group-sm > .input-group-append > .btn {\n    height: calc(1.8125rem + 2px);\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    border-radius: 0.2rem;\n}\n.webcg-devtools .input-group > .input-group-prepend > .btn,\n  .webcg-devtools .input-group > .input-group-prepend > .input-group-text,\n  .webcg-devtools .input-group > .input-group-append:not(:last-child) > .btn,\n  .webcg-devtools .input-group > .input-group-append:not(:last-child) > .input-group-text,\n  .webcg-devtools .input-group > .input-group-append:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n  .webcg-devtools .input-group > .input-group-append:last-child > .input-group-text:not(:last-child) {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n}\n.webcg-devtools .input-group > .input-group-append > .btn,\n  .webcg-devtools .input-group > .input-group-append > .input-group-text,\n  .webcg-devtools .input-group > .input-group-prepend:not(:first-child) > .btn,\n  .webcg-devtools .input-group > .input-group-prepend:not(:first-child) > .input-group-text,\n  .webcg-devtools .input-group > .input-group-prepend:first-child > .btn:not(:first-child),\n  .webcg-devtools .input-group > .input-group-prepend:first-child > .input-group-text:not(:first-child) {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0;\n}\n.webcg-devtools .custom-control {\n    position: relative;\n    display: block;\n    min-height: 1.5rem;\n    padding-left: 1.5rem;\n}\n.webcg-devtools .custom-control-inline {\n    display: inline-flex;\n    margin-right: 1rem;\n}\n.webcg-devtools .custom-control-input {\n    position: absolute;\n    z-index: -1;\n    opacity: 0;\n}\n.webcg-devtools .custom-control-input:checked ~ .custom-control-label::before {\n      color: #fff;\n      background-color: #007bff;\n}\n.webcg-devtools .custom-control-input:focus ~ .custom-control-label::before {\n      box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.webcg-devtools .custom-control-input:active ~ .custom-control-label::before {\n      color: #fff;\n      background-color: #b3d7ff;\n}\n.webcg-devtools .custom-control-input:disabled ~ .custom-control-label {\n      color: #6c757d;\n}\n.webcg-devtools .custom-control-input:disabled ~ .custom-control-label::before {\n        background-color: #e9ecef;\n}\n.webcg-devtools .custom-control-label {\n    position: relative;\n    margin-bottom: 0;\n}\n.webcg-devtools .custom-control-label::before {\n      position: absolute;\n      top: 0.25rem;\n      left: -1.5rem;\n      display: block;\n      width: 1rem;\n      height: 1rem;\n      pointer-events: none;\n      content: \"\";\n      user-select: none;\n      background-color: #dee2e6;\n}\n.webcg-devtools .custom-control-label::after {\n      position: absolute;\n      top: 0.25rem;\n      left: -1.5rem;\n      display: block;\n      width: 1rem;\n      height: 1rem;\n      content: \"\";\n      background-repeat: no-repeat;\n      background-position: center center;\n      background-size: 50% 50%;\n}\n.webcg-devtools .custom-checkbox .custom-control-label::before {\n    border-radius: 0.25rem;\n}\n.webcg-devtools .custom-checkbox .custom-control-input:checked ~ .custom-control-label::before {\n    background-color: #007bff;\n}\n.webcg-devtools .custom-checkbox .custom-control-input:checked ~ .custom-control-label::after {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3E%3C/svg%3E\");\n}\n.webcg-devtools .custom-checkbox .custom-control-input:indeterminate ~ .custom-control-label::before {\n    background-color: #007bff;\n}\n.webcg-devtools .custom-checkbox .custom-control-input:indeterminate ~ .custom-control-label::after {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Cpath stroke='%23fff' d='M0 2h4'/%3E%3C/svg%3E\");\n}\n.webcg-devtools .custom-checkbox .custom-control-input:disabled:checked ~ .custom-control-label::before {\n    background-color: rgba(0, 123, 255, 0.5);\n}\n.webcg-devtools .custom-checkbox .custom-control-input:disabled:indeterminate ~ .custom-control-label::before {\n    background-color: rgba(0, 123, 255, 0.5);\n}\n.webcg-devtools .custom-radio .custom-control-label::before {\n    border-radius: 50%;\n}\n.webcg-devtools .custom-radio .custom-control-input:checked ~ .custom-control-label::before {\n    background-color: #007bff;\n}\n.webcg-devtools .custom-radio .custom-control-input:checked ~ .custom-control-label::after {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3E%3Ccircle r='3' fill='%23fff'/%3E%3C/svg%3E\");\n}\n.webcg-devtools .custom-radio .custom-control-input:disabled:checked ~ .custom-control-label::before {\n    background-color: rgba(0, 123, 255, 0.5);\n}\n.webcg-devtools .custom-select {\n    display: inline-block;\n    width: 100%;\n    height: calc(2.25rem + 2px);\n    padding: 0.375rem 1.75rem 0.375rem 0.75rem;\n    line-height: 1.5;\n    color: #495057;\n    vertical-align: middle;\n    background: #fff url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center;\n    background-size: 8px 10px;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem;\n    appearance: none;\n}\n.webcg-devtools .custom-select:focus {\n      border-color: #80bdff;\n      outline: 0;\n      box-shadow: 0 0 0 0.2rem rgba(128, 189, 255, 0.5);\n}\n.webcg-devtools .custom-select:focus::-ms-value {\n        color: #495057;\n        background-color: #fff;\n}\n.webcg-devtools .custom-select[multiple], .webcg-devtools .custom-select[size]:not([size=\"1\"]) {\n      height: auto;\n      padding-right: 0.75rem;\n      background-image: none;\n}\n.webcg-devtools .custom-select:disabled {\n      color: #6c757d;\n      background-color: #e9ecef;\n}\n.webcg-devtools .custom-select::-ms-expand {\n      opacity: 0;\n}\n.webcg-devtools .custom-select-sm {\n    height: calc(1.8125rem + 2px);\n    padding-top: 0.375rem;\n    padding-bottom: 0.375rem;\n    font-size: 75%;\n}\n.webcg-devtools .custom-select-lg {\n    height: calc(2.875rem + 2px);\n    padding-top: 0.375rem;\n    padding-bottom: 0.375rem;\n    font-size: 125%;\n}\n.webcg-devtools .custom-file {\n    position: relative;\n    display: inline-block;\n    width: 100%;\n    height: calc(2.25rem + 2px);\n    margin-bottom: 0;\n}\n.webcg-devtools .custom-file-input {\n    position: relative;\n    z-index: 2;\n    width: 100%;\n    height: calc(2.25rem + 2px);\n    margin: 0;\n    opacity: 0;\n}\n.webcg-devtools .custom-file-input:focus ~ .custom-file-label {\n      border-color: #80bdff;\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.webcg-devtools .custom-file-input:focus ~ .custom-file-label::after {\n        border-color: #80bdff;\n}\n.webcg-devtools .custom-file-input:disabled ~ .custom-file-label {\n      background-color: #e9ecef;\n}\n.webcg-devtools .custom-file-input:lang(en) ~ .custom-file-label::after {\n      content: \"Browse\";\n}\n.webcg-devtools .custom-file-label {\n    position: absolute;\n    top: 0;\n    right: 0;\n    left: 0;\n    z-index: 1;\n    height: calc(2.25rem + 2px);\n    padding: 0.375rem 0.75rem;\n    line-height: 1.5;\n    color: #495057;\n    background-color: #fff;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .custom-file-label::after {\n      position: absolute;\n      top: 0;\n      right: 0;\n      bottom: 0;\n      z-index: 3;\n      display: block;\n      height: 2.25rem;\n      padding: 0.375rem 0.75rem;\n      line-height: 1.5;\n      color: #495057;\n      content: \"Browse\";\n      background-color: #e9ecef;\n      border-left: 1px solid #ced4da;\n      border-radius: 0 0.25rem 0.25rem 0;\n}\n.webcg-devtools .custom-range {\n    width: 100%;\n    padding-left: 0;\n    background-color: transparent;\n    appearance: none;\n}\n.webcg-devtools .custom-range:focus {\n      outline: none;\n}\n.webcg-devtools .custom-range:focus::-webkit-slider-thumb {\n        box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.webcg-devtools .custom-range:focus::-moz-range-thumb {\n        box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.webcg-devtools .custom-range:focus::-ms-thumb {\n        box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.webcg-devtools .custom-range::-moz-focus-outer {\n      border: 0;\n}\n.webcg-devtools .custom-range::-webkit-slider-thumb {\n      width: 1rem;\n      height: 1rem;\n      margin-top: -0.25rem;\n      background-color: #007bff;\n      border: 0;\n      border-radius: 1rem;\n      transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n      appearance: none;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .custom-range::-webkit-slider-thumb {\n          transition: none;\n}\n}\n.webcg-devtools .custom-range::-webkit-slider-thumb:active {\n        background-color: #b3d7ff;\n}\n.webcg-devtools .custom-range::-webkit-slider-runnable-track {\n      width: 100%;\n      height: 0.5rem;\n      color: transparent;\n      cursor: pointer;\n      background-color: #dee2e6;\n      border-color: transparent;\n      border-radius: 1rem;\n}\n.webcg-devtools .custom-range::-moz-range-thumb {\n      width: 1rem;\n      height: 1rem;\n      background-color: #007bff;\n      border: 0;\n      border-radius: 1rem;\n      transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n      appearance: none;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .custom-range::-moz-range-thumb {\n          transition: none;\n}\n}\n.webcg-devtools .custom-range::-moz-range-thumb:active {\n        background-color: #b3d7ff;\n}\n.webcg-devtools .custom-range::-moz-range-track {\n      width: 100%;\n      height: 0.5rem;\n      color: transparent;\n      cursor: pointer;\n      background-color: #dee2e6;\n      border-color: transparent;\n      border-radius: 1rem;\n}\n.webcg-devtools .custom-range::-ms-thumb {\n      width: 1rem;\n      height: 1rem;\n      margin-top: 0;\n      margin-right: 0.2rem;\n      margin-left: 0.2rem;\n      background-color: #007bff;\n      border: 0;\n      border-radius: 1rem;\n      transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n      appearance: none;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .custom-range::-ms-thumb {\n          transition: none;\n}\n}\n.webcg-devtools .custom-range::-ms-thumb:active {\n        background-color: #b3d7ff;\n}\n.webcg-devtools .custom-range::-ms-track {\n      width: 100%;\n      height: 0.5rem;\n      color: transparent;\n      cursor: pointer;\n      background-color: transparent;\n      border-color: transparent;\n      border-width: 0.5rem;\n}\n.webcg-devtools .custom-range::-ms-fill-lower {\n      background-color: #dee2e6;\n      border-radius: 1rem;\n}\n.webcg-devtools .custom-range::-ms-fill-upper {\n      margin-right: 15px;\n      background-color: #dee2e6;\n      border-radius: 1rem;\n}\n.webcg-devtools .custom-control-label::before,\n  .webcg-devtools .custom-file-label,\n  .webcg-devtools .custom-select {\n    transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .custom-control-label::before,\n      .webcg-devtools .custom-file-label,\n      .webcg-devtools .custom-select {\n        transition: none;\n}\n}\n.webcg-devtools .nav {\n    display: flex;\n    flex-wrap: wrap;\n    padding-left: 0;\n    margin-bottom: 0;\n    list-style: none;\n}\n.webcg-devtools .nav-link {\n    display: block;\n    padding: 0.5rem 1rem;\n}\n.webcg-devtools .nav-link:hover, .webcg-devtools .nav-link:focus {\n      text-decoration: none;\n}\n.webcg-devtools .nav-link.disabled {\n      color: #6c757d;\n}\n.webcg-devtools .nav-tabs {\n    border-bottom: 1px solid #dee2e6;\n}\n.webcg-devtools .nav-tabs .nav-item {\n      margin-bottom: -1px;\n}\n.webcg-devtools .nav-tabs .nav-link {\n      border: 1px solid transparent;\n      border-top-left-radius: 0.25rem;\n      border-top-right-radius: 0.25rem;\n}\n.webcg-devtools .nav-tabs .nav-link:hover, .webcg-devtools .nav-tabs .nav-link:focus {\n        border-color: #e9ecef #e9ecef #dee2e6;\n}\n.webcg-devtools .nav-tabs .nav-link.disabled {\n        color: #6c757d;\n        background-color: transparent;\n        border-color: transparent;\n}\n.webcg-devtools .nav-tabs .nav-link.active,\n    .webcg-devtools .nav-tabs .nav-item.show .nav-link {\n      color: #495057;\n      background-color: #fff;\n      border-color: #dee2e6 #dee2e6 #fff;\n}\n.webcg-devtools .nav-tabs .dropdown-menu {\n      margin-top: -1px;\n      border-top-left-radius: 0;\n      border-top-right-radius: 0;\n}\n.webcg-devtools .nav-pills .nav-link {\n    border-radius: 0.25rem;\n}\n.webcg-devtools .nav-pills .nav-link.active,\n  .webcg-devtools .nav-pills .show > .nav-link {\n    color: #fff;\n    background-color: #007bff;\n}\n.webcg-devtools .nav-fill .nav-item {\n    flex: 1 1 auto;\n    text-align: center;\n}\n.webcg-devtools .nav-justified .nav-item {\n    flex-basis: 0;\n    flex-grow: 1;\n    text-align: center;\n}\n.webcg-devtools .tab-content > .tab-pane {\n    display: none;\n}\n.webcg-devtools .tab-content > .active {\n    display: block;\n}\n.webcg-devtools .navbar {\n    position: relative;\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0.5rem 1rem;\n}\n.webcg-devtools .navbar > .container,\n    .webcg-devtools .navbar > .container-fluid {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      justify-content: space-between;\n}\n.webcg-devtools .navbar-brand {\n    display: inline-block;\n    padding-top: 0.3125rem;\n    padding-bottom: 0.3125rem;\n    margin-right: 1rem;\n    font-size: 1.25rem;\n    line-height: inherit;\n    white-space: nowrap;\n}\n.webcg-devtools .navbar-brand:hover, .webcg-devtools .navbar-brand:focus {\n      text-decoration: none;\n}\n.webcg-devtools .navbar-nav {\n    display: flex;\n    flex-direction: column;\n    padding-left: 0;\n    margin-bottom: 0;\n    list-style: none;\n}\n.webcg-devtools .navbar-nav .nav-link {\n      padding-right: 0;\n      padding-left: 0;\n}\n.webcg-devtools .navbar-nav .dropdown-menu {\n      position: static;\n      float: none;\n}\n.webcg-devtools .navbar-text {\n    display: inline-block;\n    padding-top: 0.5rem;\n    padding-bottom: 0.5rem;\n}\n.webcg-devtools .navbar-collapse {\n    flex-basis: 100%;\n    flex-grow: 1;\n    align-items: center;\n}\n.webcg-devtools .navbar-toggler {\n    padding: 0.25rem 0.75rem;\n    font-size: 1.25rem;\n    line-height: 1;\n    background-color: transparent;\n    border: 1px solid transparent;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .navbar-toggler:hover, .webcg-devtools .navbar-toggler:focus {\n      text-decoration: none;\n}\n.webcg-devtools .navbar-toggler:not(:disabled):not(.disabled) {\n      cursor: pointer;\n}\n.webcg-devtools .navbar-toggler-icon {\n    display: inline-block;\n    width: 1.5em;\n    height: 1.5em;\n    vertical-align: middle;\n    content: \"\";\n    background: no-repeat center center;\n    background-size: 100% 100%;\n}\n@media (max-width: 575.98px) {\n.webcg-devtools .navbar-expand-sm > .container,\n    .webcg-devtools .navbar-expand-sm > .container-fluid {\n      padding-right: 0;\n      padding-left: 0;\n}\n}\n@media (min-width: 576px) {\n.webcg-devtools .navbar-expand-sm {\n      flex-flow: row nowrap;\n      justify-content: flex-start;\n}\n.webcg-devtools .navbar-expand-sm .navbar-nav {\n        flex-direction: row;\n}\n.webcg-devtools .navbar-expand-sm .navbar-nav .dropdown-menu {\n          position: absolute;\n}\n.webcg-devtools .navbar-expand-sm .navbar-nav .nav-link {\n          padding-right: 0.5rem;\n          padding-left: 0.5rem;\n}\n.webcg-devtools .navbar-expand-sm > .container,\n      .webcg-devtools .navbar-expand-sm > .container-fluid {\n        flex-wrap: nowrap;\n}\n.webcg-devtools .navbar-expand-sm .navbar-collapse {\n        display: flex !important;\n        flex-basis: auto;\n}\n.webcg-devtools .navbar-expand-sm .navbar-toggler {\n        display: none;\n}\n}\n@media (max-width: 767.98px) {\n.webcg-devtools .navbar-expand-md > .container,\n    .webcg-devtools .navbar-expand-md > .container-fluid {\n      padding-right: 0;\n      padding-left: 0;\n}\n}\n@media (min-width: 768px) {\n.webcg-devtools .navbar-expand-md {\n      flex-flow: row nowrap;\n      justify-content: flex-start;\n}\n.webcg-devtools .navbar-expand-md .navbar-nav {\n        flex-direction: row;\n}\n.webcg-devtools .navbar-expand-md .navbar-nav .dropdown-menu {\n          position: absolute;\n}\n.webcg-devtools .navbar-expand-md .navbar-nav .nav-link {\n          padding-right: 0.5rem;\n          padding-left: 0.5rem;\n}\n.webcg-devtools .navbar-expand-md > .container,\n      .webcg-devtools .navbar-expand-md > .container-fluid {\n        flex-wrap: nowrap;\n}\n.webcg-devtools .navbar-expand-md .navbar-collapse {\n        display: flex !important;\n        flex-basis: auto;\n}\n.webcg-devtools .navbar-expand-md .navbar-toggler {\n        display: none;\n}\n}\n@media (max-width: 991.98px) {\n.webcg-devtools .navbar-expand-lg > .container,\n    .webcg-devtools .navbar-expand-lg > .container-fluid {\n      padding-right: 0;\n      padding-left: 0;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .navbar-expand-lg {\n      flex-flow: row nowrap;\n      justify-content: flex-start;\n}\n.webcg-devtools .navbar-expand-lg .navbar-nav {\n        flex-direction: row;\n}\n.webcg-devtools .navbar-expand-lg .navbar-nav .dropdown-menu {\n          position: absolute;\n}\n.webcg-devtools .navbar-expand-lg .navbar-nav .nav-link {\n          padding-right: 0.5rem;\n          padding-left: 0.5rem;\n}\n.webcg-devtools .navbar-expand-lg > .container,\n      .webcg-devtools .navbar-expand-lg > .container-fluid {\n        flex-wrap: nowrap;\n}\n.webcg-devtools .navbar-expand-lg .navbar-collapse {\n        display: flex !important;\n        flex-basis: auto;\n}\n.webcg-devtools .navbar-expand-lg .navbar-toggler {\n        display: none;\n}\n}\n@media (max-width: 1199.98px) {\n.webcg-devtools .navbar-expand-xl > .container,\n    .webcg-devtools .navbar-expand-xl > .container-fluid {\n      padding-right: 0;\n      padding-left: 0;\n}\n}\n@media (min-width: 1200px) {\n.webcg-devtools .navbar-expand-xl {\n      flex-flow: row nowrap;\n      justify-content: flex-start;\n}\n.webcg-devtools .navbar-expand-xl .navbar-nav {\n        flex-direction: row;\n}\n.webcg-devtools .navbar-expand-xl .navbar-nav .dropdown-menu {\n          position: absolute;\n}\n.webcg-devtools .navbar-expand-xl .navbar-nav .nav-link {\n          padding-right: 0.5rem;\n          padding-left: 0.5rem;\n}\n.webcg-devtools .navbar-expand-xl > .container,\n      .webcg-devtools .navbar-expand-xl > .container-fluid {\n        flex-wrap: nowrap;\n}\n.webcg-devtools .navbar-expand-xl .navbar-collapse {\n        display: flex !important;\n        flex-basis: auto;\n}\n.webcg-devtools .navbar-expand-xl .navbar-toggler {\n        display: none;\n}\n}\n.webcg-devtools .navbar-expand {\n    flex-flow: row nowrap;\n    justify-content: flex-start;\n}\n.webcg-devtools .navbar-expand > .container,\n    .webcg-devtools .navbar-expand > .container-fluid {\n      padding-right: 0;\n      padding-left: 0;\n}\n.webcg-devtools .navbar-expand .navbar-nav {\n      flex-direction: row;\n}\n.webcg-devtools .navbar-expand .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.webcg-devtools .navbar-expand .navbar-nav .nav-link {\n        padding-right: 0.5rem;\n        padding-left: 0.5rem;\n}\n.webcg-devtools .navbar-expand > .container,\n    .webcg-devtools .navbar-expand > .container-fluid {\n      flex-wrap: nowrap;\n}\n.webcg-devtools .navbar-expand .navbar-collapse {\n      display: flex !important;\n      flex-basis: auto;\n}\n.webcg-devtools .navbar-expand .navbar-toggler {\n      display: none;\n}\n.webcg-devtools .navbar-light .navbar-brand {\n    color: rgba(0, 0, 0, 0.9);\n}\n.webcg-devtools .navbar-light .navbar-brand:hover, .webcg-devtools .navbar-light .navbar-brand:focus {\n      color: rgba(0, 0, 0, 0.9);\n}\n.webcg-devtools .navbar-light .navbar-nav .nav-link {\n    color: rgba(0, 0, 0, 0.5);\n}\n.webcg-devtools .navbar-light .navbar-nav .nav-link:hover, .webcg-devtools .navbar-light .navbar-nav .nav-link:focus {\n      color: rgba(0, 0, 0, 0.7);\n}\n.webcg-devtools .navbar-light .navbar-nav .nav-link.disabled {\n      color: rgba(0, 0, 0, 0.3);\n}\n.webcg-devtools .navbar-light .navbar-nav .show > .nav-link,\n  .webcg-devtools .navbar-light .navbar-nav .active > .nav-link,\n  .webcg-devtools .navbar-light .navbar-nav .nav-link.show,\n  .webcg-devtools .navbar-light .navbar-nav .nav-link.active {\n    color: rgba(0, 0, 0, 0.9);\n}\n.webcg-devtools .navbar-light .navbar-toggler {\n    color: rgba(0, 0, 0, 0.5);\n    border-color: rgba(0, 0, 0, 0.1);\n}\n.webcg-devtools .navbar-light .navbar-toggler-icon {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(0, 0, 0, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\");\n}\n.webcg-devtools .navbar-light .navbar-text {\n    color: rgba(0, 0, 0, 0.5);\n}\n.webcg-devtools .navbar-light .navbar-text a {\n      color: rgba(0, 0, 0, 0.9);\n}\n.webcg-devtools .navbar-light .navbar-text a:hover, .webcg-devtools .navbar-light .navbar-text a:focus {\n        color: rgba(0, 0, 0, 0.9);\n}\n.webcg-devtools .navbar-dark .navbar-brand {\n    color: #fff;\n}\n.webcg-devtools .navbar-dark .navbar-brand:hover, .webcg-devtools .navbar-dark .navbar-brand:focus {\n      color: #fff;\n}\n.webcg-devtools .navbar-dark .navbar-nav .nav-link {\n    color: rgba(255, 255, 255, 0.5);\n}\n.webcg-devtools .navbar-dark .navbar-nav .nav-link:hover, .webcg-devtools .navbar-dark .navbar-nav .nav-link:focus {\n      color: rgba(255, 255, 255, 0.75);\n}\n.webcg-devtools .navbar-dark .navbar-nav .nav-link.disabled {\n      color: rgba(255, 255, 255, 0.25);\n}\n.webcg-devtools .navbar-dark .navbar-nav .show > .nav-link,\n  .webcg-devtools .navbar-dark .navbar-nav .active > .nav-link,\n  .webcg-devtools .navbar-dark .navbar-nav .nav-link.show,\n  .webcg-devtools .navbar-dark .navbar-nav .nav-link.active {\n    color: #fff;\n}\n.webcg-devtools .navbar-dark .navbar-toggler {\n    color: rgba(255, 255, 255, 0.5);\n    border-color: rgba(255, 255, 255, 0.1);\n}\n.webcg-devtools .navbar-dark .navbar-toggler-icon {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\");\n}\n.webcg-devtools .navbar-dark .navbar-text {\n    color: rgba(255, 255, 255, 0.5);\n}\n.webcg-devtools .navbar-dark .navbar-text a {\n      color: #fff;\n}\n.webcg-devtools .navbar-dark .navbar-text a:hover, .webcg-devtools .navbar-dark .navbar-text a:focus {\n        color: #fff;\n}\n.webcg-devtools .card {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    min-width: 0;\n    word-wrap: break-word;\n    background-color: #fff;\n    background-clip: border-box;\n    border: 1px solid rgba(0, 0, 0, 0.125);\n    border-radius: 0.25rem;\n}\n.webcg-devtools .card > hr {\n      margin-right: 0;\n      margin-left: 0;\n}\n.webcg-devtools .card > .list-group:first-child .list-group-item:first-child {\n      border-top-left-radius: 0.25rem;\n      border-top-right-radius: 0.25rem;\n}\n.webcg-devtools .card > .list-group:last-child .list-group-item:last-child {\n      border-bottom-right-radius: 0.25rem;\n      border-bottom-left-radius: 0.25rem;\n}\n.webcg-devtools .card-body {\n    flex: 1 1 auto;\n    padding: 1.25rem;\n}\n.webcg-devtools .card-title {\n    margin-bottom: 0.75rem;\n}\n.webcg-devtools .card-subtitle {\n    margin-top: -0.375rem;\n    margin-bottom: 0;\n}\n.webcg-devtools .card-text:last-child {\n    margin-bottom: 0;\n}\n.webcg-devtools .card-link:hover {\n    text-decoration: none;\n}\n.webcg-devtools .card-link + .card-link {\n    margin-left: 1.25rem;\n}\n.webcg-devtools .card-header {\n    padding: 0.75rem 1.25rem;\n    margin-bottom: 0;\n    background-color: rgba(0, 0, 0, 0.03);\n    border-bottom: 1px solid rgba(0, 0, 0, 0.125);\n}\n.webcg-devtools .card-header:first-child {\n      border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;\n}\n.webcg-devtools .card-header + .list-group .list-group-item:first-child {\n      border-top: 0;\n}\n.webcg-devtools .card-footer {\n    padding: 0.75rem 1.25rem;\n    background-color: rgba(0, 0, 0, 0.03);\n    border-top: 1px solid rgba(0, 0, 0, 0.125);\n}\n.webcg-devtools .card-footer:last-child {\n      border-radius: 0 0 calc(0.25rem - 1px) calc(0.25rem - 1px);\n}\n.webcg-devtools .card-header-tabs {\n    margin-right: -0.625rem;\n    margin-bottom: -0.75rem;\n    margin-left: -0.625rem;\n    border-bottom: 0;\n}\n.webcg-devtools .card-header-pills {\n    margin-right: -0.625rem;\n    margin-left: -0.625rem;\n}\n.webcg-devtools .card-img-overlay {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    padding: 1.25rem;\n}\n.webcg-devtools .card-img {\n    width: 100%;\n    border-radius: calc(0.25rem - 1px);\n}\n.webcg-devtools .card-img-top {\n    width: 100%;\n    border-top-left-radius: calc(0.25rem - 1px);\n    border-top-right-radius: calc(0.25rem - 1px);\n}\n.webcg-devtools .card-img-bottom {\n    width: 100%;\n    border-bottom-right-radius: calc(0.25rem - 1px);\n    border-bottom-left-radius: calc(0.25rem - 1px);\n}\n.webcg-devtools .card-deck {\n    display: flex;\n    flex-direction: column;\n}\n.webcg-devtools .card-deck .card {\n      margin-bottom: 15px;\n}\n@media (min-width: 576px) {\n.webcg-devtools .card-deck {\n        flex-flow: row wrap;\n        margin-right: -15px;\n        margin-left: -15px;\n}\n.webcg-devtools .card-deck .card {\n          display: flex;\n          flex: 1 0 0%;\n          flex-direction: column;\n          margin-right: 15px;\n          margin-bottom: 0;\n          margin-left: 15px;\n}\n}\n.webcg-devtools .card-group {\n    display: flex;\n    flex-direction: column;\n}\n.webcg-devtools .card-group > .card {\n      margin-bottom: 15px;\n}\n@media (min-width: 576px) {\n.webcg-devtools .card-group {\n        flex-flow: row wrap;\n}\n.webcg-devtools .card-group > .card {\n          flex: 1 0 0%;\n          margin-bottom: 0;\n}\n.webcg-devtools .card-group > .card + .card {\n            margin-left: 0;\n            border-left: 0;\n}\n.webcg-devtools .card-group > .card:first-child {\n            border-top-right-radius: 0;\n            border-bottom-right-radius: 0;\n}\n.webcg-devtools .card-group > .card:first-child .card-img-top,\n            .webcg-devtools .card-group > .card:first-child .card-header {\n              border-top-right-radius: 0;\n}\n.webcg-devtools .card-group > .card:first-child .card-img-bottom,\n            .webcg-devtools .card-group > .card:first-child .card-footer {\n              border-bottom-right-radius: 0;\n}\n.webcg-devtools .card-group > .card:last-child {\n            border-top-left-radius: 0;\n            border-bottom-left-radius: 0;\n}\n.webcg-devtools .card-group > .card:last-child .card-img-top,\n            .webcg-devtools .card-group > .card:last-child .card-header {\n              border-top-left-radius: 0;\n}\n.webcg-devtools .card-group > .card:last-child .card-img-bottom,\n            .webcg-devtools .card-group > .card:last-child .card-footer {\n              border-bottom-left-radius: 0;\n}\n.webcg-devtools .card-group > .card:only-child {\n            border-radius: 0.25rem;\n}\n.webcg-devtools .card-group > .card:only-child .card-img-top,\n            .webcg-devtools .card-group > .card:only-child .card-header {\n              border-top-left-radius: 0.25rem;\n              border-top-right-radius: 0.25rem;\n}\n.webcg-devtools .card-group > .card:only-child .card-img-bottom,\n            .webcg-devtools .card-group > .card:only-child .card-footer {\n              border-bottom-right-radius: 0.25rem;\n              border-bottom-left-radius: 0.25rem;\n}\n.webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) {\n            border-radius: 0;\n}\n.webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-img-top,\n            .webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-img-bottom,\n            .webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-header,\n            .webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-footer {\n              border-radius: 0;\n}\n}\n.webcg-devtools .card-columns .card {\n    margin-bottom: 0.75rem;\n}\n@media (min-width: 576px) {\n.webcg-devtools .card-columns {\n      column-count: 3;\n      column-gap: 1.25rem;\n      orphans: 1;\n      widows: 1;\n}\n.webcg-devtools .card-columns .card {\n        display: inline-block;\n        width: 100%;\n}\n}\n.webcg-devtools .accordion .card:not(:first-of-type):not(:last-of-type) {\n    border-bottom: 0;\n    border-radius: 0;\n}\n.webcg-devtools .accordion .card:not(:first-of-type) .card-header:first-child {\n    border-radius: 0;\n}\n.webcg-devtools .accordion .card:first-of-type {\n    border-bottom: 0;\n    border-bottom-right-radius: 0;\n    border-bottom-left-radius: 0;\n}\n.webcg-devtools .accordion .card:last-of-type {\n    border-top-left-radius: 0;\n    border-top-right-radius: 0;\n}\n.webcg-devtools .breadcrumb {\n    display: flex;\n    flex-wrap: wrap;\n    padding: 0.75rem 1rem;\n    margin-bottom: 1rem;\n    list-style: none;\n    background-color: #e9ecef;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .breadcrumb-item + .breadcrumb-item {\n    padding-left: 0.5rem;\n}\n.webcg-devtools .breadcrumb-item + .breadcrumb-item::before {\n      display: inline-block;\n      padding-right: 0.5rem;\n      color: #6c757d;\n      content: \"/\";\n}\n.webcg-devtools .breadcrumb-item + .breadcrumb-item:hover::before {\n    text-decoration: underline;\n}\n.webcg-devtools .breadcrumb-item + .breadcrumb-item:hover::before {\n    text-decoration: none;\n}\n.webcg-devtools .breadcrumb-item.active {\n    color: #6c757d;\n}\n.webcg-devtools .pagination {\n    display: flex;\n    padding-left: 0;\n    list-style: none;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .page-link {\n    position: relative;\n    display: block;\n    padding: 0.5rem 0.75rem;\n    margin-left: -1px;\n    line-height: 1.25;\n    color: #007bff;\n    background-color: #fff;\n    border: 1px solid #dee2e6;\n}\n.webcg-devtools .page-link:hover {\n      z-index: 2;\n      color: #0056b3;\n      text-decoration: none;\n      background-color: #e9ecef;\n      border-color: #dee2e6;\n}\n.webcg-devtools .page-link:focus {\n      z-index: 2;\n      outline: 0;\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.webcg-devtools .page-link:not(:disabled):not(.disabled) {\n      cursor: pointer;\n}\n.webcg-devtools .page-item:first-child .page-link {\n    margin-left: 0;\n    border-top-left-radius: 0.25rem;\n    border-bottom-left-radius: 0.25rem;\n}\n.webcg-devtools .page-item:last-child .page-link {\n    border-top-right-radius: 0.25rem;\n    border-bottom-right-radius: 0.25rem;\n}\n.webcg-devtools .page-item.active .page-link {\n    z-index: 1;\n    color: #fff;\n    background-color: #007bff;\n    border-color: #007bff;\n}\n.webcg-devtools .page-item.disabled .page-link {\n    color: #6c757d;\n    pointer-events: none;\n    cursor: auto;\n    background-color: #fff;\n    border-color: #dee2e6;\n}\n.webcg-devtools .pagination-lg .page-link {\n    padding: 0.75rem 1.5rem;\n    font-size: 1.25rem;\n    line-height: 1.5;\n}\n.webcg-devtools .pagination-lg .page-item:first-child .page-link {\n    border-top-left-radius: 0.3rem;\n    border-bottom-left-radius: 0.3rem;\n}\n.webcg-devtools .pagination-lg .page-item:last-child .page-link {\n    border-top-right-radius: 0.3rem;\n    border-bottom-right-radius: 0.3rem;\n}\n.webcg-devtools .pagination-sm .page-link {\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n}\n.webcg-devtools .pagination-sm .page-item:first-child .page-link {\n    border-top-left-radius: 0.2rem;\n    border-bottom-left-radius: 0.2rem;\n}\n.webcg-devtools .pagination-sm .page-item:last-child .page-link {\n    border-top-right-radius: 0.2rem;\n    border-bottom-right-radius: 0.2rem;\n}\n.webcg-devtools .badge {\n    display: inline-block;\n    padding: 0.25em 0.4em;\n    font-size: 75%;\n    font-weight: 700;\n    line-height: 1;\n    text-align: center;\n    white-space: nowrap;\n    vertical-align: baseline;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .badge:empty {\n      display: none;\n}\n.webcg-devtools .btn .badge {\n    position: relative;\n    top: -1px;\n}\n.webcg-devtools .badge-pill {\n    padding-right: 0.6em;\n    padding-left: 0.6em;\n    border-radius: 10rem;\n}\n.webcg-devtools .badge-primary {\n    color: #fff;\n    background-color: #007bff;\n}\n.webcg-devtools .badge-primary[href]:hover, .webcg-devtools .badge-primary[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #0062cc;\n}\n.webcg-devtools .badge-secondary {\n    color: #fff;\n    background-color: #6c757d;\n}\n.webcg-devtools .badge-secondary[href]:hover, .webcg-devtools .badge-secondary[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #545b62;\n}\n.webcg-devtools .badge-success {\n    color: #fff;\n    background-color: #28a745;\n}\n.webcg-devtools .badge-success[href]:hover, .webcg-devtools .badge-success[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #1e7e34;\n}\n.webcg-devtools .badge-info {\n    color: #fff;\n    background-color: #17a2b8;\n}\n.webcg-devtools .badge-info[href]:hover, .webcg-devtools .badge-info[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #117a8b;\n}\n.webcg-devtools .badge-warning {\n    color: #212529;\n    background-color: #ffc107;\n}\n.webcg-devtools .badge-warning[href]:hover, .webcg-devtools .badge-warning[href]:focus {\n      color: #212529;\n      text-decoration: none;\n      background-color: #d39e00;\n}\n.webcg-devtools .badge-danger {\n    color: #fff;\n    background-color: #dc3545;\n}\n.webcg-devtools .badge-danger[href]:hover, .webcg-devtools .badge-danger[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #bd2130;\n}\n.webcg-devtools .badge-light {\n    color: #212529;\n    background-color: #f8f9fa;\n}\n.webcg-devtools .badge-light[href]:hover, .webcg-devtools .badge-light[href]:focus {\n      color: #212529;\n      text-decoration: none;\n      background-color: #dae0e5;\n}\n.webcg-devtools .badge-dark {\n    color: #fff;\n    background-color: #343a40;\n}\n.webcg-devtools .badge-dark[href]:hover, .webcg-devtools .badge-dark[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #1d2124;\n}\n.webcg-devtools .jumbotron {\n    padding: 2rem 1rem;\n    margin-bottom: 2rem;\n    background-color: #e9ecef;\n    border-radius: 0.3rem;\n}\n@media (min-width: 576px) {\n.webcg-devtools .jumbotron {\n        padding: 4rem 2rem;\n}\n}\n.webcg-devtools .jumbotron-fluid {\n    padding-right: 0;\n    padding-left: 0;\n    border-radius: 0;\n}\n.webcg-devtools .alert {\n    position: relative;\n    padding: 0.75rem 1.25rem;\n    margin-bottom: 1rem;\n    border: 1px solid transparent;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .alert-heading {\n    color: inherit;\n}\n.webcg-devtools .alert-link {\n    font-weight: 700;\n}\n.webcg-devtools .alert-dismissible {\n    padding-right: 4rem;\n}\n.webcg-devtools .alert-dismissible .close {\n      position: absolute;\n      top: 0;\n      right: 0;\n      padding: 0.75rem 1.25rem;\n      color: inherit;\n}\n.webcg-devtools .alert-primary {\n    color: #004085;\n    background-color: #cce5ff;\n    border-color: #b8daff;\n}\n.webcg-devtools .alert-primary hr {\n      border-top-color: #9fcdff;\n}\n.webcg-devtools .alert-primary .alert-link {\n      color: #002752;\n}\n.webcg-devtools .alert-secondary {\n    color: #383d41;\n    background-color: #e2e3e5;\n    border-color: #d6d8db;\n}\n.webcg-devtools .alert-secondary hr {\n      border-top-color: #c8cbcf;\n}\n.webcg-devtools .alert-secondary .alert-link {\n      color: #202326;\n}\n.webcg-devtools .alert-success {\n    color: #155724;\n    background-color: #d4edda;\n    border-color: #c3e6cb;\n}\n.webcg-devtools .alert-success hr {\n      border-top-color: #b1dfbb;\n}\n.webcg-devtools .alert-success .alert-link {\n      color: #0b2e13;\n}\n.webcg-devtools .alert-info {\n    color: #0c5460;\n    background-color: #d1ecf1;\n    border-color: #bee5eb;\n}\n.webcg-devtools .alert-info hr {\n      border-top-color: #abdde5;\n}\n.webcg-devtools .alert-info .alert-link {\n      color: #062c33;\n}\n.webcg-devtools .alert-warning {\n    color: #856404;\n    background-color: #fff3cd;\n    border-color: #ffeeba;\n}\n.webcg-devtools .alert-warning hr {\n      border-top-color: #ffe8a1;\n}\n.webcg-devtools .alert-warning .alert-link {\n      color: #533f03;\n}\n.webcg-devtools .alert-danger {\n    color: #721c24;\n    background-color: #f8d7da;\n    border-color: #f5c6cb;\n}\n.webcg-devtools .alert-danger hr {\n      border-top-color: #f1b0b7;\n}\n.webcg-devtools .alert-danger .alert-link {\n      color: #491217;\n}\n.webcg-devtools .alert-light {\n    color: #818182;\n    background-color: #fefefe;\n    border-color: #fdfdfe;\n}\n.webcg-devtools .alert-light hr {\n      border-top-color: #ececf6;\n}\n.webcg-devtools .alert-light .alert-link {\n      color: #686868;\n}\n.webcg-devtools .alert-dark {\n    color: #1b1e21;\n    background-color: #d6d8d9;\n    border-color: #c6c8ca;\n}\n.webcg-devtools .alert-dark hr {\n      border-top-color: #b9bbbe;\n}\n.webcg-devtools .alert-dark .alert-link {\n      color: #040505;\n}\n@keyframes progress-bar-stripes {\nfrom {\n    background-position: 1rem 0;\n}\nto {\n    background-position: 0 0;\n}\n}\n.webcg-devtools .progress {\n    display: flex;\n    height: 1rem;\n    overflow: hidden;\n    font-size: 0.75rem;\n    background-color: #e9ecef;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .progress-bar {\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    color: #fff;\n    text-align: center;\n    white-space: nowrap;\n    background-color: #007bff;\n    transition: width 0.6s ease;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .progress-bar {\n        transition: none;\n}\n}\n.webcg-devtools .progress-bar-striped {\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-size: 1rem 1rem;\n}\n.webcg-devtools .progress-bar-animated {\n    animation: progress-bar-stripes 1s linear infinite;\n}\n.webcg-devtools .media {\n    display: flex;\n    align-items: flex-start;\n}\n.webcg-devtools .media-body {\n    flex: 1;\n}\n.webcg-devtools .list-group {\n    display: flex;\n    flex-direction: column;\n    padding-left: 0;\n    margin-bottom: 0;\n}\n.webcg-devtools .list-group-item-action {\n    width: 100%;\n    color: #495057;\n    text-align: inherit;\n}\n.webcg-devtools .list-group-item-action:hover, .webcg-devtools .list-group-item-action:focus {\n      color: #495057;\n      text-decoration: none;\n      background-color: #f8f9fa;\n}\n.webcg-devtools .list-group-item-action:active {\n      color: #212529;\n      background-color: #e9ecef;\n}\n.webcg-devtools .list-group-item {\n    position: relative;\n    display: block;\n    padding: 0.75rem 1.25rem;\n    margin-bottom: -1px;\n    background-color: #fff;\n    border: 1px solid rgba(0, 0, 0, 0.125);\n}\n.webcg-devtools .list-group-item:first-child {\n      border-top-left-radius: 0.25rem;\n      border-top-right-radius: 0.25rem;\n}\n.webcg-devtools .list-group-item:last-child {\n      margin-bottom: 0;\n      border-bottom-right-radius: 0.25rem;\n      border-bottom-left-radius: 0.25rem;\n}\n.webcg-devtools .list-group-item:hover, .webcg-devtools .list-group-item:focus {\n      z-index: 1;\n      text-decoration: none;\n}\n.webcg-devtools .list-group-item.disabled, .webcg-devtools .list-group-item:disabled {\n      color: #6c757d;\n      background-color: #fff;\n}\n.webcg-devtools .list-group-item.active {\n      z-index: 2;\n      color: #fff;\n      background-color: #007bff;\n      border-color: #007bff;\n}\n.webcg-devtools .list-group-flush .list-group-item {\n    border-right: 0;\n    border-left: 0;\n    border-radius: 0;\n}\n.webcg-devtools .list-group-flush:first-child .list-group-item:first-child {\n    border-top: 0;\n}\n.webcg-devtools .list-group-flush:last-child .list-group-item:last-child {\n    border-bottom: 0;\n}\n.webcg-devtools .list-group-item-primary {\n    color: #004085;\n    background-color: #b8daff;\n}\n.webcg-devtools .list-group-item-primary.list-group-item-action:hover, .webcg-devtools .list-group-item-primary.list-group-item-action:focus {\n      color: #004085;\n      background-color: #9fcdff;\n}\n.webcg-devtools .list-group-item-primary.list-group-item-action.active {\n      color: #fff;\n      background-color: #004085;\n      border-color: #004085;\n}\n.webcg-devtools .list-group-item-secondary {\n    color: #383d41;\n    background-color: #d6d8db;\n}\n.webcg-devtools .list-group-item-secondary.list-group-item-action:hover, .webcg-devtools .list-group-item-secondary.list-group-item-action:focus {\n      color: #383d41;\n      background-color: #c8cbcf;\n}\n.webcg-devtools .list-group-item-secondary.list-group-item-action.active {\n      color: #fff;\n      background-color: #383d41;\n      border-color: #383d41;\n}\n.webcg-devtools .list-group-item-success {\n    color: #155724;\n    background-color: #c3e6cb;\n}\n.webcg-devtools .list-group-item-success.list-group-item-action:hover, .webcg-devtools .list-group-item-success.list-group-item-action:focus {\n      color: #155724;\n      background-color: #b1dfbb;\n}\n.webcg-devtools .list-group-item-success.list-group-item-action.active {\n      color: #fff;\n      background-color: #155724;\n      border-color: #155724;\n}\n.webcg-devtools .list-group-item-info {\n    color: #0c5460;\n    background-color: #bee5eb;\n}\n.webcg-devtools .list-group-item-info.list-group-item-action:hover, .webcg-devtools .list-group-item-info.list-group-item-action:focus {\n      color: #0c5460;\n      background-color: #abdde5;\n}\n.webcg-devtools .list-group-item-info.list-group-item-action.active {\n      color: #fff;\n      background-color: #0c5460;\n      border-color: #0c5460;\n}\n.webcg-devtools .list-group-item-warning {\n    color: #856404;\n    background-color: #ffeeba;\n}\n.webcg-devtools .list-group-item-warning.list-group-item-action:hover, .webcg-devtools .list-group-item-warning.list-group-item-action:focus {\n      color: #856404;\n      background-color: #ffe8a1;\n}\n.webcg-devtools .list-group-item-warning.list-group-item-action.active {\n      color: #fff;\n      background-color: #856404;\n      border-color: #856404;\n}\n.webcg-devtools .list-group-item-danger {\n    color: #721c24;\n    background-color: #f5c6cb;\n}\n.webcg-devtools .list-group-item-danger.list-group-item-action:hover, .webcg-devtools .list-group-item-danger.list-group-item-action:focus {\n      color: #721c24;\n      background-color: #f1b0b7;\n}\n.webcg-devtools .list-group-item-danger.list-group-item-action.active {\n      color: #fff;\n      background-color: #721c24;\n      border-color: #721c24;\n}\n.webcg-devtools .list-group-item-light {\n    color: #818182;\n    background-color: #fdfdfe;\n}\n.webcg-devtools .list-group-item-light.list-group-item-action:hover, .webcg-devtools .list-group-item-light.list-group-item-action:focus {\n      color: #818182;\n      background-color: #ececf6;\n}\n.webcg-devtools .list-group-item-light.list-group-item-action.active {\n      color: #fff;\n      background-color: #818182;\n      border-color: #818182;\n}\n.webcg-devtools .list-group-item-dark {\n    color: #1b1e21;\n    background-color: #c6c8ca;\n}\n.webcg-devtools .list-group-item-dark.list-group-item-action:hover, .webcg-devtools .list-group-item-dark.list-group-item-action:focus {\n      color: #1b1e21;\n      background-color: #b9bbbe;\n}\n.webcg-devtools .list-group-item-dark.list-group-item-action.active {\n      color: #fff;\n      background-color: #1b1e21;\n      border-color: #1b1e21;\n}\n.webcg-devtools .close {\n    float: right;\n    font-size: 1.5rem;\n    font-weight: 700;\n    line-height: 1;\n    color: #000;\n    text-shadow: 0 1px 0 #fff;\n    opacity: .5;\n}\n.webcg-devtools .close:not(:disabled):not(.disabled) {\n      cursor: pointer;\n}\n.webcg-devtools .close:not(:disabled):not(.disabled):hover, .webcg-devtools .close:not(:disabled):not(.disabled):focus {\n        color: #000;\n        text-decoration: none;\n        opacity: .75;\n}\n.webcg-devtools button.close {\n    padding: 0;\n    background-color: transparent;\n    border: 0;\n    -webkit-appearance: none;\n}\n.webcg-devtools .modal-open {\n    overflow: hidden;\n}\n.webcg-devtools .modal-open .modal {\n      overflow-x: hidden;\n      overflow-y: auto;\n}\n.webcg-devtools .modal {\n    position: fixed;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: 1050;\n    display: none;\n    overflow: hidden;\n    outline: 0;\n}\n.webcg-devtools .modal-dialog {\n    position: relative;\n    width: auto;\n    margin: 0.5rem;\n    pointer-events: none;\n}\n.modal.fade .webcg-devtools .modal-dialog {\n      transition: transform 0.3s ease-out;\n      transform: translate(0, -25%);\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.modal.fade .webcg-devtools .modal-dialog {\n          transition: none;\n}\n}\n.modal.show .webcg-devtools .modal-dialog {\n      transform: translate(0, 0);\n}\n.webcg-devtools .modal-dialog-centered {\n    display: flex;\n    align-items: center;\n    min-height: calc(100% - (0.5rem * 2));\n}\n.webcg-devtools .modal-dialog-centered::before {\n      display: block;\n      height: calc(100vh - (0.5rem * 2));\n      content: \"\";\n}\n.webcg-devtools .modal-content {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    width: 100%;\n    pointer-events: auto;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid rgba(0, 0, 0, 0.2);\n    border-radius: 0.3rem;\n    outline: 0;\n}\n.webcg-devtools .modal-backdrop {\n    position: fixed;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: 1040;\n    background-color: #000;\n}\n.webcg-devtools .modal-backdrop.fade {\n      opacity: 0;\n}\n.webcg-devtools .modal-backdrop.show {\n      opacity: 0.5;\n}\n.webcg-devtools .modal-header {\n    display: flex;\n    align-items: flex-start;\n    justify-content: space-between;\n    padding: 1rem;\n    border-bottom: 1px solid #e9ecef;\n    border-top-left-radius: 0.3rem;\n    border-top-right-radius: 0.3rem;\n}\n.webcg-devtools .modal-header .close {\n      padding: 1rem;\n      margin: -1rem -1rem -1rem auto;\n}\n.webcg-devtools .modal-title {\n    margin-bottom: 0;\n    line-height: 1.5;\n}\n.webcg-devtools .modal-body {\n    position: relative;\n    flex: 1 1 auto;\n    padding: 1rem;\n}\n.webcg-devtools .modal-footer {\n    display: flex;\n    align-items: center;\n    justify-content: flex-end;\n    padding: 1rem;\n    border-top: 1px solid #e9ecef;\n}\n.webcg-devtools .modal-footer > :not(:first-child) {\n      margin-left: .25rem;\n}\n.webcg-devtools .modal-footer > :not(:last-child) {\n      margin-right: .25rem;\n}\n.webcg-devtools .modal-scrollbar-measure {\n    position: absolute;\n    top: -9999px;\n    width: 50px;\n    height: 50px;\n    overflow: scroll;\n}\n@media (min-width: 576px) {\n.webcg-devtools .modal-dialog {\n      max-width: 500px;\n      margin: 1.75rem auto;\n}\n.webcg-devtools .modal-dialog-centered {\n      min-height: calc(100% - (1.75rem * 2));\n}\n.webcg-devtools .modal-dialog-centered::before {\n        height: calc(100vh - (1.75rem * 2));\n}\n.webcg-devtools .modal-sm {\n      max-width: 300px;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .modal-lg {\n      max-width: 800px;\n}\n}\n.webcg-devtools .tooltip {\n    position: absolute;\n    z-index: 1070;\n    display: block;\n    margin: 0;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n    font-style: normal;\n    font-weight: 400;\n    line-height: 1.5;\n    text-align: left;\n    text-align: start;\n    text-decoration: none;\n    text-shadow: none;\n    text-transform: none;\n    letter-spacing: normal;\n    word-break: normal;\n    word-spacing: normal;\n    white-space: normal;\n    line-break: auto;\n    font-size: 0.875rem;\n    word-wrap: break-word;\n    opacity: 0;\n}\n.webcg-devtools .tooltip.show {\n      opacity: 0.9;\n}\n.webcg-devtools .tooltip .arrow {\n      position: absolute;\n      display: block;\n      width: 0.8rem;\n      height: 0.4rem;\n}\n.webcg-devtools .tooltip .arrow::before {\n        position: absolute;\n        content: \"\";\n        border-color: transparent;\n        border-style: solid;\n}\n.webcg-devtools .bs-tooltip-top, .webcg-devtools .bs-tooltip-auto[x-placement^=\"top\"] {\n    padding: 0.4rem 0;\n}\n.webcg-devtools .bs-tooltip-top .arrow, .webcg-devtools .bs-tooltip-auto[x-placement^=\"top\"] .arrow {\n      bottom: 0;\n}\n.webcg-devtools .bs-tooltip-top .arrow::before, .webcg-devtools .bs-tooltip-auto[x-placement^=\"top\"] .arrow::before {\n        top: 0;\n        border-width: 0.4rem 0.4rem 0;\n        border-top-color: #000;\n}\n.webcg-devtools .bs-tooltip-right, .webcg-devtools .bs-tooltip-auto[x-placement^=\"right\"] {\n    padding: 0 0.4rem;\n}\n.webcg-devtools .bs-tooltip-right .arrow, .webcg-devtools .bs-tooltip-auto[x-placement^=\"right\"] .arrow {\n      left: 0;\n      width: 0.4rem;\n      height: 0.8rem;\n}\n.webcg-devtools .bs-tooltip-right .arrow::before, .webcg-devtools .bs-tooltip-auto[x-placement^=\"right\"] .arrow::before {\n        right: 0;\n        border-width: 0.4rem 0.4rem 0.4rem 0;\n        border-right-color: #000;\n}\n.webcg-devtools .bs-tooltip-bottom, .webcg-devtools .bs-tooltip-auto[x-placement^=\"bottom\"] {\n    padding: 0.4rem 0;\n}\n.webcg-devtools .bs-tooltip-bottom .arrow, .webcg-devtools .bs-tooltip-auto[x-placement^=\"bottom\"] .arrow {\n      top: 0;\n}\n.webcg-devtools .bs-tooltip-bottom .arrow::before, .webcg-devtools .bs-tooltip-auto[x-placement^=\"bottom\"] .arrow::before {\n        bottom: 0;\n        border-width: 0 0.4rem 0.4rem;\n        border-bottom-color: #000;\n}\n.webcg-devtools .bs-tooltip-left, .webcg-devtools .bs-tooltip-auto[x-placement^=\"left\"] {\n    padding: 0 0.4rem;\n}\n.webcg-devtools .bs-tooltip-left .arrow, .webcg-devtools .bs-tooltip-auto[x-placement^=\"left\"] .arrow {\n      right: 0;\n      width: 0.4rem;\n      height: 0.8rem;\n}\n.webcg-devtools .bs-tooltip-left .arrow::before, .webcg-devtools .bs-tooltip-auto[x-placement^=\"left\"] .arrow::before {\n        left: 0;\n        border-width: 0.4rem 0 0.4rem 0.4rem;\n        border-left-color: #000;\n}\n.webcg-devtools .tooltip-inner {\n    max-width: 200px;\n    padding: 0.25rem 0.5rem;\n    color: #fff;\n    text-align: center;\n    background-color: #000;\n    border-radius: 0.25rem;\n}\n.webcg-devtools .popover {\n    position: absolute;\n    top: 0;\n    left: 0;\n    z-index: 1060;\n    display: block;\n    max-width: 276px;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n    font-style: normal;\n    font-weight: 400;\n    line-height: 1.5;\n    text-align: left;\n    text-align: start;\n    text-decoration: none;\n    text-shadow: none;\n    text-transform: none;\n    letter-spacing: normal;\n    word-break: normal;\n    word-spacing: normal;\n    white-space: normal;\n    line-break: auto;\n    font-size: 0.875rem;\n    word-wrap: break-word;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid rgba(0, 0, 0, 0.2);\n    border-radius: 0.3rem;\n}\n.webcg-devtools .popover .arrow {\n      position: absolute;\n      display: block;\n      width: 1rem;\n      height: 0.5rem;\n      margin: 0 0.3rem;\n}\n.webcg-devtools .popover .arrow::before, .webcg-devtools .popover .arrow::after {\n        position: absolute;\n        display: block;\n        content: \"\";\n        border-color: transparent;\n        border-style: solid;\n}\n.webcg-devtools .bs-popover-top, .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] {\n    margin-bottom: 0.5rem;\n}\n.webcg-devtools .bs-popover-top .arrow, .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow {\n      bottom: calc((0.5rem + 1px) * -1);\n}\n.webcg-devtools .bs-popover-top .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow::before,\n    .webcg-devtools .bs-popover-top .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow::after {\n      border-width: 0.5rem 0.5rem 0;\n}\n.webcg-devtools .bs-popover-top .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow::before {\n      bottom: 0;\n      border-top-color: rgba(0, 0, 0, 0.25);\n}\n.webcg-devtools .bs-popover-top .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow::after {\n      bottom: 1px;\n      border-top-color: #fff;\n}\n.webcg-devtools .bs-popover-right, .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] {\n    margin-left: 0.5rem;\n}\n.webcg-devtools .bs-popover-right .arrow, .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow {\n      left: calc((0.5rem + 1px) * -1);\n      width: 0.5rem;\n      height: 1rem;\n      margin: 0.3rem 0;\n}\n.webcg-devtools .bs-popover-right .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow::before,\n    .webcg-devtools .bs-popover-right .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow::after {\n      border-width: 0.5rem 0.5rem 0.5rem 0;\n}\n.webcg-devtools .bs-popover-right .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow::before {\n      left: 0;\n      border-right-color: rgba(0, 0, 0, 0.25);\n}\n.webcg-devtools .bs-popover-right .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow::after {\n      left: 1px;\n      border-right-color: #fff;\n}\n.webcg-devtools .bs-popover-bottom, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] {\n    margin-top: 0.5rem;\n}\n.webcg-devtools .bs-popover-bottom .arrow, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow {\n      top: calc((0.5rem + 1px) * -1);\n}\n.webcg-devtools .bs-popover-bottom .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow::before,\n    .webcg-devtools .bs-popover-bottom .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow::after {\n      border-width: 0 0.5rem 0.5rem 0.5rem;\n}\n.webcg-devtools .bs-popover-bottom .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow::before {\n      top: 0;\n      border-bottom-color: rgba(0, 0, 0, 0.25);\n}\n.webcg-devtools .bs-popover-bottom .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow::after {\n      top: 1px;\n      border-bottom-color: #fff;\n}\n.webcg-devtools .bs-popover-bottom .popover-header::before, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .popover-header::before {\n      position: absolute;\n      top: 0;\n      left: 50%;\n      display: block;\n      width: 1rem;\n      margin-left: -0.5rem;\n      content: \"\";\n      border-bottom: 1px solid #f7f7f7;\n}\n.webcg-devtools .bs-popover-left, .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] {\n    margin-right: 0.5rem;\n}\n.webcg-devtools .bs-popover-left .arrow, .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow {\n      right: calc((0.5rem + 1px) * -1);\n      width: 0.5rem;\n      height: 1rem;\n      margin: 0.3rem 0;\n}\n.webcg-devtools .bs-popover-left .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow::before,\n    .webcg-devtools .bs-popover-left .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow::after {\n      border-width: 0.5rem 0 0.5rem 0.5rem;\n}\n.webcg-devtools .bs-popover-left .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow::before {\n      right: 0;\n      border-left-color: rgba(0, 0, 0, 0.25);\n}\n.webcg-devtools .bs-popover-left .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow::after {\n      right: 1px;\n      border-left-color: #fff;\n}\n.webcg-devtools .popover-header {\n    padding: 0.5rem 0.75rem;\n    margin-bottom: 0;\n    font-size: 1rem;\n    color: inherit;\n    background-color: #f7f7f7;\n    border-bottom: 1px solid #ebebeb;\n    border-top-left-radius: calc(0.3rem - 1px);\n    border-top-right-radius: calc(0.3rem - 1px);\n}\n.webcg-devtools .popover-header:empty {\n      display: none;\n}\n.webcg-devtools .popover-body {\n    padding: 0.5rem 0.75rem;\n    color: #212529;\n}\n.webcg-devtools .carousel {\n    position: relative;\n}\n.webcg-devtools .carousel-inner {\n    position: relative;\n    width: 100%;\n    overflow: hidden;\n}\n.webcg-devtools .carousel-item {\n    position: relative;\n    display: none;\n    align-items: center;\n    width: 100%;\n    backface-visibility: hidden;\n    perspective: 1000px;\n}\n.webcg-devtools .carousel-item.active,\n  .webcg-devtools .carousel-item-next,\n  .webcg-devtools .carousel-item-prev {\n    display: block;\n    transition: transform 0.6s ease;\n}\n@media screen and (prefers-reduced-motion: reduce) {\n.webcg-devtools .carousel-item.active,\n      .webcg-devtools .carousel-item-next,\n      .webcg-devtools .carousel-item-prev {\n        transition: none;\n}\n}\n.webcg-devtools .carousel-item-next,\n  .webcg-devtools .carousel-item-prev {\n    position: absolute;\n    top: 0;\n}\n.webcg-devtools .carousel-item-next.carousel-item-left,\n  .webcg-devtools .carousel-item-prev.carousel-item-right {\n    transform: translateX(0);\n}\n@supports (transform-style: preserve-3d) {\n.webcg-devtools .carousel-item-next.carousel-item-left,\n      .webcg-devtools .carousel-item-prev.carousel-item-right {\n        transform: translate3d(0, 0, 0);\n}\n}\n.webcg-devtools .carousel-item-next,\n  .webcg-devtools .active.carousel-item-right {\n    transform: translateX(100%);\n}\n@supports (transform-style: preserve-3d) {\n.webcg-devtools .carousel-item-next,\n      .webcg-devtools .active.carousel-item-right {\n        transform: translate3d(100%, 0, 0);\n}\n}\n.webcg-devtools .carousel-item-prev,\n  .webcg-devtools .active.carousel-item-left {\n    transform: translateX(-100%);\n}\n@supports (transform-style: preserve-3d) {\n.webcg-devtools .carousel-item-prev,\n      .webcg-devtools .active.carousel-item-left {\n        transform: translate3d(-100%, 0, 0);\n}\n}\n.webcg-devtools .carousel-fade .carousel-item {\n    opacity: 0;\n    transition-duration: .6s;\n    transition-property: opacity;\n}\n.webcg-devtools .carousel-fade .carousel-item.active,\n  .webcg-devtools .carousel-fade .carousel-item-next.carousel-item-left,\n  .webcg-devtools .carousel-fade .carousel-item-prev.carousel-item-right {\n    opacity: 1;\n}\n.webcg-devtools .carousel-fade .active.carousel-item-left,\n  .webcg-devtools .carousel-fade .active.carousel-item-right {\n    opacity: 0;\n}\n.webcg-devtools .carousel-fade .carousel-item-next,\n  .webcg-devtools .carousel-fade .carousel-item-prev,\n  .webcg-devtools .carousel-fade .carousel-item.active,\n  .webcg-devtools .carousel-fade .active.carousel-item-left,\n  .webcg-devtools .carousel-fade .active.carousel-item-prev {\n    transform: translateX(0);\n}\n@supports (transform-style: preserve-3d) {\n.webcg-devtools .carousel-fade .carousel-item-next,\n      .webcg-devtools .carousel-fade .carousel-item-prev,\n      .webcg-devtools .carousel-fade .carousel-item.active,\n      .webcg-devtools .carousel-fade .active.carousel-item-left,\n      .webcg-devtools .carousel-fade .active.carousel-item-prev {\n        transform: translate3d(0, 0, 0);\n}\n}\n.webcg-devtools .carousel-control-prev,\n  .webcg-devtools .carousel-control-next {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 15%;\n    color: #fff;\n    text-align: center;\n    opacity: 0.5;\n}\n.webcg-devtools .carousel-control-prev:hover, .webcg-devtools .carousel-control-prev:focus,\n    .webcg-devtools .carousel-control-next:hover,\n    .webcg-devtools .carousel-control-next:focus {\n      color: #fff;\n      text-decoration: none;\n      outline: 0;\n      opacity: .9;\n}\n.webcg-devtools .carousel-control-prev {\n    left: 0;\n}\n.webcg-devtools .carousel-control-next {\n    right: 0;\n}\n.webcg-devtools .carousel-control-prev-icon,\n  .webcg-devtools .carousel-control-next-icon {\n    display: inline-block;\n    width: 20px;\n    height: 20px;\n    background: transparent no-repeat center center;\n    background-size: 100% 100%;\n}\n.webcg-devtools .carousel-control-prev-icon {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 8 8'%3E%3Cpath d='M5.25 0l-4 4 4 4 1.5-1.5-2.5-2.5 2.5-2.5-1.5-1.5z'/%3E%3C/svg%3E\");\n}\n.webcg-devtools .carousel-control-next-icon {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 8 8'%3E%3Cpath d='M2.75 0l-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 4-4-4-4z'/%3E%3C/svg%3E\");\n}\n.webcg-devtools .carousel-indicators {\n    position: absolute;\n    right: 0;\n    bottom: 10px;\n    left: 0;\n    z-index: 15;\n    display: flex;\n    justify-content: center;\n    padding-left: 0;\n    margin-right: 15%;\n    margin-left: 15%;\n    list-style: none;\n}\n.webcg-devtools .carousel-indicators li {\n      position: relative;\n      flex: 0 1 auto;\n      width: 30px;\n      height: 3px;\n      margin-right: 3px;\n      margin-left: 3px;\n      text-indent: -999px;\n      cursor: pointer;\n      background-color: rgba(255, 255, 255, 0.5);\n}\n.webcg-devtools .carousel-indicators li::before {\n        position: absolute;\n        top: -10px;\n        left: 0;\n        display: inline-block;\n        width: 100%;\n        height: 10px;\n        content: \"\";\n}\n.webcg-devtools .carousel-indicators li::after {\n        position: absolute;\n        bottom: -10px;\n        left: 0;\n        display: inline-block;\n        width: 100%;\n        height: 10px;\n        content: \"\";\n}\n.webcg-devtools .carousel-indicators .active {\n      background-color: #fff;\n}\n.webcg-devtools .carousel-caption {\n    position: absolute;\n    right: 15%;\n    bottom: 20px;\n    left: 15%;\n    z-index: 10;\n    padding-top: 20px;\n    padding-bottom: 20px;\n    color: #fff;\n    text-align: center;\n}\n.webcg-devtools .align-baseline {\n    vertical-align: baseline !important;\n}\n.webcg-devtools .align-top {\n    vertical-align: top !important;\n}\n.webcg-devtools .align-middle {\n    vertical-align: middle !important;\n}\n.webcg-devtools .align-bottom {\n    vertical-align: bottom !important;\n}\n.webcg-devtools .align-text-bottom {\n    vertical-align: text-bottom !important;\n}\n.webcg-devtools .align-text-top {\n    vertical-align: text-top !important;\n}\n.webcg-devtools .bg-primary {\n    background-color: #007bff !important;\n}\n.webcg-devtools a.bg-primary:hover, .webcg-devtools a.bg-primary:focus,\n  .webcg-devtools button.bg-primary:hover,\n  .webcg-devtools button.bg-primary:focus {\n    background-color: #0062cc !important;\n}\n.webcg-devtools .bg-secondary {\n    background-color: #6c757d !important;\n}\n.webcg-devtools a.bg-secondary:hover, .webcg-devtools a.bg-secondary:focus,\n  .webcg-devtools button.bg-secondary:hover,\n  .webcg-devtools button.bg-secondary:focus {\n    background-color: #545b62 !important;\n}\n.webcg-devtools .bg-success {\n    background-color: #28a745 !important;\n}\n.webcg-devtools a.bg-success:hover, .webcg-devtools a.bg-success:focus,\n  .webcg-devtools button.bg-success:hover,\n  .webcg-devtools button.bg-success:focus {\n    background-color: #1e7e34 !important;\n}\n.webcg-devtools .bg-info {\n    background-color: #17a2b8 !important;\n}\n.webcg-devtools a.bg-info:hover, .webcg-devtools a.bg-info:focus,\n  .webcg-devtools button.bg-info:hover,\n  .webcg-devtools button.bg-info:focus {\n    background-color: #117a8b !important;\n}\n.webcg-devtools .bg-warning {\n    background-color: #ffc107 !important;\n}\n.webcg-devtools a.bg-warning:hover, .webcg-devtools a.bg-warning:focus,\n  .webcg-devtools button.bg-warning:hover,\n  .webcg-devtools button.bg-warning:focus {\n    background-color: #d39e00 !important;\n}\n.webcg-devtools .bg-danger {\n    background-color: #dc3545 !important;\n}\n.webcg-devtools a.bg-danger:hover, .webcg-devtools a.bg-danger:focus,\n  .webcg-devtools button.bg-danger:hover,\n  .webcg-devtools button.bg-danger:focus {\n    background-color: #bd2130 !important;\n}\n.webcg-devtools .bg-light {\n    background-color: #f8f9fa !important;\n}\n.webcg-devtools a.bg-light:hover, .webcg-devtools a.bg-light:focus,\n  .webcg-devtools button.bg-light:hover,\n  .webcg-devtools button.bg-light:focus {\n    background-color: #dae0e5 !important;\n}\n.webcg-devtools .bg-dark {\n    background-color: #343a40 !important;\n}\n.webcg-devtools a.bg-dark:hover, .webcg-devtools a.bg-dark:focus,\n  .webcg-devtools button.bg-dark:hover,\n  .webcg-devtools button.bg-dark:focus {\n    background-color: #1d2124 !important;\n}\n.webcg-devtools .bg-white {\n    background-color: #fff !important;\n}\n.webcg-devtools .bg-transparent {\n    background-color: transparent !important;\n}\n.webcg-devtools .border {\n    border: 1px solid #dee2e6 !important;\n}\n.webcg-devtools .border-top {\n    border-top: 1px solid #dee2e6 !important;\n}\n.webcg-devtools .border-right {\n    border-right: 1px solid #dee2e6 !important;\n}\n.webcg-devtools .border-bottom {\n    border-bottom: 1px solid #dee2e6 !important;\n}\n.webcg-devtools .border-left {\n    border-left: 1px solid #dee2e6 !important;\n}\n.webcg-devtools .border-0 {\n    border: 0 !important;\n}\n.webcg-devtools .border-top-0 {\n    border-top: 0 !important;\n}\n.webcg-devtools .border-right-0 {\n    border-right: 0 !important;\n}\n.webcg-devtools .border-bottom-0 {\n    border-bottom: 0 !important;\n}\n.webcg-devtools .border-left-0 {\n    border-left: 0 !important;\n}\n.webcg-devtools .border-primary {\n    border-color: #007bff !important;\n}\n.webcg-devtools .border-secondary {\n    border-color: #6c757d !important;\n}\n.webcg-devtools .border-success {\n    border-color: #28a745 !important;\n}\n.webcg-devtools .border-info {\n    border-color: #17a2b8 !important;\n}\n.webcg-devtools .border-warning {\n    border-color: #ffc107 !important;\n}\n.webcg-devtools .border-danger {\n    border-color: #dc3545 !important;\n}\n.webcg-devtools .border-light {\n    border-color: #f8f9fa !important;\n}\n.webcg-devtools .border-dark {\n    border-color: #343a40 !important;\n}\n.webcg-devtools .border-white {\n    border-color: #fff !important;\n}\n.webcg-devtools .rounded {\n    border-radius: 0.25rem !important;\n}\n.webcg-devtools .rounded-top {\n    border-top-left-radius: 0.25rem !important;\n    border-top-right-radius: 0.25rem !important;\n}\n.webcg-devtools .rounded-right {\n    border-top-right-radius: 0.25rem !important;\n    border-bottom-right-radius: 0.25rem !important;\n}\n.webcg-devtools .rounded-bottom {\n    border-bottom-right-radius: 0.25rem !important;\n    border-bottom-left-radius: 0.25rem !important;\n}\n.webcg-devtools .rounded-left {\n    border-top-left-radius: 0.25rem !important;\n    border-bottom-left-radius: 0.25rem !important;\n}\n.webcg-devtools .rounded-circle {\n    border-radius: 50% !important;\n}\n.webcg-devtools .rounded-0 {\n    border-radius: 0 !important;\n}\n.webcg-devtools .clearfix::after {\n    display: block;\n    clear: both;\n    content: \"\";\n}\n.webcg-devtools .d-none {\n    display: none !important;\n}\n.webcg-devtools .d-inline {\n    display: inline !important;\n}\n.webcg-devtools .d-inline-block {\n    display: inline-block !important;\n}\n.webcg-devtools .d-block {\n    display: block !important;\n}\n.webcg-devtools .d-table {\n    display: table !important;\n}\n.webcg-devtools .d-table-row {\n    display: table-row !important;\n}\n.webcg-devtools .d-table-cell {\n    display: table-cell !important;\n}\n.webcg-devtools .d-flex {\n    display: flex !important;\n}\n.webcg-devtools .d-inline-flex {\n    display: inline-flex !important;\n}\n@media (min-width: 576px) {\n.webcg-devtools .d-sm-none {\n      display: none !important;\n}\n.webcg-devtools .d-sm-inline {\n      display: inline !important;\n}\n.webcg-devtools .d-sm-inline-block {\n      display: inline-block !important;\n}\n.webcg-devtools .d-sm-block {\n      display: block !important;\n}\n.webcg-devtools .d-sm-table {\n      display: table !important;\n}\n.webcg-devtools .d-sm-table-row {\n      display: table-row !important;\n}\n.webcg-devtools .d-sm-table-cell {\n      display: table-cell !important;\n}\n.webcg-devtools .d-sm-flex {\n      display: flex !important;\n}\n.webcg-devtools .d-sm-inline-flex {\n      display: inline-flex !important;\n}\n}\n@media (min-width: 768px) {\n.webcg-devtools .d-md-none {\n      display: none !important;\n}\n.webcg-devtools .d-md-inline {\n      display: inline !important;\n}\n.webcg-devtools .d-md-inline-block {\n      display: inline-block !important;\n}\n.webcg-devtools .d-md-block {\n      display: block !important;\n}\n.webcg-devtools .d-md-table {\n      display: table !important;\n}\n.webcg-devtools .d-md-table-row {\n      display: table-row !important;\n}\n.webcg-devtools .d-md-table-cell {\n      display: table-cell !important;\n}\n.webcg-devtools .d-md-flex {\n      display: flex !important;\n}\n.webcg-devtools .d-md-inline-flex {\n      display: inline-flex !important;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .d-lg-none {\n      display: none !important;\n}\n.webcg-devtools .d-lg-inline {\n      display: inline !important;\n}\n.webcg-devtools .d-lg-inline-block {\n      display: inline-block !important;\n}\n.webcg-devtools .d-lg-block {\n      display: block !important;\n}\n.webcg-devtools .d-lg-table {\n      display: table !important;\n}\n.webcg-devtools .d-lg-table-row {\n      display: table-row !important;\n}\n.webcg-devtools .d-lg-table-cell {\n      display: table-cell !important;\n}\n.webcg-devtools .d-lg-flex {\n      display: flex !important;\n}\n.webcg-devtools .d-lg-inline-flex {\n      display: inline-flex !important;\n}\n}\n@media (min-width: 1200px) {\n.webcg-devtools .d-xl-none {\n      display: none !important;\n}\n.webcg-devtools .d-xl-inline {\n      display: inline !important;\n}\n.webcg-devtools .d-xl-inline-block {\n      display: inline-block !important;\n}\n.webcg-devtools .d-xl-block {\n      display: block !important;\n}\n.webcg-devtools .d-xl-table {\n      display: table !important;\n}\n.webcg-devtools .d-xl-table-row {\n      display: table-row !important;\n}\n.webcg-devtools .d-xl-table-cell {\n      display: table-cell !important;\n}\n.webcg-devtools .d-xl-flex {\n      display: flex !important;\n}\n.webcg-devtools .d-xl-inline-flex {\n      display: inline-flex !important;\n}\n}\n@media print {\n.webcg-devtools .d-print-none {\n      display: none !important;\n}\n.webcg-devtools .d-print-inline {\n      display: inline !important;\n}\n.webcg-devtools .d-print-inline-block {\n      display: inline-block !important;\n}\n.webcg-devtools .d-print-block {\n      display: block !important;\n}\n.webcg-devtools .d-print-table {\n      display: table !important;\n}\n.webcg-devtools .d-print-table-row {\n      display: table-row !important;\n}\n.webcg-devtools .d-print-table-cell {\n      display: table-cell !important;\n}\n.webcg-devtools .d-print-flex {\n      display: flex !important;\n}\n.webcg-devtools .d-print-inline-flex {\n      display: inline-flex !important;\n}\n}\n.webcg-devtools .embed-responsive {\n    position: relative;\n    display: block;\n    width: 100%;\n    padding: 0;\n    overflow: hidden;\n}\n.webcg-devtools .embed-responsive::before {\n      display: block;\n      content: \"\";\n}\n.webcg-devtools .embed-responsive .embed-responsive-item,\n    .webcg-devtools .embed-responsive iframe,\n    .webcg-devtools .embed-responsive embed,\n    .webcg-devtools .embed-responsive object,\n    .webcg-devtools .embed-responsive video {\n      position: absolute;\n      top: 0;\n      bottom: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      border: 0;\n}\n.webcg-devtools .embed-responsive-21by9::before {\n    padding-top: 42.85714%;\n}\n.webcg-devtools .embed-responsive-16by9::before {\n    padding-top: 56.25%;\n}\n.webcg-devtools .embed-responsive-4by3::before {\n    padding-top: 75%;\n}\n.webcg-devtools .embed-responsive-1by1::before {\n    padding-top: 100%;\n}\n.webcg-devtools .flex-row {\n    flex-direction: row !important;\n}\n.webcg-devtools .flex-column {\n    flex-direction: column !important;\n}\n.webcg-devtools .flex-row-reverse {\n    flex-direction: row-reverse !important;\n}\n.webcg-devtools .flex-column-reverse {\n    flex-direction: column-reverse !important;\n}\n.webcg-devtools .flex-wrap {\n    flex-wrap: wrap !important;\n}\n.webcg-devtools .flex-nowrap {\n    flex-wrap: nowrap !important;\n}\n.webcg-devtools .flex-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n}\n.webcg-devtools .flex-fill {\n    flex: 1 1 auto !important;\n}\n.webcg-devtools .flex-grow-0 {\n    flex-grow: 0 !important;\n}\n.webcg-devtools .flex-grow-1 {\n    flex-grow: 1 !important;\n}\n.webcg-devtools .flex-shrink-0 {\n    flex-shrink: 0 !important;\n}\n.webcg-devtools .flex-shrink-1 {\n    flex-shrink: 1 !important;\n}\n.webcg-devtools .justify-content-start {\n    justify-content: flex-start !important;\n}\n.webcg-devtools .justify-content-end {\n    justify-content: flex-end !important;\n}\n.webcg-devtools .justify-content-center {\n    justify-content: center !important;\n}\n.webcg-devtools .justify-content-between {\n    justify-content: space-between !important;\n}\n.webcg-devtools .justify-content-around {\n    justify-content: space-around !important;\n}\n.webcg-devtools .align-items-start {\n    align-items: flex-start !important;\n}\n.webcg-devtools .align-items-end {\n    align-items: flex-end !important;\n}\n.webcg-devtools .align-items-center {\n    align-items: center !important;\n}\n.webcg-devtools .align-items-baseline {\n    align-items: baseline !important;\n}\n.webcg-devtools .align-items-stretch {\n    align-items: stretch !important;\n}\n.webcg-devtools .align-content-start {\n    align-content: flex-start !important;\n}\n.webcg-devtools .align-content-end {\n    align-content: flex-end !important;\n}\n.webcg-devtools .align-content-center {\n    align-content: center !important;\n}\n.webcg-devtools .align-content-between {\n    align-content: space-between !important;\n}\n.webcg-devtools .align-content-around {\n    align-content: space-around !important;\n}\n.webcg-devtools .align-content-stretch {\n    align-content: stretch !important;\n}\n.webcg-devtools .align-self-auto {\n    align-self: auto !important;\n}\n.webcg-devtools .align-self-start {\n    align-self: flex-start !important;\n}\n.webcg-devtools .align-self-end {\n    align-self: flex-end !important;\n}\n.webcg-devtools .align-self-center {\n    align-self: center !important;\n}\n.webcg-devtools .align-self-baseline {\n    align-self: baseline !important;\n}\n.webcg-devtools .align-self-stretch {\n    align-self: stretch !important;\n}\n@media (min-width: 576px) {\n.webcg-devtools .flex-sm-row {\n      flex-direction: row !important;\n}\n.webcg-devtools .flex-sm-column {\n      flex-direction: column !important;\n}\n.webcg-devtools .flex-sm-row-reverse {\n      flex-direction: row-reverse !important;\n}\n.webcg-devtools .flex-sm-column-reverse {\n      flex-direction: column-reverse !important;\n}\n.webcg-devtools .flex-sm-wrap {\n      flex-wrap: wrap !important;\n}\n.webcg-devtools .flex-sm-nowrap {\n      flex-wrap: nowrap !important;\n}\n.webcg-devtools .flex-sm-wrap-reverse {\n      flex-wrap: wrap-reverse !important;\n}\n.webcg-devtools .flex-sm-fill {\n      flex: 1 1 auto !important;\n}\n.webcg-devtools .flex-sm-grow-0 {\n      flex-grow: 0 !important;\n}\n.webcg-devtools .flex-sm-grow-1 {\n      flex-grow: 1 !important;\n}\n.webcg-devtools .flex-sm-shrink-0 {\n      flex-shrink: 0 !important;\n}\n.webcg-devtools .flex-sm-shrink-1 {\n      flex-shrink: 1 !important;\n}\n.webcg-devtools .justify-content-sm-start {\n      justify-content: flex-start !important;\n}\n.webcg-devtools .justify-content-sm-end {\n      justify-content: flex-end !important;\n}\n.webcg-devtools .justify-content-sm-center {\n      justify-content: center !important;\n}\n.webcg-devtools .justify-content-sm-between {\n      justify-content: space-between !important;\n}\n.webcg-devtools .justify-content-sm-around {\n      justify-content: space-around !important;\n}\n.webcg-devtools .align-items-sm-start {\n      align-items: flex-start !important;\n}\n.webcg-devtools .align-items-sm-end {\n      align-items: flex-end !important;\n}\n.webcg-devtools .align-items-sm-center {\n      align-items: center !important;\n}\n.webcg-devtools .align-items-sm-baseline {\n      align-items: baseline !important;\n}\n.webcg-devtools .align-items-sm-stretch {\n      align-items: stretch !important;\n}\n.webcg-devtools .align-content-sm-start {\n      align-content: flex-start !important;\n}\n.webcg-devtools .align-content-sm-end {\n      align-content: flex-end !important;\n}\n.webcg-devtools .align-content-sm-center {\n      align-content: center !important;\n}\n.webcg-devtools .align-content-sm-between {\n      align-content: space-between !important;\n}\n.webcg-devtools .align-content-sm-around {\n      align-content: space-around !important;\n}\n.webcg-devtools .align-content-sm-stretch {\n      align-content: stretch !important;\n}\n.webcg-devtools .align-self-sm-auto {\n      align-self: auto !important;\n}\n.webcg-devtools .align-self-sm-start {\n      align-self: flex-start !important;\n}\n.webcg-devtools .align-self-sm-end {\n      align-self: flex-end !important;\n}\n.webcg-devtools .align-self-sm-center {\n      align-self: center !important;\n}\n.webcg-devtools .align-self-sm-baseline {\n      align-self: baseline !important;\n}\n.webcg-devtools .align-self-sm-stretch {\n      align-self: stretch !important;\n}\n}\n@media (min-width: 768px) {\n.webcg-devtools .flex-md-row {\n      flex-direction: row !important;\n}\n.webcg-devtools .flex-md-column {\n      flex-direction: column !important;\n}\n.webcg-devtools .flex-md-row-reverse {\n      flex-direction: row-reverse !important;\n}\n.webcg-devtools .flex-md-column-reverse {\n      flex-direction: column-reverse !important;\n}\n.webcg-devtools .flex-md-wrap {\n      flex-wrap: wrap !important;\n}\n.webcg-devtools .flex-md-nowrap {\n      flex-wrap: nowrap !important;\n}\n.webcg-devtools .flex-md-wrap-reverse {\n      flex-wrap: wrap-reverse !important;\n}\n.webcg-devtools .flex-md-fill {\n      flex: 1 1 auto !important;\n}\n.webcg-devtools .flex-md-grow-0 {\n      flex-grow: 0 !important;\n}\n.webcg-devtools .flex-md-grow-1 {\n      flex-grow: 1 !important;\n}\n.webcg-devtools .flex-md-shrink-0 {\n      flex-shrink: 0 !important;\n}\n.webcg-devtools .flex-md-shrink-1 {\n      flex-shrink: 1 !important;\n}\n.webcg-devtools .justify-content-md-start {\n      justify-content: flex-start !important;\n}\n.webcg-devtools .justify-content-md-end {\n      justify-content: flex-end !important;\n}\n.webcg-devtools .justify-content-md-center {\n      justify-content: center !important;\n}\n.webcg-devtools .justify-content-md-between {\n      justify-content: space-between !important;\n}\n.webcg-devtools .justify-content-md-around {\n      justify-content: space-around !important;\n}\n.webcg-devtools .align-items-md-start {\n      align-items: flex-start !important;\n}\n.webcg-devtools .align-items-md-end {\n      align-items: flex-end !important;\n}\n.webcg-devtools .align-items-md-center {\n      align-items: center !important;\n}\n.webcg-devtools .align-items-md-baseline {\n      align-items: baseline !important;\n}\n.webcg-devtools .align-items-md-stretch {\n      align-items: stretch !important;\n}\n.webcg-devtools .align-content-md-start {\n      align-content: flex-start !important;\n}\n.webcg-devtools .align-content-md-end {\n      align-content: flex-end !important;\n}\n.webcg-devtools .align-content-md-center {\n      align-content: center !important;\n}\n.webcg-devtools .align-content-md-between {\n      align-content: space-between !important;\n}\n.webcg-devtools .align-content-md-around {\n      align-content: space-around !important;\n}\n.webcg-devtools .align-content-md-stretch {\n      align-content: stretch !important;\n}\n.webcg-devtools .align-self-md-auto {\n      align-self: auto !important;\n}\n.webcg-devtools .align-self-md-start {\n      align-self: flex-start !important;\n}\n.webcg-devtools .align-self-md-end {\n      align-self: flex-end !important;\n}\n.webcg-devtools .align-self-md-center {\n      align-self: center !important;\n}\n.webcg-devtools .align-self-md-baseline {\n      align-self: baseline !important;\n}\n.webcg-devtools .align-self-md-stretch {\n      align-self: stretch !important;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .flex-lg-row {\n      flex-direction: row !important;\n}\n.webcg-devtools .flex-lg-column {\n      flex-direction: column !important;\n}\n.webcg-devtools .flex-lg-row-reverse {\n      flex-direction: row-reverse !important;\n}\n.webcg-devtools .flex-lg-column-reverse {\n      flex-direction: column-reverse !important;\n}\n.webcg-devtools .flex-lg-wrap {\n      flex-wrap: wrap !important;\n}\n.webcg-devtools .flex-lg-nowrap {\n      flex-wrap: nowrap !important;\n}\n.webcg-devtools .flex-lg-wrap-reverse {\n      flex-wrap: wrap-reverse !important;\n}\n.webcg-devtools .flex-lg-fill {\n      flex: 1 1 auto !important;\n}\n.webcg-devtools .flex-lg-grow-0 {\n      flex-grow: 0 !important;\n}\n.webcg-devtools .flex-lg-grow-1 {\n      flex-grow: 1 !important;\n}\n.webcg-devtools .flex-lg-shrink-0 {\n      flex-shrink: 0 !important;\n}\n.webcg-devtools .flex-lg-shrink-1 {\n      flex-shrink: 1 !important;\n}\n.webcg-devtools .justify-content-lg-start {\n      justify-content: flex-start !important;\n}\n.webcg-devtools .justify-content-lg-end {\n      justify-content: flex-end !important;\n}\n.webcg-devtools .justify-content-lg-center {\n      justify-content: center !important;\n}\n.webcg-devtools .justify-content-lg-between {\n      justify-content: space-between !important;\n}\n.webcg-devtools .justify-content-lg-around {\n      justify-content: space-around !important;\n}\n.webcg-devtools .align-items-lg-start {\n      align-items: flex-start !important;\n}\n.webcg-devtools .align-items-lg-end {\n      align-items: flex-end !important;\n}\n.webcg-devtools .align-items-lg-center {\n      align-items: center !important;\n}\n.webcg-devtools .align-items-lg-baseline {\n      align-items: baseline !important;\n}\n.webcg-devtools .align-items-lg-stretch {\n      align-items: stretch !important;\n}\n.webcg-devtools .align-content-lg-start {\n      align-content: flex-start !important;\n}\n.webcg-devtools .align-content-lg-end {\n      align-content: flex-end !important;\n}\n.webcg-devtools .align-content-lg-center {\n      align-content: center !important;\n}\n.webcg-devtools .align-content-lg-between {\n      align-content: space-between !important;\n}\n.webcg-devtools .align-content-lg-around {\n      align-content: space-around !important;\n}\n.webcg-devtools .align-content-lg-stretch {\n      align-content: stretch !important;\n}\n.webcg-devtools .align-self-lg-auto {\n      align-self: auto !important;\n}\n.webcg-devtools .align-self-lg-start {\n      align-self: flex-start !important;\n}\n.webcg-devtools .align-self-lg-end {\n      align-self: flex-end !important;\n}\n.webcg-devtools .align-self-lg-center {\n      align-self: center !important;\n}\n.webcg-devtools .align-self-lg-baseline {\n      align-self: baseline !important;\n}\n.webcg-devtools .align-self-lg-stretch {\n      align-self: stretch !important;\n}\n}\n@media (min-width: 1200px) {\n.webcg-devtools .flex-xl-row {\n      flex-direction: row !important;\n}\n.webcg-devtools .flex-xl-column {\n      flex-direction: column !important;\n}\n.webcg-devtools .flex-xl-row-reverse {\n      flex-direction: row-reverse !important;\n}\n.webcg-devtools .flex-xl-column-reverse {\n      flex-direction: column-reverse !important;\n}\n.webcg-devtools .flex-xl-wrap {\n      flex-wrap: wrap !important;\n}\n.webcg-devtools .flex-xl-nowrap {\n      flex-wrap: nowrap !important;\n}\n.webcg-devtools .flex-xl-wrap-reverse {\n      flex-wrap: wrap-reverse !important;\n}\n.webcg-devtools .flex-xl-fill {\n      flex: 1 1 auto !important;\n}\n.webcg-devtools .flex-xl-grow-0 {\n      flex-grow: 0 !important;\n}\n.webcg-devtools .flex-xl-grow-1 {\n      flex-grow: 1 !important;\n}\n.webcg-devtools .flex-xl-shrink-0 {\n      flex-shrink: 0 !important;\n}\n.webcg-devtools .flex-xl-shrink-1 {\n      flex-shrink: 1 !important;\n}\n.webcg-devtools .justify-content-xl-start {\n      justify-content: flex-start !important;\n}\n.webcg-devtools .justify-content-xl-end {\n      justify-content: flex-end !important;\n}\n.webcg-devtools .justify-content-xl-center {\n      justify-content: center !important;\n}\n.webcg-devtools .justify-content-xl-between {\n      justify-content: space-between !important;\n}\n.webcg-devtools .justify-content-xl-around {\n      justify-content: space-around !important;\n}\n.webcg-devtools .align-items-xl-start {\n      align-items: flex-start !important;\n}\n.webcg-devtools .align-items-xl-end {\n      align-items: flex-end !important;\n}\n.webcg-devtools .align-items-xl-center {\n      align-items: center !important;\n}\n.webcg-devtools .align-items-xl-baseline {\n      align-items: baseline !important;\n}\n.webcg-devtools .align-items-xl-stretch {\n      align-items: stretch !important;\n}\n.webcg-devtools .align-content-xl-start {\n      align-content: flex-start !important;\n}\n.webcg-devtools .align-content-xl-end {\n      align-content: flex-end !important;\n}\n.webcg-devtools .align-content-xl-center {\n      align-content: center !important;\n}\n.webcg-devtools .align-content-xl-between {\n      align-content: space-between !important;\n}\n.webcg-devtools .align-content-xl-around {\n      align-content: space-around !important;\n}\n.webcg-devtools .align-content-xl-stretch {\n      align-content: stretch !important;\n}\n.webcg-devtools .align-self-xl-auto {\n      align-self: auto !important;\n}\n.webcg-devtools .align-self-xl-start {\n      align-self: flex-start !important;\n}\n.webcg-devtools .align-self-xl-end {\n      align-self: flex-end !important;\n}\n.webcg-devtools .align-self-xl-center {\n      align-self: center !important;\n}\n.webcg-devtools .align-self-xl-baseline {\n      align-self: baseline !important;\n}\n.webcg-devtools .align-self-xl-stretch {\n      align-self: stretch !important;\n}\n}\n.webcg-devtools .float-left {\n    float: left !important;\n}\n.webcg-devtools .float-right {\n    float: right !important;\n}\n.webcg-devtools .float-none {\n    float: none !important;\n}\n@media (min-width: 576px) {\n.webcg-devtools .float-sm-left {\n      float: left !important;\n}\n.webcg-devtools .float-sm-right {\n      float: right !important;\n}\n.webcg-devtools .float-sm-none {\n      float: none !important;\n}\n}\n@media (min-width: 768px) {\n.webcg-devtools .float-md-left {\n      float: left !important;\n}\n.webcg-devtools .float-md-right {\n      float: right !important;\n}\n.webcg-devtools .float-md-none {\n      float: none !important;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .float-lg-left {\n      float: left !important;\n}\n.webcg-devtools .float-lg-right {\n      float: right !important;\n}\n.webcg-devtools .float-lg-none {\n      float: none !important;\n}\n}\n@media (min-width: 1200px) {\n.webcg-devtools .float-xl-left {\n      float: left !important;\n}\n.webcg-devtools .float-xl-right {\n      float: right !important;\n}\n.webcg-devtools .float-xl-none {\n      float: none !important;\n}\n}\n.webcg-devtools .position-static {\n    position: static !important;\n}\n.webcg-devtools .position-relative {\n    position: relative !important;\n}\n.webcg-devtools .position-absolute {\n    position: absolute !important;\n}\n.webcg-devtools .position-fixed {\n    position: fixed !important;\n}\n.webcg-devtools .position-sticky {\n    position: sticky !important;\n}\n.webcg-devtools .fixed-top {\n    position: fixed;\n    top: 0;\n    right: 0;\n    left: 0;\n    z-index: 1030;\n}\n.webcg-devtools .fixed-bottom {\n    position: fixed;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: 1030;\n}\n@supports (position: sticky) {\n.webcg-devtools .sticky-top {\n      position: sticky;\n      top: 0;\n      z-index: 1020;\n}\n}\n.webcg-devtools .sr-only {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    padding: 0;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n    white-space: nowrap;\n    border: 0;\n}\n.webcg-devtools .sr-only-focusable:active, .webcg-devtools .sr-only-focusable:focus {\n    position: static;\n    width: auto;\n    height: auto;\n    overflow: visible;\n    clip: auto;\n    white-space: normal;\n}\n.webcg-devtools .shadow-sm {\n    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;\n}\n.webcg-devtools .shadow {\n    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;\n}\n.webcg-devtools .shadow-lg {\n    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;\n}\n.webcg-devtools .shadow-none {\n    box-shadow: none !important;\n}\n.webcg-devtools .w-25 {\n    width: 25% !important;\n}\n.webcg-devtools .w-50 {\n    width: 50% !important;\n}\n.webcg-devtools .w-75 {\n    width: 75% !important;\n}\n.webcg-devtools .w-100 {\n    width: 100% !important;\n}\n.webcg-devtools .w-auto {\n    width: auto !important;\n}\n.webcg-devtools .h-25 {\n    height: 25% !important;\n}\n.webcg-devtools .h-50 {\n    height: 50% !important;\n}\n.webcg-devtools .h-75 {\n    height: 75% !important;\n}\n.webcg-devtools .h-100 {\n    height: 100% !important;\n}\n.webcg-devtools .h-auto {\n    height: auto !important;\n}\n.webcg-devtools .mw-100 {\n    max-width: 100% !important;\n}\n.webcg-devtools .mh-100 {\n    max-height: 100% !important;\n}\n.webcg-devtools .m-0 {\n    margin: 0 !important;\n}\n.webcg-devtools .mt-0,\n  .webcg-devtools .my-0 {\n    margin-top: 0 !important;\n}\n.webcg-devtools .mr-0,\n  .webcg-devtools .mx-0 {\n    margin-right: 0 !important;\n}\n.webcg-devtools .mb-0,\n  .webcg-devtools .my-0 {\n    margin-bottom: 0 !important;\n}\n.webcg-devtools .ml-0,\n  .webcg-devtools .mx-0 {\n    margin-left: 0 !important;\n}\n.webcg-devtools .m-1 {\n    margin: 0.25rem !important;\n}\n.webcg-devtools .mt-1,\n  .webcg-devtools .my-1 {\n    margin-top: 0.25rem !important;\n}\n.webcg-devtools .mr-1,\n  .webcg-devtools .mx-1 {\n    margin-right: 0.25rem !important;\n}\n.webcg-devtools .mb-1,\n  .webcg-devtools .my-1 {\n    margin-bottom: 0.25rem !important;\n}\n.webcg-devtools .ml-1,\n  .webcg-devtools .mx-1 {\n    margin-left: 0.25rem !important;\n}\n.webcg-devtools .m-2 {\n    margin: 0.5rem !important;\n}\n.webcg-devtools .mt-2,\n  .webcg-devtools .my-2 {\n    margin-top: 0.5rem !important;\n}\n.webcg-devtools .mr-2,\n  .webcg-devtools .mx-2 {\n    margin-right: 0.5rem !important;\n}\n.webcg-devtools .mb-2,\n  .webcg-devtools .my-2 {\n    margin-bottom: 0.5rem !important;\n}\n.webcg-devtools .ml-2,\n  .webcg-devtools .mx-2 {\n    margin-left: 0.5rem !important;\n}\n.webcg-devtools .m-3 {\n    margin: 1rem !important;\n}\n.webcg-devtools .mt-3,\n  .webcg-devtools .my-3 {\n    margin-top: 1rem !important;\n}\n.webcg-devtools .mr-3,\n  .webcg-devtools .mx-3 {\n    margin-right: 1rem !important;\n}\n.webcg-devtools .mb-3,\n  .webcg-devtools .my-3 {\n    margin-bottom: 1rem !important;\n}\n.webcg-devtools .ml-3,\n  .webcg-devtools .mx-3 {\n    margin-left: 1rem !important;\n}\n.webcg-devtools .m-4 {\n    margin: 1.5rem !important;\n}\n.webcg-devtools .mt-4,\n  .webcg-devtools .my-4 {\n    margin-top: 1.5rem !important;\n}\n.webcg-devtools .mr-4,\n  .webcg-devtools .mx-4 {\n    margin-right: 1.5rem !important;\n}\n.webcg-devtools .mb-4,\n  .webcg-devtools .my-4 {\n    margin-bottom: 1.5rem !important;\n}\n.webcg-devtools .ml-4,\n  .webcg-devtools .mx-4 {\n    margin-left: 1.5rem !important;\n}\n.webcg-devtools .m-5 {\n    margin: 3rem !important;\n}\n.webcg-devtools .mt-5,\n  .webcg-devtools .my-5 {\n    margin-top: 3rem !important;\n}\n.webcg-devtools .mr-5,\n  .webcg-devtools .mx-5 {\n    margin-right: 3rem !important;\n}\n.webcg-devtools .mb-5,\n  .webcg-devtools .my-5 {\n    margin-bottom: 3rem !important;\n}\n.webcg-devtools .ml-5,\n  .webcg-devtools .mx-5 {\n    margin-left: 3rem !important;\n}\n.webcg-devtools .p-0 {\n    padding: 0 !important;\n}\n.webcg-devtools .pt-0,\n  .webcg-devtools .py-0 {\n    padding-top: 0 !important;\n}\n.webcg-devtools .pr-0,\n  .webcg-devtools .px-0 {\n    padding-right: 0 !important;\n}\n.webcg-devtools .pb-0,\n  .webcg-devtools .py-0 {\n    padding-bottom: 0 !important;\n}\n.webcg-devtools .pl-0,\n  .webcg-devtools .px-0 {\n    padding-left: 0 !important;\n}\n.webcg-devtools .p-1 {\n    padding: 0.25rem !important;\n}\n.webcg-devtools .pt-1,\n  .webcg-devtools .py-1 {\n    padding-top: 0.25rem !important;\n}\n.webcg-devtools .pr-1,\n  .webcg-devtools .px-1 {\n    padding-right: 0.25rem !important;\n}\n.webcg-devtools .pb-1,\n  .webcg-devtools .py-1 {\n    padding-bottom: 0.25rem !important;\n}\n.webcg-devtools .pl-1,\n  .webcg-devtools .px-1 {\n    padding-left: 0.25rem !important;\n}\n.webcg-devtools .p-2 {\n    padding: 0.5rem !important;\n}\n.webcg-devtools .pt-2,\n  .webcg-devtools .py-2 {\n    padding-top: 0.5rem !important;\n}\n.webcg-devtools .pr-2,\n  .webcg-devtools .px-2 {\n    padding-right: 0.5rem !important;\n}\n.webcg-devtools .pb-2,\n  .webcg-devtools .py-2 {\n    padding-bottom: 0.5rem !important;\n}\n.webcg-devtools .pl-2,\n  .webcg-devtools .px-2 {\n    padding-left: 0.5rem !important;\n}\n.webcg-devtools .p-3 {\n    padding: 1rem !important;\n}\n.webcg-devtools .pt-3,\n  .webcg-devtools .py-3 {\n    padding-top: 1rem !important;\n}\n.webcg-devtools .pr-3,\n  .webcg-devtools .px-3 {\n    padding-right: 1rem !important;\n}\n.webcg-devtools .pb-3,\n  .webcg-devtools .py-3 {\n    padding-bottom: 1rem !important;\n}\n.webcg-devtools .pl-3,\n  .webcg-devtools .px-3 {\n    padding-left: 1rem !important;\n}\n.webcg-devtools .p-4 {\n    padding: 1.5rem !important;\n}\n.webcg-devtools .pt-4,\n  .webcg-devtools .py-4 {\n    padding-top: 1.5rem !important;\n}\n.webcg-devtools .pr-4,\n  .webcg-devtools .px-4 {\n    padding-right: 1.5rem !important;\n}\n.webcg-devtools .pb-4,\n  .webcg-devtools .py-4 {\n    padding-bottom: 1.5rem !important;\n}\n.webcg-devtools .pl-4,\n  .webcg-devtools .px-4 {\n    padding-left: 1.5rem !important;\n}\n.webcg-devtools .p-5 {\n    padding: 3rem !important;\n}\n.webcg-devtools .pt-5,\n  .webcg-devtools .py-5 {\n    padding-top: 3rem !important;\n}\n.webcg-devtools .pr-5,\n  .webcg-devtools .px-5 {\n    padding-right: 3rem !important;\n}\n.webcg-devtools .pb-5,\n  .webcg-devtools .py-5 {\n    padding-bottom: 3rem !important;\n}\n.webcg-devtools .pl-5,\n  .webcg-devtools .px-5 {\n    padding-left: 3rem !important;\n}\n.webcg-devtools .m-auto {\n    margin: auto !important;\n}\n.webcg-devtools .mt-auto,\n  .webcg-devtools .my-auto {\n    margin-top: auto !important;\n}\n.webcg-devtools .mr-auto,\n  .webcg-devtools .mx-auto {\n    margin-right: auto !important;\n}\n.webcg-devtools .mb-auto,\n  .webcg-devtools .my-auto {\n    margin-bottom: auto !important;\n}\n.webcg-devtools .ml-auto,\n  .webcg-devtools .mx-auto {\n    margin-left: auto !important;\n}\n@media (min-width: 576px) {\n.webcg-devtools .m-sm-0 {\n      margin: 0 !important;\n}\n.webcg-devtools .mt-sm-0,\n    .webcg-devtools .my-sm-0 {\n      margin-top: 0 !important;\n}\n.webcg-devtools .mr-sm-0,\n    .webcg-devtools .mx-sm-0 {\n      margin-right: 0 !important;\n}\n.webcg-devtools .mb-sm-0,\n    .webcg-devtools .my-sm-0 {\n      margin-bottom: 0 !important;\n}\n.webcg-devtools .ml-sm-0,\n    .webcg-devtools .mx-sm-0 {\n      margin-left: 0 !important;\n}\n.webcg-devtools .m-sm-1 {\n      margin: 0.25rem !important;\n}\n.webcg-devtools .mt-sm-1,\n    .webcg-devtools .my-sm-1 {\n      margin-top: 0.25rem !important;\n}\n.webcg-devtools .mr-sm-1,\n    .webcg-devtools .mx-sm-1 {\n      margin-right: 0.25rem !important;\n}\n.webcg-devtools .mb-sm-1,\n    .webcg-devtools .my-sm-1 {\n      margin-bottom: 0.25rem !important;\n}\n.webcg-devtools .ml-sm-1,\n    .webcg-devtools .mx-sm-1 {\n      margin-left: 0.25rem !important;\n}\n.webcg-devtools .m-sm-2 {\n      margin: 0.5rem !important;\n}\n.webcg-devtools .mt-sm-2,\n    .webcg-devtools .my-sm-2 {\n      margin-top: 0.5rem !important;\n}\n.webcg-devtools .mr-sm-2,\n    .webcg-devtools .mx-sm-2 {\n      margin-right: 0.5rem !important;\n}\n.webcg-devtools .mb-sm-2,\n    .webcg-devtools .my-sm-2 {\n      margin-bottom: 0.5rem !important;\n}\n.webcg-devtools .ml-sm-2,\n    .webcg-devtools .mx-sm-2 {\n      margin-left: 0.5rem !important;\n}\n.webcg-devtools .m-sm-3 {\n      margin: 1rem !important;\n}\n.webcg-devtools .mt-sm-3,\n    .webcg-devtools .my-sm-3 {\n      margin-top: 1rem !important;\n}\n.webcg-devtools .mr-sm-3,\n    .webcg-devtools .mx-sm-3 {\n      margin-right: 1rem !important;\n}\n.webcg-devtools .mb-sm-3,\n    .webcg-devtools .my-sm-3 {\n      margin-bottom: 1rem !important;\n}\n.webcg-devtools .ml-sm-3,\n    .webcg-devtools .mx-sm-3 {\n      margin-left: 1rem !important;\n}\n.webcg-devtools .m-sm-4 {\n      margin: 1.5rem !important;\n}\n.webcg-devtools .mt-sm-4,\n    .webcg-devtools .my-sm-4 {\n      margin-top: 1.5rem !important;\n}\n.webcg-devtools .mr-sm-4,\n    .webcg-devtools .mx-sm-4 {\n      margin-right: 1.5rem !important;\n}\n.webcg-devtools .mb-sm-4,\n    .webcg-devtools .my-sm-4 {\n      margin-bottom: 1.5rem !important;\n}\n.webcg-devtools .ml-sm-4,\n    .webcg-devtools .mx-sm-4 {\n      margin-left: 1.5rem !important;\n}\n.webcg-devtools .m-sm-5 {\n      margin: 3rem !important;\n}\n.webcg-devtools .mt-sm-5,\n    .webcg-devtools .my-sm-5 {\n      margin-top: 3rem !important;\n}\n.webcg-devtools .mr-sm-5,\n    .webcg-devtools .mx-sm-5 {\n      margin-right: 3rem !important;\n}\n.webcg-devtools .mb-sm-5,\n    .webcg-devtools .my-sm-5 {\n      margin-bottom: 3rem !important;\n}\n.webcg-devtools .ml-sm-5,\n    .webcg-devtools .mx-sm-5 {\n      margin-left: 3rem !important;\n}\n.webcg-devtools .p-sm-0 {\n      padding: 0 !important;\n}\n.webcg-devtools .pt-sm-0,\n    .webcg-devtools .py-sm-0 {\n      padding-top: 0 !important;\n}\n.webcg-devtools .pr-sm-0,\n    .webcg-devtools .px-sm-0 {\n      padding-right: 0 !important;\n}\n.webcg-devtools .pb-sm-0,\n    .webcg-devtools .py-sm-0 {\n      padding-bottom: 0 !important;\n}\n.webcg-devtools .pl-sm-0,\n    .webcg-devtools .px-sm-0 {\n      padding-left: 0 !important;\n}\n.webcg-devtools .p-sm-1 {\n      padding: 0.25rem !important;\n}\n.webcg-devtools .pt-sm-1,\n    .webcg-devtools .py-sm-1 {\n      padding-top: 0.25rem !important;\n}\n.webcg-devtools .pr-sm-1,\n    .webcg-devtools .px-sm-1 {\n      padding-right: 0.25rem !important;\n}\n.webcg-devtools .pb-sm-1,\n    .webcg-devtools .py-sm-1 {\n      padding-bottom: 0.25rem !important;\n}\n.webcg-devtools .pl-sm-1,\n    .webcg-devtools .px-sm-1 {\n      padding-left: 0.25rem !important;\n}\n.webcg-devtools .p-sm-2 {\n      padding: 0.5rem !important;\n}\n.webcg-devtools .pt-sm-2,\n    .webcg-devtools .py-sm-2 {\n      padding-top: 0.5rem !important;\n}\n.webcg-devtools .pr-sm-2,\n    .webcg-devtools .px-sm-2 {\n      padding-right: 0.5rem !important;\n}\n.webcg-devtools .pb-sm-2,\n    .webcg-devtools .py-sm-2 {\n      padding-bottom: 0.5rem !important;\n}\n.webcg-devtools .pl-sm-2,\n    .webcg-devtools .px-sm-2 {\n      padding-left: 0.5rem !important;\n}\n.webcg-devtools .p-sm-3 {\n      padding: 1rem !important;\n}\n.webcg-devtools .pt-sm-3,\n    .webcg-devtools .py-sm-3 {\n      padding-top: 1rem !important;\n}\n.webcg-devtools .pr-sm-3,\n    .webcg-devtools .px-sm-3 {\n      padding-right: 1rem !important;\n}\n.webcg-devtools .pb-sm-3,\n    .webcg-devtools .py-sm-3 {\n      padding-bottom: 1rem !important;\n}\n.webcg-devtools .pl-sm-3,\n    .webcg-devtools .px-sm-3 {\n      padding-left: 1rem !important;\n}\n.webcg-devtools .p-sm-4 {\n      padding: 1.5rem !important;\n}\n.webcg-devtools .pt-sm-4,\n    .webcg-devtools .py-sm-4 {\n      padding-top: 1.5rem !important;\n}\n.webcg-devtools .pr-sm-4,\n    .webcg-devtools .px-sm-4 {\n      padding-right: 1.5rem !important;\n}\n.webcg-devtools .pb-sm-4,\n    .webcg-devtools .py-sm-4 {\n      padding-bottom: 1.5rem !important;\n}\n.webcg-devtools .pl-sm-4,\n    .webcg-devtools .px-sm-4 {\n      padding-left: 1.5rem !important;\n}\n.webcg-devtools .p-sm-5 {\n      padding: 3rem !important;\n}\n.webcg-devtools .pt-sm-5,\n    .webcg-devtools .py-sm-5 {\n      padding-top: 3rem !important;\n}\n.webcg-devtools .pr-sm-5,\n    .webcg-devtools .px-sm-5 {\n      padding-right: 3rem !important;\n}\n.webcg-devtools .pb-sm-5,\n    .webcg-devtools .py-sm-5 {\n      padding-bottom: 3rem !important;\n}\n.webcg-devtools .pl-sm-5,\n    .webcg-devtools .px-sm-5 {\n      padding-left: 3rem !important;\n}\n.webcg-devtools .m-sm-auto {\n      margin: auto !important;\n}\n.webcg-devtools .mt-sm-auto,\n    .webcg-devtools .my-sm-auto {\n      margin-top: auto !important;\n}\n.webcg-devtools .mr-sm-auto,\n    .webcg-devtools .mx-sm-auto {\n      margin-right: auto !important;\n}\n.webcg-devtools .mb-sm-auto,\n    .webcg-devtools .my-sm-auto {\n      margin-bottom: auto !important;\n}\n.webcg-devtools .ml-sm-auto,\n    .webcg-devtools .mx-sm-auto {\n      margin-left: auto !important;\n}\n}\n@media (min-width: 768px) {\n.webcg-devtools .m-md-0 {\n      margin: 0 !important;\n}\n.webcg-devtools .mt-md-0,\n    .webcg-devtools .my-md-0 {\n      margin-top: 0 !important;\n}\n.webcg-devtools .mr-md-0,\n    .webcg-devtools .mx-md-0 {\n      margin-right: 0 !important;\n}\n.webcg-devtools .mb-md-0,\n    .webcg-devtools .my-md-0 {\n      margin-bottom: 0 !important;\n}\n.webcg-devtools .ml-md-0,\n    .webcg-devtools .mx-md-0 {\n      margin-left: 0 !important;\n}\n.webcg-devtools .m-md-1 {\n      margin: 0.25rem !important;\n}\n.webcg-devtools .mt-md-1,\n    .webcg-devtools .my-md-1 {\n      margin-top: 0.25rem !important;\n}\n.webcg-devtools .mr-md-1,\n    .webcg-devtools .mx-md-1 {\n      margin-right: 0.25rem !important;\n}\n.webcg-devtools .mb-md-1,\n    .webcg-devtools .my-md-1 {\n      margin-bottom: 0.25rem !important;\n}\n.webcg-devtools .ml-md-1,\n    .webcg-devtools .mx-md-1 {\n      margin-left: 0.25rem !important;\n}\n.webcg-devtools .m-md-2 {\n      margin: 0.5rem !important;\n}\n.webcg-devtools .mt-md-2,\n    .webcg-devtools .my-md-2 {\n      margin-top: 0.5rem !important;\n}\n.webcg-devtools .mr-md-2,\n    .webcg-devtools .mx-md-2 {\n      margin-right: 0.5rem !important;\n}\n.webcg-devtools .mb-md-2,\n    .webcg-devtools .my-md-2 {\n      margin-bottom: 0.5rem !important;\n}\n.webcg-devtools .ml-md-2,\n    .webcg-devtools .mx-md-2 {\n      margin-left: 0.5rem !important;\n}\n.webcg-devtools .m-md-3 {\n      margin: 1rem !important;\n}\n.webcg-devtools .mt-md-3,\n    .webcg-devtools .my-md-3 {\n      margin-top: 1rem !important;\n}\n.webcg-devtools .mr-md-3,\n    .webcg-devtools .mx-md-3 {\n      margin-right: 1rem !important;\n}\n.webcg-devtools .mb-md-3,\n    .webcg-devtools .my-md-3 {\n      margin-bottom: 1rem !important;\n}\n.webcg-devtools .ml-md-3,\n    .webcg-devtools .mx-md-3 {\n      margin-left: 1rem !important;\n}\n.webcg-devtools .m-md-4 {\n      margin: 1.5rem !important;\n}\n.webcg-devtools .mt-md-4,\n    .webcg-devtools .my-md-4 {\n      margin-top: 1.5rem !important;\n}\n.webcg-devtools .mr-md-4,\n    .webcg-devtools .mx-md-4 {\n      margin-right: 1.5rem !important;\n}\n.webcg-devtools .mb-md-4,\n    .webcg-devtools .my-md-4 {\n      margin-bottom: 1.5rem !important;\n}\n.webcg-devtools .ml-md-4,\n    .webcg-devtools .mx-md-4 {\n      margin-left: 1.5rem !important;\n}\n.webcg-devtools .m-md-5 {\n      margin: 3rem !important;\n}\n.webcg-devtools .mt-md-5,\n    .webcg-devtools .my-md-5 {\n      margin-top: 3rem !important;\n}\n.webcg-devtools .mr-md-5,\n    .webcg-devtools .mx-md-5 {\n      margin-right: 3rem !important;\n}\n.webcg-devtools .mb-md-5,\n    .webcg-devtools .my-md-5 {\n      margin-bottom: 3rem !important;\n}\n.webcg-devtools .ml-md-5,\n    .webcg-devtools .mx-md-5 {\n      margin-left: 3rem !important;\n}\n.webcg-devtools .p-md-0 {\n      padding: 0 !important;\n}\n.webcg-devtools .pt-md-0,\n    .webcg-devtools .py-md-0 {\n      padding-top: 0 !important;\n}\n.webcg-devtools .pr-md-0,\n    .webcg-devtools .px-md-0 {\n      padding-right: 0 !important;\n}\n.webcg-devtools .pb-md-0,\n    .webcg-devtools .py-md-0 {\n      padding-bottom: 0 !important;\n}\n.webcg-devtools .pl-md-0,\n    .webcg-devtools .px-md-0 {\n      padding-left: 0 !important;\n}\n.webcg-devtools .p-md-1 {\n      padding: 0.25rem !important;\n}\n.webcg-devtools .pt-md-1,\n    .webcg-devtools .py-md-1 {\n      padding-top: 0.25rem !important;\n}\n.webcg-devtools .pr-md-1,\n    .webcg-devtools .px-md-1 {\n      padding-right: 0.25rem !important;\n}\n.webcg-devtools .pb-md-1,\n    .webcg-devtools .py-md-1 {\n      padding-bottom: 0.25rem !important;\n}\n.webcg-devtools .pl-md-1,\n    .webcg-devtools .px-md-1 {\n      padding-left: 0.25rem !important;\n}\n.webcg-devtools .p-md-2 {\n      padding: 0.5rem !important;\n}\n.webcg-devtools .pt-md-2,\n    .webcg-devtools .py-md-2 {\n      padding-top: 0.5rem !important;\n}\n.webcg-devtools .pr-md-2,\n    .webcg-devtools .px-md-2 {\n      padding-right: 0.5rem !important;\n}\n.webcg-devtools .pb-md-2,\n    .webcg-devtools .py-md-2 {\n      padding-bottom: 0.5rem !important;\n}\n.webcg-devtools .pl-md-2,\n    .webcg-devtools .px-md-2 {\n      padding-left: 0.5rem !important;\n}\n.webcg-devtools .p-md-3 {\n      padding: 1rem !important;\n}\n.webcg-devtools .pt-md-3,\n    .webcg-devtools .py-md-3 {\n      padding-top: 1rem !important;\n}\n.webcg-devtools .pr-md-3,\n    .webcg-devtools .px-md-3 {\n      padding-right: 1rem !important;\n}\n.webcg-devtools .pb-md-3,\n    .webcg-devtools .py-md-3 {\n      padding-bottom: 1rem !important;\n}\n.webcg-devtools .pl-md-3,\n    .webcg-devtools .px-md-3 {\n      padding-left: 1rem !important;\n}\n.webcg-devtools .p-md-4 {\n      padding: 1.5rem !important;\n}\n.webcg-devtools .pt-md-4,\n    .webcg-devtools .py-md-4 {\n      padding-top: 1.5rem !important;\n}\n.webcg-devtools .pr-md-4,\n    .webcg-devtools .px-md-4 {\n      padding-right: 1.5rem !important;\n}\n.webcg-devtools .pb-md-4,\n    .webcg-devtools .py-md-4 {\n      padding-bottom: 1.5rem !important;\n}\n.webcg-devtools .pl-md-4,\n    .webcg-devtools .px-md-4 {\n      padding-left: 1.5rem !important;\n}\n.webcg-devtools .p-md-5 {\n      padding: 3rem !important;\n}\n.webcg-devtools .pt-md-5,\n    .webcg-devtools .py-md-5 {\n      padding-top: 3rem !important;\n}\n.webcg-devtools .pr-md-5,\n    .webcg-devtools .px-md-5 {\n      padding-right: 3rem !important;\n}\n.webcg-devtools .pb-md-5,\n    .webcg-devtools .py-md-5 {\n      padding-bottom: 3rem !important;\n}\n.webcg-devtools .pl-md-5,\n    .webcg-devtools .px-md-5 {\n      padding-left: 3rem !important;\n}\n.webcg-devtools .m-md-auto {\n      margin: auto !important;\n}\n.webcg-devtools .mt-md-auto,\n    .webcg-devtools .my-md-auto {\n      margin-top: auto !important;\n}\n.webcg-devtools .mr-md-auto,\n    .webcg-devtools .mx-md-auto {\n      margin-right: auto !important;\n}\n.webcg-devtools .mb-md-auto,\n    .webcg-devtools .my-md-auto {\n      margin-bottom: auto !important;\n}\n.webcg-devtools .ml-md-auto,\n    .webcg-devtools .mx-md-auto {\n      margin-left: auto !important;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .m-lg-0 {\n      margin: 0 !important;\n}\n.webcg-devtools .mt-lg-0,\n    .webcg-devtools .my-lg-0 {\n      margin-top: 0 !important;\n}\n.webcg-devtools .mr-lg-0,\n    .webcg-devtools .mx-lg-0 {\n      margin-right: 0 !important;\n}\n.webcg-devtools .mb-lg-0,\n    .webcg-devtools .my-lg-0 {\n      margin-bottom: 0 !important;\n}\n.webcg-devtools .ml-lg-0,\n    .webcg-devtools .mx-lg-0 {\n      margin-left: 0 !important;\n}\n.webcg-devtools .m-lg-1 {\n      margin: 0.25rem !important;\n}\n.webcg-devtools .mt-lg-1,\n    .webcg-devtools .my-lg-1 {\n      margin-top: 0.25rem !important;\n}\n.webcg-devtools .mr-lg-1,\n    .webcg-devtools .mx-lg-1 {\n      margin-right: 0.25rem !important;\n}\n.webcg-devtools .mb-lg-1,\n    .webcg-devtools .my-lg-1 {\n      margin-bottom: 0.25rem !important;\n}\n.webcg-devtools .ml-lg-1,\n    .webcg-devtools .mx-lg-1 {\n      margin-left: 0.25rem !important;\n}\n.webcg-devtools .m-lg-2 {\n      margin: 0.5rem !important;\n}\n.webcg-devtools .mt-lg-2,\n    .webcg-devtools .my-lg-2 {\n      margin-top: 0.5rem !important;\n}\n.webcg-devtools .mr-lg-2,\n    .webcg-devtools .mx-lg-2 {\n      margin-right: 0.5rem !important;\n}\n.webcg-devtools .mb-lg-2,\n    .webcg-devtools .my-lg-2 {\n      margin-bottom: 0.5rem !important;\n}\n.webcg-devtools .ml-lg-2,\n    .webcg-devtools .mx-lg-2 {\n      margin-left: 0.5rem !important;\n}\n.webcg-devtools .m-lg-3 {\n      margin: 1rem !important;\n}\n.webcg-devtools .mt-lg-3,\n    .webcg-devtools .my-lg-3 {\n      margin-top: 1rem !important;\n}\n.webcg-devtools .mr-lg-3,\n    .webcg-devtools .mx-lg-3 {\n      margin-right: 1rem !important;\n}\n.webcg-devtools .mb-lg-3,\n    .webcg-devtools .my-lg-3 {\n      margin-bottom: 1rem !important;\n}\n.webcg-devtools .ml-lg-3,\n    .webcg-devtools .mx-lg-3 {\n      margin-left: 1rem !important;\n}\n.webcg-devtools .m-lg-4 {\n      margin: 1.5rem !important;\n}\n.webcg-devtools .mt-lg-4,\n    .webcg-devtools .my-lg-4 {\n      margin-top: 1.5rem !important;\n}\n.webcg-devtools .mr-lg-4,\n    .webcg-devtools .mx-lg-4 {\n      margin-right: 1.5rem !important;\n}\n.webcg-devtools .mb-lg-4,\n    .webcg-devtools .my-lg-4 {\n      margin-bottom: 1.5rem !important;\n}\n.webcg-devtools .ml-lg-4,\n    .webcg-devtools .mx-lg-4 {\n      margin-left: 1.5rem !important;\n}\n.webcg-devtools .m-lg-5 {\n      margin: 3rem !important;\n}\n.webcg-devtools .mt-lg-5,\n    .webcg-devtools .my-lg-5 {\n      margin-top: 3rem !important;\n}\n.webcg-devtools .mr-lg-5,\n    .webcg-devtools .mx-lg-5 {\n      margin-right: 3rem !important;\n}\n.webcg-devtools .mb-lg-5,\n    .webcg-devtools .my-lg-5 {\n      margin-bottom: 3rem !important;\n}\n.webcg-devtools .ml-lg-5,\n    .webcg-devtools .mx-lg-5 {\n      margin-left: 3rem !important;\n}\n.webcg-devtools .p-lg-0 {\n      padding: 0 !important;\n}\n.webcg-devtools .pt-lg-0,\n    .webcg-devtools .py-lg-0 {\n      padding-top: 0 !important;\n}\n.webcg-devtools .pr-lg-0,\n    .webcg-devtools .px-lg-0 {\n      padding-right: 0 !important;\n}\n.webcg-devtools .pb-lg-0,\n    .webcg-devtools .py-lg-0 {\n      padding-bottom: 0 !important;\n}\n.webcg-devtools .pl-lg-0,\n    .webcg-devtools .px-lg-0 {\n      padding-left: 0 !important;\n}\n.webcg-devtools .p-lg-1 {\n      padding: 0.25rem !important;\n}\n.webcg-devtools .pt-lg-1,\n    .webcg-devtools .py-lg-1 {\n      padding-top: 0.25rem !important;\n}\n.webcg-devtools .pr-lg-1,\n    .webcg-devtools .px-lg-1 {\n      padding-right: 0.25rem !important;\n}\n.webcg-devtools .pb-lg-1,\n    .webcg-devtools .py-lg-1 {\n      padding-bottom: 0.25rem !important;\n}\n.webcg-devtools .pl-lg-1,\n    .webcg-devtools .px-lg-1 {\n      padding-left: 0.25rem !important;\n}\n.webcg-devtools .p-lg-2 {\n      padding: 0.5rem !important;\n}\n.webcg-devtools .pt-lg-2,\n    .webcg-devtools .py-lg-2 {\n      padding-top: 0.5rem !important;\n}\n.webcg-devtools .pr-lg-2,\n    .webcg-devtools .px-lg-2 {\n      padding-right: 0.5rem !important;\n}\n.webcg-devtools .pb-lg-2,\n    .webcg-devtools .py-lg-2 {\n      padding-bottom: 0.5rem !important;\n}\n.webcg-devtools .pl-lg-2,\n    .webcg-devtools .px-lg-2 {\n      padding-left: 0.5rem !important;\n}\n.webcg-devtools .p-lg-3 {\n      padding: 1rem !important;\n}\n.webcg-devtools .pt-lg-3,\n    .webcg-devtools .py-lg-3 {\n      padding-top: 1rem !important;\n}\n.webcg-devtools .pr-lg-3,\n    .webcg-devtools .px-lg-3 {\n      padding-right: 1rem !important;\n}\n.webcg-devtools .pb-lg-3,\n    .webcg-devtools .py-lg-3 {\n      padding-bottom: 1rem !important;\n}\n.webcg-devtools .pl-lg-3,\n    .webcg-devtools .px-lg-3 {\n      padding-left: 1rem !important;\n}\n.webcg-devtools .p-lg-4 {\n      padding: 1.5rem !important;\n}\n.webcg-devtools .pt-lg-4,\n    .webcg-devtools .py-lg-4 {\n      padding-top: 1.5rem !important;\n}\n.webcg-devtools .pr-lg-4,\n    .webcg-devtools .px-lg-4 {\n      padding-right: 1.5rem !important;\n}\n.webcg-devtools .pb-lg-4,\n    .webcg-devtools .py-lg-4 {\n      padding-bottom: 1.5rem !important;\n}\n.webcg-devtools .pl-lg-4,\n    .webcg-devtools .px-lg-4 {\n      padding-left: 1.5rem !important;\n}\n.webcg-devtools .p-lg-5 {\n      padding: 3rem !important;\n}\n.webcg-devtools .pt-lg-5,\n    .webcg-devtools .py-lg-5 {\n      padding-top: 3rem !important;\n}\n.webcg-devtools .pr-lg-5,\n    .webcg-devtools .px-lg-5 {\n      padding-right: 3rem !important;\n}\n.webcg-devtools .pb-lg-5,\n    .webcg-devtools .py-lg-5 {\n      padding-bottom: 3rem !important;\n}\n.webcg-devtools .pl-lg-5,\n    .webcg-devtools .px-lg-5 {\n      padding-left: 3rem !important;\n}\n.webcg-devtools .m-lg-auto {\n      margin: auto !important;\n}\n.webcg-devtools .mt-lg-auto,\n    .webcg-devtools .my-lg-auto {\n      margin-top: auto !important;\n}\n.webcg-devtools .mr-lg-auto,\n    .webcg-devtools .mx-lg-auto {\n      margin-right: auto !important;\n}\n.webcg-devtools .mb-lg-auto,\n    .webcg-devtools .my-lg-auto {\n      margin-bottom: auto !important;\n}\n.webcg-devtools .ml-lg-auto,\n    .webcg-devtools .mx-lg-auto {\n      margin-left: auto !important;\n}\n}\n@media (min-width: 1200px) {\n.webcg-devtools .m-xl-0 {\n      margin: 0 !important;\n}\n.webcg-devtools .mt-xl-0,\n    .webcg-devtools .my-xl-0 {\n      margin-top: 0 !important;\n}\n.webcg-devtools .mr-xl-0,\n    .webcg-devtools .mx-xl-0 {\n      margin-right: 0 !important;\n}\n.webcg-devtools .mb-xl-0,\n    .webcg-devtools .my-xl-0 {\n      margin-bottom: 0 !important;\n}\n.webcg-devtools .ml-xl-0,\n    .webcg-devtools .mx-xl-0 {\n      margin-left: 0 !important;\n}\n.webcg-devtools .m-xl-1 {\n      margin: 0.25rem !important;\n}\n.webcg-devtools .mt-xl-1,\n    .webcg-devtools .my-xl-1 {\n      margin-top: 0.25rem !important;\n}\n.webcg-devtools .mr-xl-1,\n    .webcg-devtools .mx-xl-1 {\n      margin-right: 0.25rem !important;\n}\n.webcg-devtools .mb-xl-1,\n    .webcg-devtools .my-xl-1 {\n      margin-bottom: 0.25rem !important;\n}\n.webcg-devtools .ml-xl-1,\n    .webcg-devtools .mx-xl-1 {\n      margin-left: 0.25rem !important;\n}\n.webcg-devtools .m-xl-2 {\n      margin: 0.5rem !important;\n}\n.webcg-devtools .mt-xl-2,\n    .webcg-devtools .my-xl-2 {\n      margin-top: 0.5rem !important;\n}\n.webcg-devtools .mr-xl-2,\n    .webcg-devtools .mx-xl-2 {\n      margin-right: 0.5rem !important;\n}\n.webcg-devtools .mb-xl-2,\n    .webcg-devtools .my-xl-2 {\n      margin-bottom: 0.5rem !important;\n}\n.webcg-devtools .ml-xl-2,\n    .webcg-devtools .mx-xl-2 {\n      margin-left: 0.5rem !important;\n}\n.webcg-devtools .m-xl-3 {\n      margin: 1rem !important;\n}\n.webcg-devtools .mt-xl-3,\n    .webcg-devtools .my-xl-3 {\n      margin-top: 1rem !important;\n}\n.webcg-devtools .mr-xl-3,\n    .webcg-devtools .mx-xl-3 {\n      margin-right: 1rem !important;\n}\n.webcg-devtools .mb-xl-3,\n    .webcg-devtools .my-xl-3 {\n      margin-bottom: 1rem !important;\n}\n.webcg-devtools .ml-xl-3,\n    .webcg-devtools .mx-xl-3 {\n      margin-left: 1rem !important;\n}\n.webcg-devtools .m-xl-4 {\n      margin: 1.5rem !important;\n}\n.webcg-devtools .mt-xl-4,\n    .webcg-devtools .my-xl-4 {\n      margin-top: 1.5rem !important;\n}\n.webcg-devtools .mr-xl-4,\n    .webcg-devtools .mx-xl-4 {\n      margin-right: 1.5rem !important;\n}\n.webcg-devtools .mb-xl-4,\n    .webcg-devtools .my-xl-4 {\n      margin-bottom: 1.5rem !important;\n}\n.webcg-devtools .ml-xl-4,\n    .webcg-devtools .mx-xl-4 {\n      margin-left: 1.5rem !important;\n}\n.webcg-devtools .m-xl-5 {\n      margin: 3rem !important;\n}\n.webcg-devtools .mt-xl-5,\n    .webcg-devtools .my-xl-5 {\n      margin-top: 3rem !important;\n}\n.webcg-devtools .mr-xl-5,\n    .webcg-devtools .mx-xl-5 {\n      margin-right: 3rem !important;\n}\n.webcg-devtools .mb-xl-5,\n    .webcg-devtools .my-xl-5 {\n      margin-bottom: 3rem !important;\n}\n.webcg-devtools .ml-xl-5,\n    .webcg-devtools .mx-xl-5 {\n      margin-left: 3rem !important;\n}\n.webcg-devtools .p-xl-0 {\n      padding: 0 !important;\n}\n.webcg-devtools .pt-xl-0,\n    .webcg-devtools .py-xl-0 {\n      padding-top: 0 !important;\n}\n.webcg-devtools .pr-xl-0,\n    .webcg-devtools .px-xl-0 {\n      padding-right: 0 !important;\n}\n.webcg-devtools .pb-xl-0,\n    .webcg-devtools .py-xl-0 {\n      padding-bottom: 0 !important;\n}\n.webcg-devtools .pl-xl-0,\n    .webcg-devtools .px-xl-0 {\n      padding-left: 0 !important;\n}\n.webcg-devtools .p-xl-1 {\n      padding: 0.25rem !important;\n}\n.webcg-devtools .pt-xl-1,\n    .webcg-devtools .py-xl-1 {\n      padding-top: 0.25rem !important;\n}\n.webcg-devtools .pr-xl-1,\n    .webcg-devtools .px-xl-1 {\n      padding-right: 0.25rem !important;\n}\n.webcg-devtools .pb-xl-1,\n    .webcg-devtools .py-xl-1 {\n      padding-bottom: 0.25rem !important;\n}\n.webcg-devtools .pl-xl-1,\n    .webcg-devtools .px-xl-1 {\n      padding-left: 0.25rem !important;\n}\n.webcg-devtools .p-xl-2 {\n      padding: 0.5rem !important;\n}\n.webcg-devtools .pt-xl-2,\n    .webcg-devtools .py-xl-2 {\n      padding-top: 0.5rem !important;\n}\n.webcg-devtools .pr-xl-2,\n    .webcg-devtools .px-xl-2 {\n      padding-right: 0.5rem !important;\n}\n.webcg-devtools .pb-xl-2,\n    .webcg-devtools .py-xl-2 {\n      padding-bottom: 0.5rem !important;\n}\n.webcg-devtools .pl-xl-2,\n    .webcg-devtools .px-xl-2 {\n      padding-left: 0.5rem !important;\n}\n.webcg-devtools .p-xl-3 {\n      padding: 1rem !important;\n}\n.webcg-devtools .pt-xl-3,\n    .webcg-devtools .py-xl-3 {\n      padding-top: 1rem !important;\n}\n.webcg-devtools .pr-xl-3,\n    .webcg-devtools .px-xl-3 {\n      padding-right: 1rem !important;\n}\n.webcg-devtools .pb-xl-3,\n    .webcg-devtools .py-xl-3 {\n      padding-bottom: 1rem !important;\n}\n.webcg-devtools .pl-xl-3,\n    .webcg-devtools .px-xl-3 {\n      padding-left: 1rem !important;\n}\n.webcg-devtools .p-xl-4 {\n      padding: 1.5rem !important;\n}\n.webcg-devtools .pt-xl-4,\n    .webcg-devtools .py-xl-4 {\n      padding-top: 1.5rem !important;\n}\n.webcg-devtools .pr-xl-4,\n    .webcg-devtools .px-xl-4 {\n      padding-right: 1.5rem !important;\n}\n.webcg-devtools .pb-xl-4,\n    .webcg-devtools .py-xl-4 {\n      padding-bottom: 1.5rem !important;\n}\n.webcg-devtools .pl-xl-4,\n    .webcg-devtools .px-xl-4 {\n      padding-left: 1.5rem !important;\n}\n.webcg-devtools .p-xl-5 {\n      padding: 3rem !important;\n}\n.webcg-devtools .pt-xl-5,\n    .webcg-devtools .py-xl-5 {\n      padding-top: 3rem !important;\n}\n.webcg-devtools .pr-xl-5,\n    .webcg-devtools .px-xl-5 {\n      padding-right: 3rem !important;\n}\n.webcg-devtools .pb-xl-5,\n    .webcg-devtools .py-xl-5 {\n      padding-bottom: 3rem !important;\n}\n.webcg-devtools .pl-xl-5,\n    .webcg-devtools .px-xl-5 {\n      padding-left: 3rem !important;\n}\n.webcg-devtools .m-xl-auto {\n      margin: auto !important;\n}\n.webcg-devtools .mt-xl-auto,\n    .webcg-devtools .my-xl-auto {\n      margin-top: auto !important;\n}\n.webcg-devtools .mr-xl-auto,\n    .webcg-devtools .mx-xl-auto {\n      margin-right: auto !important;\n}\n.webcg-devtools .mb-xl-auto,\n    .webcg-devtools .my-xl-auto {\n      margin-bottom: auto !important;\n}\n.webcg-devtools .ml-xl-auto,\n    .webcg-devtools .mx-xl-auto {\n      margin-left: auto !important;\n}\n}\n.webcg-devtools .text-monospace {\n    font-family: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\n.webcg-devtools .text-justify {\n    text-align: justify !important;\n}\n.webcg-devtools .text-nowrap {\n    white-space: nowrap !important;\n}\n.webcg-devtools .text-truncate {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n.webcg-devtools .text-left {\n    text-align: left !important;\n}\n.webcg-devtools .text-right {\n    text-align: right !important;\n}\n.webcg-devtools .text-center {\n    text-align: center !important;\n}\n@media (min-width: 576px) {\n.webcg-devtools .text-sm-left {\n      text-align: left !important;\n}\n.webcg-devtools .text-sm-right {\n      text-align: right !important;\n}\n.webcg-devtools .text-sm-center {\n      text-align: center !important;\n}\n}\n@media (min-width: 768px) {\n.webcg-devtools .text-md-left {\n      text-align: left !important;\n}\n.webcg-devtools .text-md-right {\n      text-align: right !important;\n}\n.webcg-devtools .text-md-center {\n      text-align: center !important;\n}\n}\n@media (min-width: 992px) {\n.webcg-devtools .text-lg-left {\n      text-align: left !important;\n}\n.webcg-devtools .text-lg-right {\n      text-align: right !important;\n}\n.webcg-devtools .text-lg-center {\n      text-align: center !important;\n}\n}\n@media (min-width: 1200px) {\n.webcg-devtools .text-xl-left {\n      text-align: left !important;\n}\n.webcg-devtools .text-xl-right {\n      text-align: right !important;\n}\n.webcg-devtools .text-xl-center {\n      text-align: center !important;\n}\n}\n.webcg-devtools .text-lowercase {\n    text-transform: lowercase !important;\n}\n.webcg-devtools .text-uppercase {\n    text-transform: uppercase !important;\n}\n.webcg-devtools .text-capitalize {\n    text-transform: capitalize !important;\n}\n.webcg-devtools .font-weight-light {\n    font-weight: 300 !important;\n}\n.webcg-devtools .font-weight-normal {\n    font-weight: 400 !important;\n}\n.webcg-devtools .font-weight-bold {\n    font-weight: 700 !important;\n}\n.webcg-devtools .font-italic {\n    font-style: italic !important;\n}\n.webcg-devtools .text-white {\n    color: #fff !important;\n}\n.webcg-devtools .text-primary {\n    color: #007bff !important;\n}\n.webcg-devtools a.text-primary:hover, .webcg-devtools a.text-primary:focus {\n    color: #0062cc !important;\n}\n.webcg-devtools .text-secondary {\n    color: #6c757d !important;\n}\n.webcg-devtools a.text-secondary:hover, .webcg-devtools a.text-secondary:focus {\n    color: #545b62 !important;\n}\n.webcg-devtools .text-success {\n    color: #28a745 !important;\n}\n.webcg-devtools a.text-success:hover, .webcg-devtools a.text-success:focus {\n    color: #1e7e34 !important;\n}\n.webcg-devtools .text-info {\n    color: #17a2b8 !important;\n}\n.webcg-devtools a.text-info:hover, .webcg-devtools a.text-info:focus {\n    color: #117a8b !important;\n}\n.webcg-devtools .text-warning {\n    color: #ffc107 !important;\n}\n.webcg-devtools a.text-warning:hover, .webcg-devtools a.text-warning:focus {\n    color: #d39e00 !important;\n}\n.webcg-devtools .text-danger {\n    color: #dc3545 !important;\n}\n.webcg-devtools a.text-danger:hover, .webcg-devtools a.text-danger:focus {\n    color: #bd2130 !important;\n}\n.webcg-devtools .text-light {\n    color: #f8f9fa !important;\n}\n.webcg-devtools a.text-light:hover, .webcg-devtools a.text-light:focus {\n    color: #dae0e5 !important;\n}\n.webcg-devtools .text-dark {\n    color: #343a40 !important;\n}\n.webcg-devtools a.text-dark:hover, .webcg-devtools a.text-dark:focus {\n    color: #1d2124 !important;\n}\n.webcg-devtools .text-body {\n    color: #212529 !important;\n}\n.webcg-devtools .text-muted {\n    color: #6c757d !important;\n}\n.webcg-devtools .text-black-50 {\n    color: rgba(0, 0, 0, 0.5) !important;\n}\n.webcg-devtools .text-white-50 {\n    color: rgba(255, 255, 255, 0.5) !important;\n}\n.webcg-devtools .text-hide {\n    font: 0/0 a;\n    color: transparent;\n    text-shadow: none;\n    background-color: transparent;\n    border: 0;\n}\n.webcg-devtools .visible {\n    visibility: visible !important;\n}\n.webcg-devtools .invisible {\n    visibility: hidden !important;\n}\n@media print {\n.webcg-devtools *,\n    .webcg-devtools *::before,\n    .webcg-devtools *::after {\n      text-shadow: none !important;\n      box-shadow: none !important;\n}\n.webcg-devtools a:not(.btn) {\n      text-decoration: underline;\n}\n.webcg-devtools abbr[title]::after {\n      content: \" (\" attr(title) \")\";\n}\n.webcg-devtools pre {\n      white-space: pre-wrap !important;\n}\n.webcg-devtools pre,\n    .webcg-devtools blockquote {\n      border: 1px solid #adb5bd;\n      page-break-inside: avoid;\n}\n.webcg-devtools thead {\n      display: table-header-group;\n}\n.webcg-devtools tr,\n    .webcg-devtools img {\n      page-break-inside: avoid;\n}\n.webcg-devtools p,\n    .webcg-devtools h2,\n    .webcg-devtools h3 {\n      orphans: 3;\n      widows: 3;\n}\n.webcg-devtools h2,\n    .webcg-devtools h3 {\n      page-break-after: avoid;\n}\n@page {\n.webcg-devtools {\n        size: a3;\n}\n}\n.webcg-devtools body {\n      min-width: 992px !important;\n}\n.webcg-devtools .container {\n      min-width: 992px !important;\n}\n.webcg-devtools .navbar {\n      display: none;\n}\n.webcg-devtools .badge {\n      border: 1px solid #000;\n}\n.webcg-devtools .table {\n      border-collapse: collapse !important;\n}\n.webcg-devtools .table td,\n      .webcg-devtools .table th {\n        background-color: #fff !important;\n}\n.webcg-devtools .table-bordered th,\n    .webcg-devtools .table-bordered td {\n      border: 1px solid #dee2e6 !important;\n}\n.webcg-devtools .table-dark {\n      color: inherit;\n}\n.webcg-devtools .table-dark th,\n      .webcg-devtools .table-dark td,\n      .webcg-devtools .table-dark thead th,\n      .webcg-devtools .table-dark tbody + tbody {\n        border-color: #dee2e6;\n}\n.webcg-devtools .table .thead-dark th {\n      color: inherit;\n      border-color: #dee2e6;\n}\n}\n.webcg-devtools h1, .webcg-devtools h2, .webcg-devtools h3, .webcg-devtools h4, .webcg-devtools h5, .webcg-devtools h6,\n  .webcg-devtools .h1, .webcg-devtools .h2, .webcg-devtools .h3, .webcg-devtools .h4, .webcg-devtools .h5, .webcg-devtools .h6 {\n    margin-bottom: 8px;\n    /* 0.5rem */\n}\n.webcg-devtools h1, .webcg-devtools .h1 {\n    font-size: 40px;\n    /* 2.5rem */\n}\n.webcg-devtools h2, .webcg-devtools .h2 {\n    font-size: 32px;\n    /* 2rem */\n}\n.webcg-devtools h3, .webcg-devtools .h3 {\n    font-size: 28px;\n    /* 1.75rem */\n}\n.webcg-devtools h4, .webcg-devtools .h4 {\n    font-size: 24px;\n    /* 1.5rem */\n}\n.webcg-devtools h5, .webcg-devtools .h5 {\n    font-size: 20px;\n    /* 1.25rem */\n}\n.webcg-devtools h6, .webcg-devtools .h6 {\n    font-size: 16px;\n    /* 1rem */\n}\n.webcg-devtools .btn {\n    padding: 6px 12px;\n    /* 0.375rem 0.75rem */\n    font-size: 16px;\n    /* 1rem */\n    border-radius: 4px;\n    /* 0.25rem */\n}\n.webcg-devtools .btn-sm, .webcg-devtools .btn-group-sm > .btn {\n    padding: 4px 8px;\n    /* 0.25rem 0.5rem */\n    font-size: 14px;\n    /* 0.875rem */\n    border-radius: 3.2px;\n}\n.webcg-devtools .btn:focus {\n    box-shadow: 0 0 0 3.2px rgba(0, 123, 255, 0.25);\n    /* 0.2rem */\n}\n.webcg-devtools .form-group {\n    margin-bottom: 16px;\n    /* 1rem */\n}\n.webcg-devtools .form-control {\n    height: 38px;\n    /* calc(2.25rem + 2px); */\n    padding: 6px 12px;\n    /* 0.375rem 0.75rem */\n    font-size: 16px;\n    /* 1rem */\n    border-radius: 4px;\n    /* 0.25rem */\n}\n.webcg-devtools .form-control:focus {\n    box-shadow: 0 0 0 3.2px rgba(0, 123, 255, 0.25);\n    /* 0.2rem */\n}\n.webcg-devtools .nav-tabs .nav-link {\n    border-top-left-radius: 4px;\n    /* 0.25rem */\n    border-top-right-radius: 4px;\n    /* 0.25rem */\n}\n.webcg-devtools .nav-link {\n    padding: 8px 16px;\n    /* 0.5rem 1rem */\n}\n.webcg-devtools .modal {\n    display: block;\n    top: auto;\n    right: auto;\n    bottom: auto;\n    left: auto;\n}\n.webcg-devtools .modal-header {\n    padding: 16px;\n    /* 1rem */\n    border-top-left-radius: 4.8px;\n    /* 0.3rem */\n    border-top-right-radius: 4.8px;\n    /* 0.3rem */\n}\n.webcg-devtools .modal-body {\n    padding: 16px;\n    /* 1rem */\n}\n.webcg-devtools .modal-content {\n    border-radius: 4.8px;\n    /* 0.3rem */\n}\n.webcg-devtools .modal-footer {\n    padding: 16px;\n    /* 1rem */\n}\n.webcg-devtools .table {\n    margin-bottom: 16px;\n    /* 1rem */\n}\n.webcg-devtools .table th,\n    .webcg-devtools .table td {\n      padding: 12px;\n      /* 0.75rem */\n}\n.webcg-devtools .table-sm th,\n  .webcg-devtools .table-sm td {\n    padding: 4.8px;\n    /* 0.3rem */\n}\n.webcg-devtools {\n  background: white;\n  color: black;\n  font-size: 16px;\n  line-height: normal;\n}\n.webcg-devtools .btn-sm, .webcg-devtools .btn-group-sm > .btn {\n    min-width: 32px;\n    /* 2rem */\n}\n.webcg-devtools .flex-columns {\n    display: flex;\n    flex-direction: column;\n    flex: 1 0 auto;\n}\n.webcg-devtools .form-row {\n    flex: 0 0 auto;\n}\n.webcg-devtools .modal {\n    height: auto;\n    width: auto;\n    box-shadow: 0 20px 32px -8px rgba(9, 45, 66, 0.25);\n}\n.webcg-devtools .modal .modal-content {\n      resize: both;\n      overflow: hidden;\n      height: 100%;\n      min-width: 410px;\n      min-height: 63px;\n}\n.webcg-devtools .modal .modal-content .modal-header {\n        flex: 0 0 auto;\n        border-bottom: 0;\n}\n.webcg-devtools .modal .modal-content .modal-navbar .nav {\n        padding: 0 16px;\n        /* 0 1rem */\n}\n.webcg-devtools .modal .modal-content .modal-body {\n        position: static;\n        display: flex;\n        flex-direction: column;\n        overflow: auto;\n        padding-bottom: 0;\n}\n.webcg-devtools .modal .modal-content .modal-footer {\n        flex: 0 0 auto;\n        justify-content: center;\n        font-size: 12px;\n}\n.webcg-devtools .draggable {\n    position: absolute;\n    z-index: auto;\n}\n.webcg-devtools .drag-handle {\n    cursor: grab;\n    cursor: -webkit-grab;\n}\n.webcg-devtools .dragging .drag-handle {\n    cursor: grabbing;\n    cursor: -webkit-grabbing;\n}\n\n/*# sourceMappingURL=dev-tools.vue.map */", map: {"version":3,"sources":["dev-tools.vue","/home/reto/Projects/webcg/webcg-devtools/src/dev-tools.vue"],"names":[],"mappings":"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","file":"dev-tools.vue","sourcesContent":[".webcg-devtools {\n  /*!\n * Bootstrap v4.1.3 (https://getbootstrap.com/)\n * Copyright 2011-2018 The Bootstrap Authors\n * Copyright 2011-2018 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n */ }\n  .webcg-devtools :root {\n    --blue: #007bff;\n    --indigo: #6610f2;\n    --purple: #6f42c1;\n    --pink: #e83e8c;\n    --red: #dc3545;\n    --orange: #fd7e14;\n    --yellow: #ffc107;\n    --green: #28a745;\n    --teal: #20c997;\n    --cyan: #17a2b8;\n    --white: #fff;\n    --gray: #6c757d;\n    --gray-dark: #343a40;\n    --primary: #007bff;\n    --secondary: #6c757d;\n    --success: #28a745;\n    --info: #17a2b8;\n    --warning: #ffc107;\n    --danger: #dc3545;\n    --light: #f8f9fa;\n    --dark: #343a40;\n    --breakpoint-xs: 0;\n    --breakpoint-sm: 576px;\n    --breakpoint-md: 768px;\n    --breakpoint-lg: 992px;\n    --breakpoint-xl: 1200px;\n    --font-family-sans-serif: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n    --font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; }\n  .webcg-devtools *,\n  .webcg-devtools *::before,\n  .webcg-devtools *::after {\n    box-sizing: border-box; }\n  .webcg-devtools html {\n    font-family: sans-serif;\n    line-height: 1.15;\n    -webkit-text-size-adjust: 100%;\n    -ms-text-size-adjust: 100%;\n    -ms-overflow-style: scrollbar;\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0); }\n\n@-ms-viewport {\n  width: device-width; }\n  .webcg-devtools article, .webcg-devtools aside, .webcg-devtools figcaption, .webcg-devtools figure, .webcg-devtools footer, .webcg-devtools header, .webcg-devtools hgroup, .webcg-devtools main, .webcg-devtools nav, .webcg-devtools section {\n    display: block; }\n  .webcg-devtools body {\n    margin: 0;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n    font-size: 1rem;\n    font-weight: 400;\n    line-height: 1.5;\n    color: #212529;\n    text-align: left;\n    background-color: #fff; }\n  .webcg-devtools [tabindex=\"-1\"]:focus {\n    outline: 0 !important; }\n  .webcg-devtools hr {\n    box-sizing: content-box;\n    height: 0;\n    overflow: visible; }\n  .webcg-devtools h1, .webcg-devtools h2, .webcg-devtools h3, .webcg-devtools h4, .webcg-devtools h5, .webcg-devtools h6 {\n    margin-top: 0;\n    margin-bottom: 0.5rem; }\n  .webcg-devtools p {\n    margin-top: 0;\n    margin-bottom: 1rem; }\n  .webcg-devtools abbr[title],\n  .webcg-devtools abbr[data-original-title] {\n    text-decoration: underline;\n    text-decoration: underline dotted;\n    cursor: help;\n    border-bottom: 0; }\n  .webcg-devtools address {\n    margin-bottom: 1rem;\n    font-style: normal;\n    line-height: inherit; }\n  .webcg-devtools ol,\n  .webcg-devtools ul,\n  .webcg-devtools dl {\n    margin-top: 0;\n    margin-bottom: 1rem; }\n  .webcg-devtools ol ol,\n  .webcg-devtools ul ul,\n  .webcg-devtools ol ul,\n  .webcg-devtools ul ol {\n    margin-bottom: 0; }\n  .webcg-devtools dt {\n    font-weight: 700; }\n  .webcg-devtools dd {\n    margin-bottom: .5rem;\n    margin-left: 0; }\n  .webcg-devtools blockquote {\n    margin: 0 0 1rem; }\n  .webcg-devtools dfn {\n    font-style: italic; }\n  .webcg-devtools b,\n  .webcg-devtools strong {\n    font-weight: bolder; }\n  .webcg-devtools small {\n    font-size: 80%; }\n  .webcg-devtools sub,\n  .webcg-devtools sup {\n    position: relative;\n    font-size: 75%;\n    line-height: 0;\n    vertical-align: baseline; }\n  .webcg-devtools sub {\n    bottom: -.25em; }\n  .webcg-devtools sup {\n    top: -.5em; }\n  .webcg-devtools a {\n    color: #007bff;\n    text-decoration: none;\n    background-color: transparent;\n    -webkit-text-decoration-skip: objects; }\n    .webcg-devtools a:hover {\n      color: #0056b3;\n      text-decoration: underline; }\n  .webcg-devtools a:not([href]):not([tabindex]) {\n    color: inherit;\n    text-decoration: none; }\n    .webcg-devtools a:not([href]):not([tabindex]):hover, .webcg-devtools a:not([href]):not([tabindex]):focus {\n      color: inherit;\n      text-decoration: none; }\n    .webcg-devtools a:not([href]):not([tabindex]):focus {\n      outline: 0; }\n  .webcg-devtools pre,\n  .webcg-devtools code,\n  .webcg-devtools kbd,\n  .webcg-devtools samp {\n    font-family: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n    font-size: 1em; }\n  .webcg-devtools pre {\n    margin-top: 0;\n    margin-bottom: 1rem;\n    overflow: auto;\n    -ms-overflow-style: scrollbar; }\n  .webcg-devtools figure {\n    margin: 0 0 1rem; }\n  .webcg-devtools img {\n    vertical-align: middle;\n    border-style: none; }\n  .webcg-devtools svg {\n    overflow: hidden;\n    vertical-align: middle; }\n  .webcg-devtools table {\n    border-collapse: collapse; }\n  .webcg-devtools caption {\n    padding-top: 0.75rem;\n    padding-bottom: 0.75rem;\n    color: #6c757d;\n    text-align: left;\n    caption-side: bottom; }\n  .webcg-devtools th {\n    text-align: inherit; }\n  .webcg-devtools label {\n    display: inline-block;\n    margin-bottom: 0.5rem; }\n  .webcg-devtools button {\n    border-radius: 0; }\n  .webcg-devtools button:focus {\n    outline: 1px dotted;\n    outline: 5px auto -webkit-focus-ring-color; }\n  .webcg-devtools input,\n  .webcg-devtools button,\n  .webcg-devtools select,\n  .webcg-devtools optgroup,\n  .webcg-devtools textarea {\n    margin: 0;\n    font-family: inherit;\n    font-size: inherit;\n    line-height: inherit; }\n  .webcg-devtools button,\n  .webcg-devtools input {\n    overflow: visible; }\n  .webcg-devtools button,\n  .webcg-devtools select {\n    text-transform: none; }\n  .webcg-devtools button,\n  .webcg-devtools html [type=\"button\"],\n  .webcg-devtools [type=\"reset\"],\n  .webcg-devtools [type=\"submit\"] {\n    -webkit-appearance: button; }\n  .webcg-devtools button::-moz-focus-inner,\n  .webcg-devtools [type=\"button\"]::-moz-focus-inner,\n  .webcg-devtools [type=\"reset\"]::-moz-focus-inner,\n  .webcg-devtools [type=\"submit\"]::-moz-focus-inner {\n    padding: 0;\n    border-style: none; }\n  .webcg-devtools input[type=\"radio\"],\n  .webcg-devtools input[type=\"checkbox\"] {\n    box-sizing: border-box;\n    padding: 0; }\n  .webcg-devtools input[type=\"date\"],\n  .webcg-devtools input[type=\"time\"],\n  .webcg-devtools input[type=\"datetime-local\"],\n  .webcg-devtools input[type=\"month\"] {\n    -webkit-appearance: listbox; }\n  .webcg-devtools textarea {\n    overflow: auto;\n    resize: vertical; }\n  .webcg-devtools fieldset {\n    min-width: 0;\n    padding: 0;\n    margin: 0;\n    border: 0; }\n  .webcg-devtools legend {\n    display: block;\n    width: 100%;\n    max-width: 100%;\n    padding: 0;\n    margin-bottom: .5rem;\n    font-size: 1.5rem;\n    line-height: inherit;\n    color: inherit;\n    white-space: normal; }\n  .webcg-devtools progress {\n    vertical-align: baseline; }\n  .webcg-devtools [type=\"number\"]::-webkit-inner-spin-button,\n  .webcg-devtools [type=\"number\"]::-webkit-outer-spin-button {\n    height: auto; }\n  .webcg-devtools [type=\"search\"] {\n    outline-offset: -2px;\n    -webkit-appearance: none; }\n  .webcg-devtools [type=\"search\"]::-webkit-search-cancel-button,\n  .webcg-devtools [type=\"search\"]::-webkit-search-decoration {\n    -webkit-appearance: none; }\n  .webcg-devtools ::-webkit-file-upload-button {\n    font: inherit;\n    -webkit-appearance: button; }\n  .webcg-devtools output {\n    display: inline-block; }\n  .webcg-devtools summary {\n    display: list-item;\n    cursor: pointer; }\n  .webcg-devtools template {\n    display: none; }\n  .webcg-devtools [hidden] {\n    display: none !important; }\n  .webcg-devtools h1, .webcg-devtools h2, .webcg-devtools h3, .webcg-devtools h4, .webcg-devtools h5, .webcg-devtools h6,\n  .webcg-devtools .h1, .webcg-devtools .h2, .webcg-devtools .h3, .webcg-devtools .h4, .webcg-devtools .h5, .webcg-devtools .h6 {\n    margin-bottom: 0.5rem;\n    font-family: inherit;\n    font-weight: 500;\n    line-height: 1.2;\n    color: inherit; }\n  .webcg-devtools h1, .webcg-devtools .h1 {\n    font-size: 2.5rem; }\n  .webcg-devtools h2, .webcg-devtools .h2 {\n    font-size: 2rem; }\n  .webcg-devtools h3, .webcg-devtools .h3 {\n    font-size: 1.75rem; }\n  .webcg-devtools h4, .webcg-devtools .h4 {\n    font-size: 1.5rem; }\n  .webcg-devtools h5, .webcg-devtools .h5 {\n    font-size: 1.25rem; }\n  .webcg-devtools h6, .webcg-devtools .h6 {\n    font-size: 1rem; }\n  .webcg-devtools .lead {\n    font-size: 1.25rem;\n    font-weight: 300; }\n  .webcg-devtools .display-1 {\n    font-size: 6rem;\n    font-weight: 300;\n    line-height: 1.2; }\n  .webcg-devtools .display-2 {\n    font-size: 5.5rem;\n    font-weight: 300;\n    line-height: 1.2; }\n  .webcg-devtools .display-3 {\n    font-size: 4.5rem;\n    font-weight: 300;\n    line-height: 1.2; }\n  .webcg-devtools .display-4 {\n    font-size: 3.5rem;\n    font-weight: 300;\n    line-height: 1.2; }\n  .webcg-devtools hr {\n    margin-top: 1rem;\n    margin-bottom: 1rem;\n    border: 0;\n    border-top: 1px solid rgba(0, 0, 0, 0.1); }\n  .webcg-devtools small,\n  .webcg-devtools .small {\n    font-size: 80%;\n    font-weight: 400; }\n  .webcg-devtools mark,\n  .webcg-devtools .mark {\n    padding: 0.2em;\n    background-color: #fcf8e3; }\n  .webcg-devtools .list-unstyled {\n    padding-left: 0;\n    list-style: none; }\n  .webcg-devtools .list-inline {\n    padding-left: 0;\n    list-style: none; }\n  .webcg-devtools .list-inline-item {\n    display: inline-block; }\n    .webcg-devtools .list-inline-item:not(:last-child) {\n      margin-right: 0.5rem; }\n  .webcg-devtools .initialism {\n    font-size: 90%;\n    text-transform: uppercase; }\n  .webcg-devtools .blockquote {\n    margin-bottom: 1rem;\n    font-size: 1.25rem; }\n  .webcg-devtools .blockquote-footer {\n    display: block;\n    font-size: 80%;\n    color: #6c757d; }\n    .webcg-devtools .blockquote-footer::before {\n      content: \"\\2014 \\00A0\"; }\n  .webcg-devtools .img-fluid {\n    max-width: 100%;\n    height: auto; }\n  .webcg-devtools .img-thumbnail {\n    padding: 0.25rem;\n    background-color: #fff;\n    border: 1px solid #dee2e6;\n    border-radius: 0.25rem;\n    max-width: 100%;\n    height: auto; }\n  .webcg-devtools .figure {\n    display: inline-block; }\n  .webcg-devtools .figure-img {\n    margin-bottom: 0.5rem;\n    line-height: 1; }\n  .webcg-devtools .figure-caption {\n    font-size: 90%;\n    color: #6c757d; }\n  .webcg-devtools code {\n    font-size: 87.5%;\n    color: #e83e8c;\n    word-break: break-word; }\n    a > .webcg-devtools code {\n      color: inherit; }\n  .webcg-devtools kbd {\n    padding: 0.2rem 0.4rem;\n    font-size: 87.5%;\n    color: #fff;\n    background-color: #212529;\n    border-radius: 0.2rem; }\n    .webcg-devtools kbd kbd {\n      padding: 0;\n      font-size: 100%;\n      font-weight: 700; }\n  .webcg-devtools pre {\n    display: block;\n    font-size: 87.5%;\n    color: #212529; }\n    .webcg-devtools pre code {\n      font-size: inherit;\n      color: inherit;\n      word-break: normal; }\n  .webcg-devtools .pre-scrollable {\n    max-height: 340px;\n    overflow-y: scroll; }\n  .webcg-devtools .container {\n    width: 100%;\n    padding-right: 15px;\n    padding-left: 15px;\n    margin-right: auto;\n    margin-left: auto; }\n    @media (min-width: 576px) {\n      .webcg-devtools .container {\n        max-width: 540px; } }\n    @media (min-width: 768px) {\n      .webcg-devtools .container {\n        max-width: 720px; } }\n    @media (min-width: 992px) {\n      .webcg-devtools .container {\n        max-width: 960px; } }\n    @media (min-width: 1200px) {\n      .webcg-devtools .container {\n        max-width: 1140px; } }\n  .webcg-devtools .container-fluid {\n    width: 100%;\n    padding-right: 15px;\n    padding-left: 15px;\n    margin-right: auto;\n    margin-left: auto; }\n  .webcg-devtools .row {\n    display: flex;\n    flex-wrap: wrap;\n    margin-right: -15px;\n    margin-left: -15px; }\n  .webcg-devtools .no-gutters {\n    margin-right: 0;\n    margin-left: 0; }\n    .webcg-devtools .no-gutters > .col,\n    .webcg-devtools .no-gutters > [class*=\"col-\"] {\n      padding-right: 0;\n      padding-left: 0; }\n  .webcg-devtools .col-1, .webcg-devtools .col-2, .webcg-devtools .col-3, .webcg-devtools .col-4, .webcg-devtools .col-5, .webcg-devtools .col-6, .webcg-devtools .col-7, .webcg-devtools .col-8, .webcg-devtools .col-9, .webcg-devtools .col-10, .webcg-devtools .col-11, .webcg-devtools .col-12, .webcg-devtools .col,\n  .webcg-devtools .col-auto, .webcg-devtools .col-sm-1, .webcg-devtools .col-sm-2, .webcg-devtools .col-sm-3, .webcg-devtools .col-sm-4, .webcg-devtools .col-sm-5, .webcg-devtools .col-sm-6, .webcg-devtools .col-sm-7, .webcg-devtools .col-sm-8, .webcg-devtools .col-sm-9, .webcg-devtools .col-sm-10, .webcg-devtools .col-sm-11, .webcg-devtools .col-sm-12, .webcg-devtools .col-sm,\n  .webcg-devtools .col-sm-auto, .webcg-devtools .col-md-1, .webcg-devtools .col-md-2, .webcg-devtools .col-md-3, .webcg-devtools .col-md-4, .webcg-devtools .col-md-5, .webcg-devtools .col-md-6, .webcg-devtools .col-md-7, .webcg-devtools .col-md-8, .webcg-devtools .col-md-9, .webcg-devtools .col-md-10, .webcg-devtools .col-md-11, .webcg-devtools .col-md-12, .webcg-devtools .col-md,\n  .webcg-devtools .col-md-auto, .webcg-devtools .col-lg-1, .webcg-devtools .col-lg-2, .webcg-devtools .col-lg-3, .webcg-devtools .col-lg-4, .webcg-devtools .col-lg-5, .webcg-devtools .col-lg-6, .webcg-devtools .col-lg-7, .webcg-devtools .col-lg-8, .webcg-devtools .col-lg-9, .webcg-devtools .col-lg-10, .webcg-devtools .col-lg-11, .webcg-devtools .col-lg-12, .webcg-devtools .col-lg,\n  .webcg-devtools .col-lg-auto, .webcg-devtools .col-xl-1, .webcg-devtools .col-xl-2, .webcg-devtools .col-xl-3, .webcg-devtools .col-xl-4, .webcg-devtools .col-xl-5, .webcg-devtools .col-xl-6, .webcg-devtools .col-xl-7, .webcg-devtools .col-xl-8, .webcg-devtools .col-xl-9, .webcg-devtools .col-xl-10, .webcg-devtools .col-xl-11, .webcg-devtools .col-xl-12, .webcg-devtools .col-xl,\n  .webcg-devtools .col-xl-auto {\n    position: relative;\n    width: 100%;\n    min-height: 1px;\n    padding-right: 15px;\n    padding-left: 15px; }\n  .webcg-devtools .col {\n    flex-basis: 0;\n    flex-grow: 1;\n    max-width: 100%; }\n  .webcg-devtools .col-auto {\n    flex: 0 0 auto;\n    width: auto;\n    max-width: none; }\n  .webcg-devtools .col-1 {\n    flex: 0 0 8.33333%;\n    max-width: 8.33333%; }\n  .webcg-devtools .col-2 {\n    flex: 0 0 16.66667%;\n    max-width: 16.66667%; }\n  .webcg-devtools .col-3 {\n    flex: 0 0 25%;\n    max-width: 25%; }\n  .webcg-devtools .col-4 {\n    flex: 0 0 33.33333%;\n    max-width: 33.33333%; }\n  .webcg-devtools .col-5 {\n    flex: 0 0 41.66667%;\n    max-width: 41.66667%; }\n  .webcg-devtools .col-6 {\n    flex: 0 0 50%;\n    max-width: 50%; }\n  .webcg-devtools .col-7 {\n    flex: 0 0 58.33333%;\n    max-width: 58.33333%; }\n  .webcg-devtools .col-8 {\n    flex: 0 0 66.66667%;\n    max-width: 66.66667%; }\n  .webcg-devtools .col-9 {\n    flex: 0 0 75%;\n    max-width: 75%; }\n  .webcg-devtools .col-10 {\n    flex: 0 0 83.33333%;\n    max-width: 83.33333%; }\n  .webcg-devtools .col-11 {\n    flex: 0 0 91.66667%;\n    max-width: 91.66667%; }\n  .webcg-devtools .col-12 {\n    flex: 0 0 100%;\n    max-width: 100%; }\n  .webcg-devtools .order-first {\n    order: -1; }\n  .webcg-devtools .order-last {\n    order: 13; }\n  .webcg-devtools .order-0 {\n    order: 0; }\n  .webcg-devtools .order-1 {\n    order: 1; }\n  .webcg-devtools .order-2 {\n    order: 2; }\n  .webcg-devtools .order-3 {\n    order: 3; }\n  .webcg-devtools .order-4 {\n    order: 4; }\n  .webcg-devtools .order-5 {\n    order: 5; }\n  .webcg-devtools .order-6 {\n    order: 6; }\n  .webcg-devtools .order-7 {\n    order: 7; }\n  .webcg-devtools .order-8 {\n    order: 8; }\n  .webcg-devtools .order-9 {\n    order: 9; }\n  .webcg-devtools .order-10 {\n    order: 10; }\n  .webcg-devtools .order-11 {\n    order: 11; }\n  .webcg-devtools .order-12 {\n    order: 12; }\n  .webcg-devtools .offset-1 {\n    margin-left: 8.33333%; }\n  .webcg-devtools .offset-2 {\n    margin-left: 16.66667%; }\n  .webcg-devtools .offset-3 {\n    margin-left: 25%; }\n  .webcg-devtools .offset-4 {\n    margin-left: 33.33333%; }\n  .webcg-devtools .offset-5 {\n    margin-left: 41.66667%; }\n  .webcg-devtools .offset-6 {\n    margin-left: 50%; }\n  .webcg-devtools .offset-7 {\n    margin-left: 58.33333%; }\n  .webcg-devtools .offset-8 {\n    margin-left: 66.66667%; }\n  .webcg-devtools .offset-9 {\n    margin-left: 75%; }\n  .webcg-devtools .offset-10 {\n    margin-left: 83.33333%; }\n  .webcg-devtools .offset-11 {\n    margin-left: 91.66667%; }\n  @media (min-width: 576px) {\n    .webcg-devtools .col-sm {\n      flex-basis: 0;\n      flex-grow: 1;\n      max-width: 100%; }\n    .webcg-devtools .col-sm-auto {\n      flex: 0 0 auto;\n      width: auto;\n      max-width: none; }\n    .webcg-devtools .col-sm-1 {\n      flex: 0 0 8.33333%;\n      max-width: 8.33333%; }\n    .webcg-devtools .col-sm-2 {\n      flex: 0 0 16.66667%;\n      max-width: 16.66667%; }\n    .webcg-devtools .col-sm-3 {\n      flex: 0 0 25%;\n      max-width: 25%; }\n    .webcg-devtools .col-sm-4 {\n      flex: 0 0 33.33333%;\n      max-width: 33.33333%; }\n    .webcg-devtools .col-sm-5 {\n      flex: 0 0 41.66667%;\n      max-width: 41.66667%; }\n    .webcg-devtools .col-sm-6 {\n      flex: 0 0 50%;\n      max-width: 50%; }\n    .webcg-devtools .col-sm-7 {\n      flex: 0 0 58.33333%;\n      max-width: 58.33333%; }\n    .webcg-devtools .col-sm-8 {\n      flex: 0 0 66.66667%;\n      max-width: 66.66667%; }\n    .webcg-devtools .col-sm-9 {\n      flex: 0 0 75%;\n      max-width: 75%; }\n    .webcg-devtools .col-sm-10 {\n      flex: 0 0 83.33333%;\n      max-width: 83.33333%; }\n    .webcg-devtools .col-sm-11 {\n      flex: 0 0 91.66667%;\n      max-width: 91.66667%; }\n    .webcg-devtools .col-sm-12 {\n      flex: 0 0 100%;\n      max-width: 100%; }\n    .webcg-devtools .order-sm-first {\n      order: -1; }\n    .webcg-devtools .order-sm-last {\n      order: 13; }\n    .webcg-devtools .order-sm-0 {\n      order: 0; }\n    .webcg-devtools .order-sm-1 {\n      order: 1; }\n    .webcg-devtools .order-sm-2 {\n      order: 2; }\n    .webcg-devtools .order-sm-3 {\n      order: 3; }\n    .webcg-devtools .order-sm-4 {\n      order: 4; }\n    .webcg-devtools .order-sm-5 {\n      order: 5; }\n    .webcg-devtools .order-sm-6 {\n      order: 6; }\n    .webcg-devtools .order-sm-7 {\n      order: 7; }\n    .webcg-devtools .order-sm-8 {\n      order: 8; }\n    .webcg-devtools .order-sm-9 {\n      order: 9; }\n    .webcg-devtools .order-sm-10 {\n      order: 10; }\n    .webcg-devtools .order-sm-11 {\n      order: 11; }\n    .webcg-devtools .order-sm-12 {\n      order: 12; }\n    .webcg-devtools .offset-sm-0 {\n      margin-left: 0; }\n    .webcg-devtools .offset-sm-1 {\n      margin-left: 8.33333%; }\n    .webcg-devtools .offset-sm-2 {\n      margin-left: 16.66667%; }\n    .webcg-devtools .offset-sm-3 {\n      margin-left: 25%; }\n    .webcg-devtools .offset-sm-4 {\n      margin-left: 33.33333%; }\n    .webcg-devtools .offset-sm-5 {\n      margin-left: 41.66667%; }\n    .webcg-devtools .offset-sm-6 {\n      margin-left: 50%; }\n    .webcg-devtools .offset-sm-7 {\n      margin-left: 58.33333%; }\n    .webcg-devtools .offset-sm-8 {\n      margin-left: 66.66667%; }\n    .webcg-devtools .offset-sm-9 {\n      margin-left: 75%; }\n    .webcg-devtools .offset-sm-10 {\n      margin-left: 83.33333%; }\n    .webcg-devtools .offset-sm-11 {\n      margin-left: 91.66667%; } }\n  @media (min-width: 768px) {\n    .webcg-devtools .col-md {\n      flex-basis: 0;\n      flex-grow: 1;\n      max-width: 100%; }\n    .webcg-devtools .col-md-auto {\n      flex: 0 0 auto;\n      width: auto;\n      max-width: none; }\n    .webcg-devtools .col-md-1 {\n      flex: 0 0 8.33333%;\n      max-width: 8.33333%; }\n    .webcg-devtools .col-md-2 {\n      flex: 0 0 16.66667%;\n      max-width: 16.66667%; }\n    .webcg-devtools .col-md-3 {\n      flex: 0 0 25%;\n      max-width: 25%; }\n    .webcg-devtools .col-md-4 {\n      flex: 0 0 33.33333%;\n      max-width: 33.33333%; }\n    .webcg-devtools .col-md-5 {\n      flex: 0 0 41.66667%;\n      max-width: 41.66667%; }\n    .webcg-devtools .col-md-6 {\n      flex: 0 0 50%;\n      max-width: 50%; }\n    .webcg-devtools .col-md-7 {\n      flex: 0 0 58.33333%;\n      max-width: 58.33333%; }\n    .webcg-devtools .col-md-8 {\n      flex: 0 0 66.66667%;\n      max-width: 66.66667%; }\n    .webcg-devtools .col-md-9 {\n      flex: 0 0 75%;\n      max-width: 75%; }\n    .webcg-devtools .col-md-10 {\n      flex: 0 0 83.33333%;\n      max-width: 83.33333%; }\n    .webcg-devtools .col-md-11 {\n      flex: 0 0 91.66667%;\n      max-width: 91.66667%; }\n    .webcg-devtools .col-md-12 {\n      flex: 0 0 100%;\n      max-width: 100%; }\n    .webcg-devtools .order-md-first {\n      order: -1; }\n    .webcg-devtools .order-md-last {\n      order: 13; }\n    .webcg-devtools .order-md-0 {\n      order: 0; }\n    .webcg-devtools .order-md-1 {\n      order: 1; }\n    .webcg-devtools .order-md-2 {\n      order: 2; }\n    .webcg-devtools .order-md-3 {\n      order: 3; }\n    .webcg-devtools .order-md-4 {\n      order: 4; }\n    .webcg-devtools .order-md-5 {\n      order: 5; }\n    .webcg-devtools .order-md-6 {\n      order: 6; }\n    .webcg-devtools .order-md-7 {\n      order: 7; }\n    .webcg-devtools .order-md-8 {\n      order: 8; }\n    .webcg-devtools .order-md-9 {\n      order: 9; }\n    .webcg-devtools .order-md-10 {\n      order: 10; }\n    .webcg-devtools .order-md-11 {\n      order: 11; }\n    .webcg-devtools .order-md-12 {\n      order: 12; }\n    .webcg-devtools .offset-md-0 {\n      margin-left: 0; }\n    .webcg-devtools .offset-md-1 {\n      margin-left: 8.33333%; }\n    .webcg-devtools .offset-md-2 {\n      margin-left: 16.66667%; }\n    .webcg-devtools .offset-md-3 {\n      margin-left: 25%; }\n    .webcg-devtools .offset-md-4 {\n      margin-left: 33.33333%; }\n    .webcg-devtools .offset-md-5 {\n      margin-left: 41.66667%; }\n    .webcg-devtools .offset-md-6 {\n      margin-left: 50%; }\n    .webcg-devtools .offset-md-7 {\n      margin-left: 58.33333%; }\n    .webcg-devtools .offset-md-8 {\n      margin-left: 66.66667%; }\n    .webcg-devtools .offset-md-9 {\n      margin-left: 75%; }\n    .webcg-devtools .offset-md-10 {\n      margin-left: 83.33333%; }\n    .webcg-devtools .offset-md-11 {\n      margin-left: 91.66667%; } }\n  @media (min-width: 992px) {\n    .webcg-devtools .col-lg {\n      flex-basis: 0;\n      flex-grow: 1;\n      max-width: 100%; }\n    .webcg-devtools .col-lg-auto {\n      flex: 0 0 auto;\n      width: auto;\n      max-width: none; }\n    .webcg-devtools .col-lg-1 {\n      flex: 0 0 8.33333%;\n      max-width: 8.33333%; }\n    .webcg-devtools .col-lg-2 {\n      flex: 0 0 16.66667%;\n      max-width: 16.66667%; }\n    .webcg-devtools .col-lg-3 {\n      flex: 0 0 25%;\n      max-width: 25%; }\n    .webcg-devtools .col-lg-4 {\n      flex: 0 0 33.33333%;\n      max-width: 33.33333%; }\n    .webcg-devtools .col-lg-5 {\n      flex: 0 0 41.66667%;\n      max-width: 41.66667%; }\n    .webcg-devtools .col-lg-6 {\n      flex: 0 0 50%;\n      max-width: 50%; }\n    .webcg-devtools .col-lg-7 {\n      flex: 0 0 58.33333%;\n      max-width: 58.33333%; }\n    .webcg-devtools .col-lg-8 {\n      flex: 0 0 66.66667%;\n      max-width: 66.66667%; }\n    .webcg-devtools .col-lg-9 {\n      flex: 0 0 75%;\n      max-width: 75%; }\n    .webcg-devtools .col-lg-10 {\n      flex: 0 0 83.33333%;\n      max-width: 83.33333%; }\n    .webcg-devtools .col-lg-11 {\n      flex: 0 0 91.66667%;\n      max-width: 91.66667%; }\n    .webcg-devtools .col-lg-12 {\n      flex: 0 0 100%;\n      max-width: 100%; }\n    .webcg-devtools .order-lg-first {\n      order: -1; }\n    .webcg-devtools .order-lg-last {\n      order: 13; }\n    .webcg-devtools .order-lg-0 {\n      order: 0; }\n    .webcg-devtools .order-lg-1 {\n      order: 1; }\n    .webcg-devtools .order-lg-2 {\n      order: 2; }\n    .webcg-devtools .order-lg-3 {\n      order: 3; }\n    .webcg-devtools .order-lg-4 {\n      order: 4; }\n    .webcg-devtools .order-lg-5 {\n      order: 5; }\n    .webcg-devtools .order-lg-6 {\n      order: 6; }\n    .webcg-devtools .order-lg-7 {\n      order: 7; }\n    .webcg-devtools .order-lg-8 {\n      order: 8; }\n    .webcg-devtools .order-lg-9 {\n      order: 9; }\n    .webcg-devtools .order-lg-10 {\n      order: 10; }\n    .webcg-devtools .order-lg-11 {\n      order: 11; }\n    .webcg-devtools .order-lg-12 {\n      order: 12; }\n    .webcg-devtools .offset-lg-0 {\n      margin-left: 0; }\n    .webcg-devtools .offset-lg-1 {\n      margin-left: 8.33333%; }\n    .webcg-devtools .offset-lg-2 {\n      margin-left: 16.66667%; }\n    .webcg-devtools .offset-lg-3 {\n      margin-left: 25%; }\n    .webcg-devtools .offset-lg-4 {\n      margin-left: 33.33333%; }\n    .webcg-devtools .offset-lg-5 {\n      margin-left: 41.66667%; }\n    .webcg-devtools .offset-lg-6 {\n      margin-left: 50%; }\n    .webcg-devtools .offset-lg-7 {\n      margin-left: 58.33333%; }\n    .webcg-devtools .offset-lg-8 {\n      margin-left: 66.66667%; }\n    .webcg-devtools .offset-lg-9 {\n      margin-left: 75%; }\n    .webcg-devtools .offset-lg-10 {\n      margin-left: 83.33333%; }\n    .webcg-devtools .offset-lg-11 {\n      margin-left: 91.66667%; } }\n  @media (min-width: 1200px) {\n    .webcg-devtools .col-xl {\n      flex-basis: 0;\n      flex-grow: 1;\n      max-width: 100%; }\n    .webcg-devtools .col-xl-auto {\n      flex: 0 0 auto;\n      width: auto;\n      max-width: none; }\n    .webcg-devtools .col-xl-1 {\n      flex: 0 0 8.33333%;\n      max-width: 8.33333%; }\n    .webcg-devtools .col-xl-2 {\n      flex: 0 0 16.66667%;\n      max-width: 16.66667%; }\n    .webcg-devtools .col-xl-3 {\n      flex: 0 0 25%;\n      max-width: 25%; }\n    .webcg-devtools .col-xl-4 {\n      flex: 0 0 33.33333%;\n      max-width: 33.33333%; }\n    .webcg-devtools .col-xl-5 {\n      flex: 0 0 41.66667%;\n      max-width: 41.66667%; }\n    .webcg-devtools .col-xl-6 {\n      flex: 0 0 50%;\n      max-width: 50%; }\n    .webcg-devtools .col-xl-7 {\n      flex: 0 0 58.33333%;\n      max-width: 58.33333%; }\n    .webcg-devtools .col-xl-8 {\n      flex: 0 0 66.66667%;\n      max-width: 66.66667%; }\n    .webcg-devtools .col-xl-9 {\n      flex: 0 0 75%;\n      max-width: 75%; }\n    .webcg-devtools .col-xl-10 {\n      flex: 0 0 83.33333%;\n      max-width: 83.33333%; }\n    .webcg-devtools .col-xl-11 {\n      flex: 0 0 91.66667%;\n      max-width: 91.66667%; }\n    .webcg-devtools .col-xl-12 {\n      flex: 0 0 100%;\n      max-width: 100%; }\n    .webcg-devtools .order-xl-first {\n      order: -1; }\n    .webcg-devtools .order-xl-last {\n      order: 13; }\n    .webcg-devtools .order-xl-0 {\n      order: 0; }\n    .webcg-devtools .order-xl-1 {\n      order: 1; }\n    .webcg-devtools .order-xl-2 {\n      order: 2; }\n    .webcg-devtools .order-xl-3 {\n      order: 3; }\n    .webcg-devtools .order-xl-4 {\n      order: 4; }\n    .webcg-devtools .order-xl-5 {\n      order: 5; }\n    .webcg-devtools .order-xl-6 {\n      order: 6; }\n    .webcg-devtools .order-xl-7 {\n      order: 7; }\n    .webcg-devtools .order-xl-8 {\n      order: 8; }\n    .webcg-devtools .order-xl-9 {\n      order: 9; }\n    .webcg-devtools .order-xl-10 {\n      order: 10; }\n    .webcg-devtools .order-xl-11 {\n      order: 11; }\n    .webcg-devtools .order-xl-12 {\n      order: 12; }\n    .webcg-devtools .offset-xl-0 {\n      margin-left: 0; }\n    .webcg-devtools .offset-xl-1 {\n      margin-left: 8.33333%; }\n    .webcg-devtools .offset-xl-2 {\n      margin-left: 16.66667%; }\n    .webcg-devtools .offset-xl-3 {\n      margin-left: 25%; }\n    .webcg-devtools .offset-xl-4 {\n      margin-left: 33.33333%; }\n    .webcg-devtools .offset-xl-5 {\n      margin-left: 41.66667%; }\n    .webcg-devtools .offset-xl-6 {\n      margin-left: 50%; }\n    .webcg-devtools .offset-xl-7 {\n      margin-left: 58.33333%; }\n    .webcg-devtools .offset-xl-8 {\n      margin-left: 66.66667%; }\n    .webcg-devtools .offset-xl-9 {\n      margin-left: 75%; }\n    .webcg-devtools .offset-xl-10 {\n      margin-left: 83.33333%; }\n    .webcg-devtools .offset-xl-11 {\n      margin-left: 91.66667%; } }\n  .webcg-devtools .table {\n    width: 100%;\n    margin-bottom: 1rem;\n    background-color: transparent; }\n    .webcg-devtools .table th,\n    .webcg-devtools .table td {\n      padding: 0.75rem;\n      vertical-align: top;\n      border-top: 1px solid #dee2e6; }\n    .webcg-devtools .table thead th {\n      vertical-align: bottom;\n      border-bottom: 2px solid #dee2e6; }\n    .webcg-devtools .table tbody + tbody {\n      border-top: 2px solid #dee2e6; }\n    .webcg-devtools .table .table {\n      background-color: #fff; }\n  .webcg-devtools .table-sm th,\n  .webcg-devtools .table-sm td {\n    padding: 0.3rem; }\n  .webcg-devtools .table-bordered {\n    border: 1px solid #dee2e6; }\n    .webcg-devtools .table-bordered th,\n    .webcg-devtools .table-bordered td {\n      border: 1px solid #dee2e6; }\n    .webcg-devtools .table-bordered thead th,\n    .webcg-devtools .table-bordered thead td {\n      border-bottom-width: 2px; }\n  .webcg-devtools .table-borderless th,\n  .webcg-devtools .table-borderless td,\n  .webcg-devtools .table-borderless thead th,\n  .webcg-devtools .table-borderless tbody + tbody {\n    border: 0; }\n  .webcg-devtools .table-striped tbody tr:nth-of-type(odd) {\n    background-color: rgba(0, 0, 0, 0.05); }\n  .webcg-devtools .table-hover tbody tr:hover {\n    background-color: rgba(0, 0, 0, 0.075); }\n  .webcg-devtools .table-primary,\n  .webcg-devtools .table-primary > th,\n  .webcg-devtools .table-primary > td {\n    background-color: #b8daff; }\n  .webcg-devtools .table-hover .table-primary:hover {\n    background-color: #9fcdff; }\n    .webcg-devtools .table-hover .table-primary:hover > td,\n    .webcg-devtools .table-hover .table-primary:hover > th {\n      background-color: #9fcdff; }\n  .webcg-devtools .table-secondary,\n  .webcg-devtools .table-secondary > th,\n  .webcg-devtools .table-secondary > td {\n    background-color: #d6d8db; }\n  .webcg-devtools .table-hover .table-secondary:hover {\n    background-color: #c8cbcf; }\n    .webcg-devtools .table-hover .table-secondary:hover > td,\n    .webcg-devtools .table-hover .table-secondary:hover > th {\n      background-color: #c8cbcf; }\n  .webcg-devtools .table-success,\n  .webcg-devtools .table-success > th,\n  .webcg-devtools .table-success > td {\n    background-color: #c3e6cb; }\n  .webcg-devtools .table-hover .table-success:hover {\n    background-color: #b1dfbb; }\n    .webcg-devtools .table-hover .table-success:hover > td,\n    .webcg-devtools .table-hover .table-success:hover > th {\n      background-color: #b1dfbb; }\n  .webcg-devtools .table-info,\n  .webcg-devtools .table-info > th,\n  .webcg-devtools .table-info > td {\n    background-color: #bee5eb; }\n  .webcg-devtools .table-hover .table-info:hover {\n    background-color: #abdde5; }\n    .webcg-devtools .table-hover .table-info:hover > td,\n    .webcg-devtools .table-hover .table-info:hover > th {\n      background-color: #abdde5; }\n  .webcg-devtools .table-warning,\n  .webcg-devtools .table-warning > th,\n  .webcg-devtools .table-warning > td {\n    background-color: #ffeeba; }\n  .webcg-devtools .table-hover .table-warning:hover {\n    background-color: #ffe8a1; }\n    .webcg-devtools .table-hover .table-warning:hover > td,\n    .webcg-devtools .table-hover .table-warning:hover > th {\n      background-color: #ffe8a1; }\n  .webcg-devtools .table-danger,\n  .webcg-devtools .table-danger > th,\n  .webcg-devtools .table-danger > td {\n    background-color: #f5c6cb; }\n  .webcg-devtools .table-hover .table-danger:hover {\n    background-color: #f1b0b7; }\n    .webcg-devtools .table-hover .table-danger:hover > td,\n    .webcg-devtools .table-hover .table-danger:hover > th {\n      background-color: #f1b0b7; }\n  .webcg-devtools .table-light,\n  .webcg-devtools .table-light > th,\n  .webcg-devtools .table-light > td {\n    background-color: #fdfdfe; }\n  .webcg-devtools .table-hover .table-light:hover {\n    background-color: #ececf6; }\n    .webcg-devtools .table-hover .table-light:hover > td,\n    .webcg-devtools .table-hover .table-light:hover > th {\n      background-color: #ececf6; }\n  .webcg-devtools .table-dark,\n  .webcg-devtools .table-dark > th,\n  .webcg-devtools .table-dark > td {\n    background-color: #c6c8ca; }\n  .webcg-devtools .table-hover .table-dark:hover {\n    background-color: #b9bbbe; }\n    .webcg-devtools .table-hover .table-dark:hover > td,\n    .webcg-devtools .table-hover .table-dark:hover > th {\n      background-color: #b9bbbe; }\n  .webcg-devtools .table-active,\n  .webcg-devtools .table-active > th,\n  .webcg-devtools .table-active > td {\n    background-color: rgba(0, 0, 0, 0.075); }\n  .webcg-devtools .table-hover .table-active:hover {\n    background-color: rgba(0, 0, 0, 0.075); }\n    .webcg-devtools .table-hover .table-active:hover > td,\n    .webcg-devtools .table-hover .table-active:hover > th {\n      background-color: rgba(0, 0, 0, 0.075); }\n  .webcg-devtools .table .thead-dark th {\n    color: #fff;\n    background-color: #212529;\n    border-color: #32383e; }\n  .webcg-devtools .table .thead-light th {\n    color: #495057;\n    background-color: #e9ecef;\n    border-color: #dee2e6; }\n  .webcg-devtools .table-dark {\n    color: #fff;\n    background-color: #212529; }\n    .webcg-devtools .table-dark th,\n    .webcg-devtools .table-dark td,\n    .webcg-devtools .table-dark thead th {\n      border-color: #32383e; }\n    .webcg-devtools .table-dark.table-bordered {\n      border: 0; }\n    .webcg-devtools .table-dark.table-striped tbody tr:nth-of-type(odd) {\n      background-color: rgba(255, 255, 255, 0.05); }\n    .webcg-devtools .table-dark.table-hover tbody tr:hover {\n      background-color: rgba(255, 255, 255, 0.075); }\n  @media (max-width: 575.98px) {\n    .webcg-devtools .table-responsive-sm {\n      display: block;\n      width: 100%;\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n      -ms-overflow-style: -ms-autohiding-scrollbar; }\n      .webcg-devtools .table-responsive-sm > .table-bordered {\n        border: 0; } }\n  @media (max-width: 767.98px) {\n    .webcg-devtools .table-responsive-md {\n      display: block;\n      width: 100%;\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n      -ms-overflow-style: -ms-autohiding-scrollbar; }\n      .webcg-devtools .table-responsive-md > .table-bordered {\n        border: 0; } }\n  @media (max-width: 991.98px) {\n    .webcg-devtools .table-responsive-lg {\n      display: block;\n      width: 100%;\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n      -ms-overflow-style: -ms-autohiding-scrollbar; }\n      .webcg-devtools .table-responsive-lg > .table-bordered {\n        border: 0; } }\n  @media (max-width: 1199.98px) {\n    .webcg-devtools .table-responsive-xl {\n      display: block;\n      width: 100%;\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n      -ms-overflow-style: -ms-autohiding-scrollbar; }\n      .webcg-devtools .table-responsive-xl > .table-bordered {\n        border: 0; } }\n  .webcg-devtools .table-responsive {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n    -ms-overflow-style: -ms-autohiding-scrollbar; }\n    .webcg-devtools .table-responsive > .table-bordered {\n      border: 0; }\n  .webcg-devtools .form-control {\n    display: block;\n    width: 100%;\n    height: calc(2.25rem + 2px);\n    padding: 0.375rem 0.75rem;\n    font-size: 1rem;\n    line-height: 1.5;\n    color: #495057;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem;\n    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }\n    @media screen and (prefers-reduced-motion: reduce) {\n      .webcg-devtools .form-control {\n        transition: none; } }\n    .webcg-devtools .form-control::-ms-expand {\n      background-color: transparent;\n      border: 0; }\n    .webcg-devtools .form-control:focus {\n      color: #495057;\n      background-color: #fff;\n      border-color: #80bdff;\n      outline: 0;\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }\n    .webcg-devtools .form-control::placeholder {\n      color: #6c757d;\n      opacity: 1; }\n    .webcg-devtools .form-control:disabled, .webcg-devtools .form-control[readonly] {\n      background-color: #e9ecef;\n      opacity: 1; }\n  .webcg-devtools select.form-control:focus::-ms-value {\n    color: #495057;\n    background-color: #fff; }\n  .webcg-devtools .form-control-file,\n  .webcg-devtools .form-control-range {\n    display: block;\n    width: 100%; }\n  .webcg-devtools .col-form-label {\n    padding-top: calc(0.375rem + 1px);\n    padding-bottom: calc(0.375rem + 1px);\n    margin-bottom: 0;\n    font-size: inherit;\n    line-height: 1.5; }\n  .webcg-devtools .col-form-label-lg {\n    padding-top: calc(0.5rem + 1px);\n    padding-bottom: calc(0.5rem + 1px);\n    font-size: 1.25rem;\n    line-height: 1.5; }\n  .webcg-devtools .col-form-label-sm {\n    padding-top: calc(0.25rem + 1px);\n    padding-bottom: calc(0.25rem + 1px);\n    font-size: 0.875rem;\n    line-height: 1.5; }\n  .webcg-devtools .form-control-plaintext {\n    display: block;\n    width: 100%;\n    padding-top: 0.375rem;\n    padding-bottom: 0.375rem;\n    margin-bottom: 0;\n    line-height: 1.5;\n    color: #212529;\n    background-color: transparent;\n    border: solid transparent;\n    border-width: 1px 0; }\n    .webcg-devtools .form-control-plaintext.form-control-sm, .webcg-devtools .form-control-plaintext.form-control-lg {\n      padding-right: 0;\n      padding-left: 0; }\n  .webcg-devtools .form-control-sm {\n    height: calc(1.8125rem + 2px);\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    border-radius: 0.2rem; }\n  .webcg-devtools .form-control-lg {\n    height: calc(2.875rem + 2px);\n    padding: 0.5rem 1rem;\n    font-size: 1.25rem;\n    line-height: 1.5;\n    border-radius: 0.3rem; }\n  .webcg-devtools select.form-control[size], .webcg-devtools select.form-control[multiple] {\n    height: auto; }\n  .webcg-devtools textarea.form-control {\n    height: auto; }\n  .webcg-devtools .form-group {\n    margin-bottom: 1rem; }\n  .webcg-devtools .form-text {\n    display: block;\n    margin-top: 0.25rem; }\n  .webcg-devtools .form-row {\n    display: flex;\n    flex-wrap: wrap;\n    margin-right: -5px;\n    margin-left: -5px; }\n    .webcg-devtools .form-row > .col,\n    .webcg-devtools .form-row > [class*=\"col-\"] {\n      padding-right: 5px;\n      padding-left: 5px; }\n  .webcg-devtools .form-check {\n    position: relative;\n    display: block;\n    padding-left: 1.25rem; }\n  .webcg-devtools .form-check-input {\n    position: absolute;\n    margin-top: 0.3rem;\n    margin-left: -1.25rem; }\n    .webcg-devtools .form-check-input:disabled ~ .form-check-label {\n      color: #6c757d; }\n  .webcg-devtools .form-check-label {\n    margin-bottom: 0; }\n  .webcg-devtools .form-check-inline {\n    display: inline-flex;\n    align-items: center;\n    padding-left: 0;\n    margin-right: 0.75rem; }\n    .webcg-devtools .form-check-inline .form-check-input {\n      position: static;\n      margin-top: 0;\n      margin-right: 0.3125rem;\n      margin-left: 0; }\n  .webcg-devtools .valid-feedback {\n    display: none;\n    width: 100%;\n    margin-top: 0.25rem;\n    font-size: 80%;\n    color: #28a745; }\n  .webcg-devtools .valid-tooltip {\n    position: absolute;\n    top: 100%;\n    z-index: 5;\n    display: none;\n    max-width: 100%;\n    padding: 0.25rem 0.5rem;\n    margin-top: .1rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    color: #fff;\n    background-color: rgba(40, 167, 69, 0.9);\n    border-radius: 0.25rem; }\n  .was-validated .webcg-devtools .form-control:valid, .webcg-devtools .form-control.is-valid, .was-validated\n  .webcg-devtools .custom-select:valid,\n  .webcg-devtools .custom-select.is-valid {\n    border-color: #28a745; }\n    .was-validated .webcg-devtools .form-control:valid:focus, .webcg-devtools .form-control.is-valid:focus, .was-validated\n    .webcg-devtools .custom-select:valid:focus,\n    .webcg-devtools .custom-select.is-valid:focus {\n      border-color: #28a745;\n      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }\n    .was-validated .webcg-devtools .form-control:valid ~ .valid-feedback,\n    .was-validated .webcg-devtools .form-control:valid ~ .valid-tooltip, .webcg-devtools .form-control.is-valid ~ .valid-feedback,\n    .webcg-devtools .form-control.is-valid ~ .valid-tooltip, .was-validated\n    .webcg-devtools .custom-select:valid ~ .valid-feedback,\n    .was-validated\n    .webcg-devtools .custom-select:valid ~ .valid-tooltip,\n    .webcg-devtools .custom-select.is-valid ~ .valid-feedback,\n    .webcg-devtools .custom-select.is-valid ~ .valid-tooltip {\n      display: block; }\n  .was-validated .webcg-devtools .form-control-file:valid ~ .valid-feedback,\n  .was-validated .webcg-devtools .form-control-file:valid ~ .valid-tooltip, .webcg-devtools .form-control-file.is-valid ~ .valid-feedback,\n  .webcg-devtools .form-control-file.is-valid ~ .valid-tooltip {\n    display: block; }\n  .was-validated .webcg-devtools .form-check-input:valid ~ .form-check-label, .webcg-devtools .form-check-input.is-valid ~ .form-check-label {\n    color: #28a745; }\n  .was-validated .webcg-devtools .form-check-input:valid ~ .valid-feedback,\n  .was-validated .webcg-devtools .form-check-input:valid ~ .valid-tooltip, .webcg-devtools .form-check-input.is-valid ~ .valid-feedback,\n  .webcg-devtools .form-check-input.is-valid ~ .valid-tooltip {\n    display: block; }\n  .was-validated .webcg-devtools .custom-control-input:valid ~ .custom-control-label, .webcg-devtools .custom-control-input.is-valid ~ .custom-control-label {\n    color: #28a745; }\n    .was-validated .webcg-devtools .custom-control-input:valid ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-valid ~ .custom-control-label::before {\n      background-color: #71dd8a; }\n  .was-validated .webcg-devtools .custom-control-input:valid ~ .valid-feedback,\n  .was-validated .webcg-devtools .custom-control-input:valid ~ .valid-tooltip, .webcg-devtools .custom-control-input.is-valid ~ .valid-feedback,\n  .webcg-devtools .custom-control-input.is-valid ~ .valid-tooltip {\n    display: block; }\n  .was-validated .webcg-devtools .custom-control-input:valid:checked ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-valid:checked ~ .custom-control-label::before {\n    background-color: #34ce57; }\n  .was-validated .webcg-devtools .custom-control-input:valid:focus ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-valid:focus ~ .custom-control-label::before {\n    box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }\n  .was-validated .webcg-devtools .custom-file-input:valid ~ .custom-file-label, .webcg-devtools .custom-file-input.is-valid ~ .custom-file-label {\n    border-color: #28a745; }\n    .was-validated .webcg-devtools .custom-file-input:valid ~ .custom-file-label::after, .webcg-devtools .custom-file-input.is-valid ~ .custom-file-label::after {\n      border-color: inherit; }\n  .was-validated .webcg-devtools .custom-file-input:valid ~ .valid-feedback,\n  .was-validated .webcg-devtools .custom-file-input:valid ~ .valid-tooltip, .webcg-devtools .custom-file-input.is-valid ~ .valid-feedback,\n  .webcg-devtools .custom-file-input.is-valid ~ .valid-tooltip {\n    display: block; }\n  .was-validated .webcg-devtools .custom-file-input:valid:focus ~ .custom-file-label, .webcg-devtools .custom-file-input.is-valid:focus ~ .custom-file-label {\n    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }\n  .webcg-devtools .invalid-feedback {\n    display: none;\n    width: 100%;\n    margin-top: 0.25rem;\n    font-size: 80%;\n    color: #dc3545; }\n  .webcg-devtools .invalid-tooltip {\n    position: absolute;\n    top: 100%;\n    z-index: 5;\n    display: none;\n    max-width: 100%;\n    padding: 0.25rem 0.5rem;\n    margin-top: .1rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    color: #fff;\n    background-color: rgba(220, 53, 69, 0.9);\n    border-radius: 0.25rem; }\n  .was-validated .webcg-devtools .form-control:invalid, .webcg-devtools .form-control.is-invalid, .was-validated\n  .webcg-devtools .custom-select:invalid,\n  .webcg-devtools .custom-select.is-invalid {\n    border-color: #dc3545; }\n    .was-validated .webcg-devtools .form-control:invalid:focus, .webcg-devtools .form-control.is-invalid:focus, .was-validated\n    .webcg-devtools .custom-select:invalid:focus,\n    .webcg-devtools .custom-select.is-invalid:focus {\n      border-color: #dc3545;\n      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }\n    .was-validated .webcg-devtools .form-control:invalid ~ .invalid-feedback,\n    .was-validated .webcg-devtools .form-control:invalid ~ .invalid-tooltip, .webcg-devtools .form-control.is-invalid ~ .invalid-feedback,\n    .webcg-devtools .form-control.is-invalid ~ .invalid-tooltip, .was-validated\n    .webcg-devtools .custom-select:invalid ~ .invalid-feedback,\n    .was-validated\n    .webcg-devtools .custom-select:invalid ~ .invalid-tooltip,\n    .webcg-devtools .custom-select.is-invalid ~ .invalid-feedback,\n    .webcg-devtools .custom-select.is-invalid ~ .invalid-tooltip {\n      display: block; }\n  .was-validated .webcg-devtools .form-control-file:invalid ~ .invalid-feedback,\n  .was-validated .webcg-devtools .form-control-file:invalid ~ .invalid-tooltip, .webcg-devtools .form-control-file.is-invalid ~ .invalid-feedback,\n  .webcg-devtools .form-control-file.is-invalid ~ .invalid-tooltip {\n    display: block; }\n  .was-validated .webcg-devtools .form-check-input:invalid ~ .form-check-label, .webcg-devtools .form-check-input.is-invalid ~ .form-check-label {\n    color: #dc3545; }\n  .was-validated .webcg-devtools .form-check-input:invalid ~ .invalid-feedback,\n  .was-validated .webcg-devtools .form-check-input:invalid ~ .invalid-tooltip, .webcg-devtools .form-check-input.is-invalid ~ .invalid-feedback,\n  .webcg-devtools .form-check-input.is-invalid ~ .invalid-tooltip {\n    display: block; }\n  .was-validated .webcg-devtools .custom-control-input:invalid ~ .custom-control-label, .webcg-devtools .custom-control-input.is-invalid ~ .custom-control-label {\n    color: #dc3545; }\n    .was-validated .webcg-devtools .custom-control-input:invalid ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-invalid ~ .custom-control-label::before {\n      background-color: #efa2a9; }\n  .was-validated .webcg-devtools .custom-control-input:invalid ~ .invalid-feedback,\n  .was-validated .webcg-devtools .custom-control-input:invalid ~ .invalid-tooltip, .webcg-devtools .custom-control-input.is-invalid ~ .invalid-feedback,\n  .webcg-devtools .custom-control-input.is-invalid ~ .invalid-tooltip {\n    display: block; }\n  .was-validated .webcg-devtools .custom-control-input:invalid:checked ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-invalid:checked ~ .custom-control-label::before {\n    background-color: #e4606d; }\n  .was-validated .webcg-devtools .custom-control-input:invalid:focus ~ .custom-control-label::before, .webcg-devtools .custom-control-input.is-invalid:focus ~ .custom-control-label::before {\n    box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }\n  .was-validated .webcg-devtools .custom-file-input:invalid ~ .custom-file-label, .webcg-devtools .custom-file-input.is-invalid ~ .custom-file-label {\n    border-color: #dc3545; }\n    .was-validated .webcg-devtools .custom-file-input:invalid ~ .custom-file-label::after, .webcg-devtools .custom-file-input.is-invalid ~ .custom-file-label::after {\n      border-color: inherit; }\n  .was-validated .webcg-devtools .custom-file-input:invalid ~ .invalid-feedback,\n  .was-validated .webcg-devtools .custom-file-input:invalid ~ .invalid-tooltip, .webcg-devtools .custom-file-input.is-invalid ~ .invalid-feedback,\n  .webcg-devtools .custom-file-input.is-invalid ~ .invalid-tooltip {\n    display: block; }\n  .was-validated .webcg-devtools .custom-file-input:invalid:focus ~ .custom-file-label, .webcg-devtools .custom-file-input.is-invalid:focus ~ .custom-file-label {\n    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }\n  .webcg-devtools .form-inline {\n    display: flex;\n    flex-flow: row wrap;\n    align-items: center; }\n    .webcg-devtools .form-inline .form-check {\n      width: 100%; }\n    @media (min-width: 576px) {\n      .webcg-devtools .form-inline label {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        margin-bottom: 0; }\n      .webcg-devtools .form-inline .form-group {\n        display: flex;\n        flex: 0 0 auto;\n        flex-flow: row wrap;\n        align-items: center;\n        margin-bottom: 0; }\n      .webcg-devtools .form-inline .form-control {\n        display: inline-block;\n        width: auto;\n        vertical-align: middle; }\n      .webcg-devtools .form-inline .form-control-plaintext {\n        display: inline-block; }\n      .webcg-devtools .form-inline .input-group,\n      .webcg-devtools .form-inline .custom-select {\n        width: auto; }\n      .webcg-devtools .form-inline .form-check {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: auto;\n        padding-left: 0; }\n      .webcg-devtools .form-inline .form-check-input {\n        position: relative;\n        margin-top: 0;\n        margin-right: 0.25rem;\n        margin-left: 0; }\n      .webcg-devtools .form-inline .custom-control {\n        align-items: center;\n        justify-content: center; }\n      .webcg-devtools .form-inline .custom-control-label {\n        margin-bottom: 0; } }\n  .webcg-devtools .btn {\n    display: inline-block;\n    font-weight: 400;\n    text-align: center;\n    white-space: nowrap;\n    vertical-align: middle;\n    user-select: none;\n    border: 1px solid transparent;\n    padding: 0.375rem 0.75rem;\n    font-size: 1rem;\n    line-height: 1.5;\n    border-radius: 0.25rem;\n    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }\n    @media screen and (prefers-reduced-motion: reduce) {\n      .webcg-devtools .btn {\n        transition: none; } }\n    .webcg-devtools .btn:hover, .webcg-devtools .btn:focus {\n      text-decoration: none; }\n    .webcg-devtools .btn:focus, .webcg-devtools .btn.focus {\n      outline: 0;\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }\n    .webcg-devtools .btn.disabled, .webcg-devtools .btn:disabled {\n      opacity: 0.65; }\n    .webcg-devtools .btn:not(:disabled):not(.disabled) {\n      cursor: pointer; }\n  .webcg-devtools a.btn.disabled,\n  .webcg-devtools fieldset:disabled a.btn {\n    pointer-events: none; }\n  .webcg-devtools .btn-primary {\n    color: #fff;\n    background-color: #007bff;\n    border-color: #007bff; }\n    .webcg-devtools .btn-primary:hover {\n      color: #fff;\n      background-color: #0069d9;\n      border-color: #0062cc; }\n    .webcg-devtools .btn-primary:focus, .webcg-devtools .btn-primary.focus {\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5); }\n    .webcg-devtools .btn-primary.disabled, .webcg-devtools .btn-primary:disabled {\n      color: #fff;\n      background-color: #007bff;\n      border-color: #007bff; }\n    .webcg-devtools .btn-primary:not(:disabled):not(.disabled):active, .webcg-devtools .btn-primary:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-primary.dropdown-toggle {\n      color: #fff;\n      background-color: #0062cc;\n      border-color: #005cbf; }\n      .webcg-devtools .btn-primary:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-primary:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-primary.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5); }\n  .webcg-devtools .btn-secondary {\n    color: #fff;\n    background-color: #6c757d;\n    border-color: #6c757d; }\n    .webcg-devtools .btn-secondary:hover {\n      color: #fff;\n      background-color: #5a6268;\n      border-color: #545b62; }\n    .webcg-devtools .btn-secondary:focus, .webcg-devtools .btn-secondary.focus {\n      box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5); }\n    .webcg-devtools .btn-secondary.disabled, .webcg-devtools .btn-secondary:disabled {\n      color: #fff;\n      background-color: #6c757d;\n      border-color: #6c757d; }\n    .webcg-devtools .btn-secondary:not(:disabled):not(.disabled):active, .webcg-devtools .btn-secondary:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-secondary.dropdown-toggle {\n      color: #fff;\n      background-color: #545b62;\n      border-color: #4e555b; }\n      .webcg-devtools .btn-secondary:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-secondary:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-secondary.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5); }\n  .webcg-devtools .btn-success {\n    color: #fff;\n    background-color: #28a745;\n    border-color: #28a745; }\n    .webcg-devtools .btn-success:hover {\n      color: #fff;\n      background-color: #218838;\n      border-color: #1e7e34; }\n    .webcg-devtools .btn-success:focus, .webcg-devtools .btn-success.focus {\n      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5); }\n    .webcg-devtools .btn-success.disabled, .webcg-devtools .btn-success:disabled {\n      color: #fff;\n      background-color: #28a745;\n      border-color: #28a745; }\n    .webcg-devtools .btn-success:not(:disabled):not(.disabled):active, .webcg-devtools .btn-success:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-success.dropdown-toggle {\n      color: #fff;\n      background-color: #1e7e34;\n      border-color: #1c7430; }\n      .webcg-devtools .btn-success:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-success:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-success.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5); }\n  .webcg-devtools .btn-info {\n    color: #fff;\n    background-color: #17a2b8;\n    border-color: #17a2b8; }\n    .webcg-devtools .btn-info:hover {\n      color: #fff;\n      background-color: #138496;\n      border-color: #117a8b; }\n    .webcg-devtools .btn-info:focus, .webcg-devtools .btn-info.focus {\n      box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5); }\n    .webcg-devtools .btn-info.disabled, .webcg-devtools .btn-info:disabled {\n      color: #fff;\n      background-color: #17a2b8;\n      border-color: #17a2b8; }\n    .webcg-devtools .btn-info:not(:disabled):not(.disabled):active, .webcg-devtools .btn-info:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-info.dropdown-toggle {\n      color: #fff;\n      background-color: #117a8b;\n      border-color: #10707f; }\n      .webcg-devtools .btn-info:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-info:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-info.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5); }\n  .webcg-devtools .btn-warning {\n    color: #212529;\n    background-color: #ffc107;\n    border-color: #ffc107; }\n    .webcg-devtools .btn-warning:hover {\n      color: #212529;\n      background-color: #e0a800;\n      border-color: #d39e00; }\n    .webcg-devtools .btn-warning:focus, .webcg-devtools .btn-warning.focus {\n      box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5); }\n    .webcg-devtools .btn-warning.disabled, .webcg-devtools .btn-warning:disabled {\n      color: #212529;\n      background-color: #ffc107;\n      border-color: #ffc107; }\n    .webcg-devtools .btn-warning:not(:disabled):not(.disabled):active, .webcg-devtools .btn-warning:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-warning.dropdown-toggle {\n      color: #212529;\n      background-color: #d39e00;\n      border-color: #c69500; }\n      .webcg-devtools .btn-warning:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-warning:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-warning.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5); }\n  .webcg-devtools .btn-danger {\n    color: #fff;\n    background-color: #dc3545;\n    border-color: #dc3545; }\n    .webcg-devtools .btn-danger:hover {\n      color: #fff;\n      background-color: #c82333;\n      border-color: #bd2130; }\n    .webcg-devtools .btn-danger:focus, .webcg-devtools .btn-danger.focus {\n      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5); }\n    .webcg-devtools .btn-danger.disabled, .webcg-devtools .btn-danger:disabled {\n      color: #fff;\n      background-color: #dc3545;\n      border-color: #dc3545; }\n    .webcg-devtools .btn-danger:not(:disabled):not(.disabled):active, .webcg-devtools .btn-danger:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-danger.dropdown-toggle {\n      color: #fff;\n      background-color: #bd2130;\n      border-color: #b21f2d; }\n      .webcg-devtools .btn-danger:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-danger:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-danger.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5); }\n  .webcg-devtools .btn-light {\n    color: #212529;\n    background-color: #f8f9fa;\n    border-color: #f8f9fa; }\n    .webcg-devtools .btn-light:hover {\n      color: #212529;\n      background-color: #e2e6ea;\n      border-color: #dae0e5; }\n    .webcg-devtools .btn-light:focus, .webcg-devtools .btn-light.focus {\n      box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5); }\n    .webcg-devtools .btn-light.disabled, .webcg-devtools .btn-light:disabled {\n      color: #212529;\n      background-color: #f8f9fa;\n      border-color: #f8f9fa; }\n    .webcg-devtools .btn-light:not(:disabled):not(.disabled):active, .webcg-devtools .btn-light:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-light.dropdown-toggle {\n      color: #212529;\n      background-color: #dae0e5;\n      border-color: #d3d9df; }\n      .webcg-devtools .btn-light:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-light:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-light.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5); }\n  .webcg-devtools .btn-dark {\n    color: #fff;\n    background-color: #343a40;\n    border-color: #343a40; }\n    .webcg-devtools .btn-dark:hover {\n      color: #fff;\n      background-color: #23272b;\n      border-color: #1d2124; }\n    .webcg-devtools .btn-dark:focus, .webcg-devtools .btn-dark.focus {\n      box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5); }\n    .webcg-devtools .btn-dark.disabled, .webcg-devtools .btn-dark:disabled {\n      color: #fff;\n      background-color: #343a40;\n      border-color: #343a40; }\n    .webcg-devtools .btn-dark:not(:disabled):not(.disabled):active, .webcg-devtools .btn-dark:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-dark.dropdown-toggle {\n      color: #fff;\n      background-color: #1d2124;\n      border-color: #171a1d; }\n      .webcg-devtools .btn-dark:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-dark:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-dark.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5); }\n  .webcg-devtools .btn-outline-primary {\n    color: #007bff;\n    background-color: transparent;\n    background-image: none;\n    border-color: #007bff; }\n    .webcg-devtools .btn-outline-primary:hover {\n      color: #fff;\n      background-color: #007bff;\n      border-color: #007bff; }\n    .webcg-devtools .btn-outline-primary:focus, .webcg-devtools .btn-outline-primary.focus {\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5); }\n    .webcg-devtools .btn-outline-primary.disabled, .webcg-devtools .btn-outline-primary:disabled {\n      color: #007bff;\n      background-color: transparent; }\n    .webcg-devtools .btn-outline-primary:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-primary:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-primary.dropdown-toggle {\n      color: #fff;\n      background-color: #007bff;\n      border-color: #007bff; }\n      .webcg-devtools .btn-outline-primary:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-primary:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-primary.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5); }\n  .webcg-devtools .btn-outline-secondary {\n    color: #6c757d;\n    background-color: transparent;\n    background-image: none;\n    border-color: #6c757d; }\n    .webcg-devtools .btn-outline-secondary:hover {\n      color: #fff;\n      background-color: #6c757d;\n      border-color: #6c757d; }\n    .webcg-devtools .btn-outline-secondary:focus, .webcg-devtools .btn-outline-secondary.focus {\n      box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5); }\n    .webcg-devtools .btn-outline-secondary.disabled, .webcg-devtools .btn-outline-secondary:disabled {\n      color: #6c757d;\n      background-color: transparent; }\n    .webcg-devtools .btn-outline-secondary:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-secondary:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-secondary.dropdown-toggle {\n      color: #fff;\n      background-color: #6c757d;\n      border-color: #6c757d; }\n      .webcg-devtools .btn-outline-secondary:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-secondary:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-secondary.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5); }\n  .webcg-devtools .btn-outline-success {\n    color: #28a745;\n    background-color: transparent;\n    background-image: none;\n    border-color: #28a745; }\n    .webcg-devtools .btn-outline-success:hover {\n      color: #fff;\n      background-color: #28a745;\n      border-color: #28a745; }\n    .webcg-devtools .btn-outline-success:focus, .webcg-devtools .btn-outline-success.focus {\n      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5); }\n    .webcg-devtools .btn-outline-success.disabled, .webcg-devtools .btn-outline-success:disabled {\n      color: #28a745;\n      background-color: transparent; }\n    .webcg-devtools .btn-outline-success:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-success:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-success.dropdown-toggle {\n      color: #fff;\n      background-color: #28a745;\n      border-color: #28a745; }\n      .webcg-devtools .btn-outline-success:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-success:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-success.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5); }\n  .webcg-devtools .btn-outline-info {\n    color: #17a2b8;\n    background-color: transparent;\n    background-image: none;\n    border-color: #17a2b8; }\n    .webcg-devtools .btn-outline-info:hover {\n      color: #fff;\n      background-color: #17a2b8;\n      border-color: #17a2b8; }\n    .webcg-devtools .btn-outline-info:focus, .webcg-devtools .btn-outline-info.focus {\n      box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5); }\n    .webcg-devtools .btn-outline-info.disabled, .webcg-devtools .btn-outline-info:disabled {\n      color: #17a2b8;\n      background-color: transparent; }\n    .webcg-devtools .btn-outline-info:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-info:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-info.dropdown-toggle {\n      color: #fff;\n      background-color: #17a2b8;\n      border-color: #17a2b8; }\n      .webcg-devtools .btn-outline-info:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-info:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-info.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5); }\n  .webcg-devtools .btn-outline-warning {\n    color: #ffc107;\n    background-color: transparent;\n    background-image: none;\n    border-color: #ffc107; }\n    .webcg-devtools .btn-outline-warning:hover {\n      color: #212529;\n      background-color: #ffc107;\n      border-color: #ffc107; }\n    .webcg-devtools .btn-outline-warning:focus, .webcg-devtools .btn-outline-warning.focus {\n      box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5); }\n    .webcg-devtools .btn-outline-warning.disabled, .webcg-devtools .btn-outline-warning:disabled {\n      color: #ffc107;\n      background-color: transparent; }\n    .webcg-devtools .btn-outline-warning:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-warning:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-warning.dropdown-toggle {\n      color: #212529;\n      background-color: #ffc107;\n      border-color: #ffc107; }\n      .webcg-devtools .btn-outline-warning:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-warning:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-warning.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5); }\n  .webcg-devtools .btn-outline-danger {\n    color: #dc3545;\n    background-color: transparent;\n    background-image: none;\n    border-color: #dc3545; }\n    .webcg-devtools .btn-outline-danger:hover {\n      color: #fff;\n      background-color: #dc3545;\n      border-color: #dc3545; }\n    .webcg-devtools .btn-outline-danger:focus, .webcg-devtools .btn-outline-danger.focus {\n      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5); }\n    .webcg-devtools .btn-outline-danger.disabled, .webcg-devtools .btn-outline-danger:disabled {\n      color: #dc3545;\n      background-color: transparent; }\n    .webcg-devtools .btn-outline-danger:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-danger:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-danger.dropdown-toggle {\n      color: #fff;\n      background-color: #dc3545;\n      border-color: #dc3545; }\n      .webcg-devtools .btn-outline-danger:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-danger:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-danger.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5); }\n  .webcg-devtools .btn-outline-light {\n    color: #f8f9fa;\n    background-color: transparent;\n    background-image: none;\n    border-color: #f8f9fa; }\n    .webcg-devtools .btn-outline-light:hover {\n      color: #212529;\n      background-color: #f8f9fa;\n      border-color: #f8f9fa; }\n    .webcg-devtools .btn-outline-light:focus, .webcg-devtools .btn-outline-light.focus {\n      box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5); }\n    .webcg-devtools .btn-outline-light.disabled, .webcg-devtools .btn-outline-light:disabled {\n      color: #f8f9fa;\n      background-color: transparent; }\n    .webcg-devtools .btn-outline-light:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-light:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-light.dropdown-toggle {\n      color: #212529;\n      background-color: #f8f9fa;\n      border-color: #f8f9fa; }\n      .webcg-devtools .btn-outline-light:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-light:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-light.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5); }\n  .webcg-devtools .btn-outline-dark {\n    color: #343a40;\n    background-color: transparent;\n    background-image: none;\n    border-color: #343a40; }\n    .webcg-devtools .btn-outline-dark:hover {\n      color: #fff;\n      background-color: #343a40;\n      border-color: #343a40; }\n    .webcg-devtools .btn-outline-dark:focus, .webcg-devtools .btn-outline-dark.focus {\n      box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5); }\n    .webcg-devtools .btn-outline-dark.disabled, .webcg-devtools .btn-outline-dark:disabled {\n      color: #343a40;\n      background-color: transparent; }\n    .webcg-devtools .btn-outline-dark:not(:disabled):not(.disabled):active, .webcg-devtools .btn-outline-dark:not(:disabled):not(.disabled).active,\n    .show > .webcg-devtools .btn-outline-dark.dropdown-toggle {\n      color: #fff;\n      background-color: #343a40;\n      border-color: #343a40; }\n      .webcg-devtools .btn-outline-dark:not(:disabled):not(.disabled):active:focus, .webcg-devtools .btn-outline-dark:not(:disabled):not(.disabled).active:focus,\n      .show > .webcg-devtools .btn-outline-dark.dropdown-toggle:focus {\n        box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5); }\n  .webcg-devtools .btn-link {\n    font-weight: 400;\n    color: #007bff;\n    background-color: transparent; }\n    .webcg-devtools .btn-link:hover {\n      color: #0056b3;\n      text-decoration: underline;\n      background-color: transparent;\n      border-color: transparent; }\n    .webcg-devtools .btn-link:focus, .webcg-devtools .btn-link.focus {\n      text-decoration: underline;\n      border-color: transparent;\n      box-shadow: none; }\n    .webcg-devtools .btn-link:disabled, .webcg-devtools .btn-link.disabled {\n      color: #6c757d;\n      pointer-events: none; }\n  .webcg-devtools .btn-lg, .webcg-devtools .btn-group-lg > .btn {\n    padding: 0.5rem 1rem;\n    font-size: 1.25rem;\n    line-height: 1.5;\n    border-radius: 0.3rem; }\n  .webcg-devtools .btn-sm, .webcg-devtools .btn-group-sm > .btn {\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    border-radius: 0.2rem; }\n  .webcg-devtools .btn-block {\n    display: block;\n    width: 100%; }\n    .webcg-devtools .btn-block + .btn-block {\n      margin-top: 0.5rem; }\n  .webcg-devtools input[type=\"submit\"].btn-block,\n  .webcg-devtools input[type=\"reset\"].btn-block,\n  .webcg-devtools input[type=\"button\"].btn-block {\n    width: 100%; }\n  .webcg-devtools .fade {\n    transition: opacity 0.15s linear; }\n    @media screen and (prefers-reduced-motion: reduce) {\n      .webcg-devtools .fade {\n        transition: none; } }\n    .webcg-devtools .fade:not(.show) {\n      opacity: 0; }\n  .webcg-devtools .collapse:not(.show) {\n    display: none; }\n  .webcg-devtools .collapsing {\n    position: relative;\n    height: 0;\n    overflow: hidden;\n    transition: height 0.35s ease; }\n    @media screen and (prefers-reduced-motion: reduce) {\n      .webcg-devtools .collapsing {\n        transition: none; } }\n  .webcg-devtools .dropup,\n  .webcg-devtools .dropright,\n  .webcg-devtools .dropdown,\n  .webcg-devtools .dropleft {\n    position: relative; }\n  .webcg-devtools .dropdown-toggle::after {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-left: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n    border-top: 0.3em solid;\n    border-right: 0.3em solid transparent;\n    border-bottom: 0;\n    border-left: 0.3em solid transparent; }\n  .webcg-devtools .dropdown-toggle:empty::after {\n    margin-left: 0; }\n  .webcg-devtools .dropdown-menu {\n    position: absolute;\n    top: 100%;\n    left: 0;\n    z-index: 1000;\n    display: none;\n    float: left;\n    min-width: 10rem;\n    padding: 0.5rem 0;\n    margin: 0.125rem 0 0;\n    font-size: 1rem;\n    color: #212529;\n    text-align: left;\n    list-style: none;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid rgba(0, 0, 0, 0.15);\n    border-radius: 0.25rem; }\n  .webcg-devtools .dropdown-menu-right {\n    right: 0;\n    left: auto; }\n  .webcg-devtools .dropup .dropdown-menu {\n    top: auto;\n    bottom: 100%;\n    margin-top: 0;\n    margin-bottom: 0.125rem; }\n  .webcg-devtools .dropup .dropdown-toggle::after {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-left: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n    border-top: 0;\n    border-right: 0.3em solid transparent;\n    border-bottom: 0.3em solid;\n    border-left: 0.3em solid transparent; }\n  .webcg-devtools .dropup .dropdown-toggle:empty::after {\n    margin-left: 0; }\n  .webcg-devtools .dropright .dropdown-menu {\n    top: 0;\n    right: auto;\n    left: 100%;\n    margin-top: 0;\n    margin-left: 0.125rem; }\n  .webcg-devtools .dropright .dropdown-toggle::after {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-left: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n    border-top: 0.3em solid transparent;\n    border-right: 0;\n    border-bottom: 0.3em solid transparent;\n    border-left: 0.3em solid; }\n  .webcg-devtools .dropright .dropdown-toggle:empty::after {\n    margin-left: 0; }\n  .webcg-devtools .dropright .dropdown-toggle::after {\n    vertical-align: 0; }\n  .webcg-devtools .dropleft .dropdown-menu {\n    top: 0;\n    right: 100%;\n    left: auto;\n    margin-top: 0;\n    margin-right: 0.125rem; }\n  .webcg-devtools .dropleft .dropdown-toggle::after {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-left: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\"; }\n  .webcg-devtools .dropleft .dropdown-toggle::after {\n    display: none; }\n  .webcg-devtools .dropleft .dropdown-toggle::before {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    margin-right: 0.255em;\n    vertical-align: 0.255em;\n    content: \"\";\n    border-top: 0.3em solid transparent;\n    border-right: 0.3em solid;\n    border-bottom: 0.3em solid transparent; }\n  .webcg-devtools .dropleft .dropdown-toggle:empty::after {\n    margin-left: 0; }\n  .webcg-devtools .dropleft .dropdown-toggle::before {\n    vertical-align: 0; }\n  .webcg-devtools .dropdown-menu[x-placement^=\"top\"], .webcg-devtools .dropdown-menu[x-placement^=\"right\"], .webcg-devtools .dropdown-menu[x-placement^=\"bottom\"], .webcg-devtools .dropdown-menu[x-placement^=\"left\"] {\n    right: auto;\n    bottom: auto; }\n  .webcg-devtools .dropdown-divider {\n    height: 0;\n    margin: 0.5rem 0;\n    overflow: hidden;\n    border-top: 1px solid #e9ecef; }\n  .webcg-devtools .dropdown-item {\n    display: block;\n    width: 100%;\n    padding: 0.25rem 1.5rem;\n    clear: both;\n    font-weight: 400;\n    color: #212529;\n    text-align: inherit;\n    white-space: nowrap;\n    background-color: transparent;\n    border: 0; }\n    .webcg-devtools .dropdown-item:hover, .webcg-devtools .dropdown-item:focus {\n      color: #16181b;\n      text-decoration: none;\n      background-color: #f8f9fa; }\n    .webcg-devtools .dropdown-item.active, .webcg-devtools .dropdown-item:active {\n      color: #fff;\n      text-decoration: none;\n      background-color: #007bff; }\n    .webcg-devtools .dropdown-item.disabled, .webcg-devtools .dropdown-item:disabled {\n      color: #6c757d;\n      background-color: transparent; }\n  .webcg-devtools .dropdown-menu.show {\n    display: block; }\n  .webcg-devtools .dropdown-header {\n    display: block;\n    padding: 0.5rem 1.5rem;\n    margin-bottom: 0;\n    font-size: 0.875rem;\n    color: #6c757d;\n    white-space: nowrap; }\n  .webcg-devtools .dropdown-item-text {\n    display: block;\n    padding: 0.25rem 1.5rem;\n    color: #212529; }\n  .webcg-devtools .btn-group,\n  .webcg-devtools .btn-group-vertical {\n    position: relative;\n    display: inline-flex;\n    vertical-align: middle; }\n    .webcg-devtools .btn-group > .btn,\n    .webcg-devtools .btn-group-vertical > .btn {\n      position: relative;\n      flex: 0 1 auto; }\n      .webcg-devtools .btn-group > .btn:hover,\n      .webcg-devtools .btn-group-vertical > .btn:hover {\n        z-index: 1; }\n      .webcg-devtools .btn-group > .btn:focus, .webcg-devtools .btn-group > .btn:active, .webcg-devtools .btn-group > .btn.active,\n      .webcg-devtools .btn-group-vertical > .btn:focus,\n      .webcg-devtools .btn-group-vertical > .btn:active,\n      .webcg-devtools .btn-group-vertical > .btn.active {\n        z-index: 1; }\n    .webcg-devtools .btn-group .btn + .btn,\n    .webcg-devtools .btn-group .btn + .btn-group,\n    .webcg-devtools .btn-group .btn-group + .btn,\n    .webcg-devtools .btn-group .btn-group + .btn-group,\n    .webcg-devtools .btn-group-vertical .btn + .btn,\n    .webcg-devtools .btn-group-vertical .btn + .btn-group,\n    .webcg-devtools .btn-group-vertical .btn-group + .btn,\n    .webcg-devtools .btn-group-vertical .btn-group + .btn-group {\n      margin-left: -1px; }\n  .webcg-devtools .btn-toolbar {\n    display: flex;\n    flex-wrap: wrap;\n    justify-content: flex-start; }\n    .webcg-devtools .btn-toolbar .input-group {\n      width: auto; }\n  .webcg-devtools .btn-group > .btn:first-child {\n    margin-left: 0; }\n  .webcg-devtools .btn-group > .btn:not(:last-child):not(.dropdown-toggle),\n  .webcg-devtools .btn-group > .btn-group:not(:last-child) > .btn {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0; }\n  .webcg-devtools .btn-group > .btn:not(:first-child),\n  .webcg-devtools .btn-group > .btn-group:not(:first-child) > .btn {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0; }\n  .webcg-devtools .dropdown-toggle-split {\n    padding-right: 0.5625rem;\n    padding-left: 0.5625rem; }\n    .webcg-devtools .dropdown-toggle-split::after,\n    .dropup .webcg-devtools .dropdown-toggle-split::after,\n    .dropright .webcg-devtools .dropdown-toggle-split::after {\n      margin-left: 0; }\n    .dropleft .webcg-devtools .dropdown-toggle-split::before {\n      margin-right: 0; }\n  .webcg-devtools .btn-sm + .dropdown-toggle-split, .webcg-devtools .btn-group-sm > .btn + .dropdown-toggle-split {\n    padding-right: 0.375rem;\n    padding-left: 0.375rem; }\n  .webcg-devtools .btn-lg + .dropdown-toggle-split, .webcg-devtools .btn-group-lg > .btn + .dropdown-toggle-split {\n    padding-right: 0.75rem;\n    padding-left: 0.75rem; }\n  .webcg-devtools .btn-group-vertical {\n    flex-direction: column;\n    align-items: flex-start;\n    justify-content: center; }\n    .webcg-devtools .btn-group-vertical .btn,\n    .webcg-devtools .btn-group-vertical .btn-group {\n      width: 100%; }\n    .webcg-devtools .btn-group-vertical > .btn + .btn,\n    .webcg-devtools .btn-group-vertical > .btn + .btn-group,\n    .webcg-devtools .btn-group-vertical > .btn-group + .btn,\n    .webcg-devtools .btn-group-vertical > .btn-group + .btn-group {\n      margin-top: -1px;\n      margin-left: 0; }\n    .webcg-devtools .btn-group-vertical > .btn:not(:last-child):not(.dropdown-toggle),\n    .webcg-devtools .btn-group-vertical > .btn-group:not(:last-child) > .btn {\n      border-bottom-right-radius: 0;\n      border-bottom-left-radius: 0; }\n    .webcg-devtools .btn-group-vertical > .btn:not(:first-child),\n    .webcg-devtools .btn-group-vertical > .btn-group:not(:first-child) > .btn {\n      border-top-left-radius: 0;\n      border-top-right-radius: 0; }\n  .webcg-devtools .btn-group-toggle > .btn,\n  .webcg-devtools .btn-group-toggle > .btn-group > .btn {\n    margin-bottom: 0; }\n    .webcg-devtools .btn-group-toggle > .btn input[type=\"radio\"],\n    .webcg-devtools .btn-group-toggle > .btn input[type=\"checkbox\"],\n    .webcg-devtools .btn-group-toggle > .btn-group > .btn input[type=\"radio\"],\n    .webcg-devtools .btn-group-toggle > .btn-group > .btn input[type=\"checkbox\"] {\n      position: absolute;\n      clip: rect(0, 0, 0, 0);\n      pointer-events: none; }\n  .webcg-devtools .input-group {\n    position: relative;\n    display: flex;\n    flex-wrap: wrap;\n    align-items: stretch;\n    width: 100%; }\n    .webcg-devtools .input-group > .form-control,\n    .webcg-devtools .input-group > .custom-select,\n    .webcg-devtools .input-group > .custom-file {\n      position: relative;\n      flex: 1 1 auto;\n      width: 1%;\n      margin-bottom: 0; }\n      .webcg-devtools .input-group > .form-control + .form-control,\n      .webcg-devtools .input-group > .form-control + .custom-select,\n      .webcg-devtools .input-group > .form-control + .custom-file,\n      .webcg-devtools .input-group > .custom-select + .form-control,\n      .webcg-devtools .input-group > .custom-select + .custom-select,\n      .webcg-devtools .input-group > .custom-select + .custom-file,\n      .webcg-devtools .input-group > .custom-file + .form-control,\n      .webcg-devtools .input-group > .custom-file + .custom-select,\n      .webcg-devtools .input-group > .custom-file + .custom-file {\n        margin-left: -1px; }\n    .webcg-devtools .input-group > .form-control:focus,\n    .webcg-devtools .input-group > .custom-select:focus,\n    .webcg-devtools .input-group > .custom-file .custom-file-input:focus ~ .custom-file-label {\n      z-index: 3; }\n    .webcg-devtools .input-group > .custom-file .custom-file-input:focus {\n      z-index: 4; }\n    .webcg-devtools .input-group > .form-control:not(:last-child),\n    .webcg-devtools .input-group > .custom-select:not(:last-child) {\n      border-top-right-radius: 0;\n      border-bottom-right-radius: 0; }\n    .webcg-devtools .input-group > .form-control:not(:first-child),\n    .webcg-devtools .input-group > .custom-select:not(:first-child) {\n      border-top-left-radius: 0;\n      border-bottom-left-radius: 0; }\n    .webcg-devtools .input-group > .custom-file {\n      display: flex;\n      align-items: center; }\n      .webcg-devtools .input-group > .custom-file:not(:last-child) .custom-file-label,\n      .webcg-devtools .input-group > .custom-file:not(:last-child) .custom-file-label::after {\n        border-top-right-radius: 0;\n        border-bottom-right-radius: 0; }\n      .webcg-devtools .input-group > .custom-file:not(:first-child) .custom-file-label {\n        border-top-left-radius: 0;\n        border-bottom-left-radius: 0; }\n  .webcg-devtools .input-group-prepend,\n  .webcg-devtools .input-group-append {\n    display: flex; }\n    .webcg-devtools .input-group-prepend .btn,\n    .webcg-devtools .input-group-append .btn {\n      position: relative;\n      z-index: 2; }\n    .webcg-devtools .input-group-prepend .btn + .btn,\n    .webcg-devtools .input-group-prepend .btn + .input-group-text,\n    .webcg-devtools .input-group-prepend .input-group-text + .input-group-text,\n    .webcg-devtools .input-group-prepend .input-group-text + .btn,\n    .webcg-devtools .input-group-append .btn + .btn,\n    .webcg-devtools .input-group-append .btn + .input-group-text,\n    .webcg-devtools .input-group-append .input-group-text + .input-group-text,\n    .webcg-devtools .input-group-append .input-group-text + .btn {\n      margin-left: -1px; }\n  .webcg-devtools .input-group-prepend {\n    margin-right: -1px; }\n  .webcg-devtools .input-group-append {\n    margin-left: -1px; }\n  .webcg-devtools .input-group-text {\n    display: flex;\n    align-items: center;\n    padding: 0.375rem 0.75rem;\n    margin-bottom: 0;\n    font-size: 1rem;\n    font-weight: 400;\n    line-height: 1.5;\n    color: #495057;\n    text-align: center;\n    white-space: nowrap;\n    background-color: #e9ecef;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem; }\n    .webcg-devtools .input-group-text input[type=\"radio\"],\n    .webcg-devtools .input-group-text input[type=\"checkbox\"] {\n      margin-top: 0; }\n  .webcg-devtools .input-group-lg > .form-control,\n  .webcg-devtools .input-group-lg > .input-group-prepend > .input-group-text,\n  .webcg-devtools .input-group-lg > .input-group-append > .input-group-text,\n  .webcg-devtools .input-group-lg > .input-group-prepend > .btn,\n  .webcg-devtools .input-group-lg > .input-group-append > .btn {\n    height: calc(2.875rem + 2px);\n    padding: 0.5rem 1rem;\n    font-size: 1.25rem;\n    line-height: 1.5;\n    border-radius: 0.3rem; }\n  .webcg-devtools .input-group-sm > .form-control,\n  .webcg-devtools .input-group-sm > .input-group-prepend > .input-group-text,\n  .webcg-devtools .input-group-sm > .input-group-append > .input-group-text,\n  .webcg-devtools .input-group-sm > .input-group-prepend > .btn,\n  .webcg-devtools .input-group-sm > .input-group-append > .btn {\n    height: calc(1.8125rem + 2px);\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    border-radius: 0.2rem; }\n  .webcg-devtools .input-group > .input-group-prepend > .btn,\n  .webcg-devtools .input-group > .input-group-prepend > .input-group-text,\n  .webcg-devtools .input-group > .input-group-append:not(:last-child) > .btn,\n  .webcg-devtools .input-group > .input-group-append:not(:last-child) > .input-group-text,\n  .webcg-devtools .input-group > .input-group-append:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n  .webcg-devtools .input-group > .input-group-append:last-child > .input-group-text:not(:last-child) {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0; }\n  .webcg-devtools .input-group > .input-group-append > .btn,\n  .webcg-devtools .input-group > .input-group-append > .input-group-text,\n  .webcg-devtools .input-group > .input-group-prepend:not(:first-child) > .btn,\n  .webcg-devtools .input-group > .input-group-prepend:not(:first-child) > .input-group-text,\n  .webcg-devtools .input-group > .input-group-prepend:first-child > .btn:not(:first-child),\n  .webcg-devtools .input-group > .input-group-prepend:first-child > .input-group-text:not(:first-child) {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0; }\n  .webcg-devtools .custom-control {\n    position: relative;\n    display: block;\n    min-height: 1.5rem;\n    padding-left: 1.5rem; }\n  .webcg-devtools .custom-control-inline {\n    display: inline-flex;\n    margin-right: 1rem; }\n  .webcg-devtools .custom-control-input {\n    position: absolute;\n    z-index: -1;\n    opacity: 0; }\n    .webcg-devtools .custom-control-input:checked ~ .custom-control-label::before {\n      color: #fff;\n      background-color: #007bff; }\n    .webcg-devtools .custom-control-input:focus ~ .custom-control-label::before {\n      box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }\n    .webcg-devtools .custom-control-input:active ~ .custom-control-label::before {\n      color: #fff;\n      background-color: #b3d7ff; }\n    .webcg-devtools .custom-control-input:disabled ~ .custom-control-label {\n      color: #6c757d; }\n      .webcg-devtools .custom-control-input:disabled ~ .custom-control-label::before {\n        background-color: #e9ecef; }\n  .webcg-devtools .custom-control-label {\n    position: relative;\n    margin-bottom: 0; }\n    .webcg-devtools .custom-control-label::before {\n      position: absolute;\n      top: 0.25rem;\n      left: -1.5rem;\n      display: block;\n      width: 1rem;\n      height: 1rem;\n      pointer-events: none;\n      content: \"\";\n      user-select: none;\n      background-color: #dee2e6; }\n    .webcg-devtools .custom-control-label::after {\n      position: absolute;\n      top: 0.25rem;\n      left: -1.5rem;\n      display: block;\n      width: 1rem;\n      height: 1rem;\n      content: \"\";\n      background-repeat: no-repeat;\n      background-position: center center;\n      background-size: 50% 50%; }\n  .webcg-devtools .custom-checkbox .custom-control-label::before {\n    border-radius: 0.25rem; }\n  .webcg-devtools .custom-checkbox .custom-control-input:checked ~ .custom-control-label::before {\n    background-color: #007bff; }\n  .webcg-devtools .custom-checkbox .custom-control-input:checked ~ .custom-control-label::after {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3E%3C/svg%3E\"); }\n  .webcg-devtools .custom-checkbox .custom-control-input:indeterminate ~ .custom-control-label::before {\n    background-color: #007bff; }\n  .webcg-devtools .custom-checkbox .custom-control-input:indeterminate ~ .custom-control-label::after {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Cpath stroke='%23fff' d='M0 2h4'/%3E%3C/svg%3E\"); }\n  .webcg-devtools .custom-checkbox .custom-control-input:disabled:checked ~ .custom-control-label::before {\n    background-color: rgba(0, 123, 255, 0.5); }\n  .webcg-devtools .custom-checkbox .custom-control-input:disabled:indeterminate ~ .custom-control-label::before {\n    background-color: rgba(0, 123, 255, 0.5); }\n  .webcg-devtools .custom-radio .custom-control-label::before {\n    border-radius: 50%; }\n  .webcg-devtools .custom-radio .custom-control-input:checked ~ .custom-control-label::before {\n    background-color: #007bff; }\n  .webcg-devtools .custom-radio .custom-control-input:checked ~ .custom-control-label::after {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3E%3Ccircle r='3' fill='%23fff'/%3E%3C/svg%3E\"); }\n  .webcg-devtools .custom-radio .custom-control-input:disabled:checked ~ .custom-control-label::before {\n    background-color: rgba(0, 123, 255, 0.5); }\n  .webcg-devtools .custom-select {\n    display: inline-block;\n    width: 100%;\n    height: calc(2.25rem + 2px);\n    padding: 0.375rem 1.75rem 0.375rem 0.75rem;\n    line-height: 1.5;\n    color: #495057;\n    vertical-align: middle;\n    background: #fff url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center;\n    background-size: 8px 10px;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem;\n    appearance: none; }\n    .webcg-devtools .custom-select:focus {\n      border-color: #80bdff;\n      outline: 0;\n      box-shadow: 0 0 0 0.2rem rgba(128, 189, 255, 0.5); }\n      .webcg-devtools .custom-select:focus::-ms-value {\n        color: #495057;\n        background-color: #fff; }\n    .webcg-devtools .custom-select[multiple], .webcg-devtools .custom-select[size]:not([size=\"1\"]) {\n      height: auto;\n      padding-right: 0.75rem;\n      background-image: none; }\n    .webcg-devtools .custom-select:disabled {\n      color: #6c757d;\n      background-color: #e9ecef; }\n    .webcg-devtools .custom-select::-ms-expand {\n      opacity: 0; }\n  .webcg-devtools .custom-select-sm {\n    height: calc(1.8125rem + 2px);\n    padding-top: 0.375rem;\n    padding-bottom: 0.375rem;\n    font-size: 75%; }\n  .webcg-devtools .custom-select-lg {\n    height: calc(2.875rem + 2px);\n    padding-top: 0.375rem;\n    padding-bottom: 0.375rem;\n    font-size: 125%; }\n  .webcg-devtools .custom-file {\n    position: relative;\n    display: inline-block;\n    width: 100%;\n    height: calc(2.25rem + 2px);\n    margin-bottom: 0; }\n  .webcg-devtools .custom-file-input {\n    position: relative;\n    z-index: 2;\n    width: 100%;\n    height: calc(2.25rem + 2px);\n    margin: 0;\n    opacity: 0; }\n    .webcg-devtools .custom-file-input:focus ~ .custom-file-label {\n      border-color: #80bdff;\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }\n      .webcg-devtools .custom-file-input:focus ~ .custom-file-label::after {\n        border-color: #80bdff; }\n    .webcg-devtools .custom-file-input:disabled ~ .custom-file-label {\n      background-color: #e9ecef; }\n    .webcg-devtools .custom-file-input:lang(en) ~ .custom-file-label::after {\n      content: \"Browse\"; }\n  .webcg-devtools .custom-file-label {\n    position: absolute;\n    top: 0;\n    right: 0;\n    left: 0;\n    z-index: 1;\n    height: calc(2.25rem + 2px);\n    padding: 0.375rem 0.75rem;\n    line-height: 1.5;\n    color: #495057;\n    background-color: #fff;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem; }\n    .webcg-devtools .custom-file-label::after {\n      position: absolute;\n      top: 0;\n      right: 0;\n      bottom: 0;\n      z-index: 3;\n      display: block;\n      height: 2.25rem;\n      padding: 0.375rem 0.75rem;\n      line-height: 1.5;\n      color: #495057;\n      content: \"Browse\";\n      background-color: #e9ecef;\n      border-left: 1px solid #ced4da;\n      border-radius: 0 0.25rem 0.25rem 0; }\n  .webcg-devtools .custom-range {\n    width: 100%;\n    padding-left: 0;\n    background-color: transparent;\n    appearance: none; }\n    .webcg-devtools .custom-range:focus {\n      outline: none; }\n      .webcg-devtools .custom-range:focus::-webkit-slider-thumb {\n        box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }\n      .webcg-devtools .custom-range:focus::-moz-range-thumb {\n        box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }\n      .webcg-devtools .custom-range:focus::-ms-thumb {\n        box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }\n    .webcg-devtools .custom-range::-moz-focus-outer {\n      border: 0; }\n    .webcg-devtools .custom-range::-webkit-slider-thumb {\n      width: 1rem;\n      height: 1rem;\n      margin-top: -0.25rem;\n      background-color: #007bff;\n      border: 0;\n      border-radius: 1rem;\n      transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n      appearance: none; }\n      @media screen and (prefers-reduced-motion: reduce) {\n        .webcg-devtools .custom-range::-webkit-slider-thumb {\n          transition: none; } }\n      .webcg-devtools .custom-range::-webkit-slider-thumb:active {\n        background-color: #b3d7ff; }\n    .webcg-devtools .custom-range::-webkit-slider-runnable-track {\n      width: 100%;\n      height: 0.5rem;\n      color: transparent;\n      cursor: pointer;\n      background-color: #dee2e6;\n      border-color: transparent;\n      border-radius: 1rem; }\n    .webcg-devtools .custom-range::-moz-range-thumb {\n      width: 1rem;\n      height: 1rem;\n      background-color: #007bff;\n      border: 0;\n      border-radius: 1rem;\n      transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n      appearance: none; }\n      @media screen and (prefers-reduced-motion: reduce) {\n        .webcg-devtools .custom-range::-moz-range-thumb {\n          transition: none; } }\n      .webcg-devtools .custom-range::-moz-range-thumb:active {\n        background-color: #b3d7ff; }\n    .webcg-devtools .custom-range::-moz-range-track {\n      width: 100%;\n      height: 0.5rem;\n      color: transparent;\n      cursor: pointer;\n      background-color: #dee2e6;\n      border-color: transparent;\n      border-radius: 1rem; }\n    .webcg-devtools .custom-range::-ms-thumb {\n      width: 1rem;\n      height: 1rem;\n      margin-top: 0;\n      margin-right: 0.2rem;\n      margin-left: 0.2rem;\n      background-color: #007bff;\n      border: 0;\n      border-radius: 1rem;\n      transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n      appearance: none; }\n      @media screen and (prefers-reduced-motion: reduce) {\n        .webcg-devtools .custom-range::-ms-thumb {\n          transition: none; } }\n      .webcg-devtools .custom-range::-ms-thumb:active {\n        background-color: #b3d7ff; }\n    .webcg-devtools .custom-range::-ms-track {\n      width: 100%;\n      height: 0.5rem;\n      color: transparent;\n      cursor: pointer;\n      background-color: transparent;\n      border-color: transparent;\n      border-width: 0.5rem; }\n    .webcg-devtools .custom-range::-ms-fill-lower {\n      background-color: #dee2e6;\n      border-radius: 1rem; }\n    .webcg-devtools .custom-range::-ms-fill-upper {\n      margin-right: 15px;\n      background-color: #dee2e6;\n      border-radius: 1rem; }\n  .webcg-devtools .custom-control-label::before,\n  .webcg-devtools .custom-file-label,\n  .webcg-devtools .custom-select {\n    transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }\n    @media screen and (prefers-reduced-motion: reduce) {\n      .webcg-devtools .custom-control-label::before,\n      .webcg-devtools .custom-file-label,\n      .webcg-devtools .custom-select {\n        transition: none; } }\n  .webcg-devtools .nav {\n    display: flex;\n    flex-wrap: wrap;\n    padding-left: 0;\n    margin-bottom: 0;\n    list-style: none; }\n  .webcg-devtools .nav-link {\n    display: block;\n    padding: 0.5rem 1rem; }\n    .webcg-devtools .nav-link:hover, .webcg-devtools .nav-link:focus {\n      text-decoration: none; }\n    .webcg-devtools .nav-link.disabled {\n      color: #6c757d; }\n  .webcg-devtools .nav-tabs {\n    border-bottom: 1px solid #dee2e6; }\n    .webcg-devtools .nav-tabs .nav-item {\n      margin-bottom: -1px; }\n    .webcg-devtools .nav-tabs .nav-link {\n      border: 1px solid transparent;\n      border-top-left-radius: 0.25rem;\n      border-top-right-radius: 0.25rem; }\n      .webcg-devtools .nav-tabs .nav-link:hover, .webcg-devtools .nav-tabs .nav-link:focus {\n        border-color: #e9ecef #e9ecef #dee2e6; }\n      .webcg-devtools .nav-tabs .nav-link.disabled {\n        color: #6c757d;\n        background-color: transparent;\n        border-color: transparent; }\n    .webcg-devtools .nav-tabs .nav-link.active,\n    .webcg-devtools .nav-tabs .nav-item.show .nav-link {\n      color: #495057;\n      background-color: #fff;\n      border-color: #dee2e6 #dee2e6 #fff; }\n    .webcg-devtools .nav-tabs .dropdown-menu {\n      margin-top: -1px;\n      border-top-left-radius: 0;\n      border-top-right-radius: 0; }\n  .webcg-devtools .nav-pills .nav-link {\n    border-radius: 0.25rem; }\n  .webcg-devtools .nav-pills .nav-link.active,\n  .webcg-devtools .nav-pills .show > .nav-link {\n    color: #fff;\n    background-color: #007bff; }\n  .webcg-devtools .nav-fill .nav-item {\n    flex: 1 1 auto;\n    text-align: center; }\n  .webcg-devtools .nav-justified .nav-item {\n    flex-basis: 0;\n    flex-grow: 1;\n    text-align: center; }\n  .webcg-devtools .tab-content > .tab-pane {\n    display: none; }\n  .webcg-devtools .tab-content > .active {\n    display: block; }\n  .webcg-devtools .navbar {\n    position: relative;\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0.5rem 1rem; }\n    .webcg-devtools .navbar > .container,\n    .webcg-devtools .navbar > .container-fluid {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      justify-content: space-between; }\n  .webcg-devtools .navbar-brand {\n    display: inline-block;\n    padding-top: 0.3125rem;\n    padding-bottom: 0.3125rem;\n    margin-right: 1rem;\n    font-size: 1.25rem;\n    line-height: inherit;\n    white-space: nowrap; }\n    .webcg-devtools .navbar-brand:hover, .webcg-devtools .navbar-brand:focus {\n      text-decoration: none; }\n  .webcg-devtools .navbar-nav {\n    display: flex;\n    flex-direction: column;\n    padding-left: 0;\n    margin-bottom: 0;\n    list-style: none; }\n    .webcg-devtools .navbar-nav .nav-link {\n      padding-right: 0;\n      padding-left: 0; }\n    .webcg-devtools .navbar-nav .dropdown-menu {\n      position: static;\n      float: none; }\n  .webcg-devtools .navbar-text {\n    display: inline-block;\n    padding-top: 0.5rem;\n    padding-bottom: 0.5rem; }\n  .webcg-devtools .navbar-collapse {\n    flex-basis: 100%;\n    flex-grow: 1;\n    align-items: center; }\n  .webcg-devtools .navbar-toggler {\n    padding: 0.25rem 0.75rem;\n    font-size: 1.25rem;\n    line-height: 1;\n    background-color: transparent;\n    border: 1px solid transparent;\n    border-radius: 0.25rem; }\n    .webcg-devtools .navbar-toggler:hover, .webcg-devtools .navbar-toggler:focus {\n      text-decoration: none; }\n    .webcg-devtools .navbar-toggler:not(:disabled):not(.disabled) {\n      cursor: pointer; }\n  .webcg-devtools .navbar-toggler-icon {\n    display: inline-block;\n    width: 1.5em;\n    height: 1.5em;\n    vertical-align: middle;\n    content: \"\";\n    background: no-repeat center center;\n    background-size: 100% 100%; }\n  @media (max-width: 575.98px) {\n    .webcg-devtools .navbar-expand-sm > .container,\n    .webcg-devtools .navbar-expand-sm > .container-fluid {\n      padding-right: 0;\n      padding-left: 0; } }\n  @media (min-width: 576px) {\n    .webcg-devtools .navbar-expand-sm {\n      flex-flow: row nowrap;\n      justify-content: flex-start; }\n      .webcg-devtools .navbar-expand-sm .navbar-nav {\n        flex-direction: row; }\n        .webcg-devtools .navbar-expand-sm .navbar-nav .dropdown-menu {\n          position: absolute; }\n        .webcg-devtools .navbar-expand-sm .navbar-nav .nav-link {\n          padding-right: 0.5rem;\n          padding-left: 0.5rem; }\n      .webcg-devtools .navbar-expand-sm > .container,\n      .webcg-devtools .navbar-expand-sm > .container-fluid {\n        flex-wrap: nowrap; }\n      .webcg-devtools .navbar-expand-sm .navbar-collapse {\n        display: flex !important;\n        flex-basis: auto; }\n      .webcg-devtools .navbar-expand-sm .navbar-toggler {\n        display: none; } }\n  @media (max-width: 767.98px) {\n    .webcg-devtools .navbar-expand-md > .container,\n    .webcg-devtools .navbar-expand-md > .container-fluid {\n      padding-right: 0;\n      padding-left: 0; } }\n  @media (min-width: 768px) {\n    .webcg-devtools .navbar-expand-md {\n      flex-flow: row nowrap;\n      justify-content: flex-start; }\n      .webcg-devtools .navbar-expand-md .navbar-nav {\n        flex-direction: row; }\n        .webcg-devtools .navbar-expand-md .navbar-nav .dropdown-menu {\n          position: absolute; }\n        .webcg-devtools .navbar-expand-md .navbar-nav .nav-link {\n          padding-right: 0.5rem;\n          padding-left: 0.5rem; }\n      .webcg-devtools .navbar-expand-md > .container,\n      .webcg-devtools .navbar-expand-md > .container-fluid {\n        flex-wrap: nowrap; }\n      .webcg-devtools .navbar-expand-md .navbar-collapse {\n        display: flex !important;\n        flex-basis: auto; }\n      .webcg-devtools .navbar-expand-md .navbar-toggler {\n        display: none; } }\n  @media (max-width: 991.98px) {\n    .webcg-devtools .navbar-expand-lg > .container,\n    .webcg-devtools .navbar-expand-lg > .container-fluid {\n      padding-right: 0;\n      padding-left: 0; } }\n  @media (min-width: 992px) {\n    .webcg-devtools .navbar-expand-lg {\n      flex-flow: row nowrap;\n      justify-content: flex-start; }\n      .webcg-devtools .navbar-expand-lg .navbar-nav {\n        flex-direction: row; }\n        .webcg-devtools .navbar-expand-lg .navbar-nav .dropdown-menu {\n          position: absolute; }\n        .webcg-devtools .navbar-expand-lg .navbar-nav .nav-link {\n          padding-right: 0.5rem;\n          padding-left: 0.5rem; }\n      .webcg-devtools .navbar-expand-lg > .container,\n      .webcg-devtools .navbar-expand-lg > .container-fluid {\n        flex-wrap: nowrap; }\n      .webcg-devtools .navbar-expand-lg .navbar-collapse {\n        display: flex !important;\n        flex-basis: auto; }\n      .webcg-devtools .navbar-expand-lg .navbar-toggler {\n        display: none; } }\n  @media (max-width: 1199.98px) {\n    .webcg-devtools .navbar-expand-xl > .container,\n    .webcg-devtools .navbar-expand-xl > .container-fluid {\n      padding-right: 0;\n      padding-left: 0; } }\n  @media (min-width: 1200px) {\n    .webcg-devtools .navbar-expand-xl {\n      flex-flow: row nowrap;\n      justify-content: flex-start; }\n      .webcg-devtools .navbar-expand-xl .navbar-nav {\n        flex-direction: row; }\n        .webcg-devtools .navbar-expand-xl .navbar-nav .dropdown-menu {\n          position: absolute; }\n        .webcg-devtools .navbar-expand-xl .navbar-nav .nav-link {\n          padding-right: 0.5rem;\n          padding-left: 0.5rem; }\n      .webcg-devtools .navbar-expand-xl > .container,\n      .webcg-devtools .navbar-expand-xl > .container-fluid {\n        flex-wrap: nowrap; }\n      .webcg-devtools .navbar-expand-xl .navbar-collapse {\n        display: flex !important;\n        flex-basis: auto; }\n      .webcg-devtools .navbar-expand-xl .navbar-toggler {\n        display: none; } }\n  .webcg-devtools .navbar-expand {\n    flex-flow: row nowrap;\n    justify-content: flex-start; }\n    .webcg-devtools .navbar-expand > .container,\n    .webcg-devtools .navbar-expand > .container-fluid {\n      padding-right: 0;\n      padding-left: 0; }\n    .webcg-devtools .navbar-expand .navbar-nav {\n      flex-direction: row; }\n      .webcg-devtools .navbar-expand .navbar-nav .dropdown-menu {\n        position: absolute; }\n      .webcg-devtools .navbar-expand .navbar-nav .nav-link {\n        padding-right: 0.5rem;\n        padding-left: 0.5rem; }\n    .webcg-devtools .navbar-expand > .container,\n    .webcg-devtools .navbar-expand > .container-fluid {\n      flex-wrap: nowrap; }\n    .webcg-devtools .navbar-expand .navbar-collapse {\n      display: flex !important;\n      flex-basis: auto; }\n    .webcg-devtools .navbar-expand .navbar-toggler {\n      display: none; }\n  .webcg-devtools .navbar-light .navbar-brand {\n    color: rgba(0, 0, 0, 0.9); }\n    .webcg-devtools .navbar-light .navbar-brand:hover, .webcg-devtools .navbar-light .navbar-brand:focus {\n      color: rgba(0, 0, 0, 0.9); }\n  .webcg-devtools .navbar-light .navbar-nav .nav-link {\n    color: rgba(0, 0, 0, 0.5); }\n    .webcg-devtools .navbar-light .navbar-nav .nav-link:hover, .webcg-devtools .navbar-light .navbar-nav .nav-link:focus {\n      color: rgba(0, 0, 0, 0.7); }\n    .webcg-devtools .navbar-light .navbar-nav .nav-link.disabled {\n      color: rgba(0, 0, 0, 0.3); }\n  .webcg-devtools .navbar-light .navbar-nav .show > .nav-link,\n  .webcg-devtools .navbar-light .navbar-nav .active > .nav-link,\n  .webcg-devtools .navbar-light .navbar-nav .nav-link.show,\n  .webcg-devtools .navbar-light .navbar-nav .nav-link.active {\n    color: rgba(0, 0, 0, 0.9); }\n  .webcg-devtools .navbar-light .navbar-toggler {\n    color: rgba(0, 0, 0, 0.5);\n    border-color: rgba(0, 0, 0, 0.1); }\n  .webcg-devtools .navbar-light .navbar-toggler-icon {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(0, 0, 0, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\"); }\n  .webcg-devtools .navbar-light .navbar-text {\n    color: rgba(0, 0, 0, 0.5); }\n    .webcg-devtools .navbar-light .navbar-text a {\n      color: rgba(0, 0, 0, 0.9); }\n      .webcg-devtools .navbar-light .navbar-text a:hover, .webcg-devtools .navbar-light .navbar-text a:focus {\n        color: rgba(0, 0, 0, 0.9); }\n  .webcg-devtools .navbar-dark .navbar-brand {\n    color: #fff; }\n    .webcg-devtools .navbar-dark .navbar-brand:hover, .webcg-devtools .navbar-dark .navbar-brand:focus {\n      color: #fff; }\n  .webcg-devtools .navbar-dark .navbar-nav .nav-link {\n    color: rgba(255, 255, 255, 0.5); }\n    .webcg-devtools .navbar-dark .navbar-nav .nav-link:hover, .webcg-devtools .navbar-dark .navbar-nav .nav-link:focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .webcg-devtools .navbar-dark .navbar-nav .nav-link.disabled {\n      color: rgba(255, 255, 255, 0.25); }\n  .webcg-devtools .navbar-dark .navbar-nav .show > .nav-link,\n  .webcg-devtools .navbar-dark .navbar-nav .active > .nav-link,\n  .webcg-devtools .navbar-dark .navbar-nav .nav-link.show,\n  .webcg-devtools .navbar-dark .navbar-nav .nav-link.active {\n    color: #fff; }\n  .webcg-devtools .navbar-dark .navbar-toggler {\n    color: rgba(255, 255, 255, 0.5);\n    border-color: rgba(255, 255, 255, 0.1); }\n  .webcg-devtools .navbar-dark .navbar-toggler-icon {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\"); }\n  .webcg-devtools .navbar-dark .navbar-text {\n    color: rgba(255, 255, 255, 0.5); }\n    .webcg-devtools .navbar-dark .navbar-text a {\n      color: #fff; }\n      .webcg-devtools .navbar-dark .navbar-text a:hover, .webcg-devtools .navbar-dark .navbar-text a:focus {\n        color: #fff; }\n  .webcg-devtools .card {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    min-width: 0;\n    word-wrap: break-word;\n    background-color: #fff;\n    background-clip: border-box;\n    border: 1px solid rgba(0, 0, 0, 0.125);\n    border-radius: 0.25rem; }\n    .webcg-devtools .card > hr {\n      margin-right: 0;\n      margin-left: 0; }\n    .webcg-devtools .card > .list-group:first-child .list-group-item:first-child {\n      border-top-left-radius: 0.25rem;\n      border-top-right-radius: 0.25rem; }\n    .webcg-devtools .card > .list-group:last-child .list-group-item:last-child {\n      border-bottom-right-radius: 0.25rem;\n      border-bottom-left-radius: 0.25rem; }\n  .webcg-devtools .card-body {\n    flex: 1 1 auto;\n    padding: 1.25rem; }\n  .webcg-devtools .card-title {\n    margin-bottom: 0.75rem; }\n  .webcg-devtools .card-subtitle {\n    margin-top: -0.375rem;\n    margin-bottom: 0; }\n  .webcg-devtools .card-text:last-child {\n    margin-bottom: 0; }\n  .webcg-devtools .card-link:hover {\n    text-decoration: none; }\n  .webcg-devtools .card-link + .card-link {\n    margin-left: 1.25rem; }\n  .webcg-devtools .card-header {\n    padding: 0.75rem 1.25rem;\n    margin-bottom: 0;\n    background-color: rgba(0, 0, 0, 0.03);\n    border-bottom: 1px solid rgba(0, 0, 0, 0.125); }\n    .webcg-devtools .card-header:first-child {\n      border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0; }\n    .webcg-devtools .card-header + .list-group .list-group-item:first-child {\n      border-top: 0; }\n  .webcg-devtools .card-footer {\n    padding: 0.75rem 1.25rem;\n    background-color: rgba(0, 0, 0, 0.03);\n    border-top: 1px solid rgba(0, 0, 0, 0.125); }\n    .webcg-devtools .card-footer:last-child {\n      border-radius: 0 0 calc(0.25rem - 1px) calc(0.25rem - 1px); }\n  .webcg-devtools .card-header-tabs {\n    margin-right: -0.625rem;\n    margin-bottom: -0.75rem;\n    margin-left: -0.625rem;\n    border-bottom: 0; }\n  .webcg-devtools .card-header-pills {\n    margin-right: -0.625rem;\n    margin-left: -0.625rem; }\n  .webcg-devtools .card-img-overlay {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    padding: 1.25rem; }\n  .webcg-devtools .card-img {\n    width: 100%;\n    border-radius: calc(0.25rem - 1px); }\n  .webcg-devtools .card-img-top {\n    width: 100%;\n    border-top-left-radius: calc(0.25rem - 1px);\n    border-top-right-radius: calc(0.25rem - 1px); }\n  .webcg-devtools .card-img-bottom {\n    width: 100%;\n    border-bottom-right-radius: calc(0.25rem - 1px);\n    border-bottom-left-radius: calc(0.25rem - 1px); }\n  .webcg-devtools .card-deck {\n    display: flex;\n    flex-direction: column; }\n    .webcg-devtools .card-deck .card {\n      margin-bottom: 15px; }\n    @media (min-width: 576px) {\n      .webcg-devtools .card-deck {\n        flex-flow: row wrap;\n        margin-right: -15px;\n        margin-left: -15px; }\n        .webcg-devtools .card-deck .card {\n          display: flex;\n          flex: 1 0 0%;\n          flex-direction: column;\n          margin-right: 15px;\n          margin-bottom: 0;\n          margin-left: 15px; } }\n  .webcg-devtools .card-group {\n    display: flex;\n    flex-direction: column; }\n    .webcg-devtools .card-group > .card {\n      margin-bottom: 15px; }\n    @media (min-width: 576px) {\n      .webcg-devtools .card-group {\n        flex-flow: row wrap; }\n        .webcg-devtools .card-group > .card {\n          flex: 1 0 0%;\n          margin-bottom: 0; }\n          .webcg-devtools .card-group > .card + .card {\n            margin-left: 0;\n            border-left: 0; }\n          .webcg-devtools .card-group > .card:first-child {\n            border-top-right-radius: 0;\n            border-bottom-right-radius: 0; }\n            .webcg-devtools .card-group > .card:first-child .card-img-top,\n            .webcg-devtools .card-group > .card:first-child .card-header {\n              border-top-right-radius: 0; }\n            .webcg-devtools .card-group > .card:first-child .card-img-bottom,\n            .webcg-devtools .card-group > .card:first-child .card-footer {\n              border-bottom-right-radius: 0; }\n          .webcg-devtools .card-group > .card:last-child {\n            border-top-left-radius: 0;\n            border-bottom-left-radius: 0; }\n            .webcg-devtools .card-group > .card:last-child .card-img-top,\n            .webcg-devtools .card-group > .card:last-child .card-header {\n              border-top-left-radius: 0; }\n            .webcg-devtools .card-group > .card:last-child .card-img-bottom,\n            .webcg-devtools .card-group > .card:last-child .card-footer {\n              border-bottom-left-radius: 0; }\n          .webcg-devtools .card-group > .card:only-child {\n            border-radius: 0.25rem; }\n            .webcg-devtools .card-group > .card:only-child .card-img-top,\n            .webcg-devtools .card-group > .card:only-child .card-header {\n              border-top-left-radius: 0.25rem;\n              border-top-right-radius: 0.25rem; }\n            .webcg-devtools .card-group > .card:only-child .card-img-bottom,\n            .webcg-devtools .card-group > .card:only-child .card-footer {\n              border-bottom-right-radius: 0.25rem;\n              border-bottom-left-radius: 0.25rem; }\n          .webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) {\n            border-radius: 0; }\n            .webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-img-top,\n            .webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-img-bottom,\n            .webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-header,\n            .webcg-devtools .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-footer {\n              border-radius: 0; } }\n  .webcg-devtools .card-columns .card {\n    margin-bottom: 0.75rem; }\n  @media (min-width: 576px) {\n    .webcg-devtools .card-columns {\n      column-count: 3;\n      column-gap: 1.25rem;\n      orphans: 1;\n      widows: 1; }\n      .webcg-devtools .card-columns .card {\n        display: inline-block;\n        width: 100%; } }\n  .webcg-devtools .accordion .card:not(:first-of-type):not(:last-of-type) {\n    border-bottom: 0;\n    border-radius: 0; }\n  .webcg-devtools .accordion .card:not(:first-of-type) .card-header:first-child {\n    border-radius: 0; }\n  .webcg-devtools .accordion .card:first-of-type {\n    border-bottom: 0;\n    border-bottom-right-radius: 0;\n    border-bottom-left-radius: 0; }\n  .webcg-devtools .accordion .card:last-of-type {\n    border-top-left-radius: 0;\n    border-top-right-radius: 0; }\n  .webcg-devtools .breadcrumb {\n    display: flex;\n    flex-wrap: wrap;\n    padding: 0.75rem 1rem;\n    margin-bottom: 1rem;\n    list-style: none;\n    background-color: #e9ecef;\n    border-radius: 0.25rem; }\n  .webcg-devtools .breadcrumb-item + .breadcrumb-item {\n    padding-left: 0.5rem; }\n    .webcg-devtools .breadcrumb-item + .breadcrumb-item::before {\n      display: inline-block;\n      padding-right: 0.5rem;\n      color: #6c757d;\n      content: \"/\"; }\n  .webcg-devtools .breadcrumb-item + .breadcrumb-item:hover::before {\n    text-decoration: underline; }\n  .webcg-devtools .breadcrumb-item + .breadcrumb-item:hover::before {\n    text-decoration: none; }\n  .webcg-devtools .breadcrumb-item.active {\n    color: #6c757d; }\n  .webcg-devtools .pagination {\n    display: flex;\n    padding-left: 0;\n    list-style: none;\n    border-radius: 0.25rem; }\n  .webcg-devtools .page-link {\n    position: relative;\n    display: block;\n    padding: 0.5rem 0.75rem;\n    margin-left: -1px;\n    line-height: 1.25;\n    color: #007bff;\n    background-color: #fff;\n    border: 1px solid #dee2e6; }\n    .webcg-devtools .page-link:hover {\n      z-index: 2;\n      color: #0056b3;\n      text-decoration: none;\n      background-color: #e9ecef;\n      border-color: #dee2e6; }\n    .webcg-devtools .page-link:focus {\n      z-index: 2;\n      outline: 0;\n      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }\n    .webcg-devtools .page-link:not(:disabled):not(.disabled) {\n      cursor: pointer; }\n  .webcg-devtools .page-item:first-child .page-link {\n    margin-left: 0;\n    border-top-left-radius: 0.25rem;\n    border-bottom-left-radius: 0.25rem; }\n  .webcg-devtools .page-item:last-child .page-link {\n    border-top-right-radius: 0.25rem;\n    border-bottom-right-radius: 0.25rem; }\n  .webcg-devtools .page-item.active .page-link {\n    z-index: 1;\n    color: #fff;\n    background-color: #007bff;\n    border-color: #007bff; }\n  .webcg-devtools .page-item.disabled .page-link {\n    color: #6c757d;\n    pointer-events: none;\n    cursor: auto;\n    background-color: #fff;\n    border-color: #dee2e6; }\n  .webcg-devtools .pagination-lg .page-link {\n    padding: 0.75rem 1.5rem;\n    font-size: 1.25rem;\n    line-height: 1.5; }\n  .webcg-devtools .pagination-lg .page-item:first-child .page-link {\n    border-top-left-radius: 0.3rem;\n    border-bottom-left-radius: 0.3rem; }\n  .webcg-devtools .pagination-lg .page-item:last-child .page-link {\n    border-top-right-radius: 0.3rem;\n    border-bottom-right-radius: 0.3rem; }\n  .webcg-devtools .pagination-sm .page-link {\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5; }\n  .webcg-devtools .pagination-sm .page-item:first-child .page-link {\n    border-top-left-radius: 0.2rem;\n    border-bottom-left-radius: 0.2rem; }\n  .webcg-devtools .pagination-sm .page-item:last-child .page-link {\n    border-top-right-radius: 0.2rem;\n    border-bottom-right-radius: 0.2rem; }\n  .webcg-devtools .badge {\n    display: inline-block;\n    padding: 0.25em 0.4em;\n    font-size: 75%;\n    font-weight: 700;\n    line-height: 1;\n    text-align: center;\n    white-space: nowrap;\n    vertical-align: baseline;\n    border-radius: 0.25rem; }\n    .webcg-devtools .badge:empty {\n      display: none; }\n  .webcg-devtools .btn .badge {\n    position: relative;\n    top: -1px; }\n  .webcg-devtools .badge-pill {\n    padding-right: 0.6em;\n    padding-left: 0.6em;\n    border-radius: 10rem; }\n  .webcg-devtools .badge-primary {\n    color: #fff;\n    background-color: #007bff; }\n    .webcg-devtools .badge-primary[href]:hover, .webcg-devtools .badge-primary[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #0062cc; }\n  .webcg-devtools .badge-secondary {\n    color: #fff;\n    background-color: #6c757d; }\n    .webcg-devtools .badge-secondary[href]:hover, .webcg-devtools .badge-secondary[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #545b62; }\n  .webcg-devtools .badge-success {\n    color: #fff;\n    background-color: #28a745; }\n    .webcg-devtools .badge-success[href]:hover, .webcg-devtools .badge-success[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #1e7e34; }\n  .webcg-devtools .badge-info {\n    color: #fff;\n    background-color: #17a2b8; }\n    .webcg-devtools .badge-info[href]:hover, .webcg-devtools .badge-info[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #117a8b; }\n  .webcg-devtools .badge-warning {\n    color: #212529;\n    background-color: #ffc107; }\n    .webcg-devtools .badge-warning[href]:hover, .webcg-devtools .badge-warning[href]:focus {\n      color: #212529;\n      text-decoration: none;\n      background-color: #d39e00; }\n  .webcg-devtools .badge-danger {\n    color: #fff;\n    background-color: #dc3545; }\n    .webcg-devtools .badge-danger[href]:hover, .webcg-devtools .badge-danger[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #bd2130; }\n  .webcg-devtools .badge-light {\n    color: #212529;\n    background-color: #f8f9fa; }\n    .webcg-devtools .badge-light[href]:hover, .webcg-devtools .badge-light[href]:focus {\n      color: #212529;\n      text-decoration: none;\n      background-color: #dae0e5; }\n  .webcg-devtools .badge-dark {\n    color: #fff;\n    background-color: #343a40; }\n    .webcg-devtools .badge-dark[href]:hover, .webcg-devtools .badge-dark[href]:focus {\n      color: #fff;\n      text-decoration: none;\n      background-color: #1d2124; }\n  .webcg-devtools .jumbotron {\n    padding: 2rem 1rem;\n    margin-bottom: 2rem;\n    background-color: #e9ecef;\n    border-radius: 0.3rem; }\n    @media (min-width: 576px) {\n      .webcg-devtools .jumbotron {\n        padding: 4rem 2rem; } }\n  .webcg-devtools .jumbotron-fluid {\n    padding-right: 0;\n    padding-left: 0;\n    border-radius: 0; }\n  .webcg-devtools .alert {\n    position: relative;\n    padding: 0.75rem 1.25rem;\n    margin-bottom: 1rem;\n    border: 1px solid transparent;\n    border-radius: 0.25rem; }\n  .webcg-devtools .alert-heading {\n    color: inherit; }\n  .webcg-devtools .alert-link {\n    font-weight: 700; }\n  .webcg-devtools .alert-dismissible {\n    padding-right: 4rem; }\n    .webcg-devtools .alert-dismissible .close {\n      position: absolute;\n      top: 0;\n      right: 0;\n      padding: 0.75rem 1.25rem;\n      color: inherit; }\n  .webcg-devtools .alert-primary {\n    color: #004085;\n    background-color: #cce5ff;\n    border-color: #b8daff; }\n    .webcg-devtools .alert-primary hr {\n      border-top-color: #9fcdff; }\n    .webcg-devtools .alert-primary .alert-link {\n      color: #002752; }\n  .webcg-devtools .alert-secondary {\n    color: #383d41;\n    background-color: #e2e3e5;\n    border-color: #d6d8db; }\n    .webcg-devtools .alert-secondary hr {\n      border-top-color: #c8cbcf; }\n    .webcg-devtools .alert-secondary .alert-link {\n      color: #202326; }\n  .webcg-devtools .alert-success {\n    color: #155724;\n    background-color: #d4edda;\n    border-color: #c3e6cb; }\n    .webcg-devtools .alert-success hr {\n      border-top-color: #b1dfbb; }\n    .webcg-devtools .alert-success .alert-link {\n      color: #0b2e13; }\n  .webcg-devtools .alert-info {\n    color: #0c5460;\n    background-color: #d1ecf1;\n    border-color: #bee5eb; }\n    .webcg-devtools .alert-info hr {\n      border-top-color: #abdde5; }\n    .webcg-devtools .alert-info .alert-link {\n      color: #062c33; }\n  .webcg-devtools .alert-warning {\n    color: #856404;\n    background-color: #fff3cd;\n    border-color: #ffeeba; }\n    .webcg-devtools .alert-warning hr {\n      border-top-color: #ffe8a1; }\n    .webcg-devtools .alert-warning .alert-link {\n      color: #533f03; }\n  .webcg-devtools .alert-danger {\n    color: #721c24;\n    background-color: #f8d7da;\n    border-color: #f5c6cb; }\n    .webcg-devtools .alert-danger hr {\n      border-top-color: #f1b0b7; }\n    .webcg-devtools .alert-danger .alert-link {\n      color: #491217; }\n  .webcg-devtools .alert-light {\n    color: #818182;\n    background-color: #fefefe;\n    border-color: #fdfdfe; }\n    .webcg-devtools .alert-light hr {\n      border-top-color: #ececf6; }\n    .webcg-devtools .alert-light .alert-link {\n      color: #686868; }\n  .webcg-devtools .alert-dark {\n    color: #1b1e21;\n    background-color: #d6d8d9;\n    border-color: #c6c8ca; }\n    .webcg-devtools .alert-dark hr {\n      border-top-color: #b9bbbe; }\n    .webcg-devtools .alert-dark .alert-link {\n      color: #040505; }\n\n@keyframes progress-bar-stripes {\n  from {\n    background-position: 1rem 0; }\n  to {\n    background-position: 0 0; } }\n  .webcg-devtools .progress {\n    display: flex;\n    height: 1rem;\n    overflow: hidden;\n    font-size: 0.75rem;\n    background-color: #e9ecef;\n    border-radius: 0.25rem; }\n  .webcg-devtools .progress-bar {\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    color: #fff;\n    text-align: center;\n    white-space: nowrap;\n    background-color: #007bff;\n    transition: width 0.6s ease; }\n    @media screen and (prefers-reduced-motion: reduce) {\n      .webcg-devtools .progress-bar {\n        transition: none; } }\n  .webcg-devtools .progress-bar-striped {\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-size: 1rem 1rem; }\n  .webcg-devtools .progress-bar-animated {\n    animation: progress-bar-stripes 1s linear infinite; }\n  .webcg-devtools .media {\n    display: flex;\n    align-items: flex-start; }\n  .webcg-devtools .media-body {\n    flex: 1; }\n  .webcg-devtools .list-group {\n    display: flex;\n    flex-direction: column;\n    padding-left: 0;\n    margin-bottom: 0; }\n  .webcg-devtools .list-group-item-action {\n    width: 100%;\n    color: #495057;\n    text-align: inherit; }\n    .webcg-devtools .list-group-item-action:hover, .webcg-devtools .list-group-item-action:focus {\n      color: #495057;\n      text-decoration: none;\n      background-color: #f8f9fa; }\n    .webcg-devtools .list-group-item-action:active {\n      color: #212529;\n      background-color: #e9ecef; }\n  .webcg-devtools .list-group-item {\n    position: relative;\n    display: block;\n    padding: 0.75rem 1.25rem;\n    margin-bottom: -1px;\n    background-color: #fff;\n    border: 1px solid rgba(0, 0, 0, 0.125); }\n    .webcg-devtools .list-group-item:first-child {\n      border-top-left-radius: 0.25rem;\n      border-top-right-radius: 0.25rem; }\n    .webcg-devtools .list-group-item:last-child {\n      margin-bottom: 0;\n      border-bottom-right-radius: 0.25rem;\n      border-bottom-left-radius: 0.25rem; }\n    .webcg-devtools .list-group-item:hover, .webcg-devtools .list-group-item:focus {\n      z-index: 1;\n      text-decoration: none; }\n    .webcg-devtools .list-group-item.disabled, .webcg-devtools .list-group-item:disabled {\n      color: #6c757d;\n      background-color: #fff; }\n    .webcg-devtools .list-group-item.active {\n      z-index: 2;\n      color: #fff;\n      background-color: #007bff;\n      border-color: #007bff; }\n  .webcg-devtools .list-group-flush .list-group-item {\n    border-right: 0;\n    border-left: 0;\n    border-radius: 0; }\n  .webcg-devtools .list-group-flush:first-child .list-group-item:first-child {\n    border-top: 0; }\n  .webcg-devtools .list-group-flush:last-child .list-group-item:last-child {\n    border-bottom: 0; }\n  .webcg-devtools .list-group-item-primary {\n    color: #004085;\n    background-color: #b8daff; }\n    .webcg-devtools .list-group-item-primary.list-group-item-action:hover, .webcg-devtools .list-group-item-primary.list-group-item-action:focus {\n      color: #004085;\n      background-color: #9fcdff; }\n    .webcg-devtools .list-group-item-primary.list-group-item-action.active {\n      color: #fff;\n      background-color: #004085;\n      border-color: #004085; }\n  .webcg-devtools .list-group-item-secondary {\n    color: #383d41;\n    background-color: #d6d8db; }\n    .webcg-devtools .list-group-item-secondary.list-group-item-action:hover, .webcg-devtools .list-group-item-secondary.list-group-item-action:focus {\n      color: #383d41;\n      background-color: #c8cbcf; }\n    .webcg-devtools .list-group-item-secondary.list-group-item-action.active {\n      color: #fff;\n      background-color: #383d41;\n      border-color: #383d41; }\n  .webcg-devtools .list-group-item-success {\n    color: #155724;\n    background-color: #c3e6cb; }\n    .webcg-devtools .list-group-item-success.list-group-item-action:hover, .webcg-devtools .list-group-item-success.list-group-item-action:focus {\n      color: #155724;\n      background-color: #b1dfbb; }\n    .webcg-devtools .list-group-item-success.list-group-item-action.active {\n      color: #fff;\n      background-color: #155724;\n      border-color: #155724; }\n  .webcg-devtools .list-group-item-info {\n    color: #0c5460;\n    background-color: #bee5eb; }\n    .webcg-devtools .list-group-item-info.list-group-item-action:hover, .webcg-devtools .list-group-item-info.list-group-item-action:focus {\n      color: #0c5460;\n      background-color: #abdde5; }\n    .webcg-devtools .list-group-item-info.list-group-item-action.active {\n      color: #fff;\n      background-color: #0c5460;\n      border-color: #0c5460; }\n  .webcg-devtools .list-group-item-warning {\n    color: #856404;\n    background-color: #ffeeba; }\n    .webcg-devtools .list-group-item-warning.list-group-item-action:hover, .webcg-devtools .list-group-item-warning.list-group-item-action:focus {\n      color: #856404;\n      background-color: #ffe8a1; }\n    .webcg-devtools .list-group-item-warning.list-group-item-action.active {\n      color: #fff;\n      background-color: #856404;\n      border-color: #856404; }\n  .webcg-devtools .list-group-item-danger {\n    color: #721c24;\n    background-color: #f5c6cb; }\n    .webcg-devtools .list-group-item-danger.list-group-item-action:hover, .webcg-devtools .list-group-item-danger.list-group-item-action:focus {\n      color: #721c24;\n      background-color: #f1b0b7; }\n    .webcg-devtools .list-group-item-danger.list-group-item-action.active {\n      color: #fff;\n      background-color: #721c24;\n      border-color: #721c24; }\n  .webcg-devtools .list-group-item-light {\n    color: #818182;\n    background-color: #fdfdfe; }\n    .webcg-devtools .list-group-item-light.list-group-item-action:hover, .webcg-devtools .list-group-item-light.list-group-item-action:focus {\n      color: #818182;\n      background-color: #ececf6; }\n    .webcg-devtools .list-group-item-light.list-group-item-action.active {\n      color: #fff;\n      background-color: #818182;\n      border-color: #818182; }\n  .webcg-devtools .list-group-item-dark {\n    color: #1b1e21;\n    background-color: #c6c8ca; }\n    .webcg-devtools .list-group-item-dark.list-group-item-action:hover, .webcg-devtools .list-group-item-dark.list-group-item-action:focus {\n      color: #1b1e21;\n      background-color: #b9bbbe; }\n    .webcg-devtools .list-group-item-dark.list-group-item-action.active {\n      color: #fff;\n      background-color: #1b1e21;\n      border-color: #1b1e21; }\n  .webcg-devtools .close {\n    float: right;\n    font-size: 1.5rem;\n    font-weight: 700;\n    line-height: 1;\n    color: #000;\n    text-shadow: 0 1px 0 #fff;\n    opacity: .5; }\n    .webcg-devtools .close:not(:disabled):not(.disabled) {\n      cursor: pointer; }\n      .webcg-devtools .close:not(:disabled):not(.disabled):hover, .webcg-devtools .close:not(:disabled):not(.disabled):focus {\n        color: #000;\n        text-decoration: none;\n        opacity: .75; }\n  .webcg-devtools button.close {\n    padding: 0;\n    background-color: transparent;\n    border: 0;\n    -webkit-appearance: none; }\n  .webcg-devtools .modal-open {\n    overflow: hidden; }\n    .webcg-devtools .modal-open .modal {\n      overflow-x: hidden;\n      overflow-y: auto; }\n  .webcg-devtools .modal {\n    position: fixed;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: 1050;\n    display: none;\n    overflow: hidden;\n    outline: 0; }\n  .webcg-devtools .modal-dialog {\n    position: relative;\n    width: auto;\n    margin: 0.5rem;\n    pointer-events: none; }\n    .modal.fade .webcg-devtools .modal-dialog {\n      transition: transform 0.3s ease-out;\n      transform: translate(0, -25%); }\n      @media screen and (prefers-reduced-motion: reduce) {\n        .modal.fade .webcg-devtools .modal-dialog {\n          transition: none; } }\n    .modal.show .webcg-devtools .modal-dialog {\n      transform: translate(0, 0); }\n  .webcg-devtools .modal-dialog-centered {\n    display: flex;\n    align-items: center;\n    min-height: calc(100% - (0.5rem * 2)); }\n    .webcg-devtools .modal-dialog-centered::before {\n      display: block;\n      height: calc(100vh - (0.5rem * 2));\n      content: \"\"; }\n  .webcg-devtools .modal-content {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    width: 100%;\n    pointer-events: auto;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid rgba(0, 0, 0, 0.2);\n    border-radius: 0.3rem;\n    outline: 0; }\n  .webcg-devtools .modal-backdrop {\n    position: fixed;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: 1040;\n    background-color: #000; }\n    .webcg-devtools .modal-backdrop.fade {\n      opacity: 0; }\n    .webcg-devtools .modal-backdrop.show {\n      opacity: 0.5; }\n  .webcg-devtools .modal-header {\n    display: flex;\n    align-items: flex-start;\n    justify-content: space-between;\n    padding: 1rem;\n    border-bottom: 1px solid #e9ecef;\n    border-top-left-radius: 0.3rem;\n    border-top-right-radius: 0.3rem; }\n    .webcg-devtools .modal-header .close {\n      padding: 1rem;\n      margin: -1rem -1rem -1rem auto; }\n  .webcg-devtools .modal-title {\n    margin-bottom: 0;\n    line-height: 1.5; }\n  .webcg-devtools .modal-body {\n    position: relative;\n    flex: 1 1 auto;\n    padding: 1rem; }\n  .webcg-devtools .modal-footer {\n    display: flex;\n    align-items: center;\n    justify-content: flex-end;\n    padding: 1rem;\n    border-top: 1px solid #e9ecef; }\n    .webcg-devtools .modal-footer > :not(:first-child) {\n      margin-left: .25rem; }\n    .webcg-devtools .modal-footer > :not(:last-child) {\n      margin-right: .25rem; }\n  .webcg-devtools .modal-scrollbar-measure {\n    position: absolute;\n    top: -9999px;\n    width: 50px;\n    height: 50px;\n    overflow: scroll; }\n  @media (min-width: 576px) {\n    .webcg-devtools .modal-dialog {\n      max-width: 500px;\n      margin: 1.75rem auto; }\n    .webcg-devtools .modal-dialog-centered {\n      min-height: calc(100% - (1.75rem * 2)); }\n      .webcg-devtools .modal-dialog-centered::before {\n        height: calc(100vh - (1.75rem * 2)); }\n    .webcg-devtools .modal-sm {\n      max-width: 300px; } }\n  @media (min-width: 992px) {\n    .webcg-devtools .modal-lg {\n      max-width: 800px; } }\n  .webcg-devtools .tooltip {\n    position: absolute;\n    z-index: 1070;\n    display: block;\n    margin: 0;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n    font-style: normal;\n    font-weight: 400;\n    line-height: 1.5;\n    text-align: left;\n    text-align: start;\n    text-decoration: none;\n    text-shadow: none;\n    text-transform: none;\n    letter-spacing: normal;\n    word-break: normal;\n    word-spacing: normal;\n    white-space: normal;\n    line-break: auto;\n    font-size: 0.875rem;\n    word-wrap: break-word;\n    opacity: 0; }\n    .webcg-devtools .tooltip.show {\n      opacity: 0.9; }\n    .webcg-devtools .tooltip .arrow {\n      position: absolute;\n      display: block;\n      width: 0.8rem;\n      height: 0.4rem; }\n      .webcg-devtools .tooltip .arrow::before {\n        position: absolute;\n        content: \"\";\n        border-color: transparent;\n        border-style: solid; }\n  .webcg-devtools .bs-tooltip-top, .webcg-devtools .bs-tooltip-auto[x-placement^=\"top\"] {\n    padding: 0.4rem 0; }\n    .webcg-devtools .bs-tooltip-top .arrow, .webcg-devtools .bs-tooltip-auto[x-placement^=\"top\"] .arrow {\n      bottom: 0; }\n      .webcg-devtools .bs-tooltip-top .arrow::before, .webcg-devtools .bs-tooltip-auto[x-placement^=\"top\"] .arrow::before {\n        top: 0;\n        border-width: 0.4rem 0.4rem 0;\n        border-top-color: #000; }\n  .webcg-devtools .bs-tooltip-right, .webcg-devtools .bs-tooltip-auto[x-placement^=\"right\"] {\n    padding: 0 0.4rem; }\n    .webcg-devtools .bs-tooltip-right .arrow, .webcg-devtools .bs-tooltip-auto[x-placement^=\"right\"] .arrow {\n      left: 0;\n      width: 0.4rem;\n      height: 0.8rem; }\n      .webcg-devtools .bs-tooltip-right .arrow::before, .webcg-devtools .bs-tooltip-auto[x-placement^=\"right\"] .arrow::before {\n        right: 0;\n        border-width: 0.4rem 0.4rem 0.4rem 0;\n        border-right-color: #000; }\n  .webcg-devtools .bs-tooltip-bottom, .webcg-devtools .bs-tooltip-auto[x-placement^=\"bottom\"] {\n    padding: 0.4rem 0; }\n    .webcg-devtools .bs-tooltip-bottom .arrow, .webcg-devtools .bs-tooltip-auto[x-placement^=\"bottom\"] .arrow {\n      top: 0; }\n      .webcg-devtools .bs-tooltip-bottom .arrow::before, .webcg-devtools .bs-tooltip-auto[x-placement^=\"bottom\"] .arrow::before {\n        bottom: 0;\n        border-width: 0 0.4rem 0.4rem;\n        border-bottom-color: #000; }\n  .webcg-devtools .bs-tooltip-left, .webcg-devtools .bs-tooltip-auto[x-placement^=\"left\"] {\n    padding: 0 0.4rem; }\n    .webcg-devtools .bs-tooltip-left .arrow, .webcg-devtools .bs-tooltip-auto[x-placement^=\"left\"] .arrow {\n      right: 0;\n      width: 0.4rem;\n      height: 0.8rem; }\n      .webcg-devtools .bs-tooltip-left .arrow::before, .webcg-devtools .bs-tooltip-auto[x-placement^=\"left\"] .arrow::before {\n        left: 0;\n        border-width: 0.4rem 0 0.4rem 0.4rem;\n        border-left-color: #000; }\n  .webcg-devtools .tooltip-inner {\n    max-width: 200px;\n    padding: 0.25rem 0.5rem;\n    color: #fff;\n    text-align: center;\n    background-color: #000;\n    border-radius: 0.25rem; }\n  .webcg-devtools .popover {\n    position: absolute;\n    top: 0;\n    left: 0;\n    z-index: 1060;\n    display: block;\n    max-width: 276px;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n    font-style: normal;\n    font-weight: 400;\n    line-height: 1.5;\n    text-align: left;\n    text-align: start;\n    text-decoration: none;\n    text-shadow: none;\n    text-transform: none;\n    letter-spacing: normal;\n    word-break: normal;\n    word-spacing: normal;\n    white-space: normal;\n    line-break: auto;\n    font-size: 0.875rem;\n    word-wrap: break-word;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid rgba(0, 0, 0, 0.2);\n    border-radius: 0.3rem; }\n    .webcg-devtools .popover .arrow {\n      position: absolute;\n      display: block;\n      width: 1rem;\n      height: 0.5rem;\n      margin: 0 0.3rem; }\n      .webcg-devtools .popover .arrow::before, .webcg-devtools .popover .arrow::after {\n        position: absolute;\n        display: block;\n        content: \"\";\n        border-color: transparent;\n        border-style: solid; }\n  .webcg-devtools .bs-popover-top, .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] {\n    margin-bottom: 0.5rem; }\n    .webcg-devtools .bs-popover-top .arrow, .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow {\n      bottom: calc((0.5rem + 1px) * -1); }\n    .webcg-devtools .bs-popover-top .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow::before,\n    .webcg-devtools .bs-popover-top .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow::after {\n      border-width: 0.5rem 0.5rem 0; }\n    .webcg-devtools .bs-popover-top .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow::before {\n      bottom: 0;\n      border-top-color: rgba(0, 0, 0, 0.25); }\n    \n    .webcg-devtools .bs-popover-top .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"top\"] .arrow::after {\n      bottom: 1px;\n      border-top-color: #fff; }\n  .webcg-devtools .bs-popover-right, .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] {\n    margin-left: 0.5rem; }\n    .webcg-devtools .bs-popover-right .arrow, .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow {\n      left: calc((0.5rem + 1px) * -1);\n      width: 0.5rem;\n      height: 1rem;\n      margin: 0.3rem 0; }\n    .webcg-devtools .bs-popover-right .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow::before,\n    .webcg-devtools .bs-popover-right .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow::after {\n      border-width: 0.5rem 0.5rem 0.5rem 0; }\n    .webcg-devtools .bs-popover-right .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow::before {\n      left: 0;\n      border-right-color: rgba(0, 0, 0, 0.25); }\n    \n    .webcg-devtools .bs-popover-right .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"right\"] .arrow::after {\n      left: 1px;\n      border-right-color: #fff; }\n  .webcg-devtools .bs-popover-bottom, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] {\n    margin-top: 0.5rem; }\n    .webcg-devtools .bs-popover-bottom .arrow, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow {\n      top: calc((0.5rem + 1px) * -1); }\n    .webcg-devtools .bs-popover-bottom .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow::before,\n    .webcg-devtools .bs-popover-bottom .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow::after {\n      border-width: 0 0.5rem 0.5rem 0.5rem; }\n    .webcg-devtools .bs-popover-bottom .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow::before {\n      top: 0;\n      border-bottom-color: rgba(0, 0, 0, 0.25); }\n    \n    .webcg-devtools .bs-popover-bottom .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .arrow::after {\n      top: 1px;\n      border-bottom-color: #fff; }\n    .webcg-devtools .bs-popover-bottom .popover-header::before, .webcg-devtools .bs-popover-auto[x-placement^=\"bottom\"] .popover-header::before {\n      position: absolute;\n      top: 0;\n      left: 50%;\n      display: block;\n      width: 1rem;\n      margin-left: -0.5rem;\n      content: \"\";\n      border-bottom: 1px solid #f7f7f7; }\n  .webcg-devtools .bs-popover-left, .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] {\n    margin-right: 0.5rem; }\n    .webcg-devtools .bs-popover-left .arrow, .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow {\n      right: calc((0.5rem + 1px) * -1);\n      width: 0.5rem;\n      height: 1rem;\n      margin: 0.3rem 0; }\n    .webcg-devtools .bs-popover-left .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow::before,\n    .webcg-devtools .bs-popover-left .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow::after {\n      border-width: 0.5rem 0 0.5rem 0.5rem; }\n    .webcg-devtools .bs-popover-left .arrow::before, .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow::before {\n      right: 0;\n      border-left-color: rgba(0, 0, 0, 0.25); }\n    \n    .webcg-devtools .bs-popover-left .arrow::after,\n    .webcg-devtools .bs-popover-auto[x-placement^=\"left\"] .arrow::after {\n      right: 1px;\n      border-left-color: #fff; }\n  .webcg-devtools .popover-header {\n    padding: 0.5rem 0.75rem;\n    margin-bottom: 0;\n    font-size: 1rem;\n    color: inherit;\n    background-color: #f7f7f7;\n    border-bottom: 1px solid #ebebeb;\n    border-top-left-radius: calc(0.3rem - 1px);\n    border-top-right-radius: calc(0.3rem - 1px); }\n    .webcg-devtools .popover-header:empty {\n      display: none; }\n  .webcg-devtools .popover-body {\n    padding: 0.5rem 0.75rem;\n    color: #212529; }\n  .webcg-devtools .carousel {\n    position: relative; }\n  .webcg-devtools .carousel-inner {\n    position: relative;\n    width: 100%;\n    overflow: hidden; }\n  .webcg-devtools .carousel-item {\n    position: relative;\n    display: none;\n    align-items: center;\n    width: 100%;\n    backface-visibility: hidden;\n    perspective: 1000px; }\n  .webcg-devtools .carousel-item.active,\n  .webcg-devtools .carousel-item-next,\n  .webcg-devtools .carousel-item-prev {\n    display: block;\n    transition: transform 0.6s ease; }\n    @media screen and (prefers-reduced-motion: reduce) {\n      .webcg-devtools .carousel-item.active,\n      .webcg-devtools .carousel-item-next,\n      .webcg-devtools .carousel-item-prev {\n        transition: none; } }\n  .webcg-devtools .carousel-item-next,\n  .webcg-devtools .carousel-item-prev {\n    position: absolute;\n    top: 0; }\n  .webcg-devtools .carousel-item-next.carousel-item-left,\n  .webcg-devtools .carousel-item-prev.carousel-item-right {\n    transform: translateX(0); }\n    @supports (transform-style: preserve-3d) {\n      .webcg-devtools .carousel-item-next.carousel-item-left,\n      .webcg-devtools .carousel-item-prev.carousel-item-right {\n        transform: translate3d(0, 0, 0); } }\n  .webcg-devtools .carousel-item-next,\n  .webcg-devtools .active.carousel-item-right {\n    transform: translateX(100%); }\n    @supports (transform-style: preserve-3d) {\n      .webcg-devtools .carousel-item-next,\n      .webcg-devtools .active.carousel-item-right {\n        transform: translate3d(100%, 0, 0); } }\n  .webcg-devtools .carousel-item-prev,\n  .webcg-devtools .active.carousel-item-left {\n    transform: translateX(-100%); }\n    @supports (transform-style: preserve-3d) {\n      .webcg-devtools .carousel-item-prev,\n      .webcg-devtools .active.carousel-item-left {\n        transform: translate3d(-100%, 0, 0); } }\n  .webcg-devtools .carousel-fade .carousel-item {\n    opacity: 0;\n    transition-duration: .6s;\n    transition-property: opacity; }\n  .webcg-devtools .carousel-fade .carousel-item.active,\n  .webcg-devtools .carousel-fade .carousel-item-next.carousel-item-left,\n  .webcg-devtools .carousel-fade .carousel-item-prev.carousel-item-right {\n    opacity: 1; }\n  .webcg-devtools .carousel-fade .active.carousel-item-left,\n  .webcg-devtools .carousel-fade .active.carousel-item-right {\n    opacity: 0; }\n  .webcg-devtools .carousel-fade .carousel-item-next,\n  .webcg-devtools .carousel-fade .carousel-item-prev,\n  .webcg-devtools .carousel-fade .carousel-item.active,\n  .webcg-devtools .carousel-fade .active.carousel-item-left,\n  .webcg-devtools .carousel-fade .active.carousel-item-prev {\n    transform: translateX(0); }\n    @supports (transform-style: preserve-3d) {\n      .webcg-devtools .carousel-fade .carousel-item-next,\n      .webcg-devtools .carousel-fade .carousel-item-prev,\n      .webcg-devtools .carousel-fade .carousel-item.active,\n      .webcg-devtools .carousel-fade .active.carousel-item-left,\n      .webcg-devtools .carousel-fade .active.carousel-item-prev {\n        transform: translate3d(0, 0, 0); } }\n  .webcg-devtools .carousel-control-prev,\n  .webcg-devtools .carousel-control-next {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 15%;\n    color: #fff;\n    text-align: center;\n    opacity: 0.5; }\n    .webcg-devtools .carousel-control-prev:hover, .webcg-devtools .carousel-control-prev:focus,\n    .webcg-devtools .carousel-control-next:hover,\n    .webcg-devtools .carousel-control-next:focus {\n      color: #fff;\n      text-decoration: none;\n      outline: 0;\n      opacity: .9; }\n  .webcg-devtools .carousel-control-prev {\n    left: 0; }\n  .webcg-devtools .carousel-control-next {\n    right: 0; }\n  .webcg-devtools .carousel-control-prev-icon,\n  .webcg-devtools .carousel-control-next-icon {\n    display: inline-block;\n    width: 20px;\n    height: 20px;\n    background: transparent no-repeat center center;\n    background-size: 100% 100%; }\n  .webcg-devtools .carousel-control-prev-icon {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 8 8'%3E%3Cpath d='M5.25 0l-4 4 4 4 1.5-1.5-2.5-2.5 2.5-2.5-1.5-1.5z'/%3E%3C/svg%3E\"); }\n  .webcg-devtools .carousel-control-next-icon {\n    background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 8 8'%3E%3Cpath d='M2.75 0l-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 4-4-4-4z'/%3E%3C/svg%3E\"); }\n  .webcg-devtools .carousel-indicators {\n    position: absolute;\n    right: 0;\n    bottom: 10px;\n    left: 0;\n    z-index: 15;\n    display: flex;\n    justify-content: center;\n    padding-left: 0;\n    margin-right: 15%;\n    margin-left: 15%;\n    list-style: none; }\n    .webcg-devtools .carousel-indicators li {\n      position: relative;\n      flex: 0 1 auto;\n      width: 30px;\n      height: 3px;\n      margin-right: 3px;\n      margin-left: 3px;\n      text-indent: -999px;\n      cursor: pointer;\n      background-color: rgba(255, 255, 255, 0.5); }\n      .webcg-devtools .carousel-indicators li::before {\n        position: absolute;\n        top: -10px;\n        left: 0;\n        display: inline-block;\n        width: 100%;\n        height: 10px;\n        content: \"\"; }\n      .webcg-devtools .carousel-indicators li::after {\n        position: absolute;\n        bottom: -10px;\n        left: 0;\n        display: inline-block;\n        width: 100%;\n        height: 10px;\n        content: \"\"; }\n    .webcg-devtools .carousel-indicators .active {\n      background-color: #fff; }\n  .webcg-devtools .carousel-caption {\n    position: absolute;\n    right: 15%;\n    bottom: 20px;\n    left: 15%;\n    z-index: 10;\n    padding-top: 20px;\n    padding-bottom: 20px;\n    color: #fff;\n    text-align: center; }\n  .webcg-devtools .align-baseline {\n    vertical-align: baseline !important; }\n  .webcg-devtools .align-top {\n    vertical-align: top !important; }\n  .webcg-devtools .align-middle {\n    vertical-align: middle !important; }\n  .webcg-devtools .align-bottom {\n    vertical-align: bottom !important; }\n  .webcg-devtools .align-text-bottom {\n    vertical-align: text-bottom !important; }\n  .webcg-devtools .align-text-top {\n    vertical-align: text-top !important; }\n  .webcg-devtools .bg-primary {\n    background-color: #007bff !important; }\n  .webcg-devtools a.bg-primary:hover, .webcg-devtools a.bg-primary:focus,\n  .webcg-devtools button.bg-primary:hover,\n  .webcg-devtools button.bg-primary:focus {\n    background-color: #0062cc !important; }\n  .webcg-devtools .bg-secondary {\n    background-color: #6c757d !important; }\n  .webcg-devtools a.bg-secondary:hover, .webcg-devtools a.bg-secondary:focus,\n  .webcg-devtools button.bg-secondary:hover,\n  .webcg-devtools button.bg-secondary:focus {\n    background-color: #545b62 !important; }\n  .webcg-devtools .bg-success {\n    background-color: #28a745 !important; }\n  .webcg-devtools a.bg-success:hover, .webcg-devtools a.bg-success:focus,\n  .webcg-devtools button.bg-success:hover,\n  .webcg-devtools button.bg-success:focus {\n    background-color: #1e7e34 !important; }\n  .webcg-devtools .bg-info {\n    background-color: #17a2b8 !important; }\n  .webcg-devtools a.bg-info:hover, .webcg-devtools a.bg-info:focus,\n  .webcg-devtools button.bg-info:hover,\n  .webcg-devtools button.bg-info:focus {\n    background-color: #117a8b !important; }\n  .webcg-devtools .bg-warning {\n    background-color: #ffc107 !important; }\n  .webcg-devtools a.bg-warning:hover, .webcg-devtools a.bg-warning:focus,\n  .webcg-devtools button.bg-warning:hover,\n  .webcg-devtools button.bg-warning:focus {\n    background-color: #d39e00 !important; }\n  .webcg-devtools .bg-danger {\n    background-color: #dc3545 !important; }\n  .webcg-devtools a.bg-danger:hover, .webcg-devtools a.bg-danger:focus,\n  .webcg-devtools button.bg-danger:hover,\n  .webcg-devtools button.bg-danger:focus {\n    background-color: #bd2130 !important; }\n  .webcg-devtools .bg-light {\n    background-color: #f8f9fa !important; }\n  .webcg-devtools a.bg-light:hover, .webcg-devtools a.bg-light:focus,\n  .webcg-devtools button.bg-light:hover,\n  .webcg-devtools button.bg-light:focus {\n    background-color: #dae0e5 !important; }\n  .webcg-devtools .bg-dark {\n    background-color: #343a40 !important; }\n  .webcg-devtools a.bg-dark:hover, .webcg-devtools a.bg-dark:focus,\n  .webcg-devtools button.bg-dark:hover,\n  .webcg-devtools button.bg-dark:focus {\n    background-color: #1d2124 !important; }\n  .webcg-devtools .bg-white {\n    background-color: #fff !important; }\n  .webcg-devtools .bg-transparent {\n    background-color: transparent !important; }\n  .webcg-devtools .border {\n    border: 1px solid #dee2e6 !important; }\n  .webcg-devtools .border-top {\n    border-top: 1px solid #dee2e6 !important; }\n  .webcg-devtools .border-right {\n    border-right: 1px solid #dee2e6 !important; }\n  .webcg-devtools .border-bottom {\n    border-bottom: 1px solid #dee2e6 !important; }\n  .webcg-devtools .border-left {\n    border-left: 1px solid #dee2e6 !important; }\n  .webcg-devtools .border-0 {\n    border: 0 !important; }\n  .webcg-devtools .border-top-0 {\n    border-top: 0 !important; }\n  .webcg-devtools .border-right-0 {\n    border-right: 0 !important; }\n  .webcg-devtools .border-bottom-0 {\n    border-bottom: 0 !important; }\n  .webcg-devtools .border-left-0 {\n    border-left: 0 !important; }\n  .webcg-devtools .border-primary {\n    border-color: #007bff !important; }\n  .webcg-devtools .border-secondary {\n    border-color: #6c757d !important; }\n  .webcg-devtools .border-success {\n    border-color: #28a745 !important; }\n  .webcg-devtools .border-info {\n    border-color: #17a2b8 !important; }\n  .webcg-devtools .border-warning {\n    border-color: #ffc107 !important; }\n  .webcg-devtools .border-danger {\n    border-color: #dc3545 !important; }\n  .webcg-devtools .border-light {\n    border-color: #f8f9fa !important; }\n  .webcg-devtools .border-dark {\n    border-color: #343a40 !important; }\n  .webcg-devtools .border-white {\n    border-color: #fff !important; }\n  .webcg-devtools .rounded {\n    border-radius: 0.25rem !important; }\n  .webcg-devtools .rounded-top {\n    border-top-left-radius: 0.25rem !important;\n    border-top-right-radius: 0.25rem !important; }\n  .webcg-devtools .rounded-right {\n    border-top-right-radius: 0.25rem !important;\n    border-bottom-right-radius: 0.25rem !important; }\n  .webcg-devtools .rounded-bottom {\n    border-bottom-right-radius: 0.25rem !important;\n    border-bottom-left-radius: 0.25rem !important; }\n  .webcg-devtools .rounded-left {\n    border-top-left-radius: 0.25rem !important;\n    border-bottom-left-radius: 0.25rem !important; }\n  .webcg-devtools .rounded-circle {\n    border-radius: 50% !important; }\n  .webcg-devtools .rounded-0 {\n    border-radius: 0 !important; }\n  .webcg-devtools .clearfix::after {\n    display: block;\n    clear: both;\n    content: \"\"; }\n  .webcg-devtools .d-none {\n    display: none !important; }\n  .webcg-devtools .d-inline {\n    display: inline !important; }\n  .webcg-devtools .d-inline-block {\n    display: inline-block !important; }\n  .webcg-devtools .d-block {\n    display: block !important; }\n  .webcg-devtools .d-table {\n    display: table !important; }\n  .webcg-devtools .d-table-row {\n    display: table-row !important; }\n  .webcg-devtools .d-table-cell {\n    display: table-cell !important; }\n  .webcg-devtools .d-flex {\n    display: flex !important; }\n  .webcg-devtools .d-inline-flex {\n    display: inline-flex !important; }\n  @media (min-width: 576px) {\n    .webcg-devtools .d-sm-none {\n      display: none !important; }\n    .webcg-devtools .d-sm-inline {\n      display: inline !important; }\n    .webcg-devtools .d-sm-inline-block {\n      display: inline-block !important; }\n    .webcg-devtools .d-sm-block {\n      display: block !important; }\n    .webcg-devtools .d-sm-table {\n      display: table !important; }\n    .webcg-devtools .d-sm-table-row {\n      display: table-row !important; }\n    .webcg-devtools .d-sm-table-cell {\n      display: table-cell !important; }\n    .webcg-devtools .d-sm-flex {\n      display: flex !important; }\n    .webcg-devtools .d-sm-inline-flex {\n      display: inline-flex !important; } }\n  @media (min-width: 768px) {\n    .webcg-devtools .d-md-none {\n      display: none !important; }\n    .webcg-devtools .d-md-inline {\n      display: inline !important; }\n    .webcg-devtools .d-md-inline-block {\n      display: inline-block !important; }\n    .webcg-devtools .d-md-block {\n      display: block !important; }\n    .webcg-devtools .d-md-table {\n      display: table !important; }\n    .webcg-devtools .d-md-table-row {\n      display: table-row !important; }\n    .webcg-devtools .d-md-table-cell {\n      display: table-cell !important; }\n    .webcg-devtools .d-md-flex {\n      display: flex !important; }\n    .webcg-devtools .d-md-inline-flex {\n      display: inline-flex !important; } }\n  @media (min-width: 992px) {\n    .webcg-devtools .d-lg-none {\n      display: none !important; }\n    .webcg-devtools .d-lg-inline {\n      display: inline !important; }\n    .webcg-devtools .d-lg-inline-block {\n      display: inline-block !important; }\n    .webcg-devtools .d-lg-block {\n      display: block !important; }\n    .webcg-devtools .d-lg-table {\n      display: table !important; }\n    .webcg-devtools .d-lg-table-row {\n      display: table-row !important; }\n    .webcg-devtools .d-lg-table-cell {\n      display: table-cell !important; }\n    .webcg-devtools .d-lg-flex {\n      display: flex !important; }\n    .webcg-devtools .d-lg-inline-flex {\n      display: inline-flex !important; } }\n  @media (min-width: 1200px) {\n    .webcg-devtools .d-xl-none {\n      display: none !important; }\n    .webcg-devtools .d-xl-inline {\n      display: inline !important; }\n    .webcg-devtools .d-xl-inline-block {\n      display: inline-block !important; }\n    .webcg-devtools .d-xl-block {\n      display: block !important; }\n    .webcg-devtools .d-xl-table {\n      display: table !important; }\n    .webcg-devtools .d-xl-table-row {\n      display: table-row !important; }\n    .webcg-devtools .d-xl-table-cell {\n      display: table-cell !important; }\n    .webcg-devtools .d-xl-flex {\n      display: flex !important; }\n    .webcg-devtools .d-xl-inline-flex {\n      display: inline-flex !important; } }\n  @media print {\n    .webcg-devtools .d-print-none {\n      display: none !important; }\n    .webcg-devtools .d-print-inline {\n      display: inline !important; }\n    .webcg-devtools .d-print-inline-block {\n      display: inline-block !important; }\n    .webcg-devtools .d-print-block {\n      display: block !important; }\n    .webcg-devtools .d-print-table {\n      display: table !important; }\n    .webcg-devtools .d-print-table-row {\n      display: table-row !important; }\n    .webcg-devtools .d-print-table-cell {\n      display: table-cell !important; }\n    .webcg-devtools .d-print-flex {\n      display: flex !important; }\n    .webcg-devtools .d-print-inline-flex {\n      display: inline-flex !important; } }\n  .webcg-devtools .embed-responsive {\n    position: relative;\n    display: block;\n    width: 100%;\n    padding: 0;\n    overflow: hidden; }\n    .webcg-devtools .embed-responsive::before {\n      display: block;\n      content: \"\"; }\n    .webcg-devtools .embed-responsive .embed-responsive-item,\n    .webcg-devtools .embed-responsive iframe,\n    .webcg-devtools .embed-responsive embed,\n    .webcg-devtools .embed-responsive object,\n    .webcg-devtools .embed-responsive video {\n      position: absolute;\n      top: 0;\n      bottom: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      border: 0; }\n  .webcg-devtools .embed-responsive-21by9::before {\n    padding-top: 42.85714%; }\n  .webcg-devtools .embed-responsive-16by9::before {\n    padding-top: 56.25%; }\n  .webcg-devtools .embed-responsive-4by3::before {\n    padding-top: 75%; }\n  .webcg-devtools .embed-responsive-1by1::before {\n    padding-top: 100%; }\n  .webcg-devtools .flex-row {\n    flex-direction: row !important; }\n  .webcg-devtools .flex-column {\n    flex-direction: column !important; }\n  .webcg-devtools .flex-row-reverse {\n    flex-direction: row-reverse !important; }\n  .webcg-devtools .flex-column-reverse {\n    flex-direction: column-reverse !important; }\n  .webcg-devtools .flex-wrap {\n    flex-wrap: wrap !important; }\n  .webcg-devtools .flex-nowrap {\n    flex-wrap: nowrap !important; }\n  .webcg-devtools .flex-wrap-reverse {\n    flex-wrap: wrap-reverse !important; }\n  .webcg-devtools .flex-fill {\n    flex: 1 1 auto !important; }\n  .webcg-devtools .flex-grow-0 {\n    flex-grow: 0 !important; }\n  .webcg-devtools .flex-grow-1 {\n    flex-grow: 1 !important; }\n  .webcg-devtools .flex-shrink-0 {\n    flex-shrink: 0 !important; }\n  .webcg-devtools .flex-shrink-1 {\n    flex-shrink: 1 !important; }\n  .webcg-devtools .justify-content-start {\n    justify-content: flex-start !important; }\n  .webcg-devtools .justify-content-end {\n    justify-content: flex-end !important; }\n  .webcg-devtools .justify-content-center {\n    justify-content: center !important; }\n  .webcg-devtools .justify-content-between {\n    justify-content: space-between !important; }\n  .webcg-devtools .justify-content-around {\n    justify-content: space-around !important; }\n  .webcg-devtools .align-items-start {\n    align-items: flex-start !important; }\n  .webcg-devtools .align-items-end {\n    align-items: flex-end !important; }\n  .webcg-devtools .align-items-center {\n    align-items: center !important; }\n  .webcg-devtools .align-items-baseline {\n    align-items: baseline !important; }\n  .webcg-devtools .align-items-stretch {\n    align-items: stretch !important; }\n  .webcg-devtools .align-content-start {\n    align-content: flex-start !important; }\n  .webcg-devtools .align-content-end {\n    align-content: flex-end !important; }\n  .webcg-devtools .align-content-center {\n    align-content: center !important; }\n  .webcg-devtools .align-content-between {\n    align-content: space-between !important; }\n  .webcg-devtools .align-content-around {\n    align-content: space-around !important; }\n  .webcg-devtools .align-content-stretch {\n    align-content: stretch !important; }\n  .webcg-devtools .align-self-auto {\n    align-self: auto !important; }\n  .webcg-devtools .align-self-start {\n    align-self: flex-start !important; }\n  .webcg-devtools .align-self-end {\n    align-self: flex-end !important; }\n  .webcg-devtools .align-self-center {\n    align-self: center !important; }\n  .webcg-devtools .align-self-baseline {\n    align-self: baseline !important; }\n  .webcg-devtools .align-self-stretch {\n    align-self: stretch !important; }\n  @media (min-width: 576px) {\n    .webcg-devtools .flex-sm-row {\n      flex-direction: row !important; }\n    .webcg-devtools .flex-sm-column {\n      flex-direction: column !important; }\n    .webcg-devtools .flex-sm-row-reverse {\n      flex-direction: row-reverse !important; }\n    .webcg-devtools .flex-sm-column-reverse {\n      flex-direction: column-reverse !important; }\n    .webcg-devtools .flex-sm-wrap {\n      flex-wrap: wrap !important; }\n    .webcg-devtools .flex-sm-nowrap {\n      flex-wrap: nowrap !important; }\n    .webcg-devtools .flex-sm-wrap-reverse {\n      flex-wrap: wrap-reverse !important; }\n    .webcg-devtools .flex-sm-fill {\n      flex: 1 1 auto !important; }\n    .webcg-devtools .flex-sm-grow-0 {\n      flex-grow: 0 !important; }\n    .webcg-devtools .flex-sm-grow-1 {\n      flex-grow: 1 !important; }\n    .webcg-devtools .flex-sm-shrink-0 {\n      flex-shrink: 0 !important; }\n    .webcg-devtools .flex-sm-shrink-1 {\n      flex-shrink: 1 !important; }\n    .webcg-devtools .justify-content-sm-start {\n      justify-content: flex-start !important; }\n    .webcg-devtools .justify-content-sm-end {\n      justify-content: flex-end !important; }\n    .webcg-devtools .justify-content-sm-center {\n      justify-content: center !important; }\n    .webcg-devtools .justify-content-sm-between {\n      justify-content: space-between !important; }\n    .webcg-devtools .justify-content-sm-around {\n      justify-content: space-around !important; }\n    .webcg-devtools .align-items-sm-start {\n      align-items: flex-start !important; }\n    .webcg-devtools .align-items-sm-end {\n      align-items: flex-end !important; }\n    .webcg-devtools .align-items-sm-center {\n      align-items: center !important; }\n    .webcg-devtools .align-items-sm-baseline {\n      align-items: baseline !important; }\n    .webcg-devtools .align-items-sm-stretch {\n      align-items: stretch !important; }\n    .webcg-devtools .align-content-sm-start {\n      align-content: flex-start !important; }\n    .webcg-devtools .align-content-sm-end {\n      align-content: flex-end !important; }\n    .webcg-devtools .align-content-sm-center {\n      align-content: center !important; }\n    .webcg-devtools .align-content-sm-between {\n      align-content: space-between !important; }\n    .webcg-devtools .align-content-sm-around {\n      align-content: space-around !important; }\n    .webcg-devtools .align-content-sm-stretch {\n      align-content: stretch !important; }\n    .webcg-devtools .align-self-sm-auto {\n      align-self: auto !important; }\n    .webcg-devtools .align-self-sm-start {\n      align-self: flex-start !important; }\n    .webcg-devtools .align-self-sm-end {\n      align-self: flex-end !important; }\n    .webcg-devtools .align-self-sm-center {\n      align-self: center !important; }\n    .webcg-devtools .align-self-sm-baseline {\n      align-self: baseline !important; }\n    .webcg-devtools .align-self-sm-stretch {\n      align-self: stretch !important; } }\n  @media (min-width: 768px) {\n    .webcg-devtools .flex-md-row {\n      flex-direction: row !important; }\n    .webcg-devtools .flex-md-column {\n      flex-direction: column !important; }\n    .webcg-devtools .flex-md-row-reverse {\n      flex-direction: row-reverse !important; }\n    .webcg-devtools .flex-md-column-reverse {\n      flex-direction: column-reverse !important; }\n    .webcg-devtools .flex-md-wrap {\n      flex-wrap: wrap !important; }\n    .webcg-devtools .flex-md-nowrap {\n      flex-wrap: nowrap !important; }\n    .webcg-devtools .flex-md-wrap-reverse {\n      flex-wrap: wrap-reverse !important; }\n    .webcg-devtools .flex-md-fill {\n      flex: 1 1 auto !important; }\n    .webcg-devtools .flex-md-grow-0 {\n      flex-grow: 0 !important; }\n    .webcg-devtools .flex-md-grow-1 {\n      flex-grow: 1 !important; }\n    .webcg-devtools .flex-md-shrink-0 {\n      flex-shrink: 0 !important; }\n    .webcg-devtools .flex-md-shrink-1 {\n      flex-shrink: 1 !important; }\n    .webcg-devtools .justify-content-md-start {\n      justify-content: flex-start !important; }\n    .webcg-devtools .justify-content-md-end {\n      justify-content: flex-end !important; }\n    .webcg-devtools .justify-content-md-center {\n      justify-content: center !important; }\n    .webcg-devtools .justify-content-md-between {\n      justify-content: space-between !important; }\n    .webcg-devtools .justify-content-md-around {\n      justify-content: space-around !important; }\n    .webcg-devtools .align-items-md-start {\n      align-items: flex-start !important; }\n    .webcg-devtools .align-items-md-end {\n      align-items: flex-end !important; }\n    .webcg-devtools .align-items-md-center {\n      align-items: center !important; }\n    .webcg-devtools .align-items-md-baseline {\n      align-items: baseline !important; }\n    .webcg-devtools .align-items-md-stretch {\n      align-items: stretch !important; }\n    .webcg-devtools .align-content-md-start {\n      align-content: flex-start !important; }\n    .webcg-devtools .align-content-md-end {\n      align-content: flex-end !important; }\n    .webcg-devtools .align-content-md-center {\n      align-content: center !important; }\n    .webcg-devtools .align-content-md-between {\n      align-content: space-between !important; }\n    .webcg-devtools .align-content-md-around {\n      align-content: space-around !important; }\n    .webcg-devtools .align-content-md-stretch {\n      align-content: stretch !important; }\n    .webcg-devtools .align-self-md-auto {\n      align-self: auto !important; }\n    .webcg-devtools .align-self-md-start {\n      align-self: flex-start !important; }\n    .webcg-devtools .align-self-md-end {\n      align-self: flex-end !important; }\n    .webcg-devtools .align-self-md-center {\n      align-self: center !important; }\n    .webcg-devtools .align-self-md-baseline {\n      align-self: baseline !important; }\n    .webcg-devtools .align-self-md-stretch {\n      align-self: stretch !important; } }\n  @media (min-width: 992px) {\n    .webcg-devtools .flex-lg-row {\n      flex-direction: row !important; }\n    .webcg-devtools .flex-lg-column {\n      flex-direction: column !important; }\n    .webcg-devtools .flex-lg-row-reverse {\n      flex-direction: row-reverse !important; }\n    .webcg-devtools .flex-lg-column-reverse {\n      flex-direction: column-reverse !important; }\n    .webcg-devtools .flex-lg-wrap {\n      flex-wrap: wrap !important; }\n    .webcg-devtools .flex-lg-nowrap {\n      flex-wrap: nowrap !important; }\n    .webcg-devtools .flex-lg-wrap-reverse {\n      flex-wrap: wrap-reverse !important; }\n    .webcg-devtools .flex-lg-fill {\n      flex: 1 1 auto !important; }\n    .webcg-devtools .flex-lg-grow-0 {\n      flex-grow: 0 !important; }\n    .webcg-devtools .flex-lg-grow-1 {\n      flex-grow: 1 !important; }\n    .webcg-devtools .flex-lg-shrink-0 {\n      flex-shrink: 0 !important; }\n    .webcg-devtools .flex-lg-shrink-1 {\n      flex-shrink: 1 !important; }\n    .webcg-devtools .justify-content-lg-start {\n      justify-content: flex-start !important; }\n    .webcg-devtools .justify-content-lg-end {\n      justify-content: flex-end !important; }\n    .webcg-devtools .justify-content-lg-center {\n      justify-content: center !important; }\n    .webcg-devtools .justify-content-lg-between {\n      justify-content: space-between !important; }\n    .webcg-devtools .justify-content-lg-around {\n      justify-content: space-around !important; }\n    .webcg-devtools .align-items-lg-start {\n      align-items: flex-start !important; }\n    .webcg-devtools .align-items-lg-end {\n      align-items: flex-end !important; }\n    .webcg-devtools .align-items-lg-center {\n      align-items: center !important; }\n    .webcg-devtools .align-items-lg-baseline {\n      align-items: baseline !important; }\n    .webcg-devtools .align-items-lg-stretch {\n      align-items: stretch !important; }\n    .webcg-devtools .align-content-lg-start {\n      align-content: flex-start !important; }\n    .webcg-devtools .align-content-lg-end {\n      align-content: flex-end !important; }\n    .webcg-devtools .align-content-lg-center {\n      align-content: center !important; }\n    .webcg-devtools .align-content-lg-between {\n      align-content: space-between !important; }\n    .webcg-devtools .align-content-lg-around {\n      align-content: space-around !important; }\n    .webcg-devtools .align-content-lg-stretch {\n      align-content: stretch !important; }\n    .webcg-devtools .align-self-lg-auto {\n      align-self: auto !important; }\n    .webcg-devtools .align-self-lg-start {\n      align-self: flex-start !important; }\n    .webcg-devtools .align-self-lg-end {\n      align-self: flex-end !important; }\n    .webcg-devtools .align-self-lg-center {\n      align-self: center !important; }\n    .webcg-devtools .align-self-lg-baseline {\n      align-self: baseline !important; }\n    .webcg-devtools .align-self-lg-stretch {\n      align-self: stretch !important; } }\n  @media (min-width: 1200px) {\n    .webcg-devtools .flex-xl-row {\n      flex-direction: row !important; }\n    .webcg-devtools .flex-xl-column {\n      flex-direction: column !important; }\n    .webcg-devtools .flex-xl-row-reverse {\n      flex-direction: row-reverse !important; }\n    .webcg-devtools .flex-xl-column-reverse {\n      flex-direction: column-reverse !important; }\n    .webcg-devtools .flex-xl-wrap {\n      flex-wrap: wrap !important; }\n    .webcg-devtools .flex-xl-nowrap {\n      flex-wrap: nowrap !important; }\n    .webcg-devtools .flex-xl-wrap-reverse {\n      flex-wrap: wrap-reverse !important; }\n    .webcg-devtools .flex-xl-fill {\n      flex: 1 1 auto !important; }\n    .webcg-devtools .flex-xl-grow-0 {\n      flex-grow: 0 !important; }\n    .webcg-devtools .flex-xl-grow-1 {\n      flex-grow: 1 !important; }\n    .webcg-devtools .flex-xl-shrink-0 {\n      flex-shrink: 0 !important; }\n    .webcg-devtools .flex-xl-shrink-1 {\n      flex-shrink: 1 !important; }\n    .webcg-devtools .justify-content-xl-start {\n      justify-content: flex-start !important; }\n    .webcg-devtools .justify-content-xl-end {\n      justify-content: flex-end !important; }\n    .webcg-devtools .justify-content-xl-center {\n      justify-content: center !important; }\n    .webcg-devtools .justify-content-xl-between {\n      justify-content: space-between !important; }\n    .webcg-devtools .justify-content-xl-around {\n      justify-content: space-around !important; }\n    .webcg-devtools .align-items-xl-start {\n      align-items: flex-start !important; }\n    .webcg-devtools .align-items-xl-end {\n      align-items: flex-end !important; }\n    .webcg-devtools .align-items-xl-center {\n      align-items: center !important; }\n    .webcg-devtools .align-items-xl-baseline {\n      align-items: baseline !important; }\n    .webcg-devtools .align-items-xl-stretch {\n      align-items: stretch !important; }\n    .webcg-devtools .align-content-xl-start {\n      align-content: flex-start !important; }\n    .webcg-devtools .align-content-xl-end {\n      align-content: flex-end !important; }\n    .webcg-devtools .align-content-xl-center {\n      align-content: center !important; }\n    .webcg-devtools .align-content-xl-between {\n      align-content: space-between !important; }\n    .webcg-devtools .align-content-xl-around {\n      align-content: space-around !important; }\n    .webcg-devtools .align-content-xl-stretch {\n      align-content: stretch !important; }\n    .webcg-devtools .align-self-xl-auto {\n      align-self: auto !important; }\n    .webcg-devtools .align-self-xl-start {\n      align-self: flex-start !important; }\n    .webcg-devtools .align-self-xl-end {\n      align-self: flex-end !important; }\n    .webcg-devtools .align-self-xl-center {\n      align-self: center !important; }\n    .webcg-devtools .align-self-xl-baseline {\n      align-self: baseline !important; }\n    .webcg-devtools .align-self-xl-stretch {\n      align-self: stretch !important; } }\n  .webcg-devtools .float-left {\n    float: left !important; }\n  .webcg-devtools .float-right {\n    float: right !important; }\n  .webcg-devtools .float-none {\n    float: none !important; }\n  @media (min-width: 576px) {\n    .webcg-devtools .float-sm-left {\n      float: left !important; }\n    .webcg-devtools .float-sm-right {\n      float: right !important; }\n    .webcg-devtools .float-sm-none {\n      float: none !important; } }\n  @media (min-width: 768px) {\n    .webcg-devtools .float-md-left {\n      float: left !important; }\n    .webcg-devtools .float-md-right {\n      float: right !important; }\n    .webcg-devtools .float-md-none {\n      float: none !important; } }\n  @media (min-width: 992px) {\n    .webcg-devtools .float-lg-left {\n      float: left !important; }\n    .webcg-devtools .float-lg-right {\n      float: right !important; }\n    .webcg-devtools .float-lg-none {\n      float: none !important; } }\n  @media (min-width: 1200px) {\n    .webcg-devtools .float-xl-left {\n      float: left !important; }\n    .webcg-devtools .float-xl-right {\n      float: right !important; }\n    .webcg-devtools .float-xl-none {\n      float: none !important; } }\n  .webcg-devtools .position-static {\n    position: static !important; }\n  .webcg-devtools .position-relative {\n    position: relative !important; }\n  .webcg-devtools .position-absolute {\n    position: absolute !important; }\n  .webcg-devtools .position-fixed {\n    position: fixed !important; }\n  .webcg-devtools .position-sticky {\n    position: sticky !important; }\n  .webcg-devtools .fixed-top {\n    position: fixed;\n    top: 0;\n    right: 0;\n    left: 0;\n    z-index: 1030; }\n  .webcg-devtools .fixed-bottom {\n    position: fixed;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: 1030; }\n  @supports (position: sticky) {\n    .webcg-devtools .sticky-top {\n      position: sticky;\n      top: 0;\n      z-index: 1020; } }\n  .webcg-devtools .sr-only {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    padding: 0;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n    white-space: nowrap;\n    border: 0; }\n  .webcg-devtools .sr-only-focusable:active, .webcg-devtools .sr-only-focusable:focus {\n    position: static;\n    width: auto;\n    height: auto;\n    overflow: visible;\n    clip: auto;\n    white-space: normal; }\n  .webcg-devtools .shadow-sm {\n    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important; }\n  .webcg-devtools .shadow {\n    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important; }\n  .webcg-devtools .shadow-lg {\n    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important; }\n  .webcg-devtools .shadow-none {\n    box-shadow: none !important; }\n  .webcg-devtools .w-25 {\n    width: 25% !important; }\n  .webcg-devtools .w-50 {\n    width: 50% !important; }\n  .webcg-devtools .w-75 {\n    width: 75% !important; }\n  .webcg-devtools .w-100 {\n    width: 100% !important; }\n  .webcg-devtools .w-auto {\n    width: auto !important; }\n  .webcg-devtools .h-25 {\n    height: 25% !important; }\n  .webcg-devtools .h-50 {\n    height: 50% !important; }\n  .webcg-devtools .h-75 {\n    height: 75% !important; }\n  .webcg-devtools .h-100 {\n    height: 100% !important; }\n  .webcg-devtools .h-auto {\n    height: auto !important; }\n  .webcg-devtools .mw-100 {\n    max-width: 100% !important; }\n  .webcg-devtools .mh-100 {\n    max-height: 100% !important; }\n  .webcg-devtools .m-0 {\n    margin: 0 !important; }\n  .webcg-devtools .mt-0,\n  .webcg-devtools .my-0 {\n    margin-top: 0 !important; }\n  .webcg-devtools .mr-0,\n  .webcg-devtools .mx-0 {\n    margin-right: 0 !important; }\n  .webcg-devtools .mb-0,\n  .webcg-devtools .my-0 {\n    margin-bottom: 0 !important; }\n  .webcg-devtools .ml-0,\n  .webcg-devtools .mx-0 {\n    margin-left: 0 !important; }\n  .webcg-devtools .m-1 {\n    margin: 0.25rem !important; }\n  .webcg-devtools .mt-1,\n  .webcg-devtools .my-1 {\n    margin-top: 0.25rem !important; }\n  .webcg-devtools .mr-1,\n  .webcg-devtools .mx-1 {\n    margin-right: 0.25rem !important; }\n  .webcg-devtools .mb-1,\n  .webcg-devtools .my-1 {\n    margin-bottom: 0.25rem !important; }\n  .webcg-devtools .ml-1,\n  .webcg-devtools .mx-1 {\n    margin-left: 0.25rem !important; }\n  .webcg-devtools .m-2 {\n    margin: 0.5rem !important; }\n  .webcg-devtools .mt-2,\n  .webcg-devtools .my-2 {\n    margin-top: 0.5rem !important; }\n  .webcg-devtools .mr-2,\n  .webcg-devtools .mx-2 {\n    margin-right: 0.5rem !important; }\n  .webcg-devtools .mb-2,\n  .webcg-devtools .my-2 {\n    margin-bottom: 0.5rem !important; }\n  .webcg-devtools .ml-2,\n  .webcg-devtools .mx-2 {\n    margin-left: 0.5rem !important; }\n  .webcg-devtools .m-3 {\n    margin: 1rem !important; }\n  .webcg-devtools .mt-3,\n  .webcg-devtools .my-3 {\n    margin-top: 1rem !important; }\n  .webcg-devtools .mr-3,\n  .webcg-devtools .mx-3 {\n    margin-right: 1rem !important; }\n  .webcg-devtools .mb-3,\n  .webcg-devtools .my-3 {\n    margin-bottom: 1rem !important; }\n  .webcg-devtools .ml-3,\n  .webcg-devtools .mx-3 {\n    margin-left: 1rem !important; }\n  .webcg-devtools .m-4 {\n    margin: 1.5rem !important; }\n  .webcg-devtools .mt-4,\n  .webcg-devtools .my-4 {\n    margin-top: 1.5rem !important; }\n  .webcg-devtools .mr-4,\n  .webcg-devtools .mx-4 {\n    margin-right: 1.5rem !important; }\n  .webcg-devtools .mb-4,\n  .webcg-devtools .my-4 {\n    margin-bottom: 1.5rem !important; }\n  .webcg-devtools .ml-4,\n  .webcg-devtools .mx-4 {\n    margin-left: 1.5rem !important; }\n  .webcg-devtools .m-5 {\n    margin: 3rem !important; }\n  .webcg-devtools .mt-5,\n  .webcg-devtools .my-5 {\n    margin-top: 3rem !important; }\n  .webcg-devtools .mr-5,\n  .webcg-devtools .mx-5 {\n    margin-right: 3rem !important; }\n  .webcg-devtools .mb-5,\n  .webcg-devtools .my-5 {\n    margin-bottom: 3rem !important; }\n  .webcg-devtools .ml-5,\n  .webcg-devtools .mx-5 {\n    margin-left: 3rem !important; }\n  .webcg-devtools .p-0 {\n    padding: 0 !important; }\n  .webcg-devtools .pt-0,\n  .webcg-devtools .py-0 {\n    padding-top: 0 !important; }\n  .webcg-devtools .pr-0,\n  .webcg-devtools .px-0 {\n    padding-right: 0 !important; }\n  .webcg-devtools .pb-0,\n  .webcg-devtools .py-0 {\n    padding-bottom: 0 !important; }\n  .webcg-devtools .pl-0,\n  .webcg-devtools .px-0 {\n    padding-left: 0 !important; }\n  .webcg-devtools .p-1 {\n    padding: 0.25rem !important; }\n  .webcg-devtools .pt-1,\n  .webcg-devtools .py-1 {\n    padding-top: 0.25rem !important; }\n  .webcg-devtools .pr-1,\n  .webcg-devtools .px-1 {\n    padding-right: 0.25rem !important; }\n  .webcg-devtools .pb-1,\n  .webcg-devtools .py-1 {\n    padding-bottom: 0.25rem !important; }\n  .webcg-devtools .pl-1,\n  .webcg-devtools .px-1 {\n    padding-left: 0.25rem !important; }\n  .webcg-devtools .p-2 {\n    padding: 0.5rem !important; }\n  .webcg-devtools .pt-2,\n  .webcg-devtools .py-2 {\n    padding-top: 0.5rem !important; }\n  .webcg-devtools .pr-2,\n  .webcg-devtools .px-2 {\n    padding-right: 0.5rem !important; }\n  .webcg-devtools .pb-2,\n  .webcg-devtools .py-2 {\n    padding-bottom: 0.5rem !important; }\n  .webcg-devtools .pl-2,\n  .webcg-devtools .px-2 {\n    padding-left: 0.5rem !important; }\n  .webcg-devtools .p-3 {\n    padding: 1rem !important; }\n  .webcg-devtools .pt-3,\n  .webcg-devtools .py-3 {\n    padding-top: 1rem !important; }\n  .webcg-devtools .pr-3,\n  .webcg-devtools .px-3 {\n    padding-right: 1rem !important; }\n  .webcg-devtools .pb-3,\n  .webcg-devtools .py-3 {\n    padding-bottom: 1rem !important; }\n  .webcg-devtools .pl-3,\n  .webcg-devtools .px-3 {\n    padding-left: 1rem !important; }\n  .webcg-devtools .p-4 {\n    padding: 1.5rem !important; }\n  .webcg-devtools .pt-4,\n  .webcg-devtools .py-4 {\n    padding-top: 1.5rem !important; }\n  .webcg-devtools .pr-4,\n  .webcg-devtools .px-4 {\n    padding-right: 1.5rem !important; }\n  .webcg-devtools .pb-4,\n  .webcg-devtools .py-4 {\n    padding-bottom: 1.5rem !important; }\n  .webcg-devtools .pl-4,\n  .webcg-devtools .px-4 {\n    padding-left: 1.5rem !important; }\n  .webcg-devtools .p-5 {\n    padding: 3rem !important; }\n  .webcg-devtools .pt-5,\n  .webcg-devtools .py-5 {\n    padding-top: 3rem !important; }\n  .webcg-devtools .pr-5,\n  .webcg-devtools .px-5 {\n    padding-right: 3rem !important; }\n  .webcg-devtools .pb-5,\n  .webcg-devtools .py-5 {\n    padding-bottom: 3rem !important; }\n  .webcg-devtools .pl-5,\n  .webcg-devtools .px-5 {\n    padding-left: 3rem !important; }\n  .webcg-devtools .m-auto {\n    margin: auto !important; }\n  .webcg-devtools .mt-auto,\n  .webcg-devtools .my-auto {\n    margin-top: auto !important; }\n  .webcg-devtools .mr-auto,\n  .webcg-devtools .mx-auto {\n    margin-right: auto !important; }\n  .webcg-devtools .mb-auto,\n  .webcg-devtools .my-auto {\n    margin-bottom: auto !important; }\n  .webcg-devtools .ml-auto,\n  .webcg-devtools .mx-auto {\n    margin-left: auto !important; }\n  @media (min-width: 576px) {\n    .webcg-devtools .m-sm-0 {\n      margin: 0 !important; }\n    .webcg-devtools .mt-sm-0,\n    .webcg-devtools .my-sm-0 {\n      margin-top: 0 !important; }\n    .webcg-devtools .mr-sm-0,\n    .webcg-devtools .mx-sm-0 {\n      margin-right: 0 !important; }\n    .webcg-devtools .mb-sm-0,\n    .webcg-devtools .my-sm-0 {\n      margin-bottom: 0 !important; }\n    .webcg-devtools .ml-sm-0,\n    .webcg-devtools .mx-sm-0 {\n      margin-left: 0 !important; }\n    .webcg-devtools .m-sm-1 {\n      margin: 0.25rem !important; }\n    .webcg-devtools .mt-sm-1,\n    .webcg-devtools .my-sm-1 {\n      margin-top: 0.25rem !important; }\n    .webcg-devtools .mr-sm-1,\n    .webcg-devtools .mx-sm-1 {\n      margin-right: 0.25rem !important; }\n    .webcg-devtools .mb-sm-1,\n    .webcg-devtools .my-sm-1 {\n      margin-bottom: 0.25rem !important; }\n    .webcg-devtools .ml-sm-1,\n    .webcg-devtools .mx-sm-1 {\n      margin-left: 0.25rem !important; }\n    .webcg-devtools .m-sm-2 {\n      margin: 0.5rem !important; }\n    .webcg-devtools .mt-sm-2,\n    .webcg-devtools .my-sm-2 {\n      margin-top: 0.5rem !important; }\n    .webcg-devtools .mr-sm-2,\n    .webcg-devtools .mx-sm-2 {\n      margin-right: 0.5rem !important; }\n    .webcg-devtools .mb-sm-2,\n    .webcg-devtools .my-sm-2 {\n      margin-bottom: 0.5rem !important; }\n    .webcg-devtools .ml-sm-2,\n    .webcg-devtools .mx-sm-2 {\n      margin-left: 0.5rem !important; }\n    .webcg-devtools .m-sm-3 {\n      margin: 1rem !important; }\n    .webcg-devtools .mt-sm-3,\n    .webcg-devtools .my-sm-3 {\n      margin-top: 1rem !important; }\n    .webcg-devtools .mr-sm-3,\n    .webcg-devtools .mx-sm-3 {\n      margin-right: 1rem !important; }\n    .webcg-devtools .mb-sm-3,\n    .webcg-devtools .my-sm-3 {\n      margin-bottom: 1rem !important; }\n    .webcg-devtools .ml-sm-3,\n    .webcg-devtools .mx-sm-3 {\n      margin-left: 1rem !important; }\n    .webcg-devtools .m-sm-4 {\n      margin: 1.5rem !important; }\n    .webcg-devtools .mt-sm-4,\n    .webcg-devtools .my-sm-4 {\n      margin-top: 1.5rem !important; }\n    .webcg-devtools .mr-sm-4,\n    .webcg-devtools .mx-sm-4 {\n      margin-right: 1.5rem !important; }\n    .webcg-devtools .mb-sm-4,\n    .webcg-devtools .my-sm-4 {\n      margin-bottom: 1.5rem !important; }\n    .webcg-devtools .ml-sm-4,\n    .webcg-devtools .mx-sm-4 {\n      margin-left: 1.5rem !important; }\n    .webcg-devtools .m-sm-5 {\n      margin: 3rem !important; }\n    .webcg-devtools .mt-sm-5,\n    .webcg-devtools .my-sm-5 {\n      margin-top: 3rem !important; }\n    .webcg-devtools .mr-sm-5,\n    .webcg-devtools .mx-sm-5 {\n      margin-right: 3rem !important; }\n    .webcg-devtools .mb-sm-5,\n    .webcg-devtools .my-sm-5 {\n      margin-bottom: 3rem !important; }\n    .webcg-devtools .ml-sm-5,\n    .webcg-devtools .mx-sm-5 {\n      margin-left: 3rem !important; }\n    .webcg-devtools .p-sm-0 {\n      padding: 0 !important; }\n    .webcg-devtools .pt-sm-0,\n    .webcg-devtools .py-sm-0 {\n      padding-top: 0 !important; }\n    .webcg-devtools .pr-sm-0,\n    .webcg-devtools .px-sm-0 {\n      padding-right: 0 !important; }\n    .webcg-devtools .pb-sm-0,\n    .webcg-devtools .py-sm-0 {\n      padding-bottom: 0 !important; }\n    .webcg-devtools .pl-sm-0,\n    .webcg-devtools .px-sm-0 {\n      padding-left: 0 !important; }\n    .webcg-devtools .p-sm-1 {\n      padding: 0.25rem !important; }\n    .webcg-devtools .pt-sm-1,\n    .webcg-devtools .py-sm-1 {\n      padding-top: 0.25rem !important; }\n    .webcg-devtools .pr-sm-1,\n    .webcg-devtools .px-sm-1 {\n      padding-right: 0.25rem !important; }\n    .webcg-devtools .pb-sm-1,\n    .webcg-devtools .py-sm-1 {\n      padding-bottom: 0.25rem !important; }\n    .webcg-devtools .pl-sm-1,\n    .webcg-devtools .px-sm-1 {\n      padding-left: 0.25rem !important; }\n    .webcg-devtools .p-sm-2 {\n      padding: 0.5rem !important; }\n    .webcg-devtools .pt-sm-2,\n    .webcg-devtools .py-sm-2 {\n      padding-top: 0.5rem !important; }\n    .webcg-devtools .pr-sm-2,\n    .webcg-devtools .px-sm-2 {\n      padding-right: 0.5rem !important; }\n    .webcg-devtools .pb-sm-2,\n    .webcg-devtools .py-sm-2 {\n      padding-bottom: 0.5rem !important; }\n    .webcg-devtools .pl-sm-2,\n    .webcg-devtools .px-sm-2 {\n      padding-left: 0.5rem !important; }\n    .webcg-devtools .p-sm-3 {\n      padding: 1rem !important; }\n    .webcg-devtools .pt-sm-3,\n    .webcg-devtools .py-sm-3 {\n      padding-top: 1rem !important; }\n    .webcg-devtools .pr-sm-3,\n    .webcg-devtools .px-sm-3 {\n      padding-right: 1rem !important; }\n    .webcg-devtools .pb-sm-3,\n    .webcg-devtools .py-sm-3 {\n      padding-bottom: 1rem !important; }\n    .webcg-devtools .pl-sm-3,\n    .webcg-devtools .px-sm-3 {\n      padding-left: 1rem !important; }\n    .webcg-devtools .p-sm-4 {\n      padding: 1.5rem !important; }\n    .webcg-devtools .pt-sm-4,\n    .webcg-devtools .py-sm-4 {\n      padding-top: 1.5rem !important; }\n    .webcg-devtools .pr-sm-4,\n    .webcg-devtools .px-sm-4 {\n      padding-right: 1.5rem !important; }\n    .webcg-devtools .pb-sm-4,\n    .webcg-devtools .py-sm-4 {\n      padding-bottom: 1.5rem !important; }\n    .webcg-devtools .pl-sm-4,\n    .webcg-devtools .px-sm-4 {\n      padding-left: 1.5rem !important; }\n    .webcg-devtools .p-sm-5 {\n      padding: 3rem !important; }\n    .webcg-devtools .pt-sm-5,\n    .webcg-devtools .py-sm-5 {\n      padding-top: 3rem !important; }\n    .webcg-devtools .pr-sm-5,\n    .webcg-devtools .px-sm-5 {\n      padding-right: 3rem !important; }\n    .webcg-devtools .pb-sm-5,\n    .webcg-devtools .py-sm-5 {\n      padding-bottom: 3rem !important; }\n    .webcg-devtools .pl-sm-5,\n    .webcg-devtools .px-sm-5 {\n      padding-left: 3rem !important; }\n    .webcg-devtools .m-sm-auto {\n      margin: auto !important; }\n    .webcg-devtools .mt-sm-auto,\n    .webcg-devtools .my-sm-auto {\n      margin-top: auto !important; }\n    .webcg-devtools .mr-sm-auto,\n    .webcg-devtools .mx-sm-auto {\n      margin-right: auto !important; }\n    .webcg-devtools .mb-sm-auto,\n    .webcg-devtools .my-sm-auto {\n      margin-bottom: auto !important; }\n    .webcg-devtools .ml-sm-auto,\n    .webcg-devtools .mx-sm-auto {\n      margin-left: auto !important; } }\n  @media (min-width: 768px) {\n    .webcg-devtools .m-md-0 {\n      margin: 0 !important; }\n    .webcg-devtools .mt-md-0,\n    .webcg-devtools .my-md-0 {\n      margin-top: 0 !important; }\n    .webcg-devtools .mr-md-0,\n    .webcg-devtools .mx-md-0 {\n      margin-right: 0 !important; }\n    .webcg-devtools .mb-md-0,\n    .webcg-devtools .my-md-0 {\n      margin-bottom: 0 !important; }\n    .webcg-devtools .ml-md-0,\n    .webcg-devtools .mx-md-0 {\n      margin-left: 0 !important; }\n    .webcg-devtools .m-md-1 {\n      margin: 0.25rem !important; }\n    .webcg-devtools .mt-md-1,\n    .webcg-devtools .my-md-1 {\n      margin-top: 0.25rem !important; }\n    .webcg-devtools .mr-md-1,\n    .webcg-devtools .mx-md-1 {\n      margin-right: 0.25rem !important; }\n    .webcg-devtools .mb-md-1,\n    .webcg-devtools .my-md-1 {\n      margin-bottom: 0.25rem !important; }\n    .webcg-devtools .ml-md-1,\n    .webcg-devtools .mx-md-1 {\n      margin-left: 0.25rem !important; }\n    .webcg-devtools .m-md-2 {\n      margin: 0.5rem !important; }\n    .webcg-devtools .mt-md-2,\n    .webcg-devtools .my-md-2 {\n      margin-top: 0.5rem !important; }\n    .webcg-devtools .mr-md-2,\n    .webcg-devtools .mx-md-2 {\n      margin-right: 0.5rem !important; }\n    .webcg-devtools .mb-md-2,\n    .webcg-devtools .my-md-2 {\n      margin-bottom: 0.5rem !important; }\n    .webcg-devtools .ml-md-2,\n    .webcg-devtools .mx-md-2 {\n      margin-left: 0.5rem !important; }\n    .webcg-devtools .m-md-3 {\n      margin: 1rem !important; }\n    .webcg-devtools .mt-md-3,\n    .webcg-devtools .my-md-3 {\n      margin-top: 1rem !important; }\n    .webcg-devtools .mr-md-3,\n    .webcg-devtools .mx-md-3 {\n      margin-right: 1rem !important; }\n    .webcg-devtools .mb-md-3,\n    .webcg-devtools .my-md-3 {\n      margin-bottom: 1rem !important; }\n    .webcg-devtools .ml-md-3,\n    .webcg-devtools .mx-md-3 {\n      margin-left: 1rem !important; }\n    .webcg-devtools .m-md-4 {\n      margin: 1.5rem !important; }\n    .webcg-devtools .mt-md-4,\n    .webcg-devtools .my-md-4 {\n      margin-top: 1.5rem !important; }\n    .webcg-devtools .mr-md-4,\n    .webcg-devtools .mx-md-4 {\n      margin-right: 1.5rem !important; }\n    .webcg-devtools .mb-md-4,\n    .webcg-devtools .my-md-4 {\n      margin-bottom: 1.5rem !important; }\n    .webcg-devtools .ml-md-4,\n    .webcg-devtools .mx-md-4 {\n      margin-left: 1.5rem !important; }\n    .webcg-devtools .m-md-5 {\n      margin: 3rem !important; }\n    .webcg-devtools .mt-md-5,\n    .webcg-devtools .my-md-5 {\n      margin-top: 3rem !important; }\n    .webcg-devtools .mr-md-5,\n    .webcg-devtools .mx-md-5 {\n      margin-right: 3rem !important; }\n    .webcg-devtools .mb-md-5,\n    .webcg-devtools .my-md-5 {\n      margin-bottom: 3rem !important; }\n    .webcg-devtools .ml-md-5,\n    .webcg-devtools .mx-md-5 {\n      margin-left: 3rem !important; }\n    .webcg-devtools .p-md-0 {\n      padding: 0 !important; }\n    .webcg-devtools .pt-md-0,\n    .webcg-devtools .py-md-0 {\n      padding-top: 0 !important; }\n    .webcg-devtools .pr-md-0,\n    .webcg-devtools .px-md-0 {\n      padding-right: 0 !important; }\n    .webcg-devtools .pb-md-0,\n    .webcg-devtools .py-md-0 {\n      padding-bottom: 0 !important; }\n    .webcg-devtools .pl-md-0,\n    .webcg-devtools .px-md-0 {\n      padding-left: 0 !important; }\n    .webcg-devtools .p-md-1 {\n      padding: 0.25rem !important; }\n    .webcg-devtools .pt-md-1,\n    .webcg-devtools .py-md-1 {\n      padding-top: 0.25rem !important; }\n    .webcg-devtools .pr-md-1,\n    .webcg-devtools .px-md-1 {\n      padding-right: 0.25rem !important; }\n    .webcg-devtools .pb-md-1,\n    .webcg-devtools .py-md-1 {\n      padding-bottom: 0.25rem !important; }\n    .webcg-devtools .pl-md-1,\n    .webcg-devtools .px-md-1 {\n      padding-left: 0.25rem !important; }\n    .webcg-devtools .p-md-2 {\n      padding: 0.5rem !important; }\n    .webcg-devtools .pt-md-2,\n    .webcg-devtools .py-md-2 {\n      padding-top: 0.5rem !important; }\n    .webcg-devtools .pr-md-2,\n    .webcg-devtools .px-md-2 {\n      padding-right: 0.5rem !important; }\n    .webcg-devtools .pb-md-2,\n    .webcg-devtools .py-md-2 {\n      padding-bottom: 0.5rem !important; }\n    .webcg-devtools .pl-md-2,\n    .webcg-devtools .px-md-2 {\n      padding-left: 0.5rem !important; }\n    .webcg-devtools .p-md-3 {\n      padding: 1rem !important; }\n    .webcg-devtools .pt-md-3,\n    .webcg-devtools .py-md-3 {\n      padding-top: 1rem !important; }\n    .webcg-devtools .pr-md-3,\n    .webcg-devtools .px-md-3 {\n      padding-right: 1rem !important; }\n    .webcg-devtools .pb-md-3,\n    .webcg-devtools .py-md-3 {\n      padding-bottom: 1rem !important; }\n    .webcg-devtools .pl-md-3,\n    .webcg-devtools .px-md-3 {\n      padding-left: 1rem !important; }\n    .webcg-devtools .p-md-4 {\n      padding: 1.5rem !important; }\n    .webcg-devtools .pt-md-4,\n    .webcg-devtools .py-md-4 {\n      padding-top: 1.5rem !important; }\n    .webcg-devtools .pr-md-4,\n    .webcg-devtools .px-md-4 {\n      padding-right: 1.5rem !important; }\n    .webcg-devtools .pb-md-4,\n    .webcg-devtools .py-md-4 {\n      padding-bottom: 1.5rem !important; }\n    .webcg-devtools .pl-md-4,\n    .webcg-devtools .px-md-4 {\n      padding-left: 1.5rem !important; }\n    .webcg-devtools .p-md-5 {\n      padding: 3rem !important; }\n    .webcg-devtools .pt-md-5,\n    .webcg-devtools .py-md-5 {\n      padding-top: 3rem !important; }\n    .webcg-devtools .pr-md-5,\n    .webcg-devtools .px-md-5 {\n      padding-right: 3rem !important; }\n    .webcg-devtools .pb-md-5,\n    .webcg-devtools .py-md-5 {\n      padding-bottom: 3rem !important; }\n    .webcg-devtools .pl-md-5,\n    .webcg-devtools .px-md-5 {\n      padding-left: 3rem !important; }\n    .webcg-devtools .m-md-auto {\n      margin: auto !important; }\n    .webcg-devtools .mt-md-auto,\n    .webcg-devtools .my-md-auto {\n      margin-top: auto !important; }\n    .webcg-devtools .mr-md-auto,\n    .webcg-devtools .mx-md-auto {\n      margin-right: auto !important; }\n    .webcg-devtools .mb-md-auto,\n    .webcg-devtools .my-md-auto {\n      margin-bottom: auto !important; }\n    .webcg-devtools .ml-md-auto,\n    .webcg-devtools .mx-md-auto {\n      margin-left: auto !important; } }\n  @media (min-width: 992px) {\n    .webcg-devtools .m-lg-0 {\n      margin: 0 !important; }\n    .webcg-devtools .mt-lg-0,\n    .webcg-devtools .my-lg-0 {\n      margin-top: 0 !important; }\n    .webcg-devtools .mr-lg-0,\n    .webcg-devtools .mx-lg-0 {\n      margin-right: 0 !important; }\n    .webcg-devtools .mb-lg-0,\n    .webcg-devtools .my-lg-0 {\n      margin-bottom: 0 !important; }\n    .webcg-devtools .ml-lg-0,\n    .webcg-devtools .mx-lg-0 {\n      margin-left: 0 !important; }\n    .webcg-devtools .m-lg-1 {\n      margin: 0.25rem !important; }\n    .webcg-devtools .mt-lg-1,\n    .webcg-devtools .my-lg-1 {\n      margin-top: 0.25rem !important; }\n    .webcg-devtools .mr-lg-1,\n    .webcg-devtools .mx-lg-1 {\n      margin-right: 0.25rem !important; }\n    .webcg-devtools .mb-lg-1,\n    .webcg-devtools .my-lg-1 {\n      margin-bottom: 0.25rem !important; }\n    .webcg-devtools .ml-lg-1,\n    .webcg-devtools .mx-lg-1 {\n      margin-left: 0.25rem !important; }\n    .webcg-devtools .m-lg-2 {\n      margin: 0.5rem !important; }\n    .webcg-devtools .mt-lg-2,\n    .webcg-devtools .my-lg-2 {\n      margin-top: 0.5rem !important; }\n    .webcg-devtools .mr-lg-2,\n    .webcg-devtools .mx-lg-2 {\n      margin-right: 0.5rem !important; }\n    .webcg-devtools .mb-lg-2,\n    .webcg-devtools .my-lg-2 {\n      margin-bottom: 0.5rem !important; }\n    .webcg-devtools .ml-lg-2,\n    .webcg-devtools .mx-lg-2 {\n      margin-left: 0.5rem !important; }\n    .webcg-devtools .m-lg-3 {\n      margin: 1rem !important; }\n    .webcg-devtools .mt-lg-3,\n    .webcg-devtools .my-lg-3 {\n      margin-top: 1rem !important; }\n    .webcg-devtools .mr-lg-3,\n    .webcg-devtools .mx-lg-3 {\n      margin-right: 1rem !important; }\n    .webcg-devtools .mb-lg-3,\n    .webcg-devtools .my-lg-3 {\n      margin-bottom: 1rem !important; }\n    .webcg-devtools .ml-lg-3,\n    .webcg-devtools .mx-lg-3 {\n      margin-left: 1rem !important; }\n    .webcg-devtools .m-lg-4 {\n      margin: 1.5rem !important; }\n    .webcg-devtools .mt-lg-4,\n    .webcg-devtools .my-lg-4 {\n      margin-top: 1.5rem !important; }\n    .webcg-devtools .mr-lg-4,\n    .webcg-devtools .mx-lg-4 {\n      margin-right: 1.5rem !important; }\n    .webcg-devtools .mb-lg-4,\n    .webcg-devtools .my-lg-4 {\n      margin-bottom: 1.5rem !important; }\n    .webcg-devtools .ml-lg-4,\n    .webcg-devtools .mx-lg-4 {\n      margin-left: 1.5rem !important; }\n    .webcg-devtools .m-lg-5 {\n      margin: 3rem !important; }\n    .webcg-devtools .mt-lg-5,\n    .webcg-devtools .my-lg-5 {\n      margin-top: 3rem !important; }\n    .webcg-devtools .mr-lg-5,\n    .webcg-devtools .mx-lg-5 {\n      margin-right: 3rem !important; }\n    .webcg-devtools .mb-lg-5,\n    .webcg-devtools .my-lg-5 {\n      margin-bottom: 3rem !important; }\n    .webcg-devtools .ml-lg-5,\n    .webcg-devtools .mx-lg-5 {\n      margin-left: 3rem !important; }\n    .webcg-devtools .p-lg-0 {\n      padding: 0 !important; }\n    .webcg-devtools .pt-lg-0,\n    .webcg-devtools .py-lg-0 {\n      padding-top: 0 !important; }\n    .webcg-devtools .pr-lg-0,\n    .webcg-devtools .px-lg-0 {\n      padding-right: 0 !important; }\n    .webcg-devtools .pb-lg-0,\n    .webcg-devtools .py-lg-0 {\n      padding-bottom: 0 !important; }\n    .webcg-devtools .pl-lg-0,\n    .webcg-devtools .px-lg-0 {\n      padding-left: 0 !important; }\n    .webcg-devtools .p-lg-1 {\n      padding: 0.25rem !important; }\n    .webcg-devtools .pt-lg-1,\n    .webcg-devtools .py-lg-1 {\n      padding-top: 0.25rem !important; }\n    .webcg-devtools .pr-lg-1,\n    .webcg-devtools .px-lg-1 {\n      padding-right: 0.25rem !important; }\n    .webcg-devtools .pb-lg-1,\n    .webcg-devtools .py-lg-1 {\n      padding-bottom: 0.25rem !important; }\n    .webcg-devtools .pl-lg-1,\n    .webcg-devtools .px-lg-1 {\n      padding-left: 0.25rem !important; }\n    .webcg-devtools .p-lg-2 {\n      padding: 0.5rem !important; }\n    .webcg-devtools .pt-lg-2,\n    .webcg-devtools .py-lg-2 {\n      padding-top: 0.5rem !important; }\n    .webcg-devtools .pr-lg-2,\n    .webcg-devtools .px-lg-2 {\n      padding-right: 0.5rem !important; }\n    .webcg-devtools .pb-lg-2,\n    .webcg-devtools .py-lg-2 {\n      padding-bottom: 0.5rem !important; }\n    .webcg-devtools .pl-lg-2,\n    .webcg-devtools .px-lg-2 {\n      padding-left: 0.5rem !important; }\n    .webcg-devtools .p-lg-3 {\n      padding: 1rem !important; }\n    .webcg-devtools .pt-lg-3,\n    .webcg-devtools .py-lg-3 {\n      padding-top: 1rem !important; }\n    .webcg-devtools .pr-lg-3,\n    .webcg-devtools .px-lg-3 {\n      padding-right: 1rem !important; }\n    .webcg-devtools .pb-lg-3,\n    .webcg-devtools .py-lg-3 {\n      padding-bottom: 1rem !important; }\n    .webcg-devtools .pl-lg-3,\n    .webcg-devtools .px-lg-3 {\n      padding-left: 1rem !important; }\n    .webcg-devtools .p-lg-4 {\n      padding: 1.5rem !important; }\n    .webcg-devtools .pt-lg-4,\n    .webcg-devtools .py-lg-4 {\n      padding-top: 1.5rem !important; }\n    .webcg-devtools .pr-lg-4,\n    .webcg-devtools .px-lg-4 {\n      padding-right: 1.5rem !important; }\n    .webcg-devtools .pb-lg-4,\n    .webcg-devtools .py-lg-4 {\n      padding-bottom: 1.5rem !important; }\n    .webcg-devtools .pl-lg-4,\n    .webcg-devtools .px-lg-4 {\n      padding-left: 1.5rem !important; }\n    .webcg-devtools .p-lg-5 {\n      padding: 3rem !important; }\n    .webcg-devtools .pt-lg-5,\n    .webcg-devtools .py-lg-5 {\n      padding-top: 3rem !important; }\n    .webcg-devtools .pr-lg-5,\n    .webcg-devtools .px-lg-5 {\n      padding-right: 3rem !important; }\n    .webcg-devtools .pb-lg-5,\n    .webcg-devtools .py-lg-5 {\n      padding-bottom: 3rem !important; }\n    .webcg-devtools .pl-lg-5,\n    .webcg-devtools .px-lg-5 {\n      padding-left: 3rem !important; }\n    .webcg-devtools .m-lg-auto {\n      margin: auto !important; }\n    .webcg-devtools .mt-lg-auto,\n    .webcg-devtools .my-lg-auto {\n      margin-top: auto !important; }\n    .webcg-devtools .mr-lg-auto,\n    .webcg-devtools .mx-lg-auto {\n      margin-right: auto !important; }\n    .webcg-devtools .mb-lg-auto,\n    .webcg-devtools .my-lg-auto {\n      margin-bottom: auto !important; }\n    .webcg-devtools .ml-lg-auto,\n    .webcg-devtools .mx-lg-auto {\n      margin-left: auto !important; } }\n  @media (min-width: 1200px) {\n    .webcg-devtools .m-xl-0 {\n      margin: 0 !important; }\n    .webcg-devtools .mt-xl-0,\n    .webcg-devtools .my-xl-0 {\n      margin-top: 0 !important; }\n    .webcg-devtools .mr-xl-0,\n    .webcg-devtools .mx-xl-0 {\n      margin-right: 0 !important; }\n    .webcg-devtools .mb-xl-0,\n    .webcg-devtools .my-xl-0 {\n      margin-bottom: 0 !important; }\n    .webcg-devtools .ml-xl-0,\n    .webcg-devtools .mx-xl-0 {\n      margin-left: 0 !important; }\n    .webcg-devtools .m-xl-1 {\n      margin: 0.25rem !important; }\n    .webcg-devtools .mt-xl-1,\n    .webcg-devtools .my-xl-1 {\n      margin-top: 0.25rem !important; }\n    .webcg-devtools .mr-xl-1,\n    .webcg-devtools .mx-xl-1 {\n      margin-right: 0.25rem !important; }\n    .webcg-devtools .mb-xl-1,\n    .webcg-devtools .my-xl-1 {\n      margin-bottom: 0.25rem !important; }\n    .webcg-devtools .ml-xl-1,\n    .webcg-devtools .mx-xl-1 {\n      margin-left: 0.25rem !important; }\n    .webcg-devtools .m-xl-2 {\n      margin: 0.5rem !important; }\n    .webcg-devtools .mt-xl-2,\n    .webcg-devtools .my-xl-2 {\n      margin-top: 0.5rem !important; }\n    .webcg-devtools .mr-xl-2,\n    .webcg-devtools .mx-xl-2 {\n      margin-right: 0.5rem !important; }\n    .webcg-devtools .mb-xl-2,\n    .webcg-devtools .my-xl-2 {\n      margin-bottom: 0.5rem !important; }\n    .webcg-devtools .ml-xl-2,\n    .webcg-devtools .mx-xl-2 {\n      margin-left: 0.5rem !important; }\n    .webcg-devtools .m-xl-3 {\n      margin: 1rem !important; }\n    .webcg-devtools .mt-xl-3,\n    .webcg-devtools .my-xl-3 {\n      margin-top: 1rem !important; }\n    .webcg-devtools .mr-xl-3,\n    .webcg-devtools .mx-xl-3 {\n      margin-right: 1rem !important; }\n    .webcg-devtools .mb-xl-3,\n    .webcg-devtools .my-xl-3 {\n      margin-bottom: 1rem !important; }\n    .webcg-devtools .ml-xl-3,\n    .webcg-devtools .mx-xl-3 {\n      margin-left: 1rem !important; }\n    .webcg-devtools .m-xl-4 {\n      margin: 1.5rem !important; }\n    .webcg-devtools .mt-xl-4,\n    .webcg-devtools .my-xl-4 {\n      margin-top: 1.5rem !important; }\n    .webcg-devtools .mr-xl-4,\n    .webcg-devtools .mx-xl-4 {\n      margin-right: 1.5rem !important; }\n    .webcg-devtools .mb-xl-4,\n    .webcg-devtools .my-xl-4 {\n      margin-bottom: 1.5rem !important; }\n    .webcg-devtools .ml-xl-4,\n    .webcg-devtools .mx-xl-4 {\n      margin-left: 1.5rem !important; }\n    .webcg-devtools .m-xl-5 {\n      margin: 3rem !important; }\n    .webcg-devtools .mt-xl-5,\n    .webcg-devtools .my-xl-5 {\n      margin-top: 3rem !important; }\n    .webcg-devtools .mr-xl-5,\n    .webcg-devtools .mx-xl-5 {\n      margin-right: 3rem !important; }\n    .webcg-devtools .mb-xl-5,\n    .webcg-devtools .my-xl-5 {\n      margin-bottom: 3rem !important; }\n    .webcg-devtools .ml-xl-5,\n    .webcg-devtools .mx-xl-5 {\n      margin-left: 3rem !important; }\n    .webcg-devtools .p-xl-0 {\n      padding: 0 !important; }\n    .webcg-devtools .pt-xl-0,\n    .webcg-devtools .py-xl-0 {\n      padding-top: 0 !important; }\n    .webcg-devtools .pr-xl-0,\n    .webcg-devtools .px-xl-0 {\n      padding-right: 0 !important; }\n    .webcg-devtools .pb-xl-0,\n    .webcg-devtools .py-xl-0 {\n      padding-bottom: 0 !important; }\n    .webcg-devtools .pl-xl-0,\n    .webcg-devtools .px-xl-0 {\n      padding-left: 0 !important; }\n    .webcg-devtools .p-xl-1 {\n      padding: 0.25rem !important; }\n    .webcg-devtools .pt-xl-1,\n    .webcg-devtools .py-xl-1 {\n      padding-top: 0.25rem !important; }\n    .webcg-devtools .pr-xl-1,\n    .webcg-devtools .px-xl-1 {\n      padding-right: 0.25rem !important; }\n    .webcg-devtools .pb-xl-1,\n    .webcg-devtools .py-xl-1 {\n      padding-bottom: 0.25rem !important; }\n    .webcg-devtools .pl-xl-1,\n    .webcg-devtools .px-xl-1 {\n      padding-left: 0.25rem !important; }\n    .webcg-devtools .p-xl-2 {\n      padding: 0.5rem !important; }\n    .webcg-devtools .pt-xl-2,\n    .webcg-devtools .py-xl-2 {\n      padding-top: 0.5rem !important; }\n    .webcg-devtools .pr-xl-2,\n    .webcg-devtools .px-xl-2 {\n      padding-right: 0.5rem !important; }\n    .webcg-devtools .pb-xl-2,\n    .webcg-devtools .py-xl-2 {\n      padding-bottom: 0.5rem !important; }\n    .webcg-devtools .pl-xl-2,\n    .webcg-devtools .px-xl-2 {\n      padding-left: 0.5rem !important; }\n    .webcg-devtools .p-xl-3 {\n      padding: 1rem !important; }\n    .webcg-devtools .pt-xl-3,\n    .webcg-devtools .py-xl-3 {\n      padding-top: 1rem !important; }\n    .webcg-devtools .pr-xl-3,\n    .webcg-devtools .px-xl-3 {\n      padding-right: 1rem !important; }\n    .webcg-devtools .pb-xl-3,\n    .webcg-devtools .py-xl-3 {\n      padding-bottom: 1rem !important; }\n    .webcg-devtools .pl-xl-3,\n    .webcg-devtools .px-xl-3 {\n      padding-left: 1rem !important; }\n    .webcg-devtools .p-xl-4 {\n      padding: 1.5rem !important; }\n    .webcg-devtools .pt-xl-4,\n    .webcg-devtools .py-xl-4 {\n      padding-top: 1.5rem !important; }\n    .webcg-devtools .pr-xl-4,\n    .webcg-devtools .px-xl-4 {\n      padding-right: 1.5rem !important; }\n    .webcg-devtools .pb-xl-4,\n    .webcg-devtools .py-xl-4 {\n      padding-bottom: 1.5rem !important; }\n    .webcg-devtools .pl-xl-4,\n    .webcg-devtools .px-xl-4 {\n      padding-left: 1.5rem !important; }\n    .webcg-devtools .p-xl-5 {\n      padding: 3rem !important; }\n    .webcg-devtools .pt-xl-5,\n    .webcg-devtools .py-xl-5 {\n      padding-top: 3rem !important; }\n    .webcg-devtools .pr-xl-5,\n    .webcg-devtools .px-xl-5 {\n      padding-right: 3rem !important; }\n    .webcg-devtools .pb-xl-5,\n    .webcg-devtools .py-xl-5 {\n      padding-bottom: 3rem !important; }\n    .webcg-devtools .pl-xl-5,\n    .webcg-devtools .px-xl-5 {\n      padding-left: 3rem !important; }\n    .webcg-devtools .m-xl-auto {\n      margin: auto !important; }\n    .webcg-devtools .mt-xl-auto,\n    .webcg-devtools .my-xl-auto {\n      margin-top: auto !important; }\n    .webcg-devtools .mr-xl-auto,\n    .webcg-devtools .mx-xl-auto {\n      margin-right: auto !important; }\n    .webcg-devtools .mb-xl-auto,\n    .webcg-devtools .my-xl-auto {\n      margin-bottom: auto !important; }\n    .webcg-devtools .ml-xl-auto,\n    .webcg-devtools .mx-xl-auto {\n      margin-left: auto !important; } }\n  .webcg-devtools .text-monospace {\n    font-family: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; }\n  .webcg-devtools .text-justify {\n    text-align: justify !important; }\n  .webcg-devtools .text-nowrap {\n    white-space: nowrap !important; }\n  .webcg-devtools .text-truncate {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap; }\n  .webcg-devtools .text-left {\n    text-align: left !important; }\n  .webcg-devtools .text-right {\n    text-align: right !important; }\n  .webcg-devtools .text-center {\n    text-align: center !important; }\n  @media (min-width: 576px) {\n    .webcg-devtools .text-sm-left {\n      text-align: left !important; }\n    .webcg-devtools .text-sm-right {\n      text-align: right !important; }\n    .webcg-devtools .text-sm-center {\n      text-align: center !important; } }\n  @media (min-width: 768px) {\n    .webcg-devtools .text-md-left {\n      text-align: left !important; }\n    .webcg-devtools .text-md-right {\n      text-align: right !important; }\n    .webcg-devtools .text-md-center {\n      text-align: center !important; } }\n  @media (min-width: 992px) {\n    .webcg-devtools .text-lg-left {\n      text-align: left !important; }\n    .webcg-devtools .text-lg-right {\n      text-align: right !important; }\n    .webcg-devtools .text-lg-center {\n      text-align: center !important; } }\n  @media (min-width: 1200px) {\n    .webcg-devtools .text-xl-left {\n      text-align: left !important; }\n    .webcg-devtools .text-xl-right {\n      text-align: right !important; }\n    .webcg-devtools .text-xl-center {\n      text-align: center !important; } }\n  .webcg-devtools .text-lowercase {\n    text-transform: lowercase !important; }\n  .webcg-devtools .text-uppercase {\n    text-transform: uppercase !important; }\n  .webcg-devtools .text-capitalize {\n    text-transform: capitalize !important; }\n  .webcg-devtools .font-weight-light {\n    font-weight: 300 !important; }\n  .webcg-devtools .font-weight-normal {\n    font-weight: 400 !important; }\n  .webcg-devtools .font-weight-bold {\n    font-weight: 700 !important; }\n  .webcg-devtools .font-italic {\n    font-style: italic !important; }\n  .webcg-devtools .text-white {\n    color: #fff !important; }\n  .webcg-devtools .text-primary {\n    color: #007bff !important; }\n  .webcg-devtools a.text-primary:hover, .webcg-devtools a.text-primary:focus {\n    color: #0062cc !important; }\n  .webcg-devtools .text-secondary {\n    color: #6c757d !important; }\n  .webcg-devtools a.text-secondary:hover, .webcg-devtools a.text-secondary:focus {\n    color: #545b62 !important; }\n  .webcg-devtools .text-success {\n    color: #28a745 !important; }\n  .webcg-devtools a.text-success:hover, .webcg-devtools a.text-success:focus {\n    color: #1e7e34 !important; }\n  .webcg-devtools .text-info {\n    color: #17a2b8 !important; }\n  .webcg-devtools a.text-info:hover, .webcg-devtools a.text-info:focus {\n    color: #117a8b !important; }\n  .webcg-devtools .text-warning {\n    color: #ffc107 !important; }\n  .webcg-devtools a.text-warning:hover, .webcg-devtools a.text-warning:focus {\n    color: #d39e00 !important; }\n  .webcg-devtools .text-danger {\n    color: #dc3545 !important; }\n  .webcg-devtools a.text-danger:hover, .webcg-devtools a.text-danger:focus {\n    color: #bd2130 !important; }\n  .webcg-devtools .text-light {\n    color: #f8f9fa !important; }\n  .webcg-devtools a.text-light:hover, .webcg-devtools a.text-light:focus {\n    color: #dae0e5 !important; }\n  .webcg-devtools .text-dark {\n    color: #343a40 !important; }\n  .webcg-devtools a.text-dark:hover, .webcg-devtools a.text-dark:focus {\n    color: #1d2124 !important; }\n  .webcg-devtools .text-body {\n    color: #212529 !important; }\n  .webcg-devtools .text-muted {\n    color: #6c757d !important; }\n  .webcg-devtools .text-black-50 {\n    color: rgba(0, 0, 0, 0.5) !important; }\n  .webcg-devtools .text-white-50 {\n    color: rgba(255, 255, 255, 0.5) !important; }\n  .webcg-devtools .text-hide {\n    font: 0/0 a;\n    color: transparent;\n    text-shadow: none;\n    background-color: transparent;\n    border: 0; }\n  .webcg-devtools .visible {\n    visibility: visible !important; }\n  .webcg-devtools .invisible {\n    visibility: hidden !important; }\n  @media print {\n    .webcg-devtools *,\n    .webcg-devtools *::before,\n    .webcg-devtools *::after {\n      text-shadow: none !important;\n      box-shadow: none !important; }\n    .webcg-devtools a:not(.btn) {\n      text-decoration: underline; }\n    .webcg-devtools abbr[title]::after {\n      content: \" (\" attr(title) \")\"; }\n    .webcg-devtools pre {\n      white-space: pre-wrap !important; }\n    .webcg-devtools pre,\n    .webcg-devtools blockquote {\n      border: 1px solid #adb5bd;\n      page-break-inside: avoid; }\n    .webcg-devtools thead {\n      display: table-header-group; }\n    .webcg-devtools tr,\n    .webcg-devtools img {\n      page-break-inside: avoid; }\n    .webcg-devtools p,\n    .webcg-devtools h2,\n    .webcg-devtools h3 {\n      orphans: 3;\n      widows: 3; }\n    .webcg-devtools h2,\n    .webcg-devtools h3 {\n      page-break-after: avoid; }\n    @page {\n      .webcg-devtools {\n        size: a3; } }\n    .webcg-devtools body {\n      min-width: 992px !important; }\n    .webcg-devtools .container {\n      min-width: 992px !important; }\n    .webcg-devtools .navbar {\n      display: none; }\n    .webcg-devtools .badge {\n      border: 1px solid #000; }\n    .webcg-devtools .table {\n      border-collapse: collapse !important; }\n      .webcg-devtools .table td,\n      .webcg-devtools .table th {\n        background-color: #fff !important; }\n    .webcg-devtools .table-bordered th,\n    .webcg-devtools .table-bordered td {\n      border: 1px solid #dee2e6 !important; }\n    .webcg-devtools .table-dark {\n      color: inherit; }\n      .webcg-devtools .table-dark th,\n      .webcg-devtools .table-dark td,\n      .webcg-devtools .table-dark thead th,\n      .webcg-devtools .table-dark tbody + tbody {\n        border-color: #dee2e6; }\n    .webcg-devtools .table .thead-dark th {\n      color: inherit;\n      border-color: #dee2e6; } }\n  .webcg-devtools h1, .webcg-devtools h2, .webcg-devtools h3, .webcg-devtools h4, .webcg-devtools h5, .webcg-devtools h6,\n  .webcg-devtools .h1, .webcg-devtools .h2, .webcg-devtools .h3, .webcg-devtools .h4, .webcg-devtools .h5, .webcg-devtools .h6 {\n    margin-bottom: 8px;\n    /* 0.5rem */ }\n  .webcg-devtools h1, .webcg-devtools .h1 {\n    font-size: 40px;\n    /* 2.5rem */ }\n  .webcg-devtools h2, .webcg-devtools .h2 {\n    font-size: 32px;\n    /* 2rem */ }\n  .webcg-devtools h3, .webcg-devtools .h3 {\n    font-size: 28px;\n    /* 1.75rem */ }\n  .webcg-devtools h4, .webcg-devtools .h4 {\n    font-size: 24px;\n    /* 1.5rem */ }\n  .webcg-devtools h5, .webcg-devtools .h5 {\n    font-size: 20px;\n    /* 1.25rem */ }\n  .webcg-devtools h6, .webcg-devtools .h6 {\n    font-size: 16px;\n    /* 1rem */ }\n  .webcg-devtools .btn {\n    padding: 6px 12px;\n    /* 0.375rem 0.75rem */\n    font-size: 16px;\n    /* 1rem */\n    border-radius: 4px;\n    /* 0.25rem */ }\n  .webcg-devtools .btn-sm, .webcg-devtools .btn-group-sm > .btn {\n    padding: 4px 8px;\n    /* 0.25rem 0.5rem */\n    font-size: 14px;\n    /* 0.875rem */\n    border-radius: 3.2px; }\n  .webcg-devtools .btn:focus {\n    box-shadow: 0 0 0 3.2px rgba(0, 123, 255, 0.25);\n    /* 0.2rem */ }\n  .webcg-devtools .form-group {\n    margin-bottom: 16px;\n    /* 1rem */ }\n  .webcg-devtools .form-control {\n    height: 38px;\n    /* calc(2.25rem + 2px); */\n    padding: 6px 12px;\n    /* 0.375rem 0.75rem */\n    font-size: 16px;\n    /* 1rem */\n    border-radius: 4px;\n    /* 0.25rem */ }\n  .webcg-devtools .form-control:focus {\n    box-shadow: 0 0 0 3.2px rgba(0, 123, 255, 0.25);\n    /* 0.2rem */ }\n  .webcg-devtools .nav-tabs .nav-link {\n    border-top-left-radius: 4px;\n    /* 0.25rem */\n    border-top-right-radius: 4px;\n    /* 0.25rem */ }\n  .webcg-devtools .nav-link {\n    padding: 8px 16px;\n    /* 0.5rem 1rem */ }\n  .webcg-devtools .modal {\n    display: block;\n    top: auto;\n    right: auto;\n    bottom: auto;\n    left: auto; }\n  .webcg-devtools .modal-header {\n    padding: 16px;\n    /* 1rem */\n    border-top-left-radius: 4.8px;\n    /* 0.3rem */\n    border-top-right-radius: 4.8px;\n    /* 0.3rem */ }\n  .webcg-devtools .modal-body {\n    padding: 16px;\n    /* 1rem */ }\n  .webcg-devtools .modal-content {\n    border-radius: 4.8px;\n    /* 0.3rem */ }\n  .webcg-devtools .modal-footer {\n    padding: 16px;\n    /* 1rem */ }\n  .webcg-devtools .table {\n    margin-bottom: 16px;\n    /* 1rem */ }\n    .webcg-devtools .table th,\n    .webcg-devtools .table td {\n      padding: 12px;\n      /* 0.75rem */ }\n  .webcg-devtools .table-sm th,\n  .webcg-devtools .table-sm td {\n    padding: 4.8px;\n    /* 0.3rem */ }\n\n.webcg-devtools {\n  background: white;\n  color: black;\n  font-size: 16px;\n  line-height: normal; }\n  .webcg-devtools .btn-sm, .webcg-devtools .btn-group-sm > .btn {\n    min-width: 32px;\n    /* 2rem */ }\n  .webcg-devtools .flex-columns {\n    display: flex;\n    flex-direction: column;\n    flex: 1 0 auto; }\n  .webcg-devtools .form-row {\n    flex: 0 0 auto; }\n  .webcg-devtools .modal {\n    height: auto;\n    width: auto;\n    box-shadow: 0 20px 32px -8px rgba(9, 45, 66, 0.25); }\n    .webcg-devtools .modal .modal-content {\n      resize: both;\n      overflow: hidden;\n      height: 100%;\n      min-width: 410px;\n      min-height: 63px; }\n      .webcg-devtools .modal .modal-content .modal-header {\n        flex: 0 0 auto;\n        border-bottom: 0; }\n      .webcg-devtools .modal .modal-content .modal-navbar .nav {\n        padding: 0 16px;\n        /* 0 1rem */ }\n      .webcg-devtools .modal .modal-content .modal-body {\n        position: static;\n        display: flex;\n        flex-direction: column;\n        overflow: auto;\n        padding-bottom: 0; }\n      .webcg-devtools .modal .modal-content .modal-footer {\n        flex: 0 0 auto;\n        justify-content: center;\n        font-size: 12px; }\n  .webcg-devtools .draggable {\n    position: absolute;\n    z-index: auto; }\n  .webcg-devtools .drag-handle {\n    cursor: grab;\n    cursor: -webkit-grab; }\n  .webcg-devtools .dragging .drag-handle {\n    cursor: grabbing;\n    cursor: -webkit-grabbing; }\n\n/*# sourceMappingURL=dev-tools.vue.map */",null]}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__$5 = undefined;
    /* module identifier */
    var __vue_module_identifier__$5 = undefined;
    /* functional template */
    var __vue_is_functional_template__$5 = false;
    /* component normalizer */
    function __vue_normalize__$5(
      template, style, script,
      scope, functional, moduleIdentifier,
      createInjector, createInjectorSSR
    ) {
      var component = (typeof script === 'function' ? script.options : script) || {};

      // For security concerns, we use only base name in production mode.
      component.__file = "/home/reto/Projects/webcg/webcg-devtools/src/dev-tools.vue";

      if (!component.render) {
        component.render = template.render;
        component.staticRenderFns = template.staticRenderFns;
        component._compiled = true;

        if (functional) { component.functional = true; }
      }

      component._scopeId = scope;

      {
        var hook;
        if (style) {
          hook = function(context) {
            style.call(this, createInjector(context));
          };
        }

        if (hook !== undefined) {
          if (component.functional) {
            // register for functional component in vue file
            var originalRender = component.render;
            component.render = function renderWithStyleInjection(h, context) {
              hook.call(context);
              return originalRender(h, context)
            };
          } else {
            // inject component registration as beforeCreate hook
            var existing = component.beforeCreate;
            component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
        }
      }

      return component
    }
    /* style inject */
    function __vue_create_injector__$5() {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styles = __vue_create_injector__$5.styles || (__vue_create_injector__$5.styles = {});
      var isOldIE =
        typeof navigator !== 'undefined' &&
        /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

      return function addStyle(id, css) {
        if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

        var group = isOldIE ? css.media || 'default' : id;
        var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

        if (!style.ids.includes(id)) {
          var code = css.source;
          var index = style.ids.length;

          style.ids.push(id);

          if (isOldIE) {
            style.element = style.element || document.querySelector('style[data-group=' + group + ']');
          }

          if (!style.element) {
            var el = style.element = document.createElement('style');
            el.type = 'text/css';

            if (css.media) { el.setAttribute('media', css.media); }
            if (isOldIE) {
              el.setAttribute('data-group', group);
              el.setAttribute('data-next-index', '0');
            }

            head.appendChild(el);
          }

          if (isOldIE) {
            index = parseInt(style.element.getAttribute('data-next-index'));
            style.element.setAttribute('data-next-index', index + 1);
          }

          if (style.element.styleSheet) {
            style.parts.push(code);
            style.element.styleSheet.cssText = style.parts
              .filter(Boolean)
              .join('\n');
          } else {
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index]) { style.element.removeChild(nodes[index]); }
            if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
            else { style.element.appendChild(textNode); }
          }
        }
      }
    }
    /* style inject SSR */
    

    
    var DevTools = __vue_normalize__$5(
      { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
      __vue_inject_styles__$5,
      __vue_script__$5,
      __vue_scope_id__$5,
      __vue_is_functional_template__$5,
      __vue_module_identifier__$5,
      __vue_create_injector__$5,
      undefined
    );

  var Draggable = {
    install: function install (Vue) {
      Vue.prototype.$draggable = function (options) {
        options = Object.assign({}, {
          draggable: 'draggable',
          dragging: 'dragging',
          handle: 'drag-handle',
          dataOffsetX: 'data-drag-offset-x',
          dataOffsetY: 'data-drag-offset-y',
          ondragged: null
        }, options);

        var $handle = this.$el.querySelector('.' + options.handle);
        if (!$handle) { return }

        $handle.addEventListener('mousedown', function (e) {
          var $draggable = e.target.closest('.' + options.draggable);
          $draggable.classList.add(options.dragging);
          $draggable.setAttribute(options.dataOffsetX, e.clientX - $draggable.offsetLeft);
          $draggable.setAttribute(options.dataOffsetY, e.clientY - $draggable.offsetTop);
          e.preventDefault(); // prevent text selection
        });

        window.document.addEventListener('mousemove', function (e) {
          var $dragging = window.document.querySelector('.' + options.dragging);
          if ($dragging) {
            var top = e.clientY - Number.parseInt($dragging.getAttribute(options.dataOffsetY));
            var left = e.clientX - Number.parseInt($dragging.getAttribute(options.dataOffsetX));
            $dragging.style.top = top + 'px';
            $dragging.style.left = left + 'px';
          }
        });

        $handle.addEventListener('mouseup', function (e) {
          var $dragging = window.document.querySelector('.' + options.dragging);
          $dragging.removeAttribute(options.dataOffsetX);
          $dragging.removeAttribute(options.dataOffsetY);
          $dragging.classList.remove(options.dragging);
          // window.localStorage.setItem(KEY + '.top', self.$toolbox.css('top'));
          // window.localStorage.setItem(KEY + '.left', self.$toolbox.css('left'));
          if (typeof options.ondragged === 'function') {
            options.ondragged($dragging);
          }
        });
      };
    }
  };

  var Resizable = {
    install: function install (Vue) {
      Vue.prototype.$resizable = function (options) {
        options = Object.assign({}, {
          targetNode: null,
          onresized: null
        }, options);

        var oldWidth = options.targetNode.style.width;
        var oldHeight = options.targetNode.style.height;

        // Options for the observer (which mutations to observe)
        var config = { attributes: true, childList: false, subtree: false };

        // Callback function to execute when mutations are observed
        var callback = function () {
          var newWidth = options.targetNode.style.width;
          var newHeight = options.targetNode.style.height;
          if (newWidth !== oldWidth || newHeight !== oldHeight) {
            oldWidth = newWidth;
            oldHeight = newHeight;
            if (typeof options.onresized === 'function') {
              options.onresized(options.targetNode);
            }
          }
        };

        // Create an observer instance linked to the callback function
        var observer = new window.MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(options.targetNode, config);

        // Later, you can stop observing
        // observer.disconnect();
      };
    }
  };

  function readyFn () {
    Vue.use(Draggable);
    Vue.use(Resizable);
    var app = new Vue(DevTools).$mount();
    document.body.appendChild(app.$el);
  }

  /**
   * When required globally
   */
  if (typeof (window) !== 'undefined') {
    console.log('[webcg-devtools] version ' + version);
    ready(readyFn);
  }

  // @see http://youmightnotneedjquery.com/#ready
  function ready (fn) {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

})));
