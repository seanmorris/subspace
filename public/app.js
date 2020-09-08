(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("curvature/base/Bag.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bag = void 0;

var _Bindable = require("./Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var toId = function toId(_int) {
  return Number(_int).toString(36);
};

var fromId = function fromId(id) {
  return parseInt(id, 36);
};

var Bag = /*#__PURE__*/function () {
  function Bag() {
    var changeCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

    _classCallCheck(this, Bag);

    this.meta = Symbol('meta');
    this.content = new Map();
    this.list = _Bindable.Bindable.makeBindable({});
    this.current = 0;
    this.type = undefined;
    this.changeCallback = changeCallback;
  }

  _createClass(Bag, [{
    key: "add",
    value: function add(item) {
      if (item === undefined || !(item instanceof Object)) {
        throw new Error('Only objects may be added to Bags.');
      }

      if (this.type && !(item instanceof this.type)) {
        console.error(this.type, item);
        throw new Error("Only objects of type ".concat(this.type, " may be added to this Bag."));
      }

      if (this.content.has(item)) {
        return;
      }

      var id = toId(this.current++);
      this.content.set(item, id);
      this.list[id] = item;

      if (this.changeCallback) {
        this.changeCallback(item, this.meta, Bag.ITEM_ADDED, id);
      }
    }
  }, {
    key: "remove",
    value: function remove(item) {
      if (item === undefined || !(item instanceof Object)) {
        throw new Error('Only objects may be removed from Bags.');
      }

      if (this.type && !(item instanceof this.type)) {
        console.error(this.type, item);
        throw new Error("Only objects of type ".concat(this.type, " may be removed from this Bag."));
      }

      if (!this.content.has(item)) {
        if (this.changeCallback) {
          this.changeCallback(item, this.meta, 0, undefined);
        }

        return false;
      }

      var id = this.content.get(item);
      delete this.list[id];
      this.content["delete"](item);

      if (this.changeCallback) {
        this.changeCallback(item, this.meta, Bag.ITEM_REMOVED, id);
      }

      return item;
    }
  }, {
    key: "items",
    value: function items() {
      return Array.from(this.content.entries()).map(function (entry) {
        return entry[0];
      });
    }
  }]);

  return Bag;
}();

exports.Bag = Bag;
Object.defineProperty(Bag, 'ITEM_ADDED', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: 1
});
Object.defineProperty(Bag, 'ITEM_REMOVED', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: -1
});
  })();
});

require.register("curvature/base/Bindable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bindable = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Ref = Symbol('ref');
var Deck = Symbol('deck');
var Binding = Symbol('binding');
var BindingAll = Symbol('bindingAll');
var IsBindable = Symbol('isBindable');
var Executing = Symbol('executing');
var Stack = Symbol('stack');
var ObjSymbol = Symbol('object');
var Wrapped = Symbol('wrapped');

var Bindable = /*#__PURE__*/function () {
  function Bindable() {
    _classCallCheck(this, Bindable);
  }

  _createClass(Bindable, null, [{
    key: "isBindable",
    value: function isBindable(object) {
      if (!object[Binding]) {
        return false;
      }

      return object[Binding] === Bindable;
    }
  }, {
    key: "onDeck",
    value: function onDeck(object, key) {
      return object[Deck][key] || false;
    }
  }, {
    key: "ref",
    value: function ref(object) {
      return object[Ref] || false;
    }
  }, {
    key: "makeBindable",
    value: function makeBindable(object) {
      return this.make(object);
    }
  }, {
    key: "make",
    value: function make(object) {
      var _this = this;

      if (!object || !(object instanceof Object) || object instanceof Node || object instanceof Map || object instanceof Set || object instanceof IntersectionObserver || Object.isSealed(object) || !Object.isExtensible(object)) {
        // console.log('Cannot bind to object', object);
        return object;
      }

      if (object[Ref]) {
        // console.log('Already bound to object', object[Ref]);
        return object;
      }

      if (object[Binding]) {
        return object;
      }

      Object.defineProperty(object, Ref, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: object
      });
      Object.defineProperty(object, Deck, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });
      Object.defineProperty(object, Binding, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });
      Object.defineProperty(object, BindingAll, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, IsBindable, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: Bindable
      });
      Object.defineProperty(object, Executing, {
        enumerable: false,
        writable: true
      });
      Object.defineProperty(object, Stack, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, '___before___', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, '___after___', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: []
      });
      Object.defineProperty(object, Wrapped, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: {}
      });

      var bindTo = function bindTo(property) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var bindToAll = false;

        if (property instanceof Function) {
          options = callback || {};
          callback = property;
          bindToAll = true;
        }

        if (options.delay >= 0) {
          callback = _this.wrapDelayCallback(callback, options.delay);
        }

        if (options.throttle >= 0) {
          callback = _this.wrapThrottleCallback(callback, options.throttle);
        }

        if (options.wait >= 0) {
          callback = _this.wrapWaitCallback(callback, options.wait);
        }

        if (options.frame) {
          callback = _this.wrapFrameCallback(callback, options.frame);
        }

        if (options.idle) {
          callback = _this.wrapIdleCallback(callback);
        }

        if (bindToAll) {
          var _bindIndex = object[BindingAll].length;
          object[BindingAll].push(callback);

          for (var i in object) {
            callback(object[i], i, object, false);
          }

          return function () {
            delete object[BindingAll][_bindIndex];
          };
        }

        if (!object[Binding][property]) {
          object[Binding][property] = [];
        }

        var bindIndex = object[Binding][property].length;
        object[Binding][property].push(callback);
        callback(object[property], property, object, false);
        var cleaned = false;
        return function () {
          if (cleaned) {
            return;
          }

          cleaned = true;

          if (!object[Binding][property]) {
            return;
          }

          delete object[Binding][property][bindIndex];
        };
      };

      Object.defineProperty(object, 'bindTo', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: bindTo
      });

      var ___before = function ___before(callback) {
        var beforeIndex = object.___before___.length;

        object.___before___.push(callback);

        var cleaned = false;
        return function () {
          if (cleaned) {
            return;
          }

          cleaned = true;
          delete object.___before___[beforeIndex];
        };
      };

      var ___after = function ___after(callback) {
        var afterIndex = object.___after___.length;

        object.___after___.push(callback);

        var cleaned = false;
        return function () {
          if (cleaned) {
            return;
          }

          cleaned = true;
          delete object.___after___[afterIndex];
        };
      };

      Object.defineProperty(object, 'bindChain', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function value(path, callback) {
          var parts = path.split('.');
          var node = parts.shift();
          var subParts = parts.slice(0);
          var debind = [];
          debind.push(object.bindTo(node, function (v, k, t, d) {
            var rest = subParts.join('.');

            if (subParts.length === 0) {
              callback(v, k, t, d);
              return;
            }

            if (v === undefined) {
              v = t[k] = _this.makeBindable({});
            }

            debind = debind.concat(v.bindChain(rest, callback));
          })); // console.log(debind);

          return function () {
            return debind.map(function (x) {
              return x();
            });
          };
        }
      });
      Object.defineProperty(object, '___before', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: ___before
      });
      Object.defineProperty(object, '___after', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: ___after
      });

      var isBound = function isBound() {
        for (var i in object[BindingAll]) {
          if (object[BindingAll][i]) {
            return true;
          }
        }

        for (var _i in object[Binding]) {
          for (var j in object[Binding][_i]) {
            if (object[Binding][_i][j]) {
              return true;
            }
          }
        }

        return false;
      };

      Object.defineProperty(object, 'isBound', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: isBound
      });

      for (var i in object) {
        if (object[i] && object[i] instanceof Object && !object[i] instanceof Node && !object[i] instanceof Promise) {
          object[i] = Bindable.make(object[i]);
        }
      }

      var set = function set(target, key, value) {
        if (object[Deck][key] !== undefined && object[Deck][key] === value) {
          return true;
        }

        if (typeof key === 'string' && key.substring(0, 3) === '___' && key.slice(-3) === '___') {
          return true;
        }

        if (target[key] === value) {
          return true;
        }

        if (value && value instanceof Object && !(value instanceof Node)) {
          if (value.___isBindable___ !== Bindable) {
            value = Bindable.makeBindable(value);

            if (_this.isBindable(value)) {
              for (var _i2 in value) {
                if (value[_i2] && value[_i2] instanceof Object) {
                  value[_i2] = Bindable.makeBindable(value[_i2]);
                }
              }
            }
          }
        }

        object[Deck][key] = value;

        for (var _i3 in object[BindingAll]) {
          if (!object[BindingAll][_i3]) {
            continue;
          }

          object[BindingAll][_i3](value, key, target, false);
        }

        var stop = false;

        if (key in object[Binding]) {
          for (var _i4 in object[Binding][key]) {
            if (!object[Binding][key]) {
              continue;
            }

            if (!object[Binding][key][_i4]) {
              continue;
            }

            if (object[Binding][key][_i4](value, key, target, false, target[key]) === false) {
              stop = true;
            }
          }
        }

        delete object[Deck][key];

        if (!stop) {
          var descriptor = Object.getOwnPropertyDescriptor(target, key);
          var excluded = target instanceof File && key == 'lastModifiedDate';

          if (!excluded && (!descriptor || descriptor.writable) && target[key] === value) {
            target[key] = value;
          }
        }

        return Reflect.set(target, key, value);
      };

      var deleteProperty = function deleteProperty(target, key) {
        if (!(key in target)) {
          return true;
        }

        for (var _i5 in object[BindingAll]) {
          object[BindingAll][_i5](undefined, key, target, true, target[key]);
        }

        if (key in object[Binding]) {
          for (var _i6 in object[Binding][key]) {
            if (!object[Binding][key][_i6]) {
              continue;
            }

            object[Binding][key][_i6](undefined, key, target, true, target[key]);
          }
        }

        delete target[key];
        return true;
      };

      var get = function get(target, key) {
        if (key === Ref || key === 'isBound' || key === 'bindTo') {
          return target[key];
        }

        if (target[key] instanceof Function) {
          if (target[Wrapped][key]) {
            return target[Wrapped][key];
          }

          var descriptor = Object.getOwnPropertyDescriptor(object, key);

          if (descriptor && !descriptor.configurable && !descriptor.writable) {
            target[Wrapped][key] = target[key];
            return target[Wrapped][key];
          }

          target[Wrapped][key] = function () {
            target[Executing] = key;
            target[Stack].unshift(key);

            for (var _len = arguments.length, providedArgs = new Array(_len), _key = 0; _key < _len; _key++) {
              providedArgs[_key] = arguments[_key];
            }

            for (var _i7 in target.___before___) {
              target.___before___[_i7](target, key, target[Stack], object, providedArgs);
            }

            var objRef = object instanceof Promise || object instanceof EventTarget || object instanceof MutationObserver || object instanceof IntersectionObserver || object instanceof MutationObserver || object instanceof PerformanceObserver || object instanceof ResizeObserver || object instanceof Map || object instanceof Set ? object : object[Ref];
            var ret = new.target ? _construct(target[key], providedArgs) : target[key].apply(objRef || object, providedArgs);

            for (var _i8 in target.___after___) {
              target.___after___[_i8](target, key, target[Stack], object, providedArgs);
            }

            target[Executing] = null;
            target[Stack].shift();
            return ret;
          };

          return target[Wrapped][key];
        }

        if (target[key] instanceof Object && !target[key][Ref]) {
          Bindable.make(target[key]);
        }

        return target[key];
      };

      var construct = function construct(target, args) {
        var key = 'constructor';

        for (var _i9 in target.___before___) {
          target.___before___[_i9](target, key, target[Stack], undefined, args);
        }

        var instance = Bindable.make(_construct(target, _toConsumableArray(args)));

        for (var _i10 in target.___after___) {
          target.___after___[_i10](target, key, target[Stack], instance, args);
        }

        return instance;
      };

      Object.defineProperty(object, Ref, {
        configurable: false,
        enumerable: false,
        writable: true,
        value: object[Ref]
      });
      object[Ref] = new Proxy(object, {
        deleteProperty: deleteProperty,
        construct: construct,
        get: get,
        set: set
      });
      return object[Ref];
    }
  }, {
    key: "clearBindings",
    value: function clearBindings(object) {
      var clearObj = function clearObj(o) {
        return Object.keys(o).map(function (k) {
          return delete o[k];
        });
      };

      var maps = function maps(func) {
        return function () {
          for (var _len2 = arguments.length, os = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            os[_key2] = arguments[_key2];
          }

          return os.map(func);
        };
      };

      var clearObjs = maps(clearObj);
      clearObjs(object[Wrapped], object[Binding], object[BindingAll], object.___after___, object.___before___ // , object[Ref]
      ); // object[BindingAll]  = [];
      // object.___after___  = [];
      // object.___before___ = [];
      // object[Ref]         = {};
      // object[Wrapped]     = {};
      // object[Binding]     = {};
    }
  }, {
    key: "resolve",
    value: function resolve(object, path) {
      var owner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      // console.log(path, object);
      var node;
      var pathParts = path.split('.');
      var top = pathParts[0];

      while (pathParts.length) {
        if (owner && pathParts.length === 1) {
          var obj = this.makeBindable(object);
          return [obj, pathParts.shift(), top];
        }

        node = pathParts.shift();

        if (!node in object || !object[node] || !(object[node] instanceof Object)) {
          object[node] = {};
        }

        object = this.makeBindable(object[node]);
      }

      return [this.makeBindable(object), node, top];
    }
  }, {
    key: "wrapDelayCallback",
    value: function wrapDelayCallback(callback, delay) {
      return function (v, k, t, d) {
        setTimeout(function () {
          return callback(v, k, t, d, t[k]);
        }, delay);
      };
    }
  }, {
    key: "wrapThrottleCallback",
    value: function wrapThrottleCallback(callback, throttle) {
      return function (callback) {
        var throttle = false;
        return function (v, k, t, d) {
          if (throttle) {
            return;
          }

          callback(v, k, t, d, t[k]);
          throttle = true;
          setTimeout(function () {
            throttle = false;
          }, throttle);
        };
      }(callback);
    }
  }, {
    key: "wrapWaitCallback",
    value: function wrapWaitCallback(callback, wait) {
      var waiter = false;
      return function (v, k, t, d) {
        if (waiter) {
          clearTimeout(waiter);
          waiter = false;
        }

        waiter = setTimeout(function () {
          return callback(v, k, t, d, t[k]);
        }, wait);
      };
    }
  }, {
    key: "wrapFrameCallback",
    value: function wrapFrameCallback(callback, frames) {
      return function (v, k, t, d, p) {
        requestAnimationFrame(function () {
          return callback(v, k, t, d, p);
        });
      };
    }
  }, {
    key: "wrapIdleCallback",
    value: function wrapIdleCallback(callback) {
      return function (v, k, t, d, p) {
        // Compatibility for Safari 08/2020
        var req = window.requestIdleCallback || requestAnimationFrame;
        req(function () {
          return callback(v, k, t, d, p);
        });
      };
    }
  }]);

  return Bindable;
}();

exports.Bindable = Bindable;
  })();
});

require.register("curvature/base/Cache.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cache = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Cache = /*#__PURE__*/function () {
  function Cache() {
    _classCallCheck(this, Cache);
  }

  _createClass(Cache, null, [{
    key: "store",
    value: function store(key, value, expiry) {
      var bucket = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'standard';
      var expiration = 0;

      if (expiry) {
        expiration = expiry * 1000 + new Date().getTime();
      } // console.log(
      // 	`Caching ${key} until ${expiration} in ${bucket}.`
      // 	, value
      // 	, this.bucket
      // );


      if (!this.bucket) {
        this.bucket = {};
      }

      if (!this.bucket[bucket]) {
        this.bucket[bucket] = {};
      }

      this.bucket[bucket][key] = {
        expiration: expiration,
        value: value
      };
    }
  }, {
    key: "load",
    value: function load(key) {
      var defaultvalue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var bucket = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'standard';

      // console.log(
      // 	`Checking cache for ${key} in ${bucket}.`
      // 	, this.bucket
      // );
      if (this.bucket && this.bucket[bucket] && this.bucket[bucket][key]) {
        // console.log(this.bucket[bucket][key].expiration, (new Date).getTime());
        if (this.bucket[bucket][key].expiration == 0 || this.bucket[bucket][key].expiration > new Date().getTime()) {
          return this.bucket[bucket][key].value;
        }
      }

      return defaultvalue;
    }
  }]);

  return Cache;
}();

exports.Cache = Cache;
  })();
});

require.register("curvature/base/Config.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ConfigData = {};

try {
  var AppConfig = require('Config').Config || {};
  Object.assign(ConfigData, AppConfig);
} catch (error) {
  console.warn(error);
}

var Config = /*#__PURE__*/function () {
  function Config() {
    _classCallCheck(this, Config);
  }

  _createClass(Config, null, [{
    key: "get",
    value: function get(name) {
      return this.data[name];
    }
  }, {
    key: "set",
    value: function set(name, value) {
      this.data[name] = value;
      return this;
    }
  }, {
    key: "dump",
    value: function dump() {
      return this.data;
    }
  }, {
    key: "init",
    value: function init() {
      for (var _len = arguments.length, configBlobs = new Array(_len), _key = 0; _key < _len; _key++) {
        configBlobs[_key] = arguments[_key];
      }

      for (var i in configBlobs) {
        var configBlob = configBlobs[i];

        if (typeof configBlob === 'string') {
          configBlob = JSON.parse(configBlob);
        }

        for (var name in configBlob) {
          var value = configBlob[name];
          return this.data[name] = value;
        }
      }

      return this;
    }
  }]);

  return Config;
}();

exports.Config = Config;
Config.data = ConfigData || {};
  })();
});

require.register("curvature/base/Dom.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dom = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var traversals = 0;

var Dom = /*#__PURE__*/function () {
  function Dom() {
    _classCallCheck(this, Dom);
  }

  _createClass(Dom, null, [{
    key: "mapTags",
    value: function mapTags(doc, selector, callback, startNode, endNode) {
      var result = [];
      var started = true;

      if (startNode) {
        started = false;
      }

      var ended = false;
      var treeWalker = document.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: function acceptNode(node, walker) {
          if (!started) {
            if (node === startNode) {
              started = true;
            } else {
              return NodeFilter.FILTER_SKIP;
            }
          }

          if (endNode && node === endNode) {
            ended = true;
          }

          if (ended) {
            return NodeFilter.FILTER_SKIP;
          }

          if (selector) {
            if (node instanceof Element) {
              if (node.matches(selector)) {
                return NodeFilter.FILTER_ACCEPT;
              }
            }

            return NodeFilter.FILTER_SKIP;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }, false);
      var traversal = traversals++;

      while (treeWalker.nextNode()) {
        result.push(callback(treeWalker.currentNode, treeWalker));
      }

      return result;
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(doc, event) {
      doc.dispatchEvent(event);
      Dom.mapTags(doc, false, function (node) {
        node.dispatchEvent(event);
      });
    }
  }]);

  return Dom;
}();

exports.Dom = Dom;
  })();
});

require.register("curvature/base/Mixin.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mixin = void 0;

var _Bindable = require("./Bindable");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Constructor = Symbol('constructor');
var MixinList = Symbol('mixinList');

var Mixin = /*#__PURE__*/function () {
  function Mixin() {
    _classCallCheck(this, Mixin);
  }

  _createClass(Mixin, null, [{
    key: "with",
    value: function _with() {
      for (var _len = arguments.length, mixins = new Array(_len), _key = 0; _key < _len; _key++) {
        mixins[_key] = arguments[_key];
      }

      var constructors = [];

      var newClass = function newClass() {
        _classCallCheck(this, newClass);

        var _iterator = _createForOfIteratorHelper(mixins),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var mixin = _step.value;

            if (mixin[Mixin.constructor]) {
              mixin[Mixin.constructor].apply(this);
            }

            switch (_typeof(mixin)) {
              // case 'function':
              // 	this.mixClass(mixin, newClass);
              // 	break;
              case 'object':
                Mixin.mixObject(mixin, this);
                break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };

      return newClass;
    }
  }, {
    key: "mixObject",
    value: function mixObject(mixin, instance) {
      var _iterator2 = _createForOfIteratorHelper(Object.getOwnPropertyNames(mixin)),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var func = _step2.value;

          if (typeof mixin[func] === 'function') {
            instance[func] = mixin[func].bind(instance);
            continue;
          }

          instance[func] = mixin[func];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var _iterator3 = _createForOfIteratorHelper(Object.getOwnPropertySymbols(mixin)),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _func = _step3.value;

          if (typeof mixin[_func] === 'function') {
            instance[_func] = mixin[_func].bind(instance);
            continue;
          }

          instance[_func] = mixin[_func];
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "mixClass",
    value: function mixClass(cls, newClass) {
      var _iterator4 = _createForOfIteratorHelper(Object.getOwnPropertyNames(cls.prototype)),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var func = _step4.value;
          newClass.prototype[func] = cls.prototype[func].bind(newClass.prototype);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var _iterator5 = _createForOfIteratorHelper(Object.getOwnPropertySymbols(cls.prototype)),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _func2 = _step5.value;
          newClass.prototype[_func2] = cls.prototype[_func2].bind(newClass.prototype);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      var _iterator6 = _createForOfIteratorHelper(Object.getOwnPropertyNames(cls)),
          _step6;

      try {
        var _loop = function _loop() {
          var func = _step6.value;

          if (typeof cls[func] !== 'function') {
            return "continue";
          }

          var prev = newClass[func] || false;
          var meth = cls[func].bind(newClass);

          newClass[func] = function () {
            prev && prev.apply(void 0, arguments);
            return meth.apply(void 0, arguments);
          };
        };

        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _ret = _loop();

          if (_ret === "continue") continue;
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var _iterator7 = _createForOfIteratorHelper(Object.getOwnPropertySymbols(cls)),
          _step7;

      try {
        var _loop2 = function _loop2() {
          var func = _step7.value;

          if (typeof cls[func] !== 'function') {
            return "continue";
          }

          var prev = newClass[func] || false;
          var meth = cls[func].bind(newClass);

          newClass[func] = function () {
            prev && prev.apply(void 0, arguments);
            return meth.apply(void 0, arguments);
          };
        };

        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _ret2 = _loop2();

          if (_ret2 === "continue") continue;
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }
  }, {
    key: "mix",
    value: function mix(mixinTo) {
      var constructors = [];
      var allStatic = {};
      var allInstance = {};

      var mixable = _Bindable.Bindable.makeBindable(mixinTo);

      var _loop3 = function _loop3(base) {
        var instanceNames = Object.getOwnPropertyNames(base.prototype);
        var staticNames = Object.getOwnPropertyNames(base);
        var prefix = /^(before|after)__(.+)/;

        var _iterator8 = _createForOfIteratorHelper(staticNames),
            _step8;

        try {
          var _loop5 = function _loop5() {
            var methodName = _step8.value;
            var match = methodName.match(prefix);

            if (match) {
              switch (match[1]) {
                case 'before':
                  mixable.___before(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;

                case 'after':
                  mixable.___after(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;
              }

              return "continue";
            }

            if (allStatic[methodName]) {
              return "continue";
            }

            if (typeof base[methodName] !== 'function') {
              return "continue";
            }

            allStatic[methodName] = base[methodName];
          };

          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var _ret3 = _loop5();

            if (_ret3 === "continue") continue;
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }

        var _iterator9 = _createForOfIteratorHelper(instanceNames),
            _step9;

        try {
          var _loop6 = function _loop6() {
            var methodName = _step9.value;
            var match = methodName.match(prefix);

            if (match) {
              switch (match[1]) {
                case 'before':
                  mixable.___before(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base.prototype[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;

                case 'after':
                  mixable.___after(function (t, e, s, o, a) {
                    if (e !== match[2]) {
                      return;
                    }

                    var method = base.prototype[methodName].bind(o);
                    return method.apply(void 0, _toConsumableArray(a));
                  });

                  break;
              }

              return "continue";
            }

            if (allInstance[methodName]) {
              return "continue";
            }

            if (typeof base.prototype[methodName] !== 'function') {
              return "continue";
            }

            allInstance[methodName] = base.prototype[methodName];
          };

          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var _ret4 = _loop6();

            if (_ret4 === "continue") continue;
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }
      };

      for (var base = this; base && base.prototype; base = Object.getPrototypeOf(base)) {
        _loop3(base);
      }

      for (var methodName in allStatic) {
        mixinTo[methodName] = allStatic[methodName].bind(mixinTo);
      }

      var _loop4 = function _loop4(_methodName) {
        mixinTo.prototype[_methodName] = function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return allInstance[_methodName].apply(this, args);
        };
      };

      for (var _methodName in allInstance) {
        _loop4(_methodName);
      }

      return mixable;
    }
  }]);

  return Mixin;
}();

exports.Mixin = Mixin;
Mixin.constructor = Constructor;
  })();
});

require.register("curvature/base/Router.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Router = void 0;

var _View = require("./View");

var _Cache = require("./Cache");

var _Config = require("./Config");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Router = /*#__PURE__*/function () {
  function Router() {
    _classCallCheck(this, Router);
  }

  _createClass(Router, null, [{
    key: "wait",
    value: function wait(view) {
      var _this = this;

      var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'DOMContentLoaded';
      var node = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;
      node.addEventListener(event, function () {
        _this.listen(view);
      });
    }
  }, {
    key: "listen",
    value: function listen(mainView) {
      var _this2 = this;

      var routeHistory = [location.toString()];
      var prevHistoryLength = history.length;
      var route = location.pathname + location.search;

      if (location.hash) {
        route += location.hash;
      }

      Object.assign(Router.query, Router.queryOver({}));
      window.addEventListener('popstate', function (event) {
        event.preventDefault();

        if (routeHistory.length && prevHistoryLength == history.length) {
          if (location.toString() == routeHistory[routeHistory.length - 2]) {
            routeHistory.pop();
          } else {
            routeHistory.push(location.toString());
          }
        } else {
          routeHistory.push(location.toString());
          prevHistoryLength = history.length;
        }

        _this2.match(location.pathname, mainView);

        for (var i in _this2.query) {
          delete _this2.query[i];
        }

        Object.assign(Router.query, Router.queryOver({}));
      });
      this.go(route);
    }
  }, {
    key: "go",
    value: function go(route, silent) {
      var _this3 = this;

      var configTitle = _Config.Config.get('title');

      if (configTitle) {
        document.title = configTitle;
      }

      setTimeout(function () {
        if (silent === 2) {
          history.replaceState(null, null, route);
        } else {
          history.pushState(null, null, route);
        }

        if (!silent) {
          if (silent === false) {
            _this3.path = null;
          }

          window.dispatchEvent(new Event('popstate'));

          if (route.substring(0, 1) === '#') {
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        }

        for (var i in _this3.query) {
          delete _this3.query[i];
        }

        Object.assign(Router.query, Router.queryOver({}));
      }, 0);
    }
  }, {
    key: "match",
    value: function match(path, view) {
      var _this4 = this;

      var forceRefresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (this.path === path && !forceRefresh) {
        return;
      }

      var eventStart = new CustomEvent('cvRouteStart', {
        cancelable: true,
        detail: {
          result: result,
          path: path,
          view: view
        }
      });
      var current = view.args.content;
      var routes = view.routes;
      this.path = path; // this.query  = {};

      for (var i in this.query) {
        delete this.query[i];
      }

      var query = new URLSearchParams(location.search);
      this.queryString = location.search;

      var _iterator = _createForOfIteratorHelper(query),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pair = _step.value;
          this.query[pair[0]] = pair[1];
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var args = {},
          selected = false,
          result = '';
      path = path.substr(1).split('/');

      for (var _i in this.query) {
        args[_i] = this.query[_i];
      }

      L1: for (var _i2 in routes) {
        var route = _i2.split('/');

        if (route.length < path.length && route[route.length - 1] !== '*') {
          continue;
        }

        L2: for (var j in route) {
          if (route[j].substr(0, 1) == '%') {
            var argName = null;
            var groups = /^%(\w+)\??/.exec(route[j]);

            if (groups && groups[1]) {
              argName = groups[1];
            }

            if (!argName) {
              throw new Error("".concat(route[j], " is not a valid argument segment in route \"").concat(_i2, "\""));
            }

            if (!path[j]) {
              if (route[j].substr(route[j].length - 1, 1) == '?') {
                args[argName] = '';
              } else {
                continue L1;
              }
            } else {
              args[argName] = path[j];
            }
          } else if (route[j] !== '*' && path[j] !== route[j]) {
            continue L1;
          }
        }

        if (!forceRefresh && current && routes[_i2] instanceof Object && current instanceof routes[_i2] && !(routes[_i2] instanceof Promise) && current.update(args)) {
          view.args.content = current;
          return true;
        }

        selected = _i2;
        result = routes[_i2];

        if (route[route.length - 1] === '*') {
          args.pathparts = path.slice(route.length - 1);
        }

        break;
      }

      document.dispatchEvent(eventStart);

      if (selected in routes && routes[selected] instanceof Object && routes[selected].isView && routes[selected].isView()) {
        result = new routes[selected](args);

        result.root = function () {
          return view;
        };
      } else if (routes[selected] instanceof Function) {
        result = '';

        var _result = routes[selected](args);

        if (_result instanceof Promise) {
          result = false;

          _result.then(function (x) {
            _this4.update(view, path, x);
          })["catch"](function (x) {
            _this4.update(view, path, x);
          });
        } else {
          result = _result;
        }
      } else if (routes[selected] instanceof Promise) {
        result = false;
        routes[selected].then(function (x) {
          _this4.update(view, path, x);
        })["catch"](function (x) {
          _this4.update(view, path, x);
        });
      } else if (routes[selected] instanceof Object) {
        result = new routes[selected](args);
      } else if (typeof routes[selected] == 'string') {
        result = routes[selected];
      }

      this.update(view, path, result); // if(view.args.content instanceof View)
      // {
      // 	// view.args.content.pause(true);
      // 	view.args.content.remove();
      // }
      // if(result !== false)
      // {
      // 	if(document.dispatchEvent(event))
      // 	{
      // 		view.args.content = result;
      // 	}
      // }

      if (result instanceof _View.View) {
        result.pause(false);
        result.update(args, forceRefresh);
      }

      return selected !== false;
    }
  }, {
    key: "update",
    value: function update(view, path, result) {
      var event = new CustomEvent('cvRoute', {
        cancelable: true,
        detail: {
          result: result,
          path: path,
          view: view
        }
      });
      var eventEnd = new CustomEvent('cvRouteEnd', {
        cancelable: true,
        detail: {
          result: result,
          path: path,
          view: view
        }
      });

      if (result !== false) {
        if (view.args.content instanceof _View.View) {
          // view.args.content.pause(true);
          view.args.content.remove();
        }

        if (document.dispatchEvent(event)) {
          view.args.content = result;
        }

        document.dispatchEvent(eventEnd);
      }
    }
  }, {
    key: "clearCache",
    value: function clearCache() {// this.cache = {};
    }
  }, {
    key: "queryOver",
    value: function queryOver() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var params = new URLSearchParams(location.search);
      var finalArgs = {};
      var query = [];

      var _iterator2 = _createForOfIteratorHelper(params),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var pair = _step2.value;
          query[pair[0]] = pair[1];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      for (var i in query) {
        finalArgs[i] = query[i];
      }

      for (var _i3 in args) {
        finalArgs[_i3] = args[_i3];
      }

      delete finalArgs['api'];
      return finalArgs;
    }
  }, {
    key: "queryToString",
    value: function queryToString() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var fresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var parts = [],
          finalArgs = args;

      if (!fresh) {
        finalArgs = this.queryOver(args);
      }

      for (var i in finalArgs) {
        if (finalArgs[i] === '') {
          continue;
        }

        parts.push(i + '=' + encodeURIComponent(finalArgs[i]));
      }

      return parts.join('&');
    }
  }, {
    key: "setQuery",
    value: function setQuery(name, value, silent) {
      var args = this.queryOver();
      args[name] = value;

      if (value === undefined) {
        delete args[name];
      }

      var queryString = this.queryToString(args, true);
      this.go(location.pathname + (queryString ? '?' + queryString : ''), silent);
    }
  }]);

  return Router;
}();

exports.Router = Router;
Object.defineProperty(Router, 'query', {
  configurable: false,
  writeable: false,
  value: {}
});
  })();
});

require.register("curvature/base/RuleSet.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RuleSet = void 0;

var _Dom = require("./Dom");

var _Tag = require("./Tag");

var _View = require("./View");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RuleSet = /*#__PURE__*/function () {
  function RuleSet() {
    _classCallCheck(this, RuleSet);
  }

  _createClass(RuleSet, [{
    key: "add",
    value: function add(selector, callback) {
      this.rules = this.rules || {};
      this.rules[selector] = this.rules[selector] || [];
      this.rules[selector].push(callback);
      return this;
    }
  }, {
    key: "apply",
    value: function apply() {
      var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      RuleSet.apply(doc, view);

      for (var selector in this.rules) {
        for (var i in this.rules[selector]) {
          var callback = this.rules[selector][i];
          var wrapped = RuleSet.wrap(doc, callback, view);
          var nodes = doc.querySelectorAll(selector);

          var _iterator = _createForOfIteratorHelper(nodes),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var node = _step.value;
              wrapped(node);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
      }
    }
  }], [{
    key: "add",
    value: function add(selector, callback) {
      this.globalRules = this.globalRules || {};
      this.globalRules[selector] = this.globalRules[selector] || [];
      this.globalRules[selector].push(callback);
      return this;
    }
  }, {
    key: "apply",
    value: function apply() {
      var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      for (var selector in this.globalRules) {
        for (var i in this.globalRules[selector]) {
          var callback = this.globalRules[selector][i];
          var wrapped = this.wrap(doc, callback, view);
          var nodes = doc.querySelectorAll(selector);

          var _iterator2 = _createForOfIteratorHelper(nodes),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var node = _step2.value;
              wrapped(node);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      }
    }
  }, {
    key: "wait",
    value: function wait() {
      var _this = this;

      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'DOMContentLoaded';
      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

      var listener = function (event, node) {
        return function () {
          node.removeEventListener(event, listener);
          return _this.apply();
        };
      }(event, node);

      node.addEventListener(event, listener);
    }
  }, {
    key: "wrap",
    value: function wrap(doc, callback) {
      var view = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (callback instanceof _View.View || callback && callback.prototype && callback.prototype instanceof _View.View) {
        callback = function (callback) {
          return function () {
            return callback;
          };
        }(callback);
      }

      return function (element) {
        if (typeof element.___cvApplied___ === 'undefined') {
          Object.defineProperty(element, '___cvApplied___', {
            enumerable: false,
            writable: false,
            value: []
          });
        }

        for (var i in element.___cvApplied___) {
          if (callback == element.___cvApplied___[i]) {
            return;
          }
        }

        var direct, parentView;

        if (view) {
          direct = parentView = view;

          if (view.viewList) {
            parentView = view.viewList.parent;
          }
        }

        var tag = new _Tag.Tag(element, parentView, null, undefined, direct);
        var parent = tag.element.parentNode;
        var sibling = tag.element.nextSibling;
        var result = callback(tag);

        if (result !== false) {
          element.___cvApplied___.push(callback);
        }

        if (result instanceof HTMLElement) {
          result = new _Tag.Tag(result);
        }

        if (result instanceof _Tag.Tag) {
          if (!result.element.contains(tag.element)) {
            while (tag.element.firstChild) {
              result.element.appendChild(tag.element.firstChild);
            }

            tag.remove();
          }

          if (sibling) {
            parent.insertBefore(result.element, sibling);
          } else {
            parent.appendChild(result.element);
          }
        }

        if (result && result.prototype && result.prototype instanceof _View.View) {
          result = new result();
        }

        if (result instanceof _View.View) {
          if (view) {
            view.cleanup.push(function (r) {
              return function () {
                r.remove();
              };
            }(result));
            result.parent = view;
            view.cleanup.push(view.args.bindTo(function (v, k, t) {
              t[k] = v;
              result.args[k] = v;
            }));
            view.cleanup.push(result.args.bindTo(function (v, k, t, d) {
              t[k] = v;
              view.args[k] = v;
            }));
          }

          tag.clear();
          result.render(tag.element);
        }
      };
    }
  }]);

  return RuleSet;
}();

exports.RuleSet = RuleSet;
  })();
});

require.register("curvature/base/Tag.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tag = void 0;

var _Bindable = require("./Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Tag = /*#__PURE__*/function () {
  function Tag(element, parent, ref, index, direct) {
    _classCallCheck(this, Tag);

    this.element = _Bindable.Bindable.makeBindable(element);
    this.parent = parent;
    this.direct = direct;
    this.ref = ref;
    this.index = index;
    this.cleanup = [];
    this.proxy = _Bindable.Bindable.makeBindable(this); // this.detachListener = (event) => {
    // 	return;
    // 	if(event.target != this.element)
    // 	{
    // 		return;
    // 	}
    // 	if(event.path[event.path.length -1] !== window)
    // 	{
    // 		return;
    // 	}
    // 	this.element.removeEventListener('cvDomDetached', this.detachListener);
    // 	this.remove();
    // };
    // this.element.addEventListener('cvDomDetached', this.detachListener);
    // return this.proxy;
  }

  _createClass(Tag, [{
    key: "remove",
    value: function remove() {
      _Bindable.Bindable.clearBindings(this);

      var cleanup;

      while (cleanup = this.cleanup.shift()) {
        cleanup();
      }

      this.clear();

      if (!this.element) {
        return;
      }

      var detachEvent = new Event('cvDomDetached');
      this.element.dispatchEvent(detachEvent);
      this.element.remove();
      this.element = this.ref = this.parent = null;
    }
  }, {
    key: "clear",
    value: function clear() {
      if (!this.element) {
        return;
      }

      var detachEvent = new Event('cvDomDetached');

      while (this.element.firstChild) {
        this.element.firstChild.dispatchEvent(detachEvent);
        this.element.removeChild(this.element.firstChild);
      }
    }
  }, {
    key: "pause",
    value: function pause() {
      var paused = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    }
  }]);

  return Tag;
}();

exports.Tag = Tag;
  })();
});

require.register("curvature/base/View.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = void 0;

var _Bindable = require("./Bindable");

var _ViewList = require("./ViewList");

var _Router = require("./Router");

var _Dom = require("./Dom");

var _Tag = require("./Tag");

var _Bag = require("./Bag");

var _RuleSet = require("./RuleSet");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var dontParse = Symbol('dontParse');
var expandBind = Symbol('expandBind');
var moveIndex = 0;

var View = /*#__PURE__*/function () {
  _createClass(View, [{
    key: "_id",
    get: function get() {
      if (!this.__id) {
        Object.defineProperty(this, '__id', {
          configurable: false,
          writable: false,
          value: this.uuid()
        });
      }

      return this.__id;
    }
  }], [{
    key: "from",
    value: function from(template) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var view = new this(args, parent);
      view.template = template;
      return view;
    }
  }]);

  function View() {
    var _this2 = this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var mainView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, View);

    Object.defineProperty(this, '___VIEW___', {
      enumerable: false,
      writable: true
    });
    this.___VIEW___ = View;
    Object.defineProperty(this, 'args', {
      configurable: false,
      writable: false,
      value: _Bindable.Bindable.make(args)
    });

    var _this = this;

    if (!this.args._id) {
      Object.defineProperty(this.args, '_id', {
        configurable: false,
        get: function get() {
          return _this._id;
        }
      });
    }

    this.template = "";
    this.document = "";
    this.firstNode = null;
    this.lastNode = null;
    this.nodes = null;
    this.cleanup = [];
    this._onRemove = new _Bag.Bag(function (i, s, a) {// console.log('View _onRemove', i, s, a);
    });
    this.attach = new _Bag.Bag(function (i, s, a) {});
    this.detach = new _Bag.Bag(function (i, s, a) {});
    this.eventCleanup = [];
    this.mainView = null;
    this.parent = mainView;
    this.viewList = null;
    this.viewLists = {};
    this.withViews = {};
    this.tags = _Bindable.Bindable.make({});
    this.intervals = [];
    this.timeouts = [];
    this.frames = [];
    this.ruleSet = new _RuleSet.RuleSet();
    this.preRuleSet = new _RuleSet.RuleSet();
    this.subBindings = {};
    this.subTemplates = {};
    this.removed = false;
    this.preserve = false;
    this.interpolateRegex = /(\[\[((?:\$+)?[\w\.\|-]+)\]\])/g;
    this.rendered = new Promise(function (accept, reject) {
      Object.defineProperty(_this2, 'renderComplete', {
        configurable: false,
        writable: false,
        value: accept
      });
    });
    return _Bindable.Bindable.make(this);
  }

  _createClass(View, [{
    key: "onFrame",
    value: function onFrame(callback) {
      var _this3 = this;

      var stopped = false;

      var cancel = function cancel() {
        stopped = true;
      };

      var c = function c(timestamp) {
        if (_this3.removed || stopped) {
          return;
        }

        if (!_this3.paused) {
          callback(Date.now());
        }

        requestAnimationFrame(c);
      };

      requestAnimationFrame(function () {
        return c(Date.now());
      });
      return cancel;
    }
  }, {
    key: "onNextFrame",
    value: function onNextFrame(callback) {
      return requestAnimationFrame(function () {
        return callback(Date.now());
      });
    }
  }, {
    key: "onIdle",
    value: function onIdle(callback) {
      return requestIdleCallback(function () {
        return callback(Date.now());
      });
    }
  }, {
    key: "onTimeout",
    value: function onTimeout(time, callback) {
      var _this4 = this;

      var wrappedCallback = function wrappedCallback() {
        _this4.timeouts[index].fired = true;
        _this4.timeouts[index].callback = null;
        callback();
      };

      var timeout = setTimeout(wrappedCallback, time);
      var index = this.timeouts.length;
      this.timeouts.push({
        timeout: timeout,
        callback: wrappedCallback,
        time: time,
        fired: false,
        created: new Date().getTime(),
        paused: false
      });
      return timeout;
    }
  }, {
    key: "clearTimeout",
    value: function (_clearTimeout) {
      function clearTimeout(_x) {
        return _clearTimeout.apply(this, arguments);
      }

      clearTimeout.toString = function () {
        return _clearTimeout.toString();
      };

      return clearTimeout;
    }(function (timeout) {
      for (var i in this.timeouts) {
        if (timeout === this.timeouts[i].timeout) {
          clearTimeout(this.timeouts[i].timeout);
          delete this.timeouts[i];
        }
      }
    })
  }, {
    key: "onInterval",
    value: function onInterval(time, callback) {
      var timeout = setInterval(callback, time);
      this.intervals.push({
        timeout: timeout,
        callback: callback,
        time: time,
        paused: false
      });
      return timeout;
    }
  }, {
    key: "clearInterval",
    value: function (_clearInterval) {
      function clearInterval(_x2) {
        return _clearInterval.apply(this, arguments);
      }

      clearInterval.toString = function () {
        return _clearInterval.toString();
      };

      return clearInterval;
    }(function (timeout) {
      for (var i in this.intervals) {
        if (timeout === this.intervals[i].timeout) {
          clearInterval(this.intervals[i].timeout);
          delete this.intervals[i];
        }
      }
    })
  }, {
    key: "pause",
    value: function pause() {
      var paused = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (paused === undefined) {
        this.paused = !this.paused;
      }

      this.paused = paused;

      if (this.paused) {
        for (var i in this.timeouts) {
          if (this.timeouts[i].fired) {
            delete this.timeouts[i];
            continue;
          }

          clearTimeout(this.timeouts[i].timeout);
        }

        for (var _i in this.intervals) {
          clearInterval(this.intervals[_i].timeout);
        }
      } else {
        for (var _i2 in this.timeouts) {
          if (!this.timeouts[_i2].timeout.paused) {
            continue;
          }

          if (this.timeouts[_i2].fired) {
            delete this.timeouts[_i2];
            continue;
          }

          this.timeouts[_i2].timeout = setTimeout(this.timeouts[_i2].callback, this.timeouts[_i2].time);
        }

        for (var _i3 in this.intervals) {
          if (!this.intervals[_i3].timeout.paused) {
            continue;
          }

          this.intervals[_i3].timeout.paused = false;
          this.intervals[_i3].timeout = setInterval(this.intervals[_i3].callback, this.intervals[_i3].time);
        }
      }

      for (var _i4 in this.viewLists) {
        if (!this.viewLists[_i4]) {
          return;
        }

        this.viewLists[_i4].pause(!!paused);
      }

      for (var _i5 in this.tags) {
        if (Array.isArray(this.tags[_i5])) {
          for (var j in this.tags[_i5]) {
            this.tags[_i5][j].pause(!!paused);
          }

          continue;
        }

        this.tags[_i5].pause(!!paused);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$nodes;

      var parentNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var insertPoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (parentNode instanceof View) {
        parentNode = parentNode.firstNode.parentNode;
      }

      if (insertPoint instanceof View) {
        insertPoint = insertPoint.firstNode;
      }

      if (this.firstNode) {
        return this.reRender(parentNode, insertPoint);
      }

      var templateParsed = this.template instanceof DocumentFragment ? this.template.cloneNode(true) : View.templates.has(this.template);
      var subDoc = templateParsed ? this.template instanceof DocumentFragment ? templateParsed : View.templates.get(this.template).cloneNode(true) : document.createRange().createContextualFragment(this.template);

      if (!templateParsed && !(this.template instanceof DocumentFragment)) {
        View.templates.set(this.template, subDoc.cloneNode(true));
      }

      this.mainView || this.preRuleSet.apply(subDoc, this);
      this.mapTags(subDoc);
      this.mainView || this.ruleSet.apply(subDoc, this);
      this.nodes = [];

      if (window['devmode'] === true) {
        this.firstNode = document.createComment("Template ".concat(this._id, " Start"));
        this.lastNode = document.createComment("Template ".concat(this._id, " End"));
      } else {
        this.firstNode = document.createTextNode('');
        this.lastNode = document.createTextNode('');
      }

      (_this$nodes = this.nodes).push.apply(_this$nodes, [this.firstNode].concat(_toConsumableArray(Array.from(subDoc.childNodes)), [this.lastNode]));

      if (parentNode) {
        var rootNode = parentNode.getRootNode();
        var moveType = 'internal';
        var toRoot = false;

        if (rootNode.isConnected) {
          toRoot = true;
          moveType = 'external';
        }

        if (insertPoint) {
          parentNode.insertBefore(this.firstNode, insertPoint);
          parentNode.insertBefore(this.lastNode, insertPoint);
        } else {
          parentNode.appendChild(this.firstNode);
          parentNode.appendChild(this.lastNode);
        }

        parentNode.insertBefore(subDoc, this.lastNode);
        moveIndex++;

        if (toRoot) {
          this.attached(rootNode, parentNode);
          var attach = this.attach.items();

          for (var i in attach) {
            attach[i](rootNode, parentNode);
          }

          this.nodes.filter(function (n) {
            return n.nodeType !== Node.COMMENT_NODE;
          }).map(function (child) {
            child.dispatchEvent(new Event('cvDomAttached', {
              bubbles: true,
              target: child
            }));
          });
        }
      }

      this.renderComplete(this.nodes);
      this.postRender(parentNode);
      return this.nodes;
    }
  }, {
    key: "reRender",
    value: function reRender(parentNode, insertPoint) {
      var subDoc = new DocumentFragment();

      if (this.firstNode.isConnected) {
        var detach = this.detach.items();

        for (var i in detach) {
          detach[i]();
        }

        this.nodes.filter(function (n) {
          return n.nodeType === Node.ELEMENT_NODE;
        }).map(function (child) {
          child.dispatchEvent(new Event('cvDomDetached', {
            bubbles: true,
            target: child
          }));
        });
      }

      subDoc.append.apply(subDoc, _toConsumableArray(this.nodes)); // subDoc.appendChild(this.firstNode);
      // subDoc.appendChild(this.lastNode);

      if (parentNode) {
        if (insertPoint) {
          parentNode.insertBefore(this.firstNode, insertPoint);
          parentNode.insertBefore(this.lastNode, insertPoint);
        } else {
          parentNode.appendChild(this.firstNode);
          parentNode.appendChild(this.lastNode);
        }

        parentNode.insertBefore(subDoc, this.lastNode);
        var rootNode = parentNode.getRootNode();

        if (rootNode.isConnected) {
          this.nodes.filter(function (n) {
            return n.nodeType === Node.ELEMENT_NODE;
          }).map(function (child) {
            child.dispatchEvent(new Event('cvDomAttached', {
              bubbles: true,
              target: child
            }));
          });
          var attach = this.attach.items();

          for (var _i6 in attach) {
            attach[_i6](rootNode, parentNode);
          }
        }
      }

      return this.nodes;
    }
  }, {
    key: "mapTags",
    value: function mapTags(subDoc) {
      var _this5 = this;

      _Dom.Dom.mapTags(subDoc, false, function (tag, walker) {
        if (tag[dontParse]) {
          return;
        }

        if (tag.matches) {
          tag = _this5.mapInterpolatableTag(tag);
          tag = tag.matches('[cv-template]') && _this5.mapTemplateTag(tag) || tag;
          tag = tag.matches('[cv-slot]') && _this5.mapSlotTag(tag) || tag;
          tag = tag.matches('[cv-prerender]') && _this5.mapPrendererTag(tag) || tag;
          tag = tag.matches('[cv-link]') && _this5.mapLinkTag(tag) || tag;
          tag = tag.matches('[cv-attr]') && _this5.mapAttrTag(tag) || tag;
          tag = tag.matches('[cv-expand]') && _this5.mapExpandableTag(tag) || tag;
          tag = tag.matches('[cv-ref]') && _this5.mapRefTag(tag) || tag;
          tag = tag.matches('[cv-on]') && _this5.mapOnTag(tag) || tag;
          tag = tag.matches('[cv-each]') && _this5.mapEachTag(tag) || tag;
          tag = tag.matches('[cv-bind]') && _this5.mapBindTag(tag) || tag;
          tag = tag.matches('[cv-if]') && _this5.mapIfTag(tag) || tag;
          tag = tag.matches('[cv-with]') && _this5.mapWithTag(tag) || tag;
        } else {
          tag = _this5.mapInterpolatableTag(tag);
        }

        if (tag !== walker.currentNode) {
          walker.currentNode = tag;
        }
      });
    }
  }, {
    key: "mapExpandableTag",
    value: function mapExpandableTag(tag) {
      /*/
      const tagCompiler = this.compileExpandableTag(tag);
      	const newTag = tagCompiler(this);
      	tag.replaceWith(newTag);
      	return newTag;
      /*/
      var existing = tag[expandBind];

      if (existing) {
        existing();
        tag[expandBind] = false;
      }

      var _Bindable$resolve = _Bindable.Bindable.resolve(this.args, tag.getAttribute('cv-expand'), true),
          _Bindable$resolve2 = _slicedToArray(_Bindable$resolve, 2),
          proxy = _Bindable$resolve2[0],
          expandProperty = _Bindable$resolve2[1];

      tag.removeAttribute('cv-expand');
      console.log(proxy, expandProperty);
      this.onRemove(tag[expandBind] = proxy[expandProperty].bindTo(function (v, k, t, d, p) {
        if (d || v === undefined) {
          tag.removeAttribute(k, v);
          return;
        }

        if (v === null) {
          tag.setAttribute(k, '');
          return;
        }

        tag.setAttribute(k, v);
      })); // let expandProperty = tag.getAttribute('cv-expand');
      // let expandArg = Bindable.makeBindable(
      // 	this.args[expandProperty] || {}
      // );
      // tag.removeAttribute('cv-expand');
      // for(let i in expandArg)
      // {
      // 	if(i === 'name' || i === 'type')
      // 	{
      // 		continue;
      // 	}
      // 	let debind = expandArg.bindTo(i, ((tag,i)=>(v)=>{
      // 		tag.setAttribute(i, v);
      // 	})(tag,i));
      // 	this.onRemove(()=>{
      // 		debind();
      // 		if(expandArg.isBound())
      // 		{
      // 			Bindable.clearBindings(expandArg);
      // 		}
      // 	});
      // }

      return tag; //*/
    }
  }, {
    key: "compileExpandableTag",
    value: function compileExpandableTag(sourceTag) {
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);
        var expandProperty = tag.getAttribute('cv-expand');

        var expandArg = _Bindable.Bindable.make(bindingView.args[expandProperty] || {});

        tag.removeAttribute('cv-expand');

        var _loop = function _loop(i) {
          if (i === 'name' || i === 'type') {
            return "continue";
          }

          var debind = expandArg.bindTo(i, function (tag, i) {
            return function (v) {
              tag.setAttribute(i, v);
            };
          }(tag, i));
          bindingView.onRemove(function () {
            debind();

            if (expandArg.isBound()) {
              _Bindable.Bindable.clearBindings(expandArg);
            }
          });
        };

        for (var i in expandArg) {
          var _ret = _loop(i);

          if (_ret === "continue") continue;
        }

        return tag;
      };
    }
  }, {
    key: "mapAttrTag",
    value: function mapAttrTag(tag) {
      //*/
      var tagCompiler = this.compileAttrTag(tag);
      var newTag = tagCompiler(this);
      tag.replaceWith(newTag);
      return newTag;
      /*/
      	let attrProperty = tag.getAttribute('cv-attr');
      	tag.removeAttribute('cv-attr');
      	let pairs = attrProperty.split(',');
      let attrs = pairs.map((p) => p.split(':'));
      	for (let i in attrs)
      {
      	let proxy        = this.args;
      	let bindProperty = attrs[i][1];
      	let property     = bindProperty;
      		if(bindProperty.match(/\./))
      	{
      		[proxy, property] = Bindable.resolve(
      			this.args
      			, bindProperty
      			, true
      		);
      	}
      		let attrib = attrs[i][0];
      		this.onRemove(proxy.bindTo(
      		property
      		, (v)=>{
      			if(v == null)
      			{
      				tag.setAttribute(attrib, '');
      				return;
      			}
      			tag.setAttribute(attrib, v);
      		}
      	));
      }
      	return tag;
      	//*/
    }
  }, {
    key: "compileAttrTag",
    value: function compileAttrTag(sourceTag) {
      var attrProperty = sourceTag.getAttribute('cv-attr');
      var pairs = attrProperty.split(',');
      var attrs = pairs.map(function (p) {
        return p.split(':');
      });
      sourceTag.removeAttribute('cv-attr');
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);

        var _loop2 = function _loop2(i) {
          var bindProperty = attrs[i][1] || attrs[i][0];

          var _Bindable$resolve3 = _Bindable.Bindable.resolve(bindingView.args, bindProperty, true),
              _Bindable$resolve4 = _slicedToArray(_Bindable$resolve3, 2),
              proxy = _Bindable$resolve4[0],
              property = _Bindable$resolve4[1];

          var attrib = attrs[i][0];
          bindingView.onRemove(proxy.bindTo(property, function (v, k, t, d) {
            if (d || v === undefined) {
              tag.removeAttribute(attrib, v);
              return;
            }

            if (v === null) {
              tag.setAttribute(attrib, '');
              return;
            }

            tag.setAttribute(attrib, v);
          }));
        };

        for (var i in attrs) {
          _loop2(i);
        }

        return tag;
      };
    }
  }, {
    key: "mapInterpolatableTag",
    value: function mapInterpolatableTag(tag) {
      var _this6 = this;

      var regex = this.interpolateRegex;

      if (tag.nodeType === Node.TEXT_NODE) {
        var original = tag.nodeValue;

        if (!this.interpolatable(original)) {
          return tag;
        }

        var header = 0;
        var match;

        var _loop3 = function _loop3() {
          var bindProperty = match[2];
          var unsafeHtml = false;
          var unsafeView = false;
          var propertySplit = bindProperty.split('|');
          var transformer = false;

          if (propertySplit.length > 1) {
            transformer = _this6.stringTransformer(propertySplit.slice(1));
            bindProperty = propertySplit[0];
          }

          if (bindProperty.substr(0, 2) === '$$') {
            unsafeHtml = true;
            unsafeView = true;
            bindProperty = bindProperty.substr(2);
          }

          if (bindProperty.substr(0, 1) === '$') {
            unsafeHtml = true;
            bindProperty = bindProperty.substr(1);
          }

          if (bindProperty.substr(0, 3) === '000') {
            expand = true;
            bindProperty = bindProperty.substr(3);
            return "continue";
          }

          var staticPrefix = original.substring(header, match.index);
          header = match.index + match[1].length;
          var staticNode = document.createTextNode(staticPrefix);
          staticNode[dontParse] = true;
          tag.parentNode.insertBefore(staticNode, tag);
          var dynamicNode = void 0;

          if (unsafeHtml) {
            dynamicNode = document.createElement('div');
          } else {
            dynamicNode = document.createTextNode('');
          }

          dynamicNode[dontParse] = true;
          var proxy = _this6.args;
          var property = bindProperty;

          if (bindProperty.match(/\./)) {
            var _Bindable$resolve5 = _Bindable.Bindable.resolve(_this6.args, bindProperty, true);

            var _Bindable$resolve6 = _slicedToArray(_Bindable$resolve5, 2);

            proxy = _Bindable$resolve6[0];
            property = _Bindable$resolve6[1];
          }

          tag.parentNode.insertBefore(dynamicNode, tag);
          var debind = proxy.bindTo(property, function (v, k, t) {
            if (t[k] instanceof View && t[k] !== v) {
              if (!t[k].preserve) {
                t[k].remove();
              }
            }

            dynamicNode.nodeValue = '';

            if (unsafeView && !(v instanceof View)) {
              var unsafeTemplate = v;
              v = new View(_this6.args, _this6);
              v.template = unsafeTemplate;
            }

            if (v instanceof View) {
              var onAttach = function onAttach(parentNode) {
                v.attached(parentNode);
              };

              _this6.attach.add(onAttach);

              v.render(tag.parentNode, dynamicNode);

              var cleanup = function cleanup() {
                if (!v.preserve) {
                  v.remove();
                }
              };

              _this6.onRemove(cleanup);

              v.onRemove(function () {
                _this6.attach.remove(onAttach);

                _this6._onRemove.remove(cleanup);
              });
            } else {
              if (transformer) {
                v = transformer(v);
              }

              if (v instanceof Object && v.__toString instanceof Function) {
                v = v.__toString();
              }

              if (unsafeHtml) {
                dynamicNode.innerHTML = v;
              } else {
                dynamicNode.nodeValue = v;
              }

              dynamicNode[dontParse] = true;
            }
          });

          _this6.onRemove(function () {
            debind();

            if (!proxy.isBound()) {
              _Bindable.Bindable.clearBindings(proxy);
            }
          });
        };

        while (match = regex.exec(original)) {
          var _ret2 = _loop3();

          if (_ret2 === "continue") continue;
        }

        var staticSuffix = original.substring(header);
        var staticNode = document.createTextNode(staticSuffix);
        staticNode[dontParse] = true;
        tag.parentNode.insertBefore(staticNode, tag);
        tag.nodeValue = '';
      }

      if (tag.nodeType === Node.ELEMENT_NODE) {
        var _loop4 = function _loop4(i) {
          if (!_this6.interpolatable(tag.attributes[i].value)) {
            // console.log('!!', tag.attributes[i].value);
            return "continue";
          } // console.log(tag.attributes[i].value);


          var header = 0;
          var match = void 0;
          var original = tag.attributes[i].value;
          var attribute = tag.attributes[i];
          var bindProperties = {};
          var segments = [];

          while (match = regex.exec(original)) {
            segments.push(original.substring(header, match.index));

            if (!bindProperties[match[2]]) {
              bindProperties[match[2]] = [];
            }

            bindProperties[match[2]].push(segments.length);
            segments.push(match[1]);
            header = match.index + match[1].length;
          }

          segments.push(original.substring(header));

          var _loop5 = function _loop5(j) {
            var proxy = _this6.args;
            var property = j;
            var propertySplit = j.split('|');
            var transformer = false;
            var longProperty = j;

            if (propertySplit.length > 1) {
              transformer = _this6.stringTransformer(propertySplit.slice(1));
              property = propertySplit[0];
            }

            if (property.match(/\./)) {
              var _Bindable$resolve7 = _Bindable.Bindable.resolve(_this6.args, property, true);

              var _Bindable$resolve8 = _slicedToArray(_Bindable$resolve7, 2);

              proxy = _Bindable$resolve8[0];
              property = _Bindable$resolve8[1];
            } // if(property.match(/\./))
            // {
            // 	[proxy, property] = Bindable.resolve(
            // 		this.args
            // 		, property
            // 		, true
            // 	);
            // }
            // console.log(this.args, property);


            var matching = [];
            var bindProperty = j;
            var matchingSegments = bindProperties[longProperty];

            _this6.onRemove(proxy.bindTo(property, function (v, k, t, d) {
              if (transformer) {
                v = transformer(v);
              }

              for (var _i7 in bindProperties) {
                for (var _j in bindProperties[longProperty]) {
                  segments[bindProperties[longProperty][_j]] = t[_i7];

                  if (k === property) {
                    segments[bindProperties[longProperty][_j]] = v;
                  }
                }
              }

              tag.setAttribute(attribute.name, segments.join(''));
            }));

            _this6.onRemove(function () {
              if (!proxy.isBound()) {
                _Bindable.Bindable.clearBindings(proxy);
              }
            });
          };

          for (var j in bindProperties) {
            _loop5(j);
          }
        };

        for (var i = 0; i < tag.attributes.length; i++) {
          var _ret3 = _loop4(i);

          if (_ret3 === "continue") continue;
        }
      }

      return tag;
    }
  }, {
    key: "mapRefTag",
    value: function mapRefTag(tag) {
      var refAttr = tag.getAttribute('cv-ref');

      var _refAttr$split = refAttr.split(':'),
          _refAttr$split2 = _slicedToArray(_refAttr$split, 3),
          refProp = _refAttr$split2[0],
          refClassname = _refAttr$split2[1],
          refKey = _refAttr$split2[2];

      if (!refClassname) {
        refClassname = 'curvature/base/Tag';
      }

      var refClass = this.stringToClass(refClassname);
      tag.removeAttribute('cv-ref');
      Object.defineProperty(tag, '___tag___', {
        enumerable: false,
        writable: true
      });
      this.onRemove(function () {
        tag.___tag___ = null;
        tag.remove();
      });
      var parent = this;
      var direct = this;

      if (this.viewList) {
        parent = this.viewList.parent; // if(!this.viewList.parent.tags[refProp])
        // {
        // 	this.viewList.parent.tags[refProp] = [];
        // }
        // let refKeyVal = this.args[refKey];
        // this.viewList.parent.tags[refProp][refKeyVal] = new refClass(
        // 	tag, this, refProp, refKeyVal
        // );
      } else {// this.tags[refProp] = new refClass(
          // 	tag, this, refProp
          // );
        }

      var tagObject = new refClass(tag, this, refProp, undefined, direct);
      tag.___tag___ = tagObject;
      this.tags[refProp] = tag;

      while (parent) {
        if (!parent.parent) {}

        var refKeyVal = this.args[refKey];

        if (refKeyVal !== undefined) {
          if (!parent.tags[refProp]) {
            parent.tags[refProp] = [];
          }

          parent.tags[refProp][refKeyVal] = tagObject;
        } else {
          parent.tags[refProp] = tagObject;
        }

        parent = parent.parent;
      }

      return tag;
    }
  }, {
    key: "mapBindTag",
    value: function mapBindTag(tag) {
      var _this7 = this;

      var bindArg = tag.getAttribute('cv-bind');
      var proxy = this.args;
      var property = bindArg;
      var top = null;

      if (bindArg.match(/\./)) {
        var _Bindable$resolve9 = _Bindable.Bindable.resolve(this.args, bindArg, true);

        var _Bindable$resolve10 = _slicedToArray(_Bindable$resolve9, 3);

        proxy = _Bindable$resolve10[0];
        property = _Bindable$resolve10[1];
        top = _Bindable$resolve10[2];
      }

      if (proxy !== this.args) {
        this.subBindings[bindArg] = this.subBindings[bindArg] || [];
        this.onRemove(this.args.bindTo(top, function () {
          while (_this7.subBindings.length) {
            _this7.subBindings.shift()();
          }
        }));
      }

      var unsafeHtml = false;

      if (property.substr(0, 1) === '$') {
        property = property.substr(1);
        unsafeHtml = true;
      }

      var debind = proxy.bindTo(property, function (v, k, t, d, p) {
        if (p instanceof View && p !== v) {
          p.remove();
        }

        var autoChangedEvent = new CustomEvent('cvAutoChanged', {
          bubbles: true
        });

        if (tag.tagName === 'INPUT' || tag.tagName === 'SELECT' || tag.tagName === 'TEXTAREA') {
          var _type = tag.getAttribute('type');

          if (_type && _type.toLowerCase() === 'checkbox') {
            tag.checked = !!v;
            tag.dispatchEvent(autoChangedEvent);
          } else if (_type && _type.toLowerCase() === 'radio') {
            tag.checked = v == tag.value;
            tag.dispatchEvent(autoChangedEvent);
          } else if (_type !== 'file') {
            if (tag.tagName === 'SELECT') {
              // console.log(k, v, tag.outerHTML, tag.options.length);
              for (var i in tag.options) {
                var option = tag.options[i];

                if (option.value == v) {
                  tag.selectedIndex = i;
                }
              }
            }

            tag.value = v == null ? '' : v;
            tag.dispatchEvent(autoChangedEvent);
          }
        } else {
          var _iterator = _createForOfIteratorHelper(tag.childNodes),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var node = _step.value;
              node.remove();
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          if (v instanceof View) {
            var onAttach = function onAttach(parentNode) {
              v.attached(parentNode);
            };

            _this7.attach.add(onAttach);

            v.render(tag);
            v.onRemove(function () {
              return _this7.attach.remove(onAttach);
            });
          } else if (unsafeHtml) {
            tag.innerHTML = v;
          } else {
            tag.textContent = v;
          }
        }
      });

      if (proxy !== this.args) {
        this.subBindings[bindArg].push(debind);
      }

      this.onRemove(debind);
      var type = tag.getAttribute('type');
      var multi = tag.getAttribute('multiple');

      var inputListener = function inputListener(event) {
        // console.log(event, proxy, property, event.target.value);
        if (event.target !== tag) {
          return;
        }

        if (type && type.toLowerCase() === 'checkbox') {
          if (tag.checked) {
            proxy[property] = event.target.getAttribute('value');
          } else {
            proxy[property] = false;
          }
        } else if (event.target.matches('[contentEditable=true]')) {
          proxy[property] = event.target.innerHTML;
        } else if (type === 'file' && multi) {
          var files = Array.from(event.target.files);

          var current = proxy[property] || _Bindable.Bindable.onDeck(proxy, property);

          if (!current || !files.length) {
            proxy[property] = files;
          } else {
            var _loop6 = function _loop6(i) {
              if (files[i] !== current[i]) {
                files[i].toJSON = function () {
                  return {
                    name: file[i].name,
                    size: file[i].size,
                    type: file[i].type,
                    date: file[i].lastModified
                  };
                };

                current[i] = files[i];
                return "break";
              }
            };

            for (var i in files) {
              var _ret4 = _loop6(i);

              if (_ret4 === "break") break;
            }
          }
        } else if (type === 'file' && !multi) {
          var _file = event.target.files.item(0);

          _file.toJSON = function () {
            return {
              name: _file.name,
              size: _file.size,
              type: _file.type,
              date: _file.lastModified
            };
          };

          proxy[property] = _file;
        } else {
          proxy[property] = event.target.value;
        }
      };

      if (type === 'file' || type === 'radio') {
        tag.addEventListener('change', inputListener);
      } else {
        tag.addEventListener('input', inputListener);
        tag.addEventListener('change', inputListener);
        tag.addEventListener('value-changed', inputListener);
      }

      this.onRemove(function (tag, eventListener) {
        return function () {
          if (type === 'file' || type === 'radio') {
            tag.removeEventListener('change', inputListener);
          } else {
            tag.removeEventListener('input', inputListener);
            tag.removeEventListener('change', inputListener);
            tag.removeEventListener('value-changed', inputListener);
          }

          tag = undefined;
          eventListener = undefined;
        };
      }(tag, inputListener));
      tag.removeAttribute('cv-bind');
      return tag;
    }
  }, {
    key: "mapOnTag",
    value: function mapOnTag(tag) {
      var _this8 = this;

      var referent = String(tag.getAttribute('cv-on'));
      var action = referent.split(';').map(function (a) {
        return a.split(':');
      }).map(function (a) {
        a = a.map(function (a) {
          return a.trim();
        });
        var eventName = a[0].trim();
        var callbackName = a[1] || a[0];
        var eventFlags = String(a[2] || '');
        var argList = [];
        var groups = /(\w+)(?:\(([$\w\s'",]+)\))?/.exec(callbackName); // if(!groups)
        // {
        // 	throw new Error(
        // 		'Invalid event method referent: '
        // 		+ tag.getAttribute('cv-on')
        // 	);
        // }

        if (groups) {
          callbackName = groups[1].replace(/(^[\s\n]+|[\s\n]+$)/, '');

          if (groups[2]) {
            argList = groups[2].split(',').map(function (s) {
              return s.trim();
            });
          }

          if (groups.length) {}
        }

        if (!eventName) {
          eventName = callbackName;
        }

        var eventMethod;
        var parent = _this8;

        while (parent) {
          if (typeof parent[callbackName] === 'function') {
            var _ret5 = function () {
              var _parent = parent;
              var _callBackName = callbackName;

              eventMethod = function eventMethod() {
                _parent[_callBackName].apply(_parent, arguments);
              };

              return "break";
            }();

            if (_ret5 === "break") break;
          }

          if (parent.parent) {
            parent = parent.parent;
          } else {
            break;
          }
        }

        var eventListener = function eventListener(event) {
          var argRefs = argList.map(function (arg) {
            var match;

            if (parseInt(arg) == arg) {
              return arg;
            } else if (arg === 'event' || arg === '$event') {
              return event;
            } else if (arg === '$view') {
              return parent;
            } else if (arg === '$tag') {
              return tag;
            } else if (arg === '$parent') {
              return _this8.parent;
            } else if (arg === '$subview') {
              return _this8;
            } else if (arg in _this8.args) {
              return _this8.args[arg];
            } else if (match = /^['"](\w+?)["']$/.exec(arg)) {
              return match[1];
            }
          });

          if (!(typeof eventMethod === 'function')) {
            throw new Error("".concat(callbackName, " is not defined on View object.") + "\n" + "Tag:" + "\n" + "".concat(tag.outerHTML));
          }

          eventMethod.apply(void 0, _toConsumableArray(argRefs));
        };

        var eventOptions = {};

        if (eventFlags.includes('p')) {
          eventOptions.passive = true;
        } else if (eventFlags.includes('P')) {
          eventOptions.passive = false;
        }

        if (eventFlags.includes('c')) {
          eventOptions.capture = true;
        } else if (eventFlags.includes('C')) {
          eventOptions.capture = false;
        }

        if (eventFlags.includes('o')) {
          eventOptions.once = true;
        } else if (eventFlags.includes('O')) {
          eventOptions.once = false;
        }

        switch (eventName) {
          case '_init':
            eventListener();
            break;

          case '_attach':
            _this8.attach.add(eventListener);

            break;

          case '_detach':
            _this8.detach.add(eventListener);

            break;

          default:
            tag.addEventListener(eventName, eventListener, eventOptions);

            _this8.onRemove(function () {
              tag.removeEventListener(eventName, eventListener, eventOptions);
            });

            break;
        }

        return [eventName, callbackName, argList];
      });
      tag.removeAttribute('cv-on');
      return tag;
    }
  }, {
    key: "mapLinkTag",
    value: function mapLinkTag(tag) {
      /*/
      const tagCompiler = this.compileLinkTag(tag);
      	const newTag = tagCompiler(this);
      	tag.replaceWith(newTag);
      	return newTag;
      /*/
      var linkAttr = tag.getAttribute('cv-link');
      tag.setAttribute('href', linkAttr);

      var linkClick = function linkClick(event) {
        event.preventDefault();

        if (linkAttr.substring(0, 4) === 'http' || linkAttr.substring(0, 2) === '//') {
          window.open(tag.getAttribute('href', linkAttr));
          return;
        }

        _Router.Router.go(tag.getAttribute('href'));
      };

      tag.addEventListener('click', linkClick);
      this.onRemove(function (tag, eventListener) {
        return function () {
          tag.removeEventListener('click', eventListener);
          tag = undefined;
          eventListener = undefined;
        };
      }(tag, linkClick));
      tag.removeAttribute('cv-link');
      return tag; //*/
    }
  }, {
    key: "compileLinkTag",
    value: function compileLinkTag(sourceTag) {
      var linkAttr = sourceTag.getAttribute('cv-link');
      sourceTag.removeAttribute('cv-link');
      return function (bindingView) {
        var tag = sourceTag.cloneNode(true);
        tag.setAttribute('href', linkAttr);
        tag.addEventListener('click', View.linkClicked);
        bindingView.onRemove(function () {
          return tag.removeEventListener(View.linkClicked);
        });
        return tag;
      };
    }
  }, {
    key: "mapPrendererTag",
    value: function mapPrendererTag(tag) {
      var prerenderAttr = tag.getAttribute('cv-prerender');
      var prerendering = window.prerenderer || navigator.userAgent.match(/prerender/i);

      if (prerendering) {
        window.prerenderer = window.prerenderer || true;
      }

      if (prerenderAttr === 'never' && prerendering || prerenderAttr === 'only' && !prerendering) {
        tag.parentNode.removeChild(tag);
      }

      return tag;
    }
  }, {
    key: "mapWithTag",
    value: function mapWithTag(tag) {
      var _this9 = this;

      var withAttr = tag.getAttribute('cv-with');
      var carryAttr = tag.getAttribute('cv-carry');
      tag.removeAttribute('cv-with');
      tag.removeAttribute('cv-carry');
      var subTemplate = new DocumentFragment();
      Array.from(tag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      });
      var carryProps = [];

      if (carryAttr) {
        carryProps = carryAttr.split(',').map(function (s) {
          return s.trim();
        });
      }

      var debind = this.args.bindTo(withAttr, function (v, k, t, d) {
        if (_this9.withViews[k]) {
          _this9.withViews[k].remove();
        }

        while (tag.firstChild) {
          tag.removeChild(tag.firstChild);
        }

        var view = new View({}, _this9);

        _this9.onRemove(function (view) {
          return function () {
            view.remove();
          };
        }(view));

        view.template = subTemplate;

        var _loop7 = function _loop7(i) {
          var debind = _this9.args.bindTo(carryProps[i], function (v, k) {
            view.args[k] = v;
          });

          view.onRemove(debind);

          _this9.onRemove(function () {
            debind();
            view.remove();
          });
        };

        for (var i in carryProps) {
          _loop7(i);
        }

        var _loop8 = function _loop8(_i8) {
          var debind = v.bindTo(_i8, function (v, k) {
            view.args[k] = v;
          });

          _this9.onRemove(function () {
            debind();

            if (!v.isBound()) {
              _Bindable.Bindable.clearBindings(v);
            }

            view.remove();
          });

          view.onRemove(function () {
            debind();

            if (!v.isBound()) {
              _Bindable.Bindable.clearBindings(v);
            }
          });
        };

        for (var _i8 in v) {
          _loop8(_i8);
        }

        view.render(tag);
        _this9.withViews[k] = view;
      });
      this.onRemove(debind);
      return tag;
    }
  }, {
    key: "mapEachTag",
    value: function mapEachTag(tag) {
      var _this10 = this;

      var eachAttr = tag.getAttribute('cv-each');
      tag.removeAttribute('cv-each');
      var subTemplate = new DocumentFragment();
      Array.from(tag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      });

      var _eachAttr$split = eachAttr.split(':'),
          _eachAttr$split2 = _slicedToArray(_eachAttr$split, 3),
          eachProp = _eachAttr$split2[0],
          asProp = _eachAttr$split2[1],
          keyProp = _eachAttr$split2[2];

      var debind = this.args.bindTo(eachProp, function (v, k, t, d, p) {
        if (_this10.viewLists[eachProp]) {
          _this10.viewLists[eachProp].remove();
        }

        var viewList = new _ViewList.ViewList(subTemplate, asProp, v, _this10, keyProp);

        var viewListRemover = function viewListRemover() {
          return viewList.remove();
        };

        _this10.onRemove(viewListRemover);

        viewList.onRemove(function () {
          return _this10._onRemove.remove(viewListRemover);
        });

        var debindA = _this10.args.bindTo(function (v, k, t, d) {
          if (k === '_id') {
            return;
          }

          viewList.subArgs[k] = v;
        });

        var debindB = viewList.args.bindTo(function (v, k, t, d, p) {
          if (k === '_id' || k === 'value' || k.substring(0, 3) === '___') {
            return;
          }

          if (k in _this10.args) {
            _this10.args[k] = v;
          }
        });
        viewList.onRemove(debindA);
        viewList.onRemove(debindB);

        _this10.onRemove(debindA);

        _this10.onRemove(debindB);

        while (tag.firstChild) {
          tag.removeChild(tag.firstChild);
        }

        _this10.viewLists[eachProp] = viewList;
        viewList.render(tag);
      });
      this.onRemove(debind);
      return tag;
    }
  }, {
    key: "mapIfTag",
    value: function mapIfTag(tag) {
      /*/
      const tagCompiler = this.compileIfTag(tag);
      	const newTag = tagCompiler(this);
      	tag.replaceWith(newTag);
      	return newTag;
      	/*/
      var sourceTag = tag;
      var ifProperty = sourceTag.getAttribute('cv-if');
      var inverted = false;
      sourceTag.removeAttribute('cv-if');

      if (ifProperty.substr(0, 1) === '!') {
        ifProperty = ifProperty.substr(1);
        inverted = true;
      }

      var subTemplate = new DocumentFragment();
      Array.from(sourceTag.childNodes).map(function (n) {
        return subTemplate.appendChild(n);
      } // n => subTemplate.appendChild(n.cloneNode(true))
      );
      var bindingView = this;
      var ifDoc = new DocumentFragment();
      var view = new View(this.args, bindingView);
      view.template = subTemplate; // view.parent   = bindingView;
      // bindingView.syncBind(view);

      var proxy = bindingView.args;
      var property = ifProperty;

      if (ifProperty.match(/\./)) {
        var _Bindable$resolve11 = _Bindable.Bindable.resolve(bindingView.args, ifProperty, true);

        var _Bindable$resolve12 = _slicedToArray(_Bindable$resolve11, 2);

        proxy = _Bindable$resolve12[0];
        property = _Bindable$resolve12[1];
      }

      var hasRendered = false;
      var propertyDebind = proxy.bindTo(property, function (v, k) {
        if (!hasRendered) {
          var initValue = proxy[property];
          var renderDoc = !!initValue ^ !!inverted ? tag : ifDoc;
          view.render(renderDoc);
          hasRendered = true;
          return;
        }

        if (Array.isArray(v)) {
          v = !!v.length;
        }

        if (inverted) {
          v = !v;
        }

        if (v) {
          tag.appendChild(ifDoc);
        } else {
          view.nodes.map(function (n) {
            return ifDoc.appendChild(n);
          });
        }
      }); // const propertyDebind = this.args.bindChain(property, onUpdate);

      bindingView.onRemove(propertyDebind);

      var bindableDebind = function bindableDebind() {
        if (!proxy.isBound()) {
          _Bindable.Bindable.clearBindings(proxy);
        }
      };

      var viewDebind = function viewDebind() {
        propertyDebind();
        bindableDebind();

        bindingView._onRemove.remove(propertyDebind);

        bindingView._onRemove.remove(bindableDebind);
      };

      bindingView.onRemove(viewDebind);
      return tag; //*/
    }
  }, {
    key: "compileIfTag",
    value: function compileIfTag(sourceTag) {
      var ifProperty = sourceTag.getAttribute('cv-if');
      var inverted = false;
      sourceTag.removeAttribute('cv-if');

      if (ifProperty.substr(0, 1) === '!') {
        ifProperty = ifProperty.substr(1);
        inverted = true;
      }

      var subTemplate = new DocumentFragment();
      Array.from(sourceTag.childNodes).map(function (n) {
        return subTemplate.appendChild(n.cloneNode(true));
      });
      return function (bindingView) {
        var tag = sourceTag.cloneNode();
        var ifDoc = new DocumentFragment();
        var view = new View({}, bindingView);
        view.template = subTemplate; // view.parent   = bindingView;

        bindingView.syncBind(view);
        var proxy = bindingView.args;
        var property = ifProperty;

        if (ifProperty.match(/\./)) {
          var _Bindable$resolve13 = _Bindable.Bindable.resolve(bindingView.args, ifProperty, true);

          var _Bindable$resolve14 = _slicedToArray(_Bindable$resolve13, 2);

          proxy = _Bindable$resolve14[0];
          property = _Bindable$resolve14[1];
        }

        var hasRendered = false;
        var propertyDebind = proxy.bindTo(property, function (v, k) {
          if (!hasRendered) {
            var renderDoc = bindingView.args[property] || inverted ? tag : ifDoc;
            view.render(renderDoc);
            hasRendered = true;
            return;
          }

          if (Array.isArray(v)) {
            v = !!v.length;
          }

          if (inverted) {
            v = !v;
          }

          if (v) {
            tag.appendChild(ifDoc);
          } else {
            view.nodes.map(function (n) {
              return ifDoc.appendChild(n);
            });
          }
        }); // let cleaner = bindingView;
        // while(cleaner.parent)
        // {
        // 	cleaner = cleaner.parent;
        // }

        bindingView.onRemove(propertyDebind);

        var bindableDebind = function bindableDebind() {
          if (!proxy.isBound()) {
            _Bindable.Bindable.clearBindings(proxy);
          }
        };

        var viewDebind = function viewDebind() {
          propertyDebind();
          bindableDebind();

          bindingView._onRemove.remove(propertyDebind);

          bindingView._onRemove.remove(bindableDebind);
        };

        view.onRemove(viewDebind);
        return tag;
      };
    }
  }, {
    key: "mapTemplateTag",
    value: function mapTemplateTag(tag) {
      var templateName = tag.getAttribute('cv-template');
      tag.removeAttribute('cv-template');

      this.subTemplates[templateName] = function () {
        return tag.tagName === 'TEMPLATE' ? tag.content.cloneNode(true) : new DocumentFragment(tag.innerHTML);
      };

      return tag;
    }
  }, {
    key: "mapSlotTag",
    value: function mapSlotTag(tag) {
      var templateName = tag.getAttribute('cv-slot');
      var getTemplate = this.subTemplates[templateName];

      if (!getTemplate) {
        var parent = this;

        while (parent) {
          getTemplate = parent.subTemplates[templateName];

          if (getTemplate) {
            break;
          }

          parent = this.parent;
        }

        if (!getTemplate) {
          console.error("Template ".concat(templateName, " not found."));
          return;
        }
      }

      var template = getTemplate();
      tag.removeAttribute('cv-slot');

      while (tag.firstChild) {
        tag.firstChild.remove();
      }

      tag.appendChild(template);
      return tag;
    } // compileTag(sourceTag)
    // {
    // 	return (bindingView) => {
    // 		const tag = sourceTag.cloneNode(true);
    // 		return tag;
    // 	};
    // }

  }, {
    key: "syncBind",
    value: function syncBind(subView) {
      var _this11 = this;

      var debindA = this.args.bindTo(function (v, k, t, d) {
        if (k === '_id') {
          return;
        }

        if (subView.args[k] !== v) {
          subView.args[k] = v;
        }
      }); // for(let i in this.args)
      // {
      // 	if(i == '_id')
      // 	{
      // 		continue;
      // 	}
      // 	subView.args[i] = this.args[i];
      // }

      var debindB = subView.args.bindTo(function (v, k, t, d, p) {
        if (k === '_id') {
          return;
        }

        var newRef = v;
        var oldRef = p;

        if (newRef instanceof View) {
          newRef = newRef.___ref___;
        }

        if (oldRef instanceof View) {
          oldRef = oldRef.___ref___;
        }

        if (newRef !== oldRef && oldRef instanceof View) {
          p.remove();
        }

        if (k in _this11.args) {
          _this11.args[k] = v;
        }
      });
      this.onRemove(debindA);
      this.onRemove(debindB);
      subView.onRemove(function () {
        _this11._onRemove.remove(debindA);

        _this11._onRemove.remove(debindB);
      });
    }
  }, {
    key: "postRender",
    value: function postRender(parentNode) {}
  }, {
    key: "attached",
    value: function attached(parentNode) {}
  }, {
    key: "interpolatable",
    value: function interpolatable(str) {
      return !!String(str).match(this.interpolateRegex);
    }
  }, {
    key: "uuid",
    value: function uuid() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
        return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this12 = this;

      var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var remover = function remover() {
        _this12.firstNode = _this12.lastNode = undefined;

        for (var _i9 in _this12.nodes) {
          _this12.nodes[_i9].dispatchEvent(new Event('cvDomDetached'));

          _this12.nodes[_i9].remove();
        } // Bindable.clearBindings(this.args);

      };

      if (now) {
        remover();
      } else {
        requestAnimationFrame(remover);
      }

      var callbacks = this._onRemove.items();

      var _iterator2 = _createForOfIteratorHelper(callbacks),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var callback = _step2.value;

          this._onRemove.remove(callback);

          callback();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var cleanup;

      while (cleanup = this.cleanup.shift()) {
        cleanup && cleanup();
      }

      for (var _i10 in this.viewLists) {
        if (!this.viewLists[_i10]) {
          continue;
        }

        this.viewLists[_i10].remove();
      }

      this.viewLists = [];

      for (var _i11 in this.timeouts) {
        clearInterval(this.timeouts[_i11].timeout);
        delete this.timeouts[_i11];
      }

      for (var i in this.intervals) {
        clearInterval(this.intervals[i].timeout);
        delete this.intervals[i];
      }

      this.removed = true;
    }
  }, {
    key: "findTag",
    value: function findTag(selector) {
      for (var i in this.nodes) {
        var result = void 0;

        if (!this.nodes[i].querySelector) {
          continue;
        }

        if (this.nodes[i].matches(selector)) {
          return this.nodes[i];
        }

        if (result = this.nodes[i].querySelector(selector)) {
          return result;
        }
      }
    }
  }, {
    key: "findTags",
    value: function findTags(selector) {
      return this.nodes, map(function (n) {
        return n.querySelectorAll(selector);
      }).flat();
    }
  }, {
    key: "onRemove",
    value: function onRemove(callback) {
      this._onRemove.add(callback);
    }
  }, {
    key: "update",
    value: function update() {}
  }, {
    key: "beforeUpdate",
    value: function beforeUpdate(args) {}
  }, {
    key: "afterUpdate",
    value: function afterUpdate(args) {}
  }, {
    key: "stringTransformer",
    value: function stringTransformer(methods) {
      var _this13 = this;

      return function (x) {
        for (var m in methods) {
          var parent = _this13;
          var method = methods[m];

          while (parent && !parent[method]) {
            parent = parent.parent;
          }

          if (!parent) {
            return;
          }

          x = parent[methods[m]](x);
        }

        return x;
      };
    }
  }, {
    key: "stringToClass",
    value: function stringToClass(refClassname) {
      if (View.refClasses.has(refClassname)) {
        return View.refClasses.get(refClassname);
      }

      var refClassSplit = refClassname.split('/');
      var refShortClassname = refClassSplit[refClassSplit.length - 1];

      var refClass = require(refClassname);

      View.refClasses.set(refClassname, refClass[refShortClassname]);
      return refClass[refShortClassname];
    }
  }, {
    key: "preventParsing",
    value: function preventParsing(node) {
      node[dontParse] = true;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.nodes.map(function (n) {
        return n.outerHTML;
      }).join(' ');
    }
  }], [{
    key: "isView",
    value: function isView() {
      return View;
    }
  }]);

  return View;
}();

exports.View = View;
Object.defineProperty(View, 'templates', {
  enumerable: false,
  writable: false,
  value: new Map()
});
Object.defineProperty(View, 'refClasses', {
  enumerable: false,
  writable: false,
  value: new Map()
});
Object.defineProperty(View, 'linkClicked', function (event) {
  event.preventDefault();
  var href = event.target.getAttribute('href');

  if (href.substring(0, 4) === 'http' || href.substring(0, 2) === '//') {
    window.open(href);
    return;
  }

  _Router.Router.go(href);
});
  })();
});

require.register("curvature/base/ViewList.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewList = void 0;

var _Bindable = require("./Bindable");

var _View = require("./View");

var _Bag = require("./Bag");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ViewList = /*#__PURE__*/function () {
  function ViewList(template, subProperty, list, parent) {
    var _this = this;

    var keyProperty = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    _classCallCheck(this, ViewList);

    this.removed = false;
    this.args = _Bindable.Bindable.makeBindable({});
    this.args.value = _Bindable.Bindable.makeBindable(list || {});
    this.subArgs = _Bindable.Bindable.makeBindable({});
    this.views = [];
    this.cleanup = [];
    this._onRemove = new _Bag.Bag();
    this.template = template;
    this.subProperty = subProperty;
    this.keyProperty = keyProperty;
    this.tag = null;
    this.paused = false;
    this.parent = parent;
    this.rendered = new Promise(function (accept, reject) {
      Object.defineProperty(_this, 'renderComplete', {
        configurable: false,
        writable: true,
        value: accept
      });
    });
    this.willReRender = false;

    this.args.___before(function (t, e, s, o) {
      if (e == 'bindTo') {
        return;
      }

      _this.paused = true;
    });

    this.args.___after(function (t, e, s, o) {
      if (e == 'bindTo') {
        return;
      }

      _this.paused = s.length > 1;

      _this.reRender();
    });

    var debind = this.args.value.bindTo(function (v, k, t, d) {
      if (_this.paused) {
        return;
      }

      var kk = k;

      if (isNaN(k)) {
        kk = '_' + k;
      }

      if (d) {
        if (_this.views[kk]) {
          _this.views[kk].remove();
        }

        delete _this.views[kk]; // this.views.splice(k,1);

        for (var i in _this.views) {
          if (typeof i === 'string') {
            _this.views[i].args[_this.keyProperty] = i.substr(1);
            continue;
          }

          _this.views[i].args[_this.keyProperty] = i;
        }
      } else if (!_this.views[kk] && !_this.willReRender) {
        _this.willReRender = requestAnimationFrame(function () {
          _this.reRender();
        });
      } else if (_this.views[kk] && _this.views[kk].args) {
        _this.views[kk].args[_this.keyProperty] = k;
        _this.views[kk].args[_this.subProperty] = v;
      }
    });

    this._onRemove.add(debind);
  }

  _createClass(ViewList, [{
    key: "render",
    value: function render(tag) {
      var _this2 = this;

      var renders = [];

      var _iterator = _createForOfIteratorHelper(this.views),
          _step;

      try {
        var _loop = function _loop() {
          var view = _step.value;
          view.render(tag);
          renders.push(view.rendered.then(function () {
            return view;
          }));
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.tag = tag;
      Promise.all(renders).then(function (views) {
        return _this2.renderComplete(views);
      });
    }
  }, {
    key: "reRender",
    value: function reRender() {
      var _this3 = this;

      if (this.paused || !this.tag) {
        return;
      }

      var views = [];

      for (var i in this.views) {
        views[i] = this.views[i];
      }

      var finalViews = [];

      for (var _i in this.args.value) {
        var found = false;
        var k = _i;

        if (isNaN(k)) {
          k = '_' + _i;
        }

        for (var j in views) {
          if (views[j] && this.args.value[_i] !== undefined && this.args.value[_i] === views[j].args[this.subProperty]) {
            found = true;
            finalViews[k] = views[j];
            finalViews[k].args[this.keyProperty] = _i;
            delete views[j];
            break;
          }
        }

        if (!found) {
          (function () {
            var viewArgs = {};
            var view = finalViews[k] = new _View.View(viewArgs, _this3.parent);
            finalViews[k].template = _this3.template instanceof Object ? _this3.template : _this3.template; // finalViews[k].parent   = this.parent;

            finalViews[k].viewList = _this3;
            finalViews[k].args[_this3.keyProperty] = _i;
            finalViews[k].args[_this3.subProperty] = _this3.args.value[_i];
            var upDebind = viewArgs.bindTo(_this3.subProperty, function (v, k) {
              var index = viewArgs[_this3.keyProperty];
              _this3.args.value[index] = v;
            });

            var downDebind = _this3.subArgs.bindTo(function (v, k, t, d) {
              viewArgs[k] = v;
            });

            view.onRemove(function () {
              upDebind();
              downDebind();

              _this3._onRemove.remove(upDebind);

              _this3._onRemove.remove(downDebind);
            });

            _this3._onRemove.add(upDebind);

            _this3._onRemove.add(downDebind);

            viewArgs[_this3.subProperty] = _this3.args.value[_i];
          })();
        }
      }

      for (var _i2 in views) {
        var _found = false;

        for (var _j in finalViews) {
          if (views[_i2] === finalViews[_j]) {
            _found = true;
            break;
          }
        }

        if (!_found) {
          views[_i2].remove();
        }
      }

      if (Array.isArray(this.args.value)) {
        var renderRecurse = function renderRecurse() {
          var i = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var ii = finalViews.length - i - 1;

          if (!finalViews[ii]) {
            return Promise.resolve();
          }

          if (finalViews[ii] === _this3.views[ii]) {
            if (!finalViews[ii].firstNode) {
              finalViews[ii].render(_this3.tag, finalViews[ii + 1]);
              return finalViews[ii].rendered.then(function () {
                return renderRecurse(i + 1);
              });
            }

            return renderRecurse(i + 1);
          }

          finalViews[ii].render(_this3.tag, finalViews[ii + 1]);

          _this3.views.splice(ii, 0, finalViews[ii]);

          return finalViews[ii].rendered.then(function () {
            return renderRecurse(i + 1);
          });
        };

        this.rendered = renderRecurse();
      } else {
        var renders = [];
        var leftovers = Object.assign({}, finalViews);

        var _loop2 = function _loop2(_i3) {
          delete leftovers[_i3];

          if (finalViews[_i3].firstNode && finalViews[_i3] === _this3.views[_i3]) {
            return "continue";
          }

          finalViews[_i3].render(_this3.tag);

          renders.push(finalViews[_i3].rendered.then(function () {
            return finalViews[_i3];
          }));
        };

        for (var _i3 in finalViews) {
          var _ret = _loop2(_i3);

          if (_ret === "continue") continue;
        }

        for (var _i4 in leftovers) {
          delete this.args.views[_i4];
          leftovers.remove();
        }

        this.rendered = Promise.all(renders);
      }

      this.views = finalViews;

      for (var _i5 in finalViews) {
        if (isNaN(_i5)) {
          finalViews[_i5].args[this.keyProperty] = _i5.substr(1);
          continue;
        }

        finalViews[_i5].args[this.keyProperty] = _i5;
      }

      this.willReRender = false;
    }
  }, {
    key: "pause",
    value: function pause() {
      var _pause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      for (var i in this.views) {
        this.views[i].pause(_pause);
      }
    }
  }, {
    key: "onRemove",
    value: function onRemove(callback) {
      this._onRemove.add(callback);
    }
  }, {
    key: "remove",
    value: function remove() {
      for (var i in this.views) {
        this.views[i].remove();
      }

      var onRemove = this._onRemove.items();

      for (var _i6 in onRemove) {
        this._onRemove.remove(onRemove[_i6]);

        onRemove[_i6]();
      }

      var cleanup;

      while (this.cleanup.length) {
        cleanup = this.cleanup.pop();
        cleanup();
      }

      this.views = [];

      while (this.tag && this.tag.firstChild) {
        this.tag.removeChild(this.tag.firstChild);
      }

      if (this.subArgs) {
        _Bindable.Bindable.clearBindings(this.subArgs);
      }

      _Bindable.Bindable.clearBindings(this.args);

      if (this.args.value && !this.args.value.isBound()) {
        _Bindable.Bindable.clearBindings(this.args.value);
      }

      this.removed = true;
    }
  }]);

  return ViewList;
}();

exports.ViewList = ViewList;
  })();
});

require.register("subspace-client/Channel.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-client");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Channel = exports.Channel = function () {
	function Channel() {
		_classCallCheck(this, Channel);
	}

	_createClass(Channel, null, [{
		key: 'scalar',
		value: function scalar(data, type) {
			var buffer = new Uint8Array(data).buffer;

			if (type == 'float') {
				return new Float64Array(buffer)[0];
			} else if (type == 'Int32') {
				return new Int32Array(buffer)[0];
			}
		}
	}, {
		key: 'namePart',
		value: function namePart(name, part) {
			return name.split(':')[part] || null;
		}
	}, {
		key: 'isWildcard',
		value: function isWildcard(name) {
			return (/\*/.exec(name)
			);
		}
	}, {
		key: 'isRange',
		value: function isRange(name) {
			// return /\*/.exec(name);
		}
	}, {
		key: 'containsRange',
		value: function containsRange(name) {
			// return /\*/.exec(name);
		}
	}, {
		key: 'compareNames',
		value: function compareNames(a, b) {
			var rangeForm = /^(\d+)\-?(\d+)?$/;

			var result = [];
			var splitA = a.toString().split(':');
			var splitB = b.toString().split(':');
			var nodes = splitA.length;
			var cmpA = void 0;
			var cmpB = void 0;

			if (nodes < splitB.length) {
				nodes = splitB.length;
			}

			for (var i = 0; i < nodes; i++) {
				if (splitA.length > i) {
					cmpA = splitA[i];
				} else if (splitA[splitA.length - 1] == '*') {
					cmpA = splitA[splitA.length - 1];
				} else {
					return false;
				}

				if (splitB.length > i) {
					cmpB = splitB[i];
				} else if (splitB[splitB.length - 1] == '*') {
					cmpB = splitB[splitB.length - 1];
				} else {
					return false;
				}

				var returnNode = cmpA !== '*' ? cmpA : cmpB;

				if (cmpA !== cmpB) {
					if (cmpA !== '*' && cmpB !== '*') {
						var mA = rangeForm.exec(cmpA);
						var mB = rangeForm.exec(cmpB);

						if (mA && mB) {
							var a1 = mA[1];
							var a2 = mA[1];
							var b1 = mB[1];
							var b2 = mB[1];

							if (mA[2]) {
								a2 = mA[2];
							}

							if (mB[2]) {
								b2 = mB[2];
							}

							if (a1 >= b1 && a2 <= b2) {
								returnNode = a1 + '-' + a2;
							} else if (a1 <= b1 && a2 > b2) {
								returnNode = b1 + '-' + b2;
							} else if (a2 <= b2 && a2 >= b1) {
								returnNode = b1 + '-' + a2;
							} else if (a1 <= b2 && a1 >= b1) {
								returnNode = a1 + '-' + b2;
							}
							if (b2 <= a2 && b2 >= a1) {
								returnNode = a1 + '-' + b2;
							} else if (b1 <= a2 && b1 >= a1) {
								returnNode = b1 + '-' + a2;
							} else {
								return false;
							}
						} else {
							return false;
						}
					}
				}

				result.push(returnNode);
			}

			return result.join(':');
		}
	}]);

	return Channel;
}();
  })();
});

require.register("subspace-client/Socket.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-client");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Socket = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Channel = require('./Channel');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Socket = exports.Socket = function () {
	_createClass(Socket, null, [{
		key: 'get',
		value: function get(url) {
			var refresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			if (!this.sockets) {
				this.sockets = {};
			}

			if (refresh || !this.sockets[url]) {
				this.sockets[url] = new this(new WebSocket(url));
			}

			return this.sockets[url];
		}
	}]);

	function Socket(socket) {
		_classCallCheck(this, Socket);

		this.socket = socket;
		socket.binaryType = 'arraybuffer';
		this.data = {};
		this.listenerCount = {};
		this.openQueue = [];
		this._onSend = [];
	}

	_createClass(Socket, [{
		key: 'subscribe',
		value: function subscribe(type, wildType, callback) {
			var splitType = type.split(':');
			var mainType = splitType.shift();
			var channel = splitType.join(':');

			if (wildType instanceof Function) {
				callback = wildType;
				wildType = channel;
			}

			if (channel) {
				if (!(channel in this.listenerCount)) {
					this.listenerCount[channel] = 0;
				}

				this.listenerCount[channel]++;

				this.send('sub ' + channel);
			}

			var finalCallback = function (mainType, wildType, channel, callback) {
				return function (event) {

					var packet = {};

					try {
						if (typeof event.data == 'string') {
							packet = JSON.parse(event.data);
						} else if (event.data instanceof ArrayBuffer) {
							var channelNumber = new Uint16Array(event.data, 4, 1)[0];

							if (!wildType || _Channel.Channel.compareNames(wildType, channelNumber)) {
								callback(event, event.data.slice(6), channelNumber, new Uint16Array(event.data, 0, 1)[0] ? 'user' : 'server', new Uint16Array(event.data, 2, 1)[0], null, {});
								return;
							}
						} else if (mainType !== 'message') {
							callback(event);
							return;
						}
					} catch (e) {
						if (mainType !== 'message') {
							callback(event);
						}
						return;
					}

					if ((typeof packet === 'undefined' ? 'undefined' : _typeof(packet)) !== 'object') {
						if (channel === '') {
							callback(event, event.data, null, 'server', 0, null, packet);
						}
						return;
					}

					if (!wildType) {
						callback(event, packet.message, null, packet.origin, packet.originId, null, packet);
					}

					if (wildType && 'channel' in packet) {
						if (_Channel.Channel.compareNames(wildType, packet.channel)) {
							callback(event, packet.message, packet.channel, packet.origin, packet.originId, packet.originalChannel, packet);
						}
					}
				};
			}(mainType, wildType, channel, callback);

			this.socket.addEventListener(mainType, finalCallback);

			return finalCallback;
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(type, callback) {
			var splitType = type.split(':');
			var mainType = splitType.shift();
			var channel = splitType.join(':');

			if (!channel) {
				return;
			}

			this.listenerCount[channel]--;

			if (channel in this.listenerCount && this.listenerCount[channel] > 0) {} else {
				this.socket.removeEventListener(mainType, callback);
				this.send('unsub ' + channel);
			}
		}
	}, {
		key: 'publish',
		value: function publish(channel, message) {
			if (channel == parseInt(channel)) {
				if (message instanceof ArrayBuffer) {
					message = new Uint8Array(message);
				} else if (message.byteLength) {
					message = new Uint8Array(message.buffer);
				} else if (!Array.isArray(message)) {
					message = [message];
				}

				var channelBytes = new Uint8Array(new Uint16Array([channel]).buffer);

				var sendBuffer = new Uint8Array(channelBytes.byteLength + message.byteLength);

				sendBuffer.set(channelBytes, 0);
				sendBuffer.set(message, channelBytes.byteLength);

				this.send(sendBuffer);

				return;
			}

			this.send('pub ' + channel + ' ' + message);
		}
	}, {
		key: 'send',
		value: function send(message) {
			var _this = this;

			if (this.socket.readyState !== this.socket.OPEN) {
				return new Promise(function (accept, reject) {
					var connectionOpened = function (c) {
						return function (event) {

							while (_this.openQueue.length) {
								var _message = _this.openQueue.shift();

								_this.send(_message);
							}

							_this.socket.removeEventListener('open', c);

							accept();
						};
					}(connectionOpened);

					_this.socket.addEventListener('open', connectionOpened);

					_this.openQueue.unshift(message);
				});
			}

			for (var i in this._onSend) {
				this._onSend[i](message);
			}

			this.socket.send(message);

			return Promise.resolve();
		}
	}, {
		key: 'onSend',
		value: function onSend(callback) {
			this._onSend.push(callback);
		}
	}, {
		key: 'close',
		value: function close(message) {
			this.socket.close();
		}
	}, {
		key: 'ping',
		value: function ping() {
			// this.socket.ping();
		}
	}, {
		key: 'pong',
		value: function pong() {
			// this.socket.pong();
		}
	}]);

	return Socket;
}();
  })();
});

require.register("subspace-console/Console.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Console = void 0;

var _View2 = require("curvature/base/View");

var _Socket = require("subspace-client/Socket");

var _MeltingText = require("view/MeltingText");

var _Task = require("./Task");

var _Path = require("./Path");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Console = /*#__PURE__*/function (_View) {
  _inherits(Console, _View);

  var _super = _createSuper(Console);

  function Console() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Console);

    console.log(options.path);
    console.log(options);
    _this = _super.call(this, args);
    var defaults = {
      init: false,
      path: _Path.Path
    };
    var allOptions = Object.assign({}, defaults, options);
    console.log(allOptions.path);
    console.log(allOptions);
    _this.template = "<div class = \"terminal [[inverted]]\" cv-on = \"click:focus(event)\">\n\t<div class = \"output\" cv-each = \"output:line:l\" cv-ref = \"output:curvature/base/Tag\">\n\t\t<p>[[line]]</p>\n\t</div>\n\t<div class = \"bottom\">\n\t\t<div>[[prompt]]&nbsp;</div>\n\t\t<div>\n\t\t\t<form cv-on = \"submit:cancel(event)\">\n\t\t\t\t<textarea\n\t\t\t\t\tcv-bind = \"input\"\n\t\t\t\t\tcv-on   = \":keydown(event);:keyup(event)\"\n\t\t\t\t\tcv-ref  = \"input:curvature/base/Tag\"\n\t\t\t\t\trow     = \"1\"\n\t\t\t\t></textarea>\n\t\t\t</form>\n\n\t\t\t<form cv-on = \"submit:cancel(event)\">\n\t\t\t\t<input\n\t\t\t\t\tautocomplete = \"one-time-code\"\n\t\t\t\t\tname    = \"pw-input\"\n\t\t\t\t\ttype    = \"password\"\n\t\t\t\t\tcv-bind = \"input\"\n\t\t\t\t\tcv-ref  = \"password:curvature/base/Tag\"\n\t\t\t\t\tcv-on   = \":keydown(event,false);:keyup(event,false)\"\n\t\t\t\t/>\n\t\t\t</form>\n\n\t\t\t<input\n\t\t\t\tcv-on  = \"input:fileLoaded(event)\"\n\t\t\t\tcv-ref = \"file:curvature/base/Tag\"\n\t\t\t\tname   = \"file-input\"\n\t\t\t\ttype   = \"file\"\n\t\t\t\tstyle  = \"display: none\"\n\t\t\t/>\n\t\t</div>\n\t</div>\n</div>\n\n<div class = \"scanlines\"></div>\n";
    _this.args.input = '';
    _this.args.output = [];
    _this.args.inverted = '';
    _this.localEcho = true;
    _this.postToken = null;
    _this.args.prompt = '::';
    _this.routes = {};
    _this.args.passwordMode = false;
    _this.tasks = [];
    _this.max = 512;
    _this.historyCursor = -1;
    _this.history = [];
    _this.env = new Map();

    _this.args.output.___after(function (t, k, o, a) {
      if (k !== 'push') {
        return;
      }

      if (_this.args.output.length > _this.max) {
        var removed = _this.args.output.shift();

        if (_typeof(removed) === 'object') {
          removed.remove();
        }
      }

      _this.onNextFrame(function () {
        window.scrollTo({
          top: document.body.scrollHeight,
          left: 0,
          behavior: 'smooth'
        });
      });
    });

    if (allOptions.init) {
      _this.runScript(allOptions.init);
    }

    _this.path = allOptions.path || {};
    _this.originalInput = '';
    return _this;
  }

  _createClass(Console, [{
    key: "runCommand",
    value: function runCommand(command) {
      // console.log(command);
      if (this.historyCursor != 0) {
        this.history.unshift(command);
      }

      var ret;

      if (command.substring(0, 1) === '/') {
        if (!this.args.passwordMode) {
          this.args.output.push(":: ".concat(command));
        }

        ret = this.interpret(command.substr(1));
      } else if (this.tasks.length) {
        if (!this.args.passwordMode) {
          this.args.output.push("".concat(this.tasks[0].prompt, " ").concat(command));
        }

        ret = this.tasks[0].write(command) || Promise.resolve();
      } else {
        if (!this.args.passwordMode) {
          this.args.output.push(":: ".concat(command));
        }

        ret = this.interpret(command);
      }

      if (!(ret instanceof Promise)) {
        ret = Promise.resolve(ret);
      }

      this.historyCursor = -1;
      this.originalInput = this.args.input = '';
      return ret;
    }
  }, {
    key: "runScript",
    value: function runScript(url) {
      var _this2 = this;

      fetch(url + '?api=txt').then(function (response) {
        return response.text();
      }).then(function (init) {
        var lines = init.split("\n");

        var process = function process(lines) {
          if (!lines.length) {
            return;
          }

          var line = lines.shift();

          if (line && line[0] == '!') {
            _this2.args.output.push(line.substring(1));

            process(lines);
          } else if (line) {
            _this2.runCommand(line).then(function () {
              return process(lines);
            });
          } else {
            process(lines);
          }
        };

        process(lines);
      });
    }
  }, {
    key: "postRender",
    value: function postRender() {
      var _this3 = this;

      var inputBox = this.tags.input.element;
      var passwordBox = this.tags.password.element;
      this.args.bindTo('input', function (v) {
        inputBox.style.height = 'auto';
        inputBox.style.height = inputBox.scrollHeight + 'px';
      }, {
        frame: 1
      });
      this.args.bindTo('passwordMode', function (v) {
        if (v) {
          inputBox.style.display = 'none';
          passwordBox.style.display = 'unset';
        } else {
          inputBox.style.display = 'unset';
          passwordBox.style.display = 'none';
        }
      });
      this.args.bindTo('passwordMode', function (v) {
        _this3.focus(null, v);
      }, {
        frame: 1
      });
    }
  }, {
    key: "focus",
    value: function focus() {
      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var passwordMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (event) {
        event.preventDefault();
      }

      if (event && event.target && event.target.matches('input,textarea')) {
        return;
      }

      if (window.getSelection().toString()) {
        return;
      }

      if (passwordMode || this.args.passwordMode) {
        this.tags.password.element.focus();
        return;
      }

      this.tags.input.element.focus();
    }
  }, {
    key: "interpret",
    value: function interpret(command) {
      var _this4 = this;

      this.historyCursor = -1;
      var commands = command.split(/\s*\|\s*/);
      var task = null;
      var topTask = null;

      var _iterator = _createForOfIteratorHelper(commands),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var commandString = _step.value;
          var args = commandString.trim().split(' ');

          var _command = args.shift().trim();

          if (_command.substr(-1) == "?") {
            _command = _command.substr(0, _command.length - 1);

            if (_command in this.path) {
              this.args.output.push("?? ".concat(this.path[_command].helpText));
              this.args.output.push("?? ".concat(this.path[_command].useText));
            }

            continue;
          }

          if (_command in this.path) {
            var cmdClass = this.path[_command]; // console.log(cmdClass);

            task = new cmdClass(args, task, this);
          } else {
            switch (_command) {
              case 'clear':
                this.args.output.splice(0);
                break;

              case 'z':
                this.args.output.push(new _MeltingText.MeltingText({
                  input: 'lmao!'
                }));
                break;

              case 'commands':
              case '?':
                this.args.output.push("   Subspace Console 0.29a \xA92018-2020 Sean Morris");

                for (var cmd in this.path) {
                  this.args.output.push(" * ".concat(cmd, " - ").concat(this.path[cmd].helpText));
                  this.path[cmd].useText && this.args.output.push("   ".concat(this.path[cmd].useText));
                  this.args.output.push("  ");
                }

                break;

              default:
                this.args.output.push("!! Bad command: ".concat(_command));
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (task) {
        this.tasks.unshift(task);

        var output = function output(event) {
          var prompt = task.prompt || _this4.args.prompt || '::';

          _this4.args.output.push("".concat(prompt, " ").concat(event.detail));
        };

        var error = function error(event) {
          var errorPrompt = task.errorPrompt || '!!';
          _this4.args.prompt = errorPrompt;

          _this4.args.output.push("".concat(errorPrompt, " ").concat(event.detail));
        };

        task.addEventListener('output', output);
        task.addEventListener('error', error);
        task.execute();
        task["catch"](function (error) {
          return console.error(error);
        });
        task["catch"](function (error) {
          return _this4.args.output.push("!! ".concat(error));
        });
        task["finally"](function (done) {
          task.removeEventListener('error', error);
          task.removeEventListener('output', output);

          _this4.tasks.shift();

          if (_this4.tasks.length) {
            _this4.args.prompt = _this4.tasks[0].prompt;
          } else {
            _this4.args.prompt = '::';
          }
        });
      }

      this.args.input = '';
      return task;
    }
  }, {
    key: "keydown",
    value: function keydown(event, autocomplete) {
      switch (event.key) {
        case 'Tab':
          if (autocomplete) {
            break;
          }

          event.preventDefault();
          break;

        case 'Enter':
          if (!event.ctrlKey) {
            event.preventDefault();
          }

          break;
      }
    }
  }, {
    key: "keyup",
    value: function keyup(event, autocomplete) {
      var _this5 = this;

      switch (event.key) {
        case 'ArrowDown':
          this.historyCursor--;

          if (this.historyCursor <= -1) {
            this.historyCursor = -1;
            this.args.input = this.originalInput;
            return;
          }

          this.args.input = this.history[this.historyCursor];
          this.onNextFrame(function () {
            var element = _this5.tags.input.element;
            element.selectionStart = element.value.length;
            element.selectionEnd = element.value.length;
          });
          break;

        case 'ArrowUp':
          if (this.historyCursor == -1) {
            this.originalInput = this.args.input;
          }

          this.historyCursor++;

          if (this.historyCursor >= this.history.length) {
            this.historyCursor--;
            return;
          }

          this.args.input = this.history[this.historyCursor];
          this.onNextFrame(function () {
            var element = _this5.tags.input.element;
            element.selectionStart = element.value.length;
            element.selectionEnd = element.value.length;
          });
          break;

        case 'Escape':
          if (this.tasks.length) {
            console.log(_Task.Task.KILL);
            this.tasks[0]["finally"](function () {
              return _this5.args.output.push(":: Killed.");
            });
            this.tasks[0].signal(_Task.Task.KILL);
            this.tasks[0].signal('kill');
          }

          this.args.passwordMode = false;
          break;

        case 'Tab':
          event.preventDefault();

          if (!this.args.input || this.args.input[0] !== '/') {
            break;
          }

          var search = this.args.input.substr(1);

          for (var cmd in this.path) {
            if (cmd.length < search.length) {
              continue;
            }

            if (search === cmd.substr(0, search.length)) {
              this.args.input = '/' + cmd;
              break;
            }
          }

          break;

        case 'Enter':
          if (!event.ctrlKey) {
            event.preventDefault();
          } else {
            return;
          }

          this.runCommand(this.args.input);
          break;

        default:
          this.historyCursor = -1;
          window.scrollTo({
            top: document.body.scrollHeight,
            left: 0,
            behavior: 'smooth'
          });
          break;
      }
    }
  }, {
    key: "cancel",
    value: function cancel(event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }]);

  return Console;
}(_View2.View);

exports.Console = Console;
  })();
});

require.register("subspace-console/Path.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Path = void 0;

var _Task = require("subspace-console/Task");

var Path = {
  task: _Task.Task
};
exports.Path = Path;
  })();
});

require.register("subspace-console/Task.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Task = void 0;

var _Bindable = require("curvature/base/Bindable");

var _Mixin = require("curvature/base/Mixin");

var _Target = require("./mixin/Target");

var _TaskSignals = require("./mixin/TaskSignals");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var taskId = 0;
var target = Symbol('target');
var Accept = Symbol('accept');
var Reject = Symbol('reject');
var Execute = Symbol('execute');

var Task = /*#__PURE__*/function (_Mixin$with) {
  _inherits(Task, _Mixin$with);

  var _super = _createSuper(Task);

  function Task() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var prev = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var term = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, Task);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "title", 'Generic Task');

    _defineProperty(_assertThisInitialized(_this), "prompt", '::');

    _this.args = args;
    _this.prev = prev;
    _this.term = term;
    _this.status = -1;
    _this.thread = new Promise(function (accept, reject) {
      _this[Accept] = accept;
      _this[Reject] = reject;
    });
    _this.id = taskId++;

    _this.thread["finally"](function () {
      return console.log(_this.title + ' closed.');
    });

    return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
  }

  _createClass(Task, [{
    key: "then",
    value: function then(callback) {
      return this.thread.then(callback);
    }
  }, {
    key: "catch",
    value: function _catch(callback) {
      return this.thread["catch"](callback);
    }
  }, {
    key: "finally",
    value: function _finally(callback) {
      return this.thread["finally"](callback);
    }
  }, {
    key: "print",
    value: function print(detail) {
      this.dispatchEvent(new CustomEvent('output', {
        detail: detail
      }));
    }
  }, {
    key: "printErr",
    value: function printErr(detail) {
      this.dispatchEvent(new CustomEvent('error', {
        detail: detail
      }));
    }
  }, {
    key: "write",
    value: function write(line) {
      return this.main(line);
    }
  }, {
    key: "signal",
    value: function signal(signalName) {
      console.log(this, "signal::".concat(signalName));

      if (this["signal::".concat(signalName)]) {
        this["signal::".concat(signalName)]();
      }

      switch (signalName) {
        case 'close':
          if (this.dispatchEvent(new CustomEvent('close'))) {
            this.status > 0 ? this[Reject]() : this[Accept]();
          }

          break;

        case 'kill':
          this.status > 0 ? this[Reject]() : this[Accept]();
          break;
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      return this[Execute](this.prev);
    }
  }, {
    key: Execute,
    value: function value() {
      var _this2 = this;

      if (prev) {
        var _onOutputEvent = function _onOutputEvent(_ref) {
          var detail = _ref.detail;
          return _this2.write(detail);
        };

        prev.addEventListener('output', _onOutputEvent);
      }

      console.log(this.title + ' initializing.');
      var init = this.init.apply(this, _toConsumableArray(this.args));
      var prev = this.prev;

      if (!(init instanceof Promise)) {
        init = Promise.resolve(init);
      } else {
        console.log(this.title + ' continues...');
      }

      if (prev) {
        prev[Execute]();
        return Promise.allSettled([prev, init])["finally"](function () {
          prev.then(function (r) {
            return _this2[Accept](r);
          });
          prev["catch"](function (e) {
            return _this2[Reject](r);
          });
          prev.removeEventListener('output', onOutputEvent);
          return _this2.done();
        });
      } else {
        return Promise.allSettled([init]).then(function () {
          try {
            _this2.main(undefined);

            _this2[Accept]();
          } catch (_unused) {
            _this2[Reject]();
          }

          _this2.done();
        });
      }
    }
  }, {
    key: "init",
    value: function init() {}
  }, {
    key: "main",
    value: function main() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    }
  }, {
    key: "done",
    value: function done(results) {
      return this.status;
    }
  }]);

  return Task;
}(_Mixin.Mixin["with"](_Target.Target, _TaskSignals.TaskSignals)); // export class Task extends Target.mix(BaseTask){};


exports.Task = Task;
  })();
});

require.register("subspace-console/mixin/Target.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Target = void 0;

var _Mixin = require("curvature/base/Mixin");

var _Target;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var target = Symbol('target');
var index = 0;
var Target = (_Target = {}, _defineProperty(_Target, _Mixin.Mixin.constructor, function () {
  try {
    this[target] = new EventTarget();
  } catch (error) {
    this[target] = document.createDocumentFragment();
  }

  this[target].x = index++;
}), _defineProperty(_Target, "dispatchEvent", function dispatchEvent() {
  var _this$target;

  (_this$target = this[target]).dispatchEvent.apply(_this$target, arguments);
}), _defineProperty(_Target, "addEventListener", function addEventListener() {
  var _this$target2;

  (_this$target2 = this[target]).addEventListener.apply(_this$target2, arguments);
}), _defineProperty(_Target, "removeEventListener", function removeEventListener() {
  var _this$target3;

  (_this$target3 = this[target]).removeEventListener.apply(_this$target3, arguments);
}), _Target);
exports.Target = Target;
  })();
});

require.register("subspace-console/mixin/TaskSignals.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskSignals = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TaskSignals = /*#__PURE__*/function () {
  function TaskSignals() {
    _classCallCheck(this, TaskSignals);
  }

  _createClass(TaskSignals, [{
    key: 'signal::kill',
    value: function signalKill() {
      console.log('KILL!');
      this.status > 0 ? this[Reject]() : this[Accept]();
    }
  }, {
    key: 'signal::close',
    value: function signalClose() {
      if (this.dispatchEvent(new CustomEvent('error', {
        detail: detail
      }))) {
        this.status > 0 ? this[Reject]() : this[Accept]();
      }
    }
  }]);

  return TaskSignals;
}();

exports.TaskSignals = TaskSignals;

_defineProperty(TaskSignals, "KILL", 'kill');

_defineProperty(TaskSignals, "CLOSE", 'close');
  })();
});
require.register("Config.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var socketProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://';

var Config = function Config() {
  _classCallCheck(this, Config);
};

exports.Config = Config;
;
Config.title = 'SubSpace 0x29a';
Config.socketHost = socketProtocol + location.hostname + ':9998';
});

require.register("Path.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Path = void 0;

var _Lower = require("./tasks/Lower");

var _Upper = require("./tasks/Upper");

var _Prefix = require("./tasks/Prefix");

var _Suffix = require("./tasks/Suffix");

var _Countdown = require("./tasks/Countdown");

var _Auth = require("./tasks/Auth");

var _Login = require("./tasks/Login");

var _Register = require("./tasks/Register");

var _RtcClient = require("./tasks/RtcClient");

var _RtcServer = require("./tasks/RtcServer");

var _PublishBytes = require("./tasks/PublishBytes");

var _PublishFile = require("./tasks/PublishFile");

var _WatchImages = require("./tasks/WatchImages");

var _PublishAjax = require("./tasks/PublishAjax");

var _Connection = require("./tasks/Connection");

var _Theme = require("./tasks/Theme");

var Path = {
  countdown: _Countdown.Countdown,
  upper: _Upper.Upper,
  lower: _Lower.Lower,
  prefix: _Prefix.Prefix,
  suffix: _Suffix.Suffix,
  auth: _Auth.Auth,
  pub: _PublishBytes.PublishBytes,
  pubajax: _PublishAjax.PublishAjax,
  pubfile: _PublishFile.PublishFile,
  images: _WatchImages.WatchImages,
  login: _Login.Login,
  register: _Register.Register,
  rtcc: _RtcClient.RtcClient,
  rtcs: _RtcServer.RtcServer,
  connect: _Connection.Connection,
  theme: _Theme.Theme
};
exports.Path = Path;
});

require.register("chat/Chat.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Chat = void 0;

var _View = require("./View.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Chat = /*#__PURE__*/function () {
  function Chat(terminal, args) {
    _classCallCheck(this, Chat);

    terminal.args.output.push(new _View.View());
  }

  _createClass(Chat, [{
    key: "pass",
    value: function pass(command) {}
  }]);

  return Chat;
}();

exports.Chat = Chat;
});

;require.register("chat/View.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = void 0;

var _View = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var View = /*#__PURE__*/function (_BaseView) {
  _inherits(View, _BaseView);

  var _super = _createSuper(View);

  function View() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, View);

    _this = _super.call(this, args);
    _this.template = require('./view.tmp');
    return _this;
  }

  return View;
}(_View.View);

exports.View = View;
});

;require.register("chat/view.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"nynex window\">\n\t<div class = \"titlebar\">\n\t\t<div class = \"title\">💬 Chat App</div>\n\t\t<div class = \"button\">▂</div>\n\t\t<div class = \"button\">▅</div>\n\t</div>\n\t<select multiple height = \"5\">\n\t\t<option>Buddy</option>\n\t\t<option>Guy</option>\n\t\t<option>Friend</option>\n\t</select>\n</div>"
});

;require.register("initialize.js", function(exports, require, module) {
"use strict";

var _Tag = require("curvature/base/Tag");

var _RuleSet = require("curvature/base/RuleSet");

var _Router = require("curvature/base/Router");

var _Console = require("subspace-console/Console");

var _Path = require("./Path");

console.log(_Path.Path);
var view = new _Console.Console({
  path: _Path.Path,
  init: '/init_rc'
});
console.log(view);

_RuleSet.RuleSet.add('body', view);

_RuleSet.RuleSet.wait();

_Router.Router.wait(view);
});

require.register("mixin/MixPromise.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MixPromise = void 0;

var _Mixin = require("curvature/base/Mixin");

var _Bindable = require("curvature/base/Bindable");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var promise = Symbol('promise');

var MixPromise = /*#__PURE__*/function () {
  function MixPromise() {
    _classCallCheck(this, MixPromise);
  }

  _createClass(MixPromise, [{
    key: _Mixin.Mixin._constructor,
    value: function value(instance) {
      instance[promise] = new Promise();
    }
  }, {
    key: "then",
    value: function then(callback) {
      return this[promise].then(callback);
    }
  }, {
    key: "catch",
    value: function _catch(callback) {
      return this[promise]["catch"](callback);
    }
  }, {
    key: "finally",
    value: function _finally(callback) {
      return this[promise]["finally"](callback);
    }
  }]);

  return MixPromise;
}();

exports.MixPromise = MixPromise;
});

;require.register("mixin/Target.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Target = void 0;

var _Mixin = require("curvature/base/Mixin");

var _Target;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var target = Symbol('target');
var index = 0;
var Target = (_Target = {}, _defineProperty(_Target, _Mixin.Mixin.constructor, function () {
  try {
    this[target] = new EventTarget();
  } catch (error) {
    this[target] = document.createDocumentFragment();
  }

  this[target].x = index++;
}), _defineProperty(_Target, "dispatchEvent", function dispatchEvent() {
  var _this$target;

  (_this$target = this[target]).dispatchEvent.apply(_this$target, arguments);
}), _defineProperty(_Target, "addEventListener", function addEventListener() {
  var _this$target2;

  (_this$target2 = this[target]).addEventListener.apply(_this$target2, arguments);
}), _defineProperty(_Target, "removeEventListener", function removeEventListener() {
  var _this$target3;

  (_this$target3 = this[target]).removeEventListener.apply(_this$target3, arguments);
}), _Target);
exports.Target = Target;
});

;require.register("mixin/TaskSignals.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskSignals = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TaskSignals = /*#__PURE__*/function () {
  function TaskSignals() {
    _classCallCheck(this, TaskSignals);
  }

  _createClass(TaskSignals, [{
    key: 'signal::kill',
    value: function signalKill() {
      console.log('KILL!');
      this.status > 0 ? this[Reject]() : this[Accept]();
    }
  }, {
    key: 'signal::close',
    value: function signalClose() {
      if (this.dispatchEvent(new CustomEvent('error', {
        detail: detail
      }))) {
        this.status > 0 ? this[Reject]() : this[Accept]();
      }
    }
  }]);

  return TaskSignals;
}();

exports.TaskSignals = TaskSignals;

_defineProperty(TaskSignals, "KILL", 'kill');

_defineProperty(TaskSignals, "CLOSE", 'close');
});

;require.register("tasks/Auth.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Auth = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Auth = /*#__PURE__*/function (_Task) {
  _inherits(Auth, _Task);

  var _super = _createSuper(Auth);

  function Auth() {
    var _this;

    _classCallCheck(this, Auth);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Auth Task');

    _defineProperty(_assertThisInitialized(_this), "prompt", '<<');

    return _this;
  }

  _createClass(Auth, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      return fetch('/auth?api').then(function (response) {
        return response.text();
      }).then(function (token) {
        _this2.print('auth [token censored]');

        _this2.term.socket.send("auth ".concat(token));

        return true;
      });
    }
  }]);

  return Auth;
}(_Task2.Task);

exports.Auth = Auth;

_defineProperty(Auth, "helpText", 'Perform token exchange to identify socket connection.');

_defineProperty(Auth, "useText", '/auth');
});

;require.register("tasks/Connection.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Connection = void 0;

var _Config = require("Config");

var _Socket = require("subspace-client/Socket");

var _ByteView = require("../view/ByteView");

var _TextMessageView = require("../view/TextMessageView");

var _BinaryMessageView = require("../view/BinaryMessageView");

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Accept = Symbol('accept');

var Connection = /*#__PURE__*/function (_Task) {
  _inherits(Connection, _Task);

  var _super = _createSuper(Connection);

  function Connection() {
    var _this;

    _classCallCheck(this, Connection);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Websocket Connection Task');

    _defineProperty(_assertThisInitialized(_this), "prompt", '..');

    return _this;
  }

  _createClass(Connection, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      this.socket = _Socket.Socket.get(_Config.Config.socketHost, true);
      this.term.socket = this.socket;
      this.term.env.set('socket', this.socket);
      this.socket.subscribe('close', function (event) {
        _this2.term.args.output.push("Disconnected!");

        _this2.term.args.output.push("Reinitializing in ".concat(_Config.Config.reconnect / 1000 || 3, "s..."));

        if (_this2.recon) {
          _this2.clearTimeout(_this2.recon);

          _this2.recon = false;
        } else {
          _this2.recon = setTimeout(function () {
            _this2.recon = false;

            _this2.term.runScript('/bounce_rc');
          }, _Config.Config.reconnect || 3000);
        }
      });
      this.socket.subscribe('open', function () {
        _this2.term.runScript('/open_rc');

        _this2.prompt = '<<';
      });
      this.socket.subscribe('message', function (event, message, channel, origin, originId, originalChannel, packet) {
        if (!_this2.term.localEcho) {
          return;
        }

        if (typeof event.data == 'string') {
          var received = JSON.parse(event.data);

          if (received.token && received.you == true) {
            _this2.term.postToken = received.token;
          }

          if (_typeof(received) == 'object') {
            received = JSON.stringify(received, null, 4);
          }

          var messageView = new _TextMessageView.TextMessageView({
            message: received
          });
          messageView.preserve = true;

          _this2["finally"](function () {
            return messageView.remove();
          });

          _this2.term.args.output.push(messageView);
        } else if (event.data instanceof ArrayBuffer) {
          var bytesArray = new Uint8Array(event.data);
          var user = originId.toString(16).toUpperCase().padStart(4, '0');
          var channelName = channel.toString(16).toUpperCase().padStart(4, '0');
          var header = "0x".concat(user).concat(channelName);
          var headerBytes = [originId.toString(16).toUpperCase().padStart(4, '0'), channel.toString(16).toUpperCase().padStart(4, '0')].join('').match(/.{1,2}/g);
          var messageIndex = 6;

          if (origin == 'server') {
            headerBytes = [channel.toString(16).padStart(4, '0')];
            header = "0x".concat(channel.toString(16).padStart(4, '0'));
          }

          var bytes = Array.from(bytesArray).map(function (x) {
            return x.toString(16).toUpperCase().padStart(2, '0');
          });

          var _messageView = new _BinaryMessageView.BinaryMessageView({
            header: new _ByteView.ByteView({
              separator: '',
              bytes: headerBytes
            }),
            message: new _ByteView.ByteView({
              separator: ' ',
              bytes: bytes.slice(messageIndex)
            })
          });

          _messageView.preserve = true;

          _this2["finally"](function () {
            return _messageView.remove();
          });

          _this2.term.args.output.push(_messageView);
        }
      });
      return new Promise(function (accept) {
        _this2[Accept] = accept;
      });
    }
  }, {
    key: "main",
    value: function main(command) {
      if (!command) {
        return;
      }

      if (this.socket) {
        this.prompt = '<<';
        this.socket.send(command);
        return Promise.resolve();
      }
    }
  }]);

  return Connection;
}(_Task2.Task);

exports.Connection = Connection;

_defineProperty(Connection, "helpText", 'Connect to a websocket.');

_defineProperty(Connection, "useText", '/connect SERVER');
});

;require.register("tasks/Cornfield.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cornfield = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Cornfield = /*#__PURE__*/function () {
  function Cornfield(terminal) {
    var _this = this;

    _classCallCheck(this, Cornfield);

    terminal.args.output.push(':: Welcome to Cornfield');
    terminal.args.output.push(':: You are in a cornfield.');
    terminal.args.output.push(':: You see corn.');
    terminal.args.output.push(':: Move? [north south east west]');
    terminal.args.output.push(':: Look?');
    terminal.localEcho = false;
    this.socket = terminal.socket;
    this.socket.subscribe('message:cornfield:game', function (e, m, o, i) {});
    this.socket.subscribe('message:cornfield:chat', function (e, m, c, o, i) {
      terminal.args.output.push("!! <".concat(i, "> ").concat(m));
    });
    this.socket.subscribe('message:cornfield:users:ping', function (e, m, o, i) {
      _this.socket.publish('cornfield:users:pong', 'pong!');
    });
    this.socket.subscribe('message:cornfield:users:pong', function (e, m, o, i) {});
  }

  _createClass(Cornfield, [{
    key: "pass",
    value: function pass(input, terminal) {
      var args = input.split(' ');
      var command = args.shift();
      console.log(command);

      switch (command.toLowerCase()) {
        case 'ping':
          this.socket.publish('cornfield:users:ping', 'ping!');
          break;

        case 'look':
          terminal.args.output.push(':: You found an ear of corn.');
          this.socket.publish('cornfield:game', 'l');
          break;

        case 'n':
        case 'north':
          terminal.args.output.push(':: You moved north.');
          this.socket.publish('cornfield:game', 'n');
          break;

        case 's':
        case 'south':
          terminal.args.output.push(':: You moved south.');
          this.socket.publish('cornfield:game', 's');
          break;

        case 'e':
        case 'east':
          terminal.args.output.push(':: You moved east.');
          this.socket.publish('cornfield:game', 'e');
          break;

        case 'w':
        case 'west':
          terminal.args.output.push(':: You moved west.');
          this.socket.publish('cornfield:game', 'w');
          break;

        case 't':
        case 'talk':
        case 'say':
          // let chatMessage = 'ok';
          var chatMessage = args.join(' ');
          terminal.args.output.push("!! <you> ".concat(chatMessage));
          this.socket.publish('cornfield:chat', chatMessage);
          break;
      }

      terminal.args.input = '';
    }
  }]);

  return Cornfield;
}();

exports.Cornfield = Cornfield;
});

;require.register("tasks/Countdown.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Countdown = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Countdown = /*#__PURE__*/function (_Task) {
  _inherits(Countdown, _Task);

  var _super = _createSuper(Countdown);

  function Countdown() {
    var _this;

    _classCallCheck(this, Countdown);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Countdown Task');

    return _this;
  }

  _createClass(Countdown, [{
    key: "init",
    value: function init(max) {
      var _this2 = this;

      var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
      this.max = Number(max);
      this.interval = Number(interval);
      var count = this.max;

      if (!this.max) {
        this.status = 1;
        this.printErr('Max must be a number > 0.');
        return;
      }

      if (!this.interval) {
        this.status = 1;
        this.printErr('Interval must be a number > 0.');
        return;
      }

      this.status = 0;
      return new Promise(function (accept, reject) {
        var timer = setInterval(function () {
          console.log(_this2);

          _this2.print("".concat(--count, " iterations left").concat(count ? '...' : '.'));

          if (count <= 0) {
            accept();
          }
        }, _this2.interval);

        _this2["finally"](function () {
          return clearInterval(timer);
        });
      });
    }
  }, {
    key: "main",
    value: function main() {}
  }]);

  return Countdown;
}(_Task2.Task);

exports.Countdown = Countdown;

_defineProperty(Countdown, "helpText", 'Countdown from a given number.');

_defineProperty(Countdown, "useText", '/countdown MAX [INTERVAL]');
});

;require.register("tasks/Help.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Help = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Help = /*#__PURE__*/function (_Task) {
  _inherits(Help, _Task);

  var _super = _createSuper(Help);

  function Help() {
    _classCallCheck(this, Help);

    return _super.apply(this, arguments);
  }

  return Help;
}(_Task2.Task);

exports.Help = Help;
});

;require.register("tasks/Login.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Login = void 0;

var _Config = require("Config");

var _Socket = require("subspace-client/Socket");

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Accept = Symbol('accept');

var Login = /*#__PURE__*/function (_Task) {
  _inherits(Login, _Task);

  var _super = _createSuper(Login);

  function Login() {
    var _this;

    _classCallCheck(this, Login);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Login Task');

    return _this;
  }

  _createClass(Login, [{
    key: "init",
    // static useText  = '';
    value: function init() {
      var _this2 = this;

      this.print('Please type your username');
      return new Promise(function (accept) {
        _this2[Accept] = accept;
      });
    }
  }, {
    key: "main",
    value: function main(command) {
      var terminal = this.term;
      terminal.args.passwordMode = false;

      if (!this.stack) {
        this.stack = [];
      }

      if (!command) {
        return;
      }

      this.stack.push(command);

      if (this.stack.length == 1) {
        terminal.args.passwordMode = true;
        terminal.args.input = '';
        terminal.args.output.push(':: Please type your password [censored]');
        return;
      }

      if (this.stack.length == 2) {
        terminal.args.input = '';
        terminal.localLock = false;
        terminal.args.prompt = '<<';
        terminal.args.output.push("<< login ".concat(this.stack[0], " [password censored]"));
        terminal.socket.send("login ".concat(this.stack[0], " ").concat(this.stack[1]));
        terminal.args.output.push(':: Checking...');
        this[Accept]();
      }
    }
  }]);

  return Login;
}(_Task2.Task);

exports.Login = Login;

_defineProperty(Login, "helpText", 'Login.');
});

;require.register("tasks/Lower.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Lower = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Lower = /*#__PURE__*/function (_Task) {
  _inherits(Lower, _Task);

  var _super = _createSuper(Lower);

  function Lower() {
    var _this;

    _classCallCheck(this, Lower);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Lowercase Task');

    return _this;
  }

  _createClass(Lower, [{
    key: "main",
    value: function main() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.status = 0;
      this.print(String(input).toLowerCase());
    }
  }]);

  return Lower;
}(_Task2.Task);

exports.Lower = Lower;

_defineProperty(Lower, "helpText", 'Transform data from STDIN to lowercase.');

_defineProperty(Lower, "useText", '/something | lower');
});

;require.register("tasks/Prefix.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Prefix = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Prefix = /*#__PURE__*/function (_Task) {
  _inherits(Prefix, _Task);

  var _super = _createSuper(Prefix);

  function Prefix() {
    var _this;

    _classCallCheck(this, Prefix);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Prefix Task');

    return _this;
  }

  _createClass(Prefix, [{
    key: "init",
    value: function init(content) {
      this.content = content;
    }
  }, {
    key: "main",
    value: function main() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.status = 0;
      this.print((this.content || 'Prefix.') + ' ' + String(input));
    }
  }]);

  return Prefix;
}(_Task2.Task);

exports.Prefix = Prefix;

_defineProperty(Prefix, "helpText", 'Prepend a prefix to lines passed into STDIN.');

_defineProperty(Prefix, "useText", '/something | prefix PREFIX_TEXT');
});

;require.register("tasks/PublishAjax.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PublishAjax = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PublishAjax = /*#__PURE__*/function (_Task) {
  _inherits(PublishAjax, _Task);

  var _super = _createSuper(PublishAjax);

  function PublishAjax() {
    var _this;

    _classCallCheck(this, PublishAjax);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Publish Ajax Task');

    return _this;
  }

  _createClass(PublishAjax, [{
    key: "init",
    value: function init() {
      if (!this.term.postToken) {
        this.print("Please aquire a POST token first.");
        return;
      }

      this.print("".concat(this.postToken));

      var _formData = new FormData();

      _formData.append('token', this.term.postToken);

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      _formData.append('channel', args.shift());

      _formData.append('message', args.join(' '));

      console.log(_formData);
      var options = {
        method: 'post',
        body: _formData
      };
      return fetch('/post', options).then(function (response) {
        console.log(response);
      });
    }
  }]);

  return PublishAjax;
}(_Task2.Task);

exports.PublishAjax = PublishAjax;

_defineProperty(PublishAjax, "helpText", 'Publish to a channel via AJAX.');

_defineProperty(PublishAjax, "useText", '/pubajax');
});

;require.register("tasks/PublishBytes.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PublishBytes = void 0;

var _Config = require("Config");

var _Socket = require("subspace-client/Socket");

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PublishBytes = /*#__PURE__*/function (_Task) {
  _inherits(PublishBytes, _Task);

  var _super = _createSuper(PublishBytes);

  function PublishBytes() {
    var _this;

    _classCallCheck(this, PublishBytes);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Publish Bytes Task');

    return _this;
  }

  _createClass(PublishBytes, [{
    key: "main",
    value: function main(input) {
      var args = this.args;
      var channel = parseInt(args.shift(), 16);
      var data = [];

      while (args.length) {
        data.push(args.shift());
      }

      var channelBytes = new Uint8Array(new Uint16Array([channel]).buffer);
      var bytes = [];

      for (var i in channelBytes) {
        bytes[i] = channelBytes[i];
      }

      for (var _i = 0; _i < data.length; _i++) {
        bytes[_i + 2] = parseInt(data[_i], 16);
      }

      this.term.socket.send(new Uint8Array(bytes));
    }
  }]);

  return PublishBytes;
}(_Task2.Task);

exports.PublishBytes = PublishBytes;

_defineProperty(PublishBytes, "helpText", 'Publish bytes from ARGV.');

_defineProperty(PublishBytes, "useText", '/pub CHAN BYTE [BYTE...] (hexadecimal)');
});

;require.register("tasks/PublishFile.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PublishFile = void 0;

var _Config = require("Config");

var _Socket = require("subspace-client/Socket");

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PublishFile = /*#__PURE__*/function (_Task) {
  _inherits(PublishFile, _Task);

  var _super = _createSuper(PublishFile);

  function PublishFile() {
    var _this;

    _classCallCheck(this, PublishFile);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Publish File Task');

    return _this;
  }

  _createClass(PublishFile, [{
    key: "init",
    value: function init(fileChannel) {
      var _this2 = this;

      this.fileChannel = fileChannel;
      var fileInput = document.createElement('input');
      fileInput.setAttribute('type', 'file');
      fileInput.addEventListener('input', function () {
        return _this2.fileLoaded(event);
      });
      fileInput.click(); // this.term.socket.send(new Uint8Array(bytes));
    }
  }, {
    key: "main",
    value: function main() {}
  }, {
    key: "fileLoaded",
    value: function fileLoaded(event) {
      var _this3 = this;

      if (this.fileChannel === false) {
        return;
      }

      var fileReader = new FileReader();
      var field = event.target;
      var file = event.target.files[0];
      fileReader.addEventListener('load', function (event) {
        _this3.print("Sending ".concat(file.name, "..."));

        if (_this3.fileChannel == parseInt(_this3.fileChannel)) {
          _this3.term.socket.publish(_this3.fileChannel, event.target.result);
        } else {
          _this3.term.socket.publish(_this3.fileChannel, new TextDecoder("utf-8").decode(event.target.result));
        }

        _this3.fileChannel = false;
        field.value = '';
      });
      fileReader.readAsArrayBuffer(file);
    }
  }]);

  return PublishFile;
}(_Task2.Task);

exports.PublishFile = PublishFile;

_defineProperty(PublishFile, "helpText", 'Publish bytes from a file to a channel.');

_defineProperty(PublishFile, "useText", '/pubfile CHAN');
});

;require.register("tasks/Register.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Register = void 0;

var _Config = require("Config");

var _Socket = require("subspace-client/Socket");

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Accept = Symbol('accept');

var Register = /*#__PURE__*/function (_Task) {
  _inherits(Register, _Task);

  var _super = _createSuper(Register);

  function Register() {
    var _this;

    _classCallCheck(this, Register);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Register Task');

    return _this;
  }

  _createClass(Register, [{
    key: "init",
    // static useText  = '';
    value: function init() {
      var _this2 = this;

      this.print('Please type your username');
      return new Promise(function (accept) {
        _this2[Accept] = accept;
      });
    }
  }, {
    key: "main",
    value: function main(command) {
      var terminal = this.term;
      terminal.args.passwordMode = false;

      if (!this.stack) {
        this.stack = [];
      }

      this.stack.push(command);

      if (this.stack.length == 1) {
        terminal.args.input = '';
        terminal.args.output.push(':: Please type your email address');
        return;
      }

      if (this.stack.length == 2) {
        terminal.args.passwordMode = true;
        terminal.args.input = '';
        terminal.args.output.push(':: Please type your password');
        return;
      }

      if (this.stack.length == 3) {
        terminal.args.passwordMode = true;
        terminal.args.input = '';
        terminal.args.output.push(':: Please type your password again.');
        return;
      }

      if (this.stack.length == 4) {
        terminal.args.input = '';

        if (this.stack[2] !== this.stack[3]) {
          terminal.args.output.push(':: Password verification failed.');
          terminal.args.output.push(':: Please type your password');
          terminal.args.passwordMode = true;
          this.stack.pop();
          this.stack.pop();
          return;
        }

        terminal.args.output.push(":: Trying to register ".concat(this.stack[0], " <").concat(this.stack[1], ">..."));
        terminal.args.output.push("<< register ".concat(this.stack[0], " [password censored] ").concat(this.stack[1]));
        terminal.socket.send("register ".concat(this.stack[0], " ").concat(this.stack[2], " ").concat(this.stack[1]));
        terminal.localLock = false;
        terminal.args.prompt = '<<'; // terminal.socket.send(`login ${this.stack[0]} ${this.stack[1]}`);
      }

      this[Accept]();
    }
  }]);

  return Register;
}(_Task2.Task);

exports.Register = Register;

_defineProperty(Register, "helpText", 'Register.');
});

;require.register("tasks/RtcClient.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RtcClient = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Accept = Symbol('accept');

var RtcClient = /*#__PURE__*/function (_Task) {
  _inherits(RtcClient, _Task);

  var _super = _createSuper(RtcClient);

  function RtcClient() {
    var _this;

    _classCallCheck(this, RtcClient);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'RTC Client Task');

    _defineProperty(_assertThisInitialized(_this), "connected", false);

    return _this;
  }

  _createClass(RtcClient, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      var rtcConfig = {
        iceServers: [// 	{urls: 'stun:stun1.l.google.com:19302'},
          // 	{urls: 'stun:stun2.l.google.com:19302'}
        ]
      };
      this.peerClient = new RTCPeerConnection(rtcConfig);
      this.peerClient.addEventListener('icecandidate', function (event) {
        if (!event.candidate) {
          return;
        }

        var localDescription = JSON.stringify(_this2.peerClient.localDescription);

        _this2.print('Client Offer');

        _this2.print(localDescription);
      });
      this.peerClient.addEventListener('iceconnectionstatechange', function () {
        var state = _this2.peerClient.iceConnectionState;

        _this2.print("RTC state: ".concat(state));
      });
      this.peerClientChannel = this.peerClient.createDataChannel("chat");
      this.peerClientChannel.addEventListener('open', function () {
        _this2.print('Remote peer server accepted!');

        _this2.connected = true;
      });
      this.peerClientChannel.addEventListener('close', function () {
        _this2.print('Peer reset connection.');

        _this2[Accept]();
      });
      this["finally"](function () {
        _this2.print('Terminating connection...');

        _this2.peerClientChannel.close();
      });
      this.peerClientChannel.addEventListener('message', function (event) {
        _this2.print("> ".concat(event.data));

        console.log(event);
      });
      this.peerClient.createOffer().then(function (offer) {
        _this2.peerClient.setLocalDescription(offer);
      });
      return new Promise(function (accept) {
        _this2[Accept] = accept;
      });
    }
  }, {
    key: "main",
    value: function main(input) {
      if (!input) {
        return;
      }

      if (!this.connected) {
        this.accept(input);
        return;
      }

      this.print("< ".concat(input));
      this.peerClientChannel.send(input);
    }
  }, {
    key: "accept",
    value: function accept(answerString) {
      if (!answerString) {
        this.print("Please supply SDP answer string.");
        return;
      }

      var answer = JSON.parse(answerString);
      var session = new RTCSessionDescription(answer);
      this.peerClient.setRemoteDescription(session);
    }
  }]);

  return RtcClient;
}(_Task2.Task);

exports.RtcClient = RtcClient;

_defineProperty(RtcClient, "helpText", 'RTC Client.');

_defineProperty(RtcClient, "useText", '');
});

;require.register("tasks/RtcServer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RtcServer = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Accept = Symbol('accept');

var RtcServer = /*#__PURE__*/function (_Task) {
  _inherits(RtcServer, _Task);

  var _super = _createSuper(RtcServer);

  function RtcServer() {
    var _this;

    _classCallCheck(this, RtcServer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'RTC Server Task');

    _defineProperty(_assertThisInitialized(_this), "connected", false);

    return _this;
  }

  _createClass(RtcServer, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      var rtcConfig = {// iceServers: [
        // 	{urls: 'stun:stun1.l.google.com:19302'},
        // 	{urls: 'stun:stun2.l.google.com:19302'}
        // ]
      };
      this.peerServer = new RTCPeerConnection(rtcConfig);
      this.peerServer.addEventListener('icecandidate', function (event) {
        if (!event.candidate) {
          return;
        }

        var localDescription = JSON.stringify(_this2.peerServer.localDescription);

        _this2.print('Server Answer');

        _this2.print(localDescription);
      });
      this.peerServer.addEventListener('iceconnectionstatechange', function () {
        var state = _this2.peerServer.iceConnectionState;

        _this2.print("RTC state: ".concat(state));
      });
      this.peerServer.addEventListener('datachannel', function (event) {
        _this2.peerServerChannel = event.channel;

        _this2.peerServerChannel.addEventListener('open', function () {
          _this2.print('Remote peer client accepted!');

          _this2.connected = true;
        });

        _this2.peerServerChannel.addEventListener('close', function () {
          _this2.print('Peer reset connection.');

          _this2[Accept]();
        });

        _this2["finally"](function () {
          if (_this2.peerServerChannel) {
            _this2.print('Terminating connection...');

            _this2.peerServerChannel.close();
          }
        });

        _this2.peerServerChannel.addEventListener('message', function (event) {
          _this2.print("> ".concat(event.data));

          console.log(event);
        });
      });
      this.printErr("Please supply SDP offer string.");
      return new Promise(function (accept) {
        _this2[Accept] = accept;
      });
    }
  }, {
    key: "main",
    value: function main(input) {
      if (!input) {
        return;
      }

      if (!this.connected) {
        this.answer(input);
        return;
      }

      this.print("< ".concat(input));
      this.peerServerChannel.send(input);
    }
  }, {
    key: "answer",
    value: function answer(offerString) {
      var _this3 = this;

      var offer = JSON.parse(offerString);
      this.peerServer.setRemoteDescription(offer);
      this.peerServer.createAnswer(function (answer) {
        _this3.peerServer.setLocalDescription(answer);
      }, function (error) {
        console.error(error);

        _this3.printErr("Unexpected exception.");

        _this3[Accept]();
      });
    }
  }, {
    key: "done",
    value: function done() {}
  }]);

  return RtcServer;
}(_Task2.Task);

exports.RtcServer = RtcServer;

_defineProperty(RtcServer, "helpText", 'RTC Server.');

_defineProperty(RtcServer, "useText", '');
});

;require.register("tasks/SayAjax.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SayAjax = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SayAjax = /*#__PURE__*/function (_Task) {
  _inherits(SayAjax, _Task);

  var _super = _createSuper(SayAjax);

  function SayAjax() {
    var _this;

    _classCallCheck(this, SayAjax);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Say Ajax Task');

    return _this;
  }

  _createClass(SayAjax, [{
    key: "init",
    value: function init() {
      if (!this.term.postToken) {
        this.print("Please aquire a POST token first.");
        return;
      }

      this.print("".concat(this.postToken));
      var formData = new FormData();

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var ccCount = args.shift();
      var ccList = args.splice(0, ccCount);
      var bccCount = args.shift();
      var bccList = args.splice(0, bccCount);
      formData.append('cc', ccList.join(','));
      formData.append('bcc', bccList.join(','));
      console.log(ccList, bccList);
      formData.append('token', this.term.postToken);
      formData.append('channel', args.shift());
      formData.append('message', args.join(' '));
      var options = {
        method: 'post',
        body: formData
      };
      return fetch('/post', options).then(function (response) {
        console.log(response);
      });
    }
  }]);

  return SayAjax;
}(_Task2.Task);

exports.SayAjax = SayAjax;

_defineProperty(SayAjax, "helpText", 'Whisper on a channel via AJAX.');

_defineProperty(SayAjax, "useText", '/sayajax');
});

;require.register("tasks/Suffix.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Suffix = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Suffix = /*#__PURE__*/function (_Task) {
  _inherits(Suffix, _Task);

  var _super = _createSuper(Suffix);

  function Suffix() {
    var _this;

    _classCallCheck(this, Suffix);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Sufffix Task');

    return _this;
  }

  _createClass(Suffix, [{
    key: "init",
    value: function init(content) {
      this.content = content;
    }
  }, {
    key: "main",
    value: function main() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.status = 0;
      this.print(String(input) + ' ' + (this.content || 'Suffix.'));
    }
  }]);

  return Suffix;
}(_Task2.Task);

exports.Suffix = Suffix;

_defineProperty(Suffix, "helpText", 'Append a suffix to lines passed into STDIN.');

_defineProperty(Suffix, "useText", '/something | suffix SUFFIX_TEXT');
});

;require.register("tasks/Theme.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Theme = void 0;

var _Config = require("Config");

var _Socket = require("subspace-client/Socket");

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Accept = Symbol('accept');

var Theme = /*#__PURE__*/function (_Task) {
  _inherits(Theme, _Task);

  var _super = _createSuper(Theme);

  function Theme() {
    var _this;

    _classCallCheck(this, Theme);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Theme Task');

    return _this;
  }

  _createClass(Theme, [{
    key: "init",
    value: function init(themeName) {
      this.term.args.inverted = this.term.args.inverted ? '' : 'inverted';
    }
  }]);

  return Theme;
}(_Task2.Task);

exports.Theme = Theme;

_defineProperty(Theme, "helpText", 'Change the current theme.');

_defineProperty(Theme, "useText", '/theme');
});

;require.register("tasks/Upper.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Upper = void 0;

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Upper = /*#__PURE__*/function (_Task) {
  _inherits(Upper, _Task);

  var _super = _createSuper(Upper);

  function Upper() {
    var _this;

    _classCallCheck(this, Upper);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Uppercase Task');

    return _this;
  }

  _createClass(Upper, [{
    key: "main",
    value: function main() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.status = 0;
      this.print(String(input).toUpperCase());
    }
  }]);

  return Upper;
}(_Task2.Task);

exports.Upper = Upper;

_defineProperty(Upper, "helpText", 'Transform data from STDIN to uppercase.');

_defineProperty(Upper, "useText", '/something | upper');
});

;require.register("tasks/WatchImages.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WatchImages = void 0;

var _View = require("curvature/base/View");

var _Task2 = require("subspace-console/Task");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Accept = Symbol('accept');

var WatchImages = /*#__PURE__*/function (_Task) {
  _inherits(WatchImages, _Task);

  var _super = _createSuper(WatchImages);

  function WatchImages() {
    var _this;

    _classCallCheck(this, WatchImages);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", 'Watch Images Task');

    return _this;
  }

  _createClass(WatchImages, [{
    key: "init",
    value: function init(channel) {
      var _this2 = this;

      if (channel === undefined) {
        this.printErr('Please supply a channel');
        return;
      }

      this.socket = this.term.socket;
      var originalEcho = this.term.localEcho;

      var onMessage = function onMessage(e, m, o, i) {
        console.log(m, o, i);

        _this2.print("Got one.");

        var blob = new Blob([new Uint8Array(m)]);
        var url = URL.createObjectURL(blob);

        var view = _View.View.from('<img cv-attr = "src:img" cv-ref = "img:curvature/base/Tag" />');

        view.postRender = function () {
          var img = view.tags.img.element;

          var imageLoad = function imageLoad(event) {
            img.removeEventListener('load', imageLoad);
            URL.revokeObjectURL(url);
          };

          img.addEventListener('load', imageLoad);
        };

        console.log(view);

        _this2.term.args.output.push(view);

        view.args.img = url;
      };

      this["finally"](function () {
        _this2.socket.unsubscribe("message:".concat(channel), onMessage);

        _this2.term.localEcho = originalEcho;
      });
      this.term.localEcho = false;
      this.socket.subscribe("message:".concat(channel), onMessage);
      this.print("Listening for images on channel ".concat(channel));
      return new Promise(function (accept) {
        _this2[Accept] = accept;
      });
    }
  }]);

  return WatchImages;
}(_Task2.Task);

exports.WatchImages = WatchImages;

_defineProperty(WatchImages, "helpText", 'Watch a channel for images.');

_defineProperty(WatchImages, "useText", '/images CHAN');
});

;require.register("view/BinaryMessageView.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BinaryMessageView = void 0;

var _View2 = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var BinaryMessageView = /*#__PURE__*/function (_View) {
  _inherits(BinaryMessageView, _View);

  var _super = _createSuper(BinaryMessageView);

  function BinaryMessageView() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BinaryMessageView);

    _this = _super.call(this, args);
    _this.template = "<span>&gt;&gt;&nbsp;0x</span>[[header]]&nbsp;[[message]]";
    return _this;
  }

  return BinaryMessageView;
}(_View2.View);

exports.BinaryMessageView = BinaryMessageView;
});

;require.register("view/ByteView.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ByteView = void 0;

var _View2 = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var ByteView = /*#__PURE__*/function (_View) {
  _inherits(ByteView, _View);

  var _super = _createSuper(ByteView);

  function ByteView() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ByteView);

    _this = _super.call(this, args);
    _this.args.separator = _this.args.separator || '';
    _this.template = "<span\n\t\t\tcv-each = \"bytes:byte:b\"\n\t\t\tcv-carry = \"separator\"\n\t\t\t\"><span\n\t\t\t\tclass  = \"byte\"\n\t\t\t\tcv-on  = \"cvDomAttached:color(event, byte, $view)\"\n\t\t\t\tcv-ref = \"byte:curvature/base/Tag\"\n\t\t\t\t\n\t\t\t>[[byte]][[separator]]</span></span>";
    return _this;
  }

  _createClass(ByteView, [{
    key: "color",
    value: function color(event, _byte, $view) {
      var hue = parseInt(_byte, 16); // let color = '#' + [
      // 	(Math.pow(Math.cos(Math.PI * hue + 5), 2) * 192)
      // 	, (Math.pow(Math.cos(Math.PI * hue + 10), 2) * 192)
      // 	, (Math.pow(Math.cos(Math.PI * hue + 0), 2) * 192)
      // ].map((x)=>Math.floor(x).toString(16).padStart(2, '0')).join('');

      if (!hue) {
        return;
      }

      var color = "hsl(" + 360 * hue / 0xFF + ",100%,50%)";
      $view.tags["byte"].element.style.color = color; // $view.tags.byte.element.style['text-shadow'] = `2px 0px 5px ${color}, -2px 0px 5px ${color}`
    }
  }]);

  return ByteView;
}(_View2.View);

exports.ByteView = ByteView;
});

;require.register("view/MeltingText.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeltingText = void 0;

var _View = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var MeltingText = /*#__PURE__*/function (_BaseView) {
  _inherits(MeltingText, _BaseView);

  var _super = _createSuper(MeltingText);

  function MeltingText(args) {
    var _this;

    _classCallCheck(this, MeltingText);

    _this = _super.call(this, args);
    _this.last = _this.init = Date.now();
    _this.charUp = [// '\u030d', /*     ̍     */		'\u030e', /*     ̎     */		'\u0304', /*     ̄     */		'\u0305', /*     ̅     */
    // '\u033f', /*     ̿     */		'\u0311', /*     ̑     */		'\u0306', /*     ̆     */		'\u0310', /*     ̐     */
    // '\u0352', /*     ͒     */		'\u0357', /*     ͗     */		'\u0351', /*     ͑     */		'\u0307', /*     ̇     */
    // '\u0308', /*     ̈     */		'\u030a', /*     ̊     */		'\u0342', /*     ͂     */		'\u0343', /*     ̓     */
    "\u0344",
    /*     ̈́     */

    /*	'\u034a', /*     ͊     */

    /*	'\u034b', /*     ͋     */

    /*	'\u034c', /*     ͌     */
    "\u0303",
    /*     ̃     */

    /*	'\u0302', /*     ̂     */

    /*	'\u030c', /*     ̌     */

    /*	'\u0350', /*     ͐     */
    "\u0300"
    /*     ̀     */
    //	'\u0301', /*     ́     */		'\u030b', /*     ̋     */		'\u030f', /*     ̏     */
    // '\u0312', /*     ̒     */		'\u0313', /*     ̓     */		'\u0314', /*     ̔     */		'\u033d', /*     ̽     */
    // '\u0309', /*     ̉     */		'\u0363', /*     ͣ     */		'\u0364', /*     ͤ     */		'\u0365', /*     ͥ     */
    // '\u0366', /*     ͦ     */		'\u0367', /*     ͧ     */		'\u0368', /*     ͨ     */		'\u0369', /*     ͩ     */
    // '\u036a', /*     ͪ     */		'\u036b', /*     ͫ     */		'\u036c', /*     ͬ     */		'\u036d', /*     ͭ     */
    // '\u036e', /*     ͮ     */		'\u036f', /*     ͯ     */		'\u033e', /*     ̾     */		'\u035b', /*     ͛     */
    ];
    _this.charMid = ["\u0315",
    /*     ̕     */
    "\u031B",
    /*     ̛     */
    "\u0340",
    /*     ̀     */
    "\u0341",
    /*     ́     */
    "\u0358",
    /*     ͘     */
    "\u0321",
    /*     ̡     */
    "\u0322",
    /*     ̢     */
    "\u0327",
    /*     ̧     */
    "\u0328",
    /*     ̨     */
    "\u0334",
    /*     ̴     */
    "\u0335",
    /*     ̵     */
    "\u0336",
    /*     ̶     */
    "\u034F",
    /*     ͏     */
    "\u035C",
    /*     ͜     */
    "\u035D",
    /*     ͝     */
    "\u035E",
    /*     ͞     */
    "\u035F",
    /*     ͟     */
    "\u0360",
    /*     ͠     */

    /*'\u0362',      ͢     */
    "\u0338",
    /*     ̸     */
    "\u0337",
    /*     ̷     */
    "\u0361"
    /*     ͡     */

    /*'\u0489'     ҉_     */
    ];
    _this.charDown = [// '\u0316', /*     ̖     */		'\u0317', /*     ̗     */		'\u0318', /*     ̘     */		'\u0319', /*     ̙     */
    // '\u0316', /*     ̖     */		'\u0317', /*     ̗     */		'\u0318', /*     ̘     */		'\u0319', /*     ̙     */
    // '\u0320', /*     ̠     */		'\u0324', /*     ̤     */		'\u0325', /*     ̥     */		'\u0326', /*     ̦     */
    // '\u0329', /*     ̩     */		'\u032a', /*     ̪     */		'\u032b', /*     ̫     */		'\u032c', /*     ̬     */
    // '\u032d', /*     ̭     */		'\u032e', /*     ̮     */		'\u032f', /*     ̯     */		'\u0330', /*     ̰     */
    // '\u0331', /*     ̱     */		'\u0332', /*     ̲     */		'\u0333', /*     ̳     */		'\u0339', /*     ̹     */
    "\u033A",
    /*     ̺     */
    "\u033B",
    /*     ̻     */
    "\u033C",
    /*     ̼     */
    "\u0345"
    /*     ͅ     */
    //'\u0347', /*     ͇     */		'\u0348', /*     ͈     */		'\u0349', /*     ͉     */		'\u034d', /*     ͍     */
    //'\u034e', /*     ͎     */		'\u0353', /*     ͓     */		'\u0354', /*     ͔     */		'\u0355', /*     ͕     */
    // '\u0356', /*     ͖     */		'\u0359', /*     ͙     */		'\u035a', /*     ͚     */		'\u0323' /*     ̣     */
    ];
    _this.template = "\n\t\t\t<div cv-bind = \"output\" class = \"melting\"></div>\n\t\t";
    _this.args.input = "Magic is no more than the art of employing consciously invisible means to produce visible effects. Will, love, and imagination are magic powers that everyone possesses; and whoever knows how to develop them to their fullest extent is a magician. Magic has but one dogma, namely, that the seen is the measure of the unseen\n"; // this.args.input      = 'anything';

    _this.args.output = 'uh.';
    _this.corruptors = [];
    _this.maxMaxCorrupt = 25;
    _this.maxCorrupt = 0;
    _this.type = '';

    _this.onFrame(function () {
      _this.typewriter(_this.args.input);
    });

    _this.onInterval(16 * 4, function () {
      var selection = window.getSelection();

      if (selection.anchorOffset !== selection.focusOffset) {
        return;
      }

      if (selection.anchorNode !== selection.focusNode) {
        return;
      }

      _this.args.output = _this.corrupt(_this.type); // this.args.output = this.type;
    });

    _this.args.bindTo('input', function (v) {
      _this.type = '';
      _this.corruptors = [];
    });

    return _this;
  }

  _createClass(MeltingText, [{
    key: "age",
    value: function age() {
      return this.init - Date.now();
    }
  }, {
    key: "lastFrame",
    value: function lastFrame() {
      return this.last - Date.now();
    }
  }, {
    key: "corrupt",
    value: function corrupt(v) {
      if (v.length * 1.15 < this.args.input.length) {
        return this.type;
      }

      var chars = v.split('');

      var random = function random(x) {
        return parseInt(Math.random() * x);
      };

      if (random(1024) < 256 && this.maxCorrupt < this.maxMaxCorrupt) {
        this.maxCorrupt += 5;
      }

      for (var _i in chars) {
        this.corruptors[_i] = this.corruptors[_i] || [];

        if (chars[_i].match(/\W/)) {
          continue;
        }

        var charSets = [// this.charDown // Melt Slow
        this.charDown, this.charMid // Melt
        // this.charDown, this.charUp,   this.charMid, // Boil
        // this.charMid, this.charUp, // Burn
        // this.charMid // Simmer
        // this.charUp // Rain
        ];
        var charSet = charSets[random(charSets.length)];

        if (random(8192) < 1) {
          this.corruptors[_i].unshift(charSet[random(charSet.length)]);
        }

        if (this.corruptors[_i].length < this.maxCorrupt) {
          this.corruptors[_i].unshift(charSet[random(charSet.length)]);
        }

        if (random(2048) < 1 && this.maxCorrupt > 25) {
          this.corruptors[_i].splice(5 * random(5));
        }

        this.corruptors[_i].push(this.corruptors[_i].shift());
      }

      for (var i in chars) {
        if (this.corruptors[i]) {
          chars[i] += this.corruptors[i].join('');
        }
      }

      return chars.join('');
    }
  }, {
    key: "typewriter",
    value: function typewriter(v) {
      this.type = this.type || '';

      if (this.type !== v) {
        this.type += v.substr(this.type.length, 1);
        this.onTimeout(150, function () {
          var max = window.scrollY + window.innerHeight;

          if (document.body.scrollHeight > max) {
            window.scrollTo({
              top: document.body.scrollHeight,
              left: 0,
              behavior: 'smooth'
            });
          }
        });
      } else {
        return true;
      }

      return false;
    }
  }]);

  return MeltingText;
}(_View.View);

exports.MeltingText = MeltingText;
});

;require.register("view/TextMessageView.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextMessageView = void 0;

var _View2 = require("curvature/base/View");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var TextMessageView = /*#__PURE__*/function (_View) {
  _inherits(TextMessageView, _View);

  var _super = _createSuper(TextMessageView);

  function TextMessageView() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, TextMessageView);

    _this = _super.call(this, args);
    _this.template = "<span>&gt;&gt;&nbsp;</span><span class = \"text\">[[message]]</span>";
    return _this;
  }

  return TextMessageView;
}(_View2.View);

exports.TextMessageView = TextMessageView;
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

"use strict";

/* jshint ignore:start */
(function () {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = window.brunch || {};
  var ar = br['auto-reload'] = br['auto-reload'] || {};
  if (!WebSocket || ar.disabled) return;
  if (window._ar) return;
  window._ar = true;

  var cacheBuster = function cacheBuster(url) {
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;
  var reloaders = {
    page: function page() {
      window.location.reload(true);
    },
    stylesheet: function stylesheet() {
      [].slice.call(document.querySelectorAll('link[rel=stylesheet]')).filter(function (link) {
        var val = link.getAttribute('data-autoreload');
        return link.href && val != 'false';
      }).forEach(function (link) {
        link.href = cacheBuster(link.href);
      }); // Hack to force page repaint after 25ms.

      if (forceRepaint) setTimeout(function () {
        document.body.offsetHeight;
      }, 25);
    },
    javascript: function javascript() {
      var scripts = [].slice.call(document.querySelectorAll('script'));
      var textScripts = scripts.map(function (script) {
        return script.text;
      }).filter(function (text) {
        return text.length > 0;
      });
      var srcScripts = scripts.filter(function (script) {
        return script.src;
      });
      var loaded = 0;
      var all = srcScripts.length;

      var onLoad = function onLoad() {
        loaded = loaded + 1;

        if (loaded === all) {
          textScripts.forEach(function (script) {
            eval(script);
          });
        }
      };

      srcScripts.forEach(function (script) {
        var src = script.src;
        script.remove();
        var newScript = document.createElement('script');
        newScript.src = cacheBuster(src);
        newScript.async = true;
        newScript.onload = onLoad;
        document.head.appendChild(newScript);
      });
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function connect() {
    var connection = new WebSocket('ws://' + host + ':' + port);

    connection.onmessage = function (event) {
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };

    connection.onerror = function () {
      if (connection.readyState) connection.close();
    };

    connection.onclose = function () {
      window.setTimeout(connect, 1000);
    };
  };

  connect();
})();
/* jshint ignore:end */
;
//# sourceMappingURL=app.js.map