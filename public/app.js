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
    return aliases[name] ? expandAlias(aliases[name]) : name;
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

require.register("curvature/base/Bindable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bindable = exports.Bindable = function () {
    function Bindable() {
        _classCallCheck(this, Bindable);
    }

    _createClass(Bindable, null, [{
        key: 'isBindable',
        value: function isBindable(object) {
            if (!object.___binding___) {
                return false;
            }

            return object.___binding___ === Bindable;
        }
    }, {
        key: 'makeBindable',
        value: function makeBindable(object) {

            if (!object || object.___binding___ || (typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object' || object instanceof Node) {
                return object;
            }

            Object.defineProperty(object, '___ref___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, 'bindTo', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, 'isBound', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___binding___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___bindingAll___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___isBindable___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___executing___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___stack___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___stackTime___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___before___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___after___', {
                enumerable: false,
                writable: true
            });

            // Object.defineProperty(object, 'toString', {
            //     enumerable: false,
            //     writable: true
            // });

            Object.defineProperty(object, '___setCount___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___wrapped___', {
                enumerable: false,
                writable: true
            });

            Object.defineProperty(object, '___object___', {
                enumerable: false,
                writable: false,
                value: object
            });
            object.___isBindable___ = Bindable;
            object.___wrapped___ = {};
            object.___binding___ = {};
            object.___bindingAll___ = [];
            object.___stack___ = [];
            object.___stackTime___ = [];
            object.___before___ = [];
            object.___after___ = [];
            object.___setCount___ = {};
            object.bindTo = function (property) {
                var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                var bindToAll = false;

                if (property instanceof Function) {
                    options = callback || {};
                    callback = property;
                    bindToAll = true;
                }

                var throttle = false;

                if (options.delay >= 0) {
                    callback = function (callback) {
                        return function (v, k, t, d) {
                            var p = t[k];
                            setTimeout(function () {
                                return callback(v, k, t, d, p);
                            }, options.delay);
                        };
                    }(callback);
                }

                if (options.throttle >= 0) {
                    callback = function (callback) {
                        return function (v, k, t, d) {
                            if (throttle) {
                                return;
                            }
                            callback(v, k, t, d);
                            throttle = true;
                            setTimeout(function () {
                                return throttle = false;
                            }, options.throttle);
                        };
                    }(callback);
                }

                var waiter = void 0;

                if (options.wait >= 0) {
                    callback = function (callback) {
                        return function (v, k, t, d) {
                            if (waiter) {
                                clearTimeout(waiter);
                            }
                            var p = t[k];
                            waiter = setTimeout(function () {
                                return callback(v, k, t, d, p);
                            }, options.wait);
                        };
                    }(callback);
                }

                if (bindToAll) {
                    var _bindIndex = object.___bindingAll___.length;

                    object.___bindingAll___.push(callback);

                    for (var i in object) {
                        callback(object[i], i, object, false);
                    }

                    return function () {
                        object.___bindingAll___[_bindIndex] = null;
                    };
                }

                if (!object.___binding___[property]) {
                    object.___binding___[property] = [];
                }

                var bindIndex = object.___binding___[property].length;

                object.___binding___[property].push(callback);

                callback(object[property], property, object, false);

                return function () {
                    if (!object.___binding___[property]) {
                        return;
                    }
                    object.___binding___[property][bindIndex] = null;
                };
            };

            object.isBound = function () {
                for (var i in object.___bindingAll___) {
                    if (object.___bindingAll___[i]) {
                        return true;
                    }
                }

                for (var _i in object.___binding___) {
                    for (var j in object.___binding___[_i]) {
                        if (object.___binding___[_i][j]) {
                            return true;
                        }
                    }
                }
                return false;
            };

            // object.toString = object.toString || (() => {
            //     if (typeof object == 'object') {
            //         return JSON.stringify(object);
            //         return '[object]'
            //     }

            //     return object;
            // });

            for (var i in object) {
                if (object[i] && _typeof(object[i]) == 'object' && !object[i] instanceof Node) {
                    object[i] = Bindable.makeBindable(object[i]);
                }
            }

            var set = function set(target, key, value) {
                if (target[key] === value) {
                    return true;
                }

                // console.log(`Setting ${key}`, value);

                if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' && !(value instanceof Node)) {
                    if (value.___isBindable___ !== Bindable) {
                        value = Bindable.makeBindable(value);

                        for (var _i2 in value) {
                            if (value[_i2] && _typeof(value[_i2]) == 'object') {
                                value[_i2] = Bindable.makeBindable(value[_i2]);
                            }
                        }
                    }
                }

                for (var _i3 in object.___bindingAll___) {
                    if (!object.___bindingAll___[_i3]) {
                        continue;
                    }
                    object.___bindingAll___[_i3](value, key, target, false);
                }

                var stop = false;

                if (key in object.___binding___) {
                    for (var _i4 in object.___binding___[key]) {
                        if (!object.___binding___[key]) {
                            continue;
                        }
                        if (!object.___binding___[key][_i4]) {
                            continue;
                        }
                        if (object.___binding___[key][_i4](value, key, target, false) === false) {
                            stop = true;
                        }
                    }
                }

                if (!stop) {
                    var descriptor = Object.getOwnPropertyDescriptor(target, key);

                    var excluded = target instanceof File && key == 'lastModifiedDate';

                    if (!excluded && (!descriptor || descriptor.writable)) {
                        target[key] = value;
                    }
                }

                if (!target.___setCount___[key]) {
                    target.___setCount___[key] = 0;
                }

                target.___setCount___[key]++;

                var warnOn = 10;

                if (target.___setCount___[key] > warnOn && value instanceof Object) {
                    // console.log(
                    //     'Warning: Resetting bindable reference "' +
                    //     key +
                    //     '" to object ' +
                    //     target.___setCount___[key] +
                    //     ' times.'
                    // );
                }

                return true;
            };

            var del = function del(target, key) {
                if (!(key in target)) {
                    return true;
                }

                for (var _i5 in object.___bindingAll___) {
                    object.___bindingAll___[_i5](undefined, key, target, true);
                }

                if (key in object.___binding___) {
                    for (var _i6 in object.___binding___[key]) {
                        if (!object.___binding___[key][_i6]) {
                            continue;
                        }
                        object.___binding___[key][_i6](undefined, key, target, true);
                    }
                }

                if (Array.isArray(target)) {
                    target.splice(key, 1);
                } else {
                    delete target[key];
                }

                return true;
            };

            var get = function get(target, key) {
                if (target[key] instanceof Function) {

                    if (target.___wrapped___[key]) {
                        return target.___wrapped___[key];
                    }

                    target.___wrapped___[key] = function () {
                        target.___executing___ = key;

                        target.___stack___.unshift(key);
                        // target.___stackTime___.unshift((new Date).getTime());

                        // console.log(`Start ${key}()`);

                        for (var _i7 in target.___before___) {
                            target.___before___[_i7](target, key, object);
                        }

                        var ret = target[key].apply(object.___ref___, arguments);

                        for (var _i8 in target.___after___) {
                            target.___after___[_i8](target, key, object);
                        }

                        target.___executing___ = null;

                        // let execTime = (new Date).getTime() - target.___stackTime___[0];

                        // if (execTime > 150) {
                        //     // console.log(`End ${key}(), took ${execTime} ms`);
                        // }

                        target.___stack___.shift();
                        // target.___stackTime___.shift();

                        return ret;
                    };

                    return target.___wrapped___[key];
                }

                if (target[key] instanceof Object) {
                    Bindable.makeBindable(target[key]);
                }

                // console.log(`Getting ${key}`);

                return target[key];
            };

            object.___ref___ = new Proxy(object, {
                deleteProperty: del,
                get: get,
                set: set
            });

            return object.___ref___;
        }
    }, {
        key: 'clearBindings',
        value: function clearBindings(object) {
            object.___wrapped___ = {};
            object.___bindingAll___ = [];
            object.___binding___ = {};
            object.___before___ = [];
            object.___after___ = [];
            object.___ref___ = {};
            // object.toString         = ()=>'{}';
        }
    }, {
        key: 'resolve',
        value: function resolve(object, path) {
            var owner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            // console.log(path, object);

            var node = void 0;
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
    }]);

    return Bindable;
}();
  })();
});

require.register("curvature/base/Cache.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cache = exports.Cache = function () {
	function Cache() {
		_classCallCheck(this, Cache);
	}

	_createClass(Cache, null, [{
		key: 'store',
		value: function store(key, value, expiry) {
			var bucket = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'standard';

			var expiration = 0;

			if (expiry) {
				expiration = expiry * 1000 + new Date().getTime();
			}

			// console.log(
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

			this.bucket[bucket][key] = { expiration: expiration, value: value };
		}
	}, {
		key: 'load',
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
  })();
});

require.register("curvature/base/Cookie.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Cookie = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Bindable = require('./Bindable');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cookie = exports.Cookie = function () {
	function Cookie() {
		_classCallCheck(this, Cookie);
	}

	_createClass(Cookie, null, [{
		key: 'set',
		value: function set(name, value) {
			Cookie.jar[name] = value;
		}
	}, {
		key: 'get',
		value: function get(name) {
			return Cookie.jar[name];
		}
	}, {
		key: 'delete',
		value: function _delete(name) {
			delete Cookie.jar[name];
		}
	}]);

	return Cookie;
}();

;

Cookie.jar = Cookie.jar || _Bindable.Bindable.makeBindable({});

if (window.location.href.substr(0, 4) !== 'data') {
	document.cookie.split(';').map(function (c) {
		var _c$split = c.split('='),
		    _c$split2 = _slicedToArray(_c$split, 2),
		    key = _c$split2[0],
		    value = _c$split2[1];

		try {
			value = JSON.parse(value);
		} catch (error) {
			value = value;
		}

		key = key.trim();

		Cookie.jar[decodeURIComponent(key)] = value;
		// console.log(Cookie.jar);
	});

	Cookie.jar.bindTo(function (v, k, t, d) {
		t[k] = v;

		if (d) {
			t[k] = null;
		}

		var cookieString = encodeURIComponent(k) + '=' + t[k];
		// console.log(cookieString);
		document.cookie = cookieString;
	});
}
  })();
});

require.register("curvature/base/Dom.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dom = exports.Dom = function () {
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

			var treeWalker = document.createTreeWalker(doc, NodeFilter.SHOW_ALL, {
				acceptNode: function acceptNode(node) {
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
						// console.log(selector, node, !!(node instanceof Element));
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

			while (treeWalker.nextNode()) {
				result.push(callback(treeWalker.currentNode));
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
  })();
});

require.register("curvature/base/Router.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Router = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _View = require('./View');

var _Cache = require('./Cache');

var _Config = require('Config');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Router = exports.Router = function () {
	function Router() {
		_classCallCheck(this, Router);
	}

	_createClass(Router, null, [{
		key: 'wait',
		value: function wait(view) {
			var _this = this;

			var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'DOMContentLoaded';
			var node = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;

			node.addEventListener(event, function () {
				_this.listen(view);
			});
		}
	}, {
		key: 'listen',
		value: function listen(mainView) {
			var _this2 = this;

			var routeHistory = [location.toString()];
			var prevHistoryLength = history.length;

			var route = location.pathname + location.search;

			if (location.hash) {
				route += location.hash;
			}

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
			});

			this.go(route);
		}
	}, {
		key: 'go',
		value: function go(route, silent) {
			document.title = _Config.Config.title;
			setTimeout(function () {
				history.pushState(null, null, route);

				if (!silent) {
					window.dispatchEvent(new Event('popstate'));

					if (route.substring(0, 1) === '#') {
						window.dispatchEvent(new HashChangeEvent('hashchange'));
					}
				}
			}, 0);
		}
	}, {
		key: 'match',
		value: function match(path, view) {
			var _this3 = this;

			var forceRefresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			if (this.path == path && !forceRefresh) {
				return;
			}

			var eventStart = new CustomEvent('cvRouteStart', {
				cancelable: true,
				detail: { result: result, path: path, view: view }
			});

			var current = view.args.content;
			var routes = view.routes;

			this.path = path;
			this.query = {};

			var query = new URLSearchParams(location.search);

			this.queryString = location.search;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = query[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var pair = _step.value;

					this.query[pair[0]] = pair[1];
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var args = {},
			    selected = false,
			    result = '';

			path = path.substr(1).split('/');

			for (var i in this.query) {
				args[i] = this.query[i];
			}

			L1: for (var _i in routes) {
				var route = _i.split('/');
				if (route.length < path.length) {
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
							throw new Error(route[j] + ' is not a valid argument segment in route "' + _i + '"');
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
					} else if (path[j] !== route[j]) {
						continue L1;
					}
				}

				if (!forceRefresh && current && routes[_i] instanceof Object && current instanceof routes[_i] && !(routes[_i] instanceof Promise) && current.update(args)) {
					view.args.content = current;

					return true;
				}

				selected = _i;
				result = routes[_i];

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
						_this3.update(view, path, x);
					}).catch(function (x) {
						_this3.update(view, path, x);
					});
				} else {
					result = _result;
				}
			} else if (routes[selected] instanceof Promise) {
				result = false;

				routes[selected].then(function (x) {
					_this3.update(view, path, x);
				}).catch(function (x) {
					_this3.update(view, path, x);
				});
			} else if (routes[selected] instanceof Object) {
				result = new routes[selected](args);
			} else if (typeof routes[selected] == 'string') {
				result = routes[selected];
			}

			this.update(view, path, result);

			// if(view.args.content instanceof View)
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
		key: 'update',
		value: function update(view, path, result) {
			var event = new CustomEvent('cvRoute', {
				cancelable: true,
				detail: { result: result, path: path, view: view }
			});

			var eventEnd = new CustomEvent('cvRouteEnd', {
				cancelable: true,
				detail: { result: result, path: path, view: view }
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
		key: 'clearCache',
		value: function clearCache() {
			// this.cache = {};
		}
	}, {
		key: 'queryOver',
		value: function queryOver() {
			var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var params = new URLSearchParams(location.search);
			var finalArgs = {};
			var query = [];

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = params[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var pair = _step2.value;

					query[pair[0]] = pair[1];
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			for (var i in query) {
				finalArgs[i] = query[i];
			}

			for (var _i2 in args) {
				finalArgs[_i2] = args[_i2];
			}

			delete finalArgs['api'];

			return finalArgs;
		}
	}, {
		key: 'queryToString',
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
		key: 'setQuery',
		value: function setQuery(name, value, silent) {
			var args = {};

			args[name] = value;

			this.go(this.path + '?' + this.queryToString(args), silent);
		}
	}]);

	return Router;
}();
  })();
});

require.register("curvature/base/RuleSet.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RuleSet = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dom = require('./Dom');

var _Tag = require('./Tag');

var _View = require('./View');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RuleSet = exports.RuleSet = function () {
	function RuleSet() {
		_classCallCheck(this, RuleSet);
	}

	_createClass(RuleSet, [{
		key: 'add',
		value: function add(selector, callback) {
			this.rules = this.rules || {};
			this.rules[selector] = this.rules[selector] || [];

			this.rules[selector].push(callback);

			return this;
		}
	}, {
		key: 'apply',
		value: function apply() {
			var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
			var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			RuleSet.apply(doc, view);

			for (var selector in this.rules) {
				for (var i in this.rules[selector]) {
					var callback = this.rules[selector][i];
					var wrapped = RuleSet.wrap(doc, callback, view);
					var nodes = doc.querySelectorAll(selector);

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var node = _step.value;

							wrapped(node);
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				}
			}
		}
	}], [{
		key: 'add',
		value: function add(selector, callback) {
			this.globalRules = this.globalRules || {};
			this.globalRules[selector] = this.globalRules[selector] || [];

			this.globalRules[selector].push(callback);

			return this;
		}
	}, {
		key: 'apply',
		value: function apply() {
			var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
			var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			for (var selector in this.globalRules) {
				for (var i in this.globalRules[selector]) {
					var callback = this.globalRules[selector][i];
					var wrapped = this.wrap(doc, callback, view);
					var nodes = doc.querySelectorAll(selector);

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var node = _step2.value;

							wrapped(node);
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}
				}
			}
		}
	}, {
		key: 'wait',
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
		key: 'wrap',
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
				if (!element.___cvApplied___) {
					Object.defineProperty(element, '___cvApplied___', {
						enumerable: false,
						writable: true
					});

					element.___cvApplied___ = [];
				}

				for (var i in element.___cvApplied___) {
					if (callback == element.___cvApplied___[i]) {
						return;
					}
				}

				var direct = void 0,
				    parentView = void 0;

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
  })();
});

require.register("curvature/base/Tag.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Tag = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Bindable = require('./Bindable');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tag = exports.Tag = function () {
		function Tag(element, parent, ref, index, direct) {
				_classCallCheck(this, Tag);

				this.element = _Bindable.Bindable.makeBindable(element);
				this.parent = parent;
				this.direct = direct;
				this.ref = ref;
				this.index = index;

				this.cleanup = [];

				this.proxy = _Bindable.Bindable.makeBindable(this);

				// this.detachListener = (event) => {
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
				key: 'remove',
				value: function remove() {
						_Bindable.Bindable.clearBindings(this);

						var cleanup = void 0;

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
				key: 'clear',
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
				key: 'pause',
				value: function pause() {
						var paused = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
				}
		}]);

		return Tag;
}();
  })();
});

require.register("curvature/base/View.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.View = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Bindable = require('./Bindable');

var _ViewList = require('./ViewList');

var _Router = require('./Router');

var _Cookie = require('./Cookie');

var _Dom = require('./Dom');

var _Tag = require('./Tag');

var _RuleSet = require('./RuleSet');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var View = exports.View = function () {
	function View() {
		var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, View);

		Object.defineProperty(this, '___VIEW___', {
			enumerable: false,
			writable: true
		});

		this.___VIEW___ = View;

		this.args = _Bindable.Bindable.makeBindable(args);
		this._id = this.uuid();
		this.args._id = this._id;
		this.template = '';
		this.document = '';

		this.firstNode = null;
		this.lastNode = null;
		this.nodes = null;

		this.cleanup = [];

		this.attach = [];
		this.detach = [];

		this.eventCleanup = [];

		this.parent = null;
		this.viewList = null;
		this.viewLists = {};

		this.withViews = {};

		this.tags = {};

		this.intervals = [];
		this.timeouts = [];
		this.frames = [];

		this.ruleSet = new _RuleSet.RuleSet();
		this.preRuleSet = new _RuleSet.RuleSet();
		this.subBindings = {};

		this.removed = false;
		this.preserve = false;

		this.interpolateRegex = /(\[\[((?:\$)?[\w\.]+)\]\])/g;
	}

	_createClass(View, [{
		key: 'onFrame',
		value: function onFrame(callback) {
			var c = function c(timestamp) {
				callback(timestamp);
				window.requestAnimationFrame(c);
			};

			c();
		}
	}, {
		key: 'onTimeout',
		value: function onTimeout(time, callback) {
			var _this = this;

			var wrappedCallback = function wrappedCallback() {
				_this.timeouts[index].fired = true;
				_this.timeouts[index].callback = null;
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
		key: 'clearTimeout',
		value: function clearTimeout(timeout) {
			for (var i in this.timeouts) {
				if (timeout === this.timeouts[i].timeout) {
					clearInterval(this.timeouts[i].timeout);

					delete this.timeouts[i];
				}
			}
		}
	}, {
		key: 'onInterval',
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
		key: 'clearInterval',
		value: function (_clearInterval) {
			function clearInterval(_x) {
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
		key: 'pause',
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
		key: 'render',
		value: function render() {
			var _this2 = this;

			var parentNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
			var insertPoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			if (insertPoint instanceof View) {
				insertPoint = insertPoint.firstNode;
			}

			if (this.nodes) {
				for (var i in this.detach) {
					this.detach[i]();
				}

				var _loop = function _loop(_i6) {
					var detachEvent = new Event('cvDomDetached', { bubbles: true, target: _this2.nodes[_i6] });
					var attachEvent = new Event('cvDomAttached', { bubbles: true, target: _this2.nodes[_i6] });

					_this2.nodes[_i6].dispatchEvent(detachEvent);

					_Dom.Dom.mapTags(_this2.nodes[_i6], false, function (node) {
						node.dispatchEvent(detachEvent);
					});

					if (parentNode) {
						if (insertPoint) {
							parentNode.insertBefore(_this2.nodes[_i6], insertPoint);
						} else {
							parentNode.appendChild(_this2.nodes[_i6]);
						}
					}

					_Dom.Dom.mapTags(_this2.nodes[_i6], false, function (node) {
						node.dispatchEvent(attachEvent);
					});

					_this2.nodes[_i6].dispatchEvent(attachEvent);
				};

				for (var _i6 in this.nodes) {
					_loop(_i6);
				}

				for (var _i7 in this.attach) {
					this.attach[_i7]();
				}

				return;
			}

			var subDoc = void 0;

			if (this.template == document) {
				subDoc = this.template;
			} else if (this.document) {
				subDoc = this.document;
			} else {
				subDoc = document.createRange().createContextualFragment(this.template);

				this.document = subDoc;
			}

			this.preRuleSet.apply(subDoc, this);

			_Dom.Dom.mapTags(subDoc, false, function (tag) {
				if (tag.matches) {
					tag.matches('[cv-each]') && _this2.mapEachTags(tag);

					tag.matches('[cv-with]') && _this2.mapWithTags(tag);

					tag.matches('[cv-prerender]') && _this2.mapPrendererTags(tag);

					tag.matches('[cv-link]') && _this2.mapLinkTags(tag);

					tag.matches('[cv-bind]') && _this2.mapBindTags(tag);

					tag.matches('[cv-attr]') && _this2.mapAttrTags(tag);

					_this2.mapInterpolatableTags(tag);

					tag.matches('[cv-expand]') && _this2.mapExpandableTags(tag);

					tag.matches('[cv-ref]') && _this2.mapRefTags(tag);

					tag.matches('[cv-if]') && _this2.mapIfTags(tag);

					tag.matches('[cv-on]') && _this2.mapOnTags(tag);
				} else {
					_this2.mapInterpolatableTags(tag);
				}
			});

			this.ruleSet.apply(subDoc, this);

			this.nodes = [];

			this.firstNode = document.createComment('Template ' + this._id + ' Start');
			// this.firstNode = document.createTextNode('');

			this.nodes.push(this.firstNode);

			if (parentNode) {
				if (insertPoint) {
					parentNode.insertBefore(this.firstNode, insertPoint);
				} else {
					parentNode.appendChild(this.firstNode);
				}
			}

			var _loop2 = function _loop2() {
				var newNode = subDoc.firstChild;
				var attachEvent = new Event('cvDomAttached', { bubbles: true, target: newNode });

				_this2.nodes.push(newNode);

				if (parentNode) {
					if (insertPoint) {
						parentNode.insertBefore(newNode, insertPoint);
					} else {
						parentNode.appendChild(newNode);
					}
				}

				_Dom.Dom.mapTags(newNode, false, function (node) {
					node.dispatchEvent(attachEvent);
				});

				newNode.dispatchEvent(attachEvent);
			};

			while (subDoc.firstChild) {
				_loop2();
			}

			this.lastNode = document.createComment('Template ' + this._id + ' End');
			// this.lastNode = document.createTextNode('');

			this.nodes.push(this.lastNode);

			if (parentNode) {
				if (insertPoint) {
					parentNode.insertBefore(this.lastNode, insertPoint);
				} else {
					parentNode.appendChild(this.lastNode);
				}
			}

			for (var _i8 in this.attach) {
				this.attach[_i8]();
			}

			this.postRender(parentNode);

			// return this.nodes;
		}
	}, {
		key: 'mapExpandableTags',
		value: function mapExpandableTags(tag) {
			var _this3 = this;

			var expandProperty = tag.getAttribute('cv-expand');
			var expandArg = _Bindable.Bindable.makeBindable(this.args[expandProperty] || {});

			tag.removeAttribute('cv-expand');

			var _loop3 = function _loop3(i) {
				if (i == 'name' || i == 'type') {
					return 'continue';
				}

				var debind = expandArg.bindTo(i, function (tag, i) {
					return function (v) {
						tag.setAttribute(i, v);
					};
				}(tag, i));

				_this3.cleanup.push(function () {
					debind();
					if (expandArg.isBound()) {
						_Bindable.Bindable.clearBindings(expandArg);
					}
				});
			};

			for (var i in expandArg) {
				var _ret3 = _loop3(i);

				if (_ret3 === 'continue') continue;
			}
		}
	}, {
		key: 'mapAttrTags',
		value: function mapAttrTags(tag) {
			var attrProperty = tag.getAttribute('cv-attr');

			tag.removeAttribute('cv-attr');

			var pairs = attrProperty.split(',');
			var attrs = pairs.map(function (p) {
				return p.split(':');
			});

			for (var i in attrs) {
				if (this.args[attrs[i][1]]) {
					tag.setAttribute(attrs[i][0], this.args[attrs[i][1]]);
				}

				this.cleanup.push(this.args.bindTo(attrs[i][1], function (attr) {
					return function (v) {
						if (v == null) {
							tag.setAttribute(attr[0], '');
							return;
						}
						tag.setAttribute(attr[0], v);
					};
				}(attrs[i])));
			}
		}
	}, {
		key: 'mapInterpolatableTags',
		value: function mapInterpolatableTags(tag) {
			var _this4 = this;

			var regex = this.interpolateRegex;

			if (tag.nodeType == Node.TEXT_NODE) {
				var original = tag.nodeValue;

				if (!this.interpolatable(original)) {
					return;
				}

				var header = 0;
				var match = void 0;

				var _loop4 = function _loop4() {
					var bindProperty = match[2];

					var unsafeHtml = false;

					if (bindProperty.substr(0, 1) === '$') {
						unsafeHtml = true;
						bindProperty = bindProperty.substr(1);
					}

					if (bindProperty.substr(0, 3) === '000') {
						expand = true;
						bindProperty = bindProperty.substr(3);

						return 'continue';
					}

					var staticPrefix = original.substring(header, match.index);

					header = match.index + match[1].length;

					var staticNode = document.createTextNode(staticPrefix);

					tag.parentNode.insertBefore(staticNode, tag);

					var dynamicNode = void 0;

					if (unsafeHtml) {
						dynamicNode = document.createElement('div');
					} else {
						dynamicNode = document.createTextNode('');
					}

					var proxy = _this4.args;
					var property = bindProperty;

					if (bindProperty.match(/\./)) {
						var _Bindable$resolve = _Bindable.Bindable.resolve(_this4.args, bindProperty, true);

						var _Bindable$resolve2 = _slicedToArray(_Bindable$resolve, 2);

						proxy = _Bindable$resolve2[0];
						property = _Bindable$resolve2[1];
					}

					tag.parentNode.insertBefore(dynamicNode, tag);

					var debind = proxy.bindTo(property, function (dynamicNode, unsafeHtml) {
						return function (v, k, t) {
							if (t[k] instanceof View && t[k] !== v) {
								if (!t[k].preserve) {
									t[k].remove();
								}
							}

							dynamicNode.nodeValue = '';

							if (v instanceof View) {
								v.render(tag.parentNode, dynamicNode);

								_this4.cleanup.push(function () {
									if (!v.preserve) {
										v.remove();
									}
								});
							} else {
								if (v instanceof Object && v.__toString instanceof Function) {
									v = v.__toString();
								}

								if (unsafeHtml) {
									dynamicNode.innerHTML = v;
								} else {
									dynamicNode.nodeValue = v;
								}
							}
						};
					}(dynamicNode, unsafeHtml));

					_this4.cleanup.push(function () {
						debind();
						if (!proxy.isBound()) {
							_Bindable.Bindable.clearBindings(proxy);
						}
					});
				};

				while (match = regex.exec(original)) {
					var _ret4 = _loop4();

					if (_ret4 === 'continue') continue;
				}

				var staticSuffix = original.substring(header);

				var staticNode = document.createTextNode(staticSuffix);

				tag.parentNode.insertBefore(staticNode, tag);

				tag.nodeValue = '';
			}

			if (tag.nodeType == Node.ELEMENT_NODE) {
				var _loop5 = function _loop5(i) {
					if (!_this4.interpolatable(tag.attributes[i].value)) {
						return 'continue';
					}

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

					var _loop6 = function _loop6(j) {
						var proxy = _this4.args;
						var property = j;

						if (j.match(/\./)) {
							var _Bindable$resolve3 = _Bindable.Bindable.resolve(_this4.args, j, true);

							var _Bindable$resolve4 = _slicedToArray(_Bindable$resolve3, 2);

							proxy = _Bindable$resolve4[0];
							property = _Bindable$resolve4[1];
						}

						var longProperty = j;

						var debind = proxy.bindTo(property, function (v, k, t, d) {
							for (var _i9 in bindProperties) {
								for (var _j in bindProperties[longProperty]) {
									segments[bindProperties[longProperty][_j]] = t[_i9];

									if (k === property) {
										segments[bindProperties[longProperty][_j]] = v;
									}
								}
							}

							tag.setAttribute(attribute.name, segments.join(''));
						});

						_this4.cleanup.push(function () {
							debind();
							if (!proxy.isBound()) {
								_Bindable.Bindable.clearBindings(proxy);
							}
						});
					};

					for (var j in bindProperties) {
						_loop6(j);
					}
				};

				for (var i = 0; i < tag.attributes.length; i++) {
					var _ret5 = _loop5(i);

					if (_ret5 === 'continue') continue;
				}
			}
		}
	}, {
		key: 'mapRefTags',
		value: function mapRefTags(tag) {
			var refAttr = tag.getAttribute('cv-ref');

			var _refAttr$split = refAttr.split(':'),
			    _refAttr$split2 = _slicedToArray(_refAttr$split, 3),
			    refProp = _refAttr$split2[0],
			    refClassname = _refAttr$split2[1],
			    refKey = _refAttr$split2[2];

			var refClass = this.stringToClass(refClassname);

			tag.removeAttribute('cv-ref');

			Object.defineProperty(tag, '___tag___', {
				enumerable: false,
				writable: true
			});

			this.cleanup.push(function () {
				tag.___tag___ = null;
				tag.remove();
			});

			var parent = this;
			var direct = this;

			if (this.viewList) {
				parent = this.viewList.parent;
				// if(!this.viewList.parent.tags[refProp])
				// {
				// 	this.viewList.parent.tags[refProp] = [];
				// }

				// let refKeyVal = this.args[refKey];

				// this.viewList.parent.tags[refProp][refKeyVal] = new refClass(
				// 	tag, this, refProp, refKeyVal
				// );
			} else {
					// this.tags[refProp] = new refClass(
					// 	tag, this, refProp
					// );
				}

			var tagObject = new refClass(tag, this, refProp, undefined, direct);

			tag.___tag___ = tagObject;

			if (parent) {
				if (1 || !parent.parent) {
					var refKeyVal = this.args[refKey];

					if (refKeyVal !== undefined) {
						if (!parent.tags[refProp]) {
							parent.tags[refProp] = [];
						}

						parent.tags[refProp][refKeyVal] = tagObject;
					} else {
						parent.tags[refProp] = tagObject;
					}
				}
				parent = parent.parent;
			}
		}
	}, {
		key: 'mapBindTags',
		value: function mapBindTags(tag) {
			var _this5 = this;

			var bindArg = tag.getAttribute('cv-bind');
			var proxy = this.args;
			var property = bindArg;
			var top = null;

			if (bindArg.match(/\./)) {
				var _Bindable$resolve5 = _Bindable.Bindable.resolve(this.args, bindArg, true);

				var _Bindable$resolve6 = _slicedToArray(_Bindable$resolve5, 3);

				proxy = _Bindable$resolve6[0];
				property = _Bindable$resolve6[1];
				top = _Bindable$resolve6[2];
			}

			if (proxy !== this.args) {
				this.subBindings[bindArg] = this.subBindings[bindArg] || [];

				this.cleanup.push(this.args.bindTo(top, function () {
					while (_this5.subBindings.length) {
						console.log('HERE!');
						_this5.subBindings.shift()();
					}
				}));
			}

			var debind = proxy.bindTo(property, function (v, k, t, d, p) {

				if (p instanceof View && p !== v) {
					p.remove();
				}

				if (tag.tagName == 'INPUT' || tag.tagName == 'SELECT' || tag.tagName == 'TEXTAREA') {
					var type = tag.getAttribute('type');
					if (type && type.toLowerCase() == 'checkbox') {
						tag.checked = !!v;
					} else if (type && type.toLowerCase() == 'radio') {
						tag.checked = v == tag.value;
					} else if (type !== 'file') {
						if (tag.tagName == 'SELECT') {
							// console.log(k, v, tag.outerHTML, tag.options.length);
							for (var i in tag.options) {
								var option = tag.options[i];

								if (option.value == v) {
									tag.selectedIndex = i;
								}
							}
						}
						tag.value = v == null ? '' : v;
					}
					return;
				}

				if (v instanceof View) {
					v.render(tag);
				} else {
					tag.innerText = v;
				}
			}, { wait: 0 });

			if (proxy !== this.args) {
				this.subBindings[bindArg].push(debind);
			}

			this.cleanup.push(debind);

			var inputListener = function inputListener(event) {
				if (event.target !== tag) {
					return;
				}

				var type = tag.getAttribute('type');
				if (type && type.toLowerCase() == 'checkbox') {
					if (tag.checked) {
						proxy[property] = event.target.value;
					} else {
						proxy[property] = false;
					}
				} else {
					proxy[property] = event.target.value;
				}
			};

			tag.addEventListener('input', inputListener);
			tag.addEventListener('change', inputListener);
			tag.addEventListener('value-changed', inputListener);

			this.cleanup.push(function (tag, eventListener) {
				return function () {
					tag.removeEventListener('input', inputListener);
					tag.removeEventListener('change', inputListener);
					tag.removeEventListener('value-changed', inputListener);
					tag = undefined;
					eventListener = undefined;
				};
			}(tag, inputListener));

			tag.removeAttribute('cv-bind');
		}
	}, {
		key: 'mapOnTags',
		value: function mapOnTags(tag) {
			var _this6 = this;

			var action = String(tag.getAttribute('cv-on')).split(/;/).map(function (a) {
				return a.split(':');
			}).map(function (object, tag) {
				return function (a) {
					var eventName = a[0].replace(/(^[\s\n]+|[\s\n]+$)/, '');
					var callbackName = a[1];
					var argList = [];
					var groups = /(\w+)(?:\(([$\w\s'",]+)\))?/.exec(callbackName);
					if (groups.length) {
						callbackName = groups[1].replace(/(^[\s\n]+|[\s\n]+$)/, '');
						if (groups[2]) {
							argList = groups[2].split(',').map(function (s) {
								return s.trim();
							});
						}
					}

					var eventMethod = void 0;
					var parent = _this6;

					while (parent) {
						if (typeof parent[callbackName] == 'function') {
							var _ret7 = function () {
								var _parent = parent;
								var _callBackName = callbackName;
								eventMethod = function eventMethod() {
									_parent[_callBackName].apply(_parent, arguments);
								};
								return 'break';
							}();

							if (_ret7 === 'break') break;
						}

						if (parent.viewList && parent.viewList.parent) {
							parent = parent.viewList.parent;
						} else if (parent.parent) {
							parent = parent.parent;
						} else {
							break;
						}
					}

					var eventListener = function (object, parent, eventMethod, tag) {
						return function (event) {
							var argRefs = argList.map(function (arg) {
								var match = void 0;
								if (parseInt(arg) == arg) {
									return arg;
								} else if (arg === 'event' || arg === '$event') {
									return event;
								} else if (arg === '$view') {
									return parent;
								} else if (arg === '$tag') {
									return tag;
								} else if (arg === '$parent') {
									return _this6.parent;
								} else if (arg === '$subview') {
									return _this6;
								} else if (arg in _this6.args) {
									return _this6.args[arg];
								} else if (match = /^['"](\w+?)["']$/.exec(arg)) {
									return match[1];
								}
							});
							if (!(typeof eventMethod == 'function')) {
								throw new Error(callbackName + ' is not defined on View object.\n\nTag:\n\n' + tag.outerHTML);
							}
							eventMethod.apply(undefined, _toConsumableArray(argRefs));
						};
					}(object, parent, eventMethod, tag);

					switch (eventName) {
						case '_init':
							eventListener();
							break;

						case '_attach':
							_this6.attach.push(eventListener);
							break;

						case '_detach':
							_this6.detach.push(eventListener);
							break;

						default:
							tag.addEventListener(eventName, eventListener);

							_this6.cleanup.push(function () {
								tag.removeEventListener(eventName, eventListener);
							});
							break;
					}

					return [eventName, callbackName, argList];
				};
			}(this, tag));

			tag.removeAttribute('cv-on');
		}
	}, {
		key: 'mapLinkTags',
		value: function mapLinkTags(tag) {
			var linkAttr = tag.getAttribute('cv-link');

			tag.setAttribute('href', linkAttr);

			var linkClick = function linkClick(event) {
				event.preventDefault();

				if (linkAttr.substring(0, 4) == 'http' || linkAttr.substring(0, 2) == '//') {
					window.open(tag.getAttribute('href', linkAttr));

					return;
				}

				_Router.Router.go(tag.getAttribute('href'));
			};

			tag.addEventListener('click', linkClick);

			this.cleanup.push(function (tag, eventListener) {
				return function () {
					tag.removeEventListener('click', eventListener);
					tag = undefined;
					eventListener = undefined;
				};
			}(tag, linkClick));

			tag.removeAttribute('cv-link');
		}
	}, {
		key: 'mapPrendererTags',
		value: function mapPrendererTags(tag) {
			var prerenderAttr = tag.getAttribute('cv-prerender');
			var prerendering = window.prerenderer;

			if (prerenderAttr == 'never' && prerendering || prerenderAttr == 'only' && !prerendering) {
				tag.parentNode.removeChild(tag);
			}
		}
	}, {
		key: 'mapWithTags',
		value: function mapWithTags(tag) {
			var _this7 = this;

			var withAttr = tag.getAttribute('cv-with');
			var carryAttr = tag.getAttribute('cv-carry');
			tag.removeAttribute('cv-with');
			tag.removeAttribute('cv-carry');

			var subTemplate = tag.innerHTML;

			var carryProps = [];

			if (carryAttr) {
				carryProps = carryAttr.split(',').map(function (s) {
					return s.trim();
				});
			}

			var debind = this.args.bindTo(withAttr, function (v, k, t, d) {
				if (_this7.withViews[k]) {
					_this7.withViews[k].remove();
				}

				while (tag.firstChild) {
					tag.removeChild(tag.firstChild);
				}

				var view = new View();

				_this7.cleanup.push(function (view) {
					return function () {
						view.remove();
					};
				}(view));

				view.template = subTemplate;
				view.parent = _this7;

				var _loop7 = function _loop7(i) {
					var debind = _this7.args.bindTo(carryProps[i], function (v, k) {
						view.args[k] = v;
					});

					view.cleanup.push(debind);
					_this7.cleanup.push(function () {
						debind();
						view.remove();
					});
				};

				for (var i in carryProps) {
					_loop7(i);
				}

				var _loop8 = function _loop8(i) {
					var debind = v.bindTo(i, function (v, k) {
						view.args[k] = v;
					});

					_this7.cleanup.push(function () {
						debind();
						if (!v.isBound()) {
							_Bindable.Bindable.clearBindings(v);
						}
						view.remove();
					});

					view.cleanup.push(function () {
						debind();
						if (!v.isBound()) {
							_Bindable.Bindable.clearBindings(v);
						}
					});
				};

				for (var i in v) {
					_loop8(i);
				}

				view.render(tag);

				_this7.withViews[k] = view;
			});

			this.cleanup.push(debind);
		}
	}, {
		key: 'mapEachTags',
		value: function mapEachTags(tag) {
			var _this8 = this;

			var eachAttr = tag.getAttribute('cv-each');
			var carryAttr = tag.getAttribute('cv-carry');
			tag.removeAttribute('cv-each');
			tag.removeAttribute('cv-carry');

			var subTemplate = tag.innerHTML;

			while (tag.firstChild) {
				tag.removeChild(tag.firstChild);
			}

			var carryProps = [];

			if (carryAttr) {
				carryProps = carryAttr.split(',');
			}

			var _eachAttr$split = eachAttr.split(':'),
			    _eachAttr$split2 = _slicedToArray(_eachAttr$split, 3),
			    eachProp = _eachAttr$split2[0],
			    asProp = _eachAttr$split2[1],
			    keyProp = _eachAttr$split2[2];

			var debind = this.args.bindTo(eachProp, function (v, k, t, d, p) {
				if (_this8.viewLists[eachProp]) {
					_this8.viewLists[eachProp].remove();
				}

				var viewList = new _ViewList.ViewList(subTemplate, asProp, v, _this8, keyProp);

				_this8.cleanup.push(function () {
					viewList.remove();
				});

				var _loop9 = function _loop9(i) {
					var _debind = _this8.args.bindTo(carryProps[i], function (v, k) {
						viewList.args.subArgs[k] = v;
					});

					viewList.cleanup.push(_debind);

					_this8.cleanup.push(function () {
						_debind();

						if (v && !v.isBound()) {
							_Bindable.Bindable.clearBindings(v);
						}
					});
				};

				for (var i in carryProps) {
					_loop9(i);
				}

				while (tag.firstChild) {
					tag.removeChild(tag.firstChild);
				}

				_this8.viewLists[eachProp] = viewList;

				viewList.render(tag);
			}, { wait: 0 });

			this.cleanup.push(function () {
				debind();
			});
		}
	}, {
		key: 'mapIfTags',
		value: function mapIfTags(tag) {
			var _this9 = this;

			var ifProperty = tag.getAttribute('cv-if');

			tag.removeAttribute('cv-if');

			var subTemplate = tag.innerHTML;

			var inverted = false;

			if (ifProperty.substr(0, 1) === '!') {
				inverted = true;
				ifProperty = ifProperty.substr(1);
			}

			while (tag.firstChild) {
				tag.removeChild(tag.firstChild);
			}

			var ifDoc = document.createRange().createContextualFragment('');

			var view = new View();

			view.template = subTemplate;
			view.parent = this;

			view.render(tag);

			var debindA = this.args.bindTo(function (v, k, t, d) {
				if (k == '_id') {
					return;
				}

				if (view.args[k] !== v) {
					view.args[k] = v;
				}
				// t[k]         = v;
			});

			for (var i in this.args) {
				if (i == '_id') {
					continue;
				}

				view.args[i] = this.args[i];
			}

			var debindB = view.args.bindTo(function (v, k, t, d) {
				if (k == '_id') {
					return;
				}

				var newRef = v;
				var oldRef = t[k];

				if (v instanceof View) {
					newRef = v.___ref___;
				}

				if (t[k] instanceof View) {
					oldRef = t[k].___ref___;
				}

				if (newRef !== oldRef && t[k] instanceof View) {
					t[k].remove();
				}

				if (t[k] !== v) {
					t[k] = v;
				}

				if (_this9.args[k] !== v) {
					_this9.args[k] = v;
				}
			});

			var cleaner = this;

			while (cleaner.parent) {
				cleaner = cleaner.parent;
			}

			this.cleanup.push(function () {
				debindA();
				debindB();
				// view.remove();
			});

			var proxy = this.args;
			var property = ifProperty;

			if (ifProperty.match(/\./)) {
				var _Bindable$resolve7 = _Bindable.Bindable.resolve(this.args, ifProperty, true);

				var _Bindable$resolve8 = _slicedToArray(_Bindable$resolve7, 2);

				proxy = _Bindable$resolve8[0];
				property = _Bindable$resolve8[1];
			}

			var debind = proxy.bindTo(property, function (v, k) {
				if (Array.isArray(v)) {
					v = !!v.length;
				}

				if (inverted) {
					v = !v;
				}

				if (v) {
					view.render(tag);
				} else {
					while (tag.firstChild) {
						tag.firstChild.remove();
					}
					view.render(ifDoc);
				}
			});

			this.cleanup.push(function () {
				debind();
				if (!proxy.isBound()) {
					_Bindable.Bindable.clearBindings(proxy);
				}
			});
		}
	}, {
		key: 'postRender',
		value: function postRender(parentNode) {}
	}, {
		key: 'interpolatable',
		value: function interpolatable(str) {
			return !!String(str).match(this.interpolateRegex);
		}
	}, {
		key: 'uuid',
		value: function uuid() {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
				return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
			});
		}
	}, {
		key: 'remove',
		value: function remove() {
			var detachEvent = new Event('cvDomDetached');

			for (var _i10 in this.tags) {
				if (Array.isArray(this.tags[_i10])) {
					for (var j in this.tags[_i10]) {
						this.tags[_i10][j].remove();
					}
					continue;
				}
				this.tags[_i10].remove();
			}

			for (var _i11 in this.nodes) {
				this.nodes[_i11].dispatchEvent(detachEvent);
				this.nodes[_i11].remove();
			}

			var cleanup = void 0;

			while (cleanup = this.cleanup.shift()) {
				cleanup();
			}

			for (var _i12 in this.viewLists) {
				if (!this.viewLists[_i12]) {
					continue;
				}
				this.viewLists[_i12].remove();
			}

			this.viewLists = [];

			for (var _i13 in this.timeouts) {
				clearInterval(this.timeouts[_i13].timeout);
				delete this.timeouts[_i13];
			}

			for (var i in this.intervals) {
				clearInterval(this.intervals[i].timeout);
				delete this.intervals[i];
			}

			this.removed = true;

			// Bindable.clearBindings(this.args);
		}
	}, {
		key: 'update',
		value: function update() {}
	}, {
		key: 'beforeUpdate',
		value: function beforeUpdate(args) {}
	}, {
		key: 'afterUpdate',
		value: function afterUpdate(args) {}
	}, {
		key: 'stringToClass',
		value: function stringToClass(refClassname) {
			var refClassSplit = refClassname.split('/');
			var refShortClassname = refClassSplit[refClassSplit.length - 1];
			var refClass = require(refClassname);

			return refClass[refShortClassname];
		}
	}], [{
		key: 'isView',
		value: function isView() {
			return View;
		}
	}]);

	return View;
}();
  })();
});

require.register("curvature/base/ViewList.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ViewList = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Bindable = require('./Bindable');

var _View = require('./View');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ViewList = function () {
	function ViewList(template, subProperty, list, parent) {
		var _this = this;

		var keyProperty = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

		_classCallCheck(this, ViewList);

		this.args = _Bindable.Bindable.makeBindable({});
		this.args.value = _Bindable.Bindable.makeBindable(list || {});
		this.args.subArgs = _Bindable.Bindable.makeBindable({});
		this.views = [];
		this.cleanup = [];
		this.template = template;
		this.subProperty = subProperty;
		this.keyProperty = keyProperty;
		this.tag = null;
		this.paused = false;
		this.parent = parent;

		this.args.value.___before___.push(function (t) {
			if (t.___executing___ == 'bindTo') {
				return;
			}
			_this.paused = true;
		});

		this.args.value.___after___.push(function (t) {
			if (t.___executing___ == 'bindTo') {
				return;
			}

			_this.paused = t.___stack___.length > 1;

			_this.reRender();
		});

		var debind = this.args.value.bindTo(function (v, k, t, d) {

			if (_this.paused) {
				return;
			}

			if (d) {
				if (_this.views[k]) {
					_this.views[k].remove();
				}

				_this.views.splice(k, 1);

				for (var i in _this.views) {
					_this.views[i].args[_this.keyProperty] = i;
				}

				return;
			}

			if (!_this.views[k]) {
				_this.reRender();
			}
		}, { wait: 0 });

		this.cleanup.push(debind);
	}

	_createClass(ViewList, [{
		key: 'render',
		value: function render(tag) {
			for (var i in this.views) {
				this.views[i].render(tag);
			}

			this.tag = tag;
		}
	}, {
		key: 'reRender',
		value: function reRender() {
			var _this2 = this;

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

				for (var j in views) {
					if (views[j] && this.args.value[_i] === views[j].args[this.subProperty]) {
						found = true;
						finalViews[_i] = views[j];
						finalViews[_i].args[this.keyProperty] = _i;
						delete views[j];
						break;
					}
				}

				if (!found) {
					(function () {
						var viewArgs = {};
						var view = finalViews[_i] = new _View.View(viewArgs);

						finalViews[_i].template = _this2.template;
						finalViews[_i].parent = _this2.parent;
						finalViews[_i].viewList = _this2;

						finalViews[_i].args[_this2.keyProperty] = _i;
						finalViews[_i].args[_this2.subProperty] = _this2.args.value[_i];

						_this2.cleanup.push(_this2.args.value.bindTo(_i, function (v, k, t) {
							// viewArgs[ this.keyProperty ] = k;
							// viewArgs[ this.subProperty ] = v;
						}));

						_this2.cleanup.push(viewArgs.bindTo(_this2.subProperty, function (v, k) {
							var index = viewArgs[_this2.keyProperty];
							_this2.args.value[index] = v;
						}));

						_this2.cleanup.push(_this2.args.subArgs.bindTo(function (v, k, t, d) {
							viewArgs[k] = v;
						}));

						viewArgs[_this2.subProperty] = _this2.args.value[_i];
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

			var appendOnly = true;

			for (var _i3 in this.views) {
				if (this.views[_i3] !== finalViews[_i3]) {
					appendOnly = false;
				}
			}

			for (var _i4 in finalViews) {
				if (finalViews[_i4] === this.views[_i4]) {
					continue;
				}

				views.splice(_i4 + 1, 0, finalViews[_i4]);

				finalViews[_i4].render(this.tag);
			}

			for (var _i5 in finalViews) {
				finalViews[_i5].args[this.keyProperty] = _i5;
			}

			this.views = finalViews;
		}
	}, {
		key: 'pause',
		value: function pause() {
			var _pause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

			for (var i in this.views) {
				this.views[i].pause(_pause);
			}
		}
	}, {
		key: 'remove',
		value: function remove() {
			for (var i in this.views) {
				this.views[i].remove();
			}

			var cleanup = void 0;

			while (this.cleanup.length) {
				cleanup = this.cleanup.pop();
				cleanup();
			}

			this.views = [];

			while (this.tag && this.tag.firstChild) {
				this.tag.removeChild(this.tag.firstChild);
			}

			_Bindable.Bindable.clearBindings(this.args.subArgs);
			_Bindable.Bindable.clearBindings(this.args);

			if (!this.args.value.isBound()) {
				_Bindable.Bindable.clearBindings(this.args.value);
			}
		}
	}]);

	return ViewList;
}();

exports.ViewList = ViewList;
  })();
});

require.register("curvature/input/Keyboard.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "curvature");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Keyboard = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Bindable = require('../base/Bindable');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Keyboard = exports.Keyboard = function () {
	function Keyboard() {
		var _this = this;

		_classCallCheck(this, Keyboard);

		this.maxDecay = 120;

		this.listening = true;

		this.keys = _Bindable.Bindable.makeBindable({});
		this.codes = _Bindable.Bindable.makeBindable({});

		document.addEventListener('keyup', function (event) {
			_this.keys[event.key] = -1;
			_this.codes[event.code] = -1;
		});

		document.addEventListener('keydown', function (event) {
			if (_this.keys[event.key] > 0) {
				return;
			}
			_this.keys[event.key] = 1;
			_this.codes[event.code] = 1;
		});

		window.addEventListener('blur', function (event) {
			for (var i in _this.keys) {
				_this.keys[i] = -1;
			}
			for (var _i in _this.codes) {
				_this.codes[_i] = -1;
			}
		});
	}

	_createClass(Keyboard, [{
		key: 'getKey',
		value: function getKey(key) {
			if (!this.keys[key]) {
				return 0;
			}

			return this.keys[key];
		}
	}, {
		key: 'getKeyCode',
		value: function getKeyCode(code) {
			if (!this.codes[code]) {
				return 0;
			}

			return this.codes[code];
		}
	}, {
		key: 'update',
		value: function update() {
			for (var i in this.keys) {
				if (this.keys[i] > 0) {
					this.keys[i]++;
				} else {
					this.keys[i]--;

					if (this.keys[i] < -this.maxDecay) {
						delete this.keys[i];
					}
				}
			}
			for (var i in this.codes) {
				if (this.codes[i] > 0) {
					this.codes[i]++;
				} else {
					this.codes[i]--;

					if (this.codes[i] < -this.maxDecay) {
						delete this.keys[i];
					}
				}
			}
		}
	}]);

	return Keyboard;
}();
  })();
});
require.register("BinaryMessageView.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.BinaryMessageView = undefined;

var _View2 = require('curvature/base/View');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BinaryMessageView = exports.BinaryMessageView = function (_View) {
	_inherits(BinaryMessageView, _View);

	function BinaryMessageView() {
		var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, BinaryMessageView);

		var _this = _possibleConstructorReturn(this, (BinaryMessageView.__proto__ || Object.getPrototypeOf(BinaryMessageView)).call(this, args));

		_this.template = '<span>&gt;&gt;&nbsp;0x</span>[[header]]&nbsp;[[message]]';
		return _this;
	}

	return BinaryMessageView;
}(_View2.View);
});

;require.register("ByteView.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ByteView = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _View2 = require('curvature/base/View');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ByteView = exports.ByteView = function (_View) {
	_inherits(ByteView, _View);

	function ByteView() {
		var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, ByteView);

		var _this = _possibleConstructorReturn(this, (ByteView.__proto__ || Object.getPrototypeOf(ByteView)).call(this, args));

		_this.args.separator = _this.args.separator || '';

		_this.template = '<span\n\t\t\tcv-each = "bytes:byte:b"\n\t\t\tcv-carry = "separator"\n\t\t\tstyle = "display: block;"\n\t\t\t"><span\n\t\t\t\tcv-on = "cvDomAttached:color(event, byte, $view)"\n\t\t\t\tcv-ref = "byte:curvature/base/Tag"\n\t\t\t\t\n\t\t\t>[[byte]][[separator]]</span></span>';
		return _this;
	}

	_createClass(ByteView, [{
		key: 'color',
		value: function color(event, byte, $view) {
			var hue = parseInt(byte, 16);

			// let color = '#' + [
			// 	(Math.pow(Math.cos(Math.PI * hue + 5), 2) * 192)
			// 	, (Math.pow(Math.cos(Math.PI * hue + 10), 2) * 192)
			// 	, (Math.pow(Math.cos(Math.PI * hue + 0), 2) * 192)
			// ].map((x)=>Math.floor(x).toString(16).padStart(2, '0')).join('');

			if (!hue) {
				return;
			}

			var color = "hsl(" + 360 * hue / 0xFF + ",70%,70%)";

			$view.tags.byte.element.style.color = color;

			$view.tags.byte.element.style['text-shadow'] = '2px 0px 5px ' + color + ', -2px 0px 5px ' + color;
		}
	}]);

	return ByteView;
}(_View2.View);
});

;require.register("Config.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = exports.Config = function Config() {
  _classCallCheck(this, Config);
};

Config.title = 'SubSpace 0.2.0a';
});

require.register("Cornfield.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cornfield = exports.Cornfield = function () {
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
			terminal.args.output.push('!! <' + i + '> ' + m);
		});

		this.socket.subscribe('message:cornfield:users:ping', function (e, m, o, i) {
			_this.socket.publish('cornfield:users:pong', 'pong!');
		});

		this.socket.subscribe('message:cornfield:users:pong', function (e, m, o, i) {});
	}

	_createClass(Cornfield, [{
		key: 'pass',
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
					terminal.args.output.push('!! <you> ' + chatMessage);
					this.socket.publish('cornfield:chat', chatMessage);
					break;
			}

			terminal.args.input = '';
		}
	}]);

	return Cornfield;
}();
});

;require.register("Image.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Image = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _View = require('curvature/base/View');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Image = exports.Image = function () {
	function Image(terminal, args) {
		_classCallCheck(this, Image);

		terminal.localEcho = false;

		this.socket = terminal.socket;

		var channel = 0;

		if (args.length) {
			channel = args[0];
		}

		this.socket.subscribe('message:' + channel, function (e, m, o, i) {
			console.log(m, o, i);
			terminal.args.output.push('Got one.');
			var blob = new Blob([new Uint8Array(m)]);
			var url = URL.createObjectURL(blob);

			var view = new _View.View();

			view.template = '<img cv-attr = "src:img" cv-ref = "img:curvature/base/Tag" />';

			view.postRender = function () {
				var img = view.tags.img.element;
				var imageLoad = function imageLoad(event) {
					img.removeEventListener('load', imageLoad);
					URL.revokeObjectURL(url);
				};
				img.addEventListener('load', imageLoad);
			};

			terminal.args.output.push(view);

			view.args.img = url;
		});

		terminal.args.output.push(':: Listening for images on channel ' + channel);
	}

	_createClass(Image, [{
		key: 'pass',
		value: function pass(input, terminal) {
			var args = input.split(' ');
			var command = args.shift();
			console.log(command);

			switch (command.toLowerCase()) {
				case 'ping':
					this.socket.publish('cornfield:users:ping', 'ping!');
					break;
			}

			terminal.args.input = '';
		}
	}]);

	return Image;
}();
});

;require.register("Login.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Login = exports.Login = function () {
	function Login() {
		_classCallCheck(this, Login);
	}

	_createClass(Login, [{
		key: 'init',
		value: function init(terminal) {
			terminal.args.output.push(':: Please type your username');
		}
	}, {
		key: 'pass',
		value: function pass(command, terminal) {
			terminal.args.passwordMode = false;

			if (!this.stack) {
				this.stack = [];
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

				terminal.args.output.push('<< login ' + this.stack[0] + ' [password censored]');
				terminal.socket.send('login ' + this.stack[0] + ' ' + this.stack[1]);
				terminal.args.output.push(':: Checking...');
			}
		}
	}]);

	return Login;
}();
});

;require.register("MeltingText.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MeltingText = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _View = require('curvature/base/View');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MeltingText = exports.MeltingText = function (_BaseView) {
	_inherits(MeltingText, _BaseView);

	function MeltingText(args) {
		_classCallCheck(this, MeltingText);

		var _this = _possibleConstructorReturn(this, (MeltingText.__proto__ || Object.getPrototypeOf(MeltingText)).call(this, args));

		_this.charUp = ['\u030D', /*     ̍     */'\u030E', /*     ̎     */'\u0304', /*     ̄     */'\u0305', /*     ̅     */
		'\u033F', /*     ̿     */'\u0311', /*     ̑     */'\u0306', /*     ̆     */'\u0310', /*     ̐     */
		'\u0352', /*     ͒     */'\u0357', /*     ͗     */'\u0351', /*     ͑     */'\u0307', /*     ̇     */
		'\u0308', /*     ̈     */'\u030A', /*     ̊     */'\u0342', /*     ͂     */'\u0343', /*     ̓     */
		'\u0344', /*     ̈́     */'\u034A', /*     ͊     */'\u034B', /*     ͋     */'\u034C', /*     ͌     */
		'\u0303', /*     ̃     */'\u0302', /*     ̂     */'\u030C', /*     ̌     */'\u0350', /*     ͐     */
		'\u0300', /*     ̀     */'\u0301', /*     ́     */'\u030B', /*     ̋     */'\u030F', /*     ̏     */
		'\u0312', /*     ̒     */'\u0313', /*     ̓     */'\u0314', /*     ̔     */'\u033D', /*     ̽     */
		'\u0309', /*     ̉     */'\u0363', /*     ͣ     */'\u0364', /*     ͤ     */'\u0365', /*     ͥ     */
		'\u0366', /*     ͦ     */'\u0367', /*     ͧ     */'\u0368', /*     ͨ     */'\u0369', /*     ͩ     */
		'\u036A', /*     ͪ     */'\u036B', /*     ͫ     */'\u036C', /*     ͬ     */'\u036D', /*     ͭ     */
		'\u036E', /*     ͮ     */'\u036F', /*     ͯ     */'\u033E', /*     ̾     */'\u035B', /*     ͛     */
		'\u0346', /*     ͆     */'\u031A' /*     ̚     */
		];
		_this.charMid = ['\u0315', /*     ̕     */'\u031B', /*     ̛     */'\u0340', /*     ̀     */'\u0341', /*     ́     */
		'\u0358', /*     ͘     */'\u0321', /*     ̡     */'\u0322', /*     ̢     */'\u0327', /*     ̧     */
		'\u0328', /*     ̨     */'\u0334', /*     ̴     */'\u0335', /*     ̵     */'\u0336', /*     ̶     */
		'\u034F', /*     ͏     */'\u035C', /*     ͜     */'\u035D', /*     ͝     */'\u035E', /*     ͞     */
		'\u035F', /*     ͟     */'\u0360', /*     ͠     */ /*'\u0362',      ͢     */'\u0338', /*     ̸     */
		'\u0337', /*     ̷     */'\u0361'];
		_this.charDown = ['\u0316', /*     ̖     */'\u0317', /*     ̗     */'\u0318', /*     ̘     */'\u0319', /*     ̙     */
		'\u031C', /*     ̜     */'\u031D', /*     ̝     */'\u031E', /*     ̞     */'\u031F', /*     ̟     */
		'\u0320', /*     ̠     */'\u0324', /*     ̤     */'\u0325', /*     ̥     */'\u0326', /*     ̦     */
		'\u0329', /*     ̩     */'\u032A', /*     ̪     */'\u032B', /*     ̫     */'\u032C', /*     ̬     */
		'\u032D', /*     ̭     */'\u032E', /*     ̮     */'\u032F', /*     ̯     */'\u0330', /*     ̰     */
		'\u0331', /*     ̱     */'\u0332', /*     ̲     */'\u0333', /*     ̳     */'\u0339', /*     ̹     */
		'\u033A', /*     ̺     */'\u033B', /*     ̻     */'\u033C', /*     ̼     */'\u0345', /*     ͅ     */
		'\u0347', /*     ͇     */'\u0348', /*     ͈     */'\u0349', /*     ͉     */'\u034D', /*     ͍     */
		'\u034E', /*     ͎     */'\u0353', /*     ͓     */'\u0354', /*     ͔     */'\u0355', /*     ͕     */
		'\u0356', /*     ͖     */'\u0359', /*     ͙     */'\u035A', /*     ͚     */'\u0323' /*     ̣     */
		];
		_this.template = '\n\t\t\t<div cv-bind = "output" class = "melting"></div>\n\t\t';
		// this.args.input      = 'Magic is no more than the art of employing consciously invisible means to produce visible effects. Will, love, and imagination are magic powers that everyone possesses; and whoever knows how to develop them to their fullest extent is a magician. Magic has but one dogma, namely, that the seen is the measure of the unseen'; 
		_this.args.input = 'anything';
		_this.args.output = 'uh.';
		_this.corruptors = {};
		_this.maxCorrupt = 200;
		_this.type = '';

		_this.args.bindTo('type', function (v) {
			_this.output = _this.corrupt(_this.type);
		});

		setInterval(function () {
			_this.typewriter(_this.args.input);
		}, 1);
		setInterval(function () {
			_this.args.output = _this.corrupt(_this.type);
			// this.args.output = this.type;
		}, 45);

		_this.args.bindTo('input', function (v) {
			_this.type = '';_this.corruptors = [];
		});
		return _this;
	}

	_createClass(MeltingText, [{
		key: 'corrupt',
		value: function corrupt(v) {
			var chars = v.split('');
			var rand = function rand(x) {
				return parseInt(Math.random() * x);
			};
			for (var i in chars) {
				if (!this.corruptors[i]) {
					this.corruptors[i] = [];
				}
				if (chars[i].match(/\W/)) {
					continue;
				}
				var charSets = [
				// this.charDown, this.charDown, this.charUp, 
				this.charDown, this.charUp];
				var charSet = charSets[rand(charSets.length)];
				while (this.corruptors[i].length < this.maxCorrupt) {
					if (rand(10) < 5) {
						this.corruptors[i].unshift(this.corruptors[i].pop());
						break;
					}
					if (charSet === this.charMid) {
						if (rand(15) > 1) {
							this.corruptors[i].shift();
							continue;
						}
					}
					this.corruptors[i].unshift(charSet[rand(charSet.length)]);
				}
				if (this.corruptors[i].length >= this.maxCorrupt) {
					this.corruptors[i].pop();
				}

				chars[i] += this.corruptors[i].join('');
			}
			return chars.join('');
		}
	}, {
		key: 'typewriter',
		value: function typewriter(v) {
			this.type = this.type || '';

			if (this.type !== v) {
				this.type += v.substr(this.type.length, 1);
			} else {
				return true;
			}
			return false;
		}
	}]);

	return MeltingText;
}(_View.View);
});

;require.register("Register.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Register = exports.Register = function () {
	function Register() {
		_classCallCheck(this, Register);
	}

	_createClass(Register, [{
		key: 'init',
		value: function init(terminal) {
			terminal.args.output.push(':: Please type your username');
		}
	}, {
		key: 'pass',
		value: function pass(command, terminal) {
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

				terminal.args.output.push(':: Trying to register ' + this.stack[0] + ' <' + this.stack[1] + '>...');

				terminal.args.output.push('<< register ' + this.stack[0] + ' [password censored] ' + this.stack[1]);
				terminal.socket.send('register ' + this.stack[0] + ' ' + this.stack[2] + ' ' + this.stack[1]);

				terminal.localLock = false;
				terminal.args.prompt = '<<';

				// terminal.socket.send(`login ${this.stack[0]} ${this.stack[1]}`);
			}
		}
	}]);

	return Register;
}();
});

;require.register("RootView.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RootView = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _View2 = require('curvature/base/View');

var _Keyboard = require('curvature/input/Keyboard');

var _Socket = require('kalisti/Socket');

var _BinaryMessageView = require('BinaryMessageView');

var _TextMessageView = require('TextMessageView');

var _ByteView = require('ByteView');

var _MeltingText = require('MeltingText');

var _Login = require('Login');

var _Register = require('Register');

var _Cornfield = require('Cornfield');

var _Image = require('Image');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RootView = exports.RootView = function (_View) {
	_inherits(RootView, _View);

	function RootView() {
		var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, RootView);

		var _this = _possibleConstructorReturn(this, (RootView.__proto__ || Object.getPrototypeOf(RootView)).call(this, args));

		_this.routes = {};
		_this.template = require('./root.tmp');
		_this.args.input = '';
		_this.args.output = [];
		_this.args.inverted = '';
		_this.args.passwordMode = false;
		_this.localEcho = true;

		_this.localLock = null;
		_this.args.prompt = '<<';

		_this.max = 1024;

		_this.history = [];
		_this.historyCursor = -1;

		args.output.___after___.push(function (t, k, o, a) {
			if (k === 'push') {
				_this.onTimeout(16, function () {
					window.scrollTo({
						top: document.body.scrollHeight,
						left: 0,
						behavior: 'smooth'
					});
				});

				_this.onTimeout(48, function () {
					window.scrollTo({
						top: document.body.scrollHeight,
						left: 0,
						behavior: 'smooth'
					});
				});
			}
		});

		_this.socket = _Socket.Socket.get('ws://' + location.hostname + ':9998');

		_this.auth().then(function () {
			_this.onTimeout(10, function () {
				_this.socket.send('motd');
				_this.args.output.push('<< motd');
			});
		});

		_this.socket.subscribe('message', function (event, message, channel, origin, originId, originalChannel, packet) {
			if (typeof event.data == 'string') {
				var received = JSON.parse(event.data);

				if ((typeof received === 'undefined' ? 'undefined' : _typeof(received)) == 'object') {
					received = JSON.stringify(received, null, 4);
				}

				if (_this.localEcho) {
					_this.args.output.push(new _TextMessageView.TextMessageView({
						message: received
					}));
				}
			} else if (event.data instanceof ArrayBuffer) {
				var bytesArray = new Uint8Array(event.data);

				var user = originId.toString(16).toUpperCase().padStart(4, '0');

				var channelName = channel.toString(16).toUpperCase().padStart(4, '0');

				var header = '0x' + user + channelName;

				var headerBytes = [originId.toString(16).toUpperCase().padStart(4, '0'), channel.toString(16).toUpperCase().padStart(4, '0')].join('').match(/.{1,2}/g);

				var messageIndex = 6;

				if (origin == 'server') {
					headerBytes = [channel.toString(16).padStart(4, '0')];
					header = '0x' + channel.toString(16).padStart(4, '0');

					var _messageIndex = 4;
				}

				var bytes = Array.from(bytesArray).map(function (x) {
					return x.toString(16).toUpperCase().padStart(2, '0');
				});

				if (_this.localEcho) {
					_this.args.output.push(new _BinaryMessageView.BinaryMessageView({
						header: new _ByteView.ByteView({
							separator: '',
							bytes: headerBytes
						}),
						message: new _ByteView.ByteView({
							separator: ' ',
							bytes: bytes.slice(messageIndex)
						})
					}));
				}

				while (_this.args.output.length > _this.max) {
					_this.args.output.shift();
				}
			}
		});

		var keyboard = new _Keyboard.Keyboard();

		keyboard.keys.bindTo(function (v, k) {
			if (v == 1) {
				// alert(k);
			}
		}, { wait: 1 });

		keyboard.keys.bindTo('Escape', function (v) {
			if (v == 1) {
				if (_this.localLock) {
					_this.args.output.push(':: Killed.');
				}
				_this.localLock = false;
				_this.args.prompt = '<<';
				_this.args.passwordMode = false;
			}
		}, { wait: 1 });

		keyboard.keys.bindTo('ArrowUp', function (v) {
			if (v == 1) {
				_this.historyCursor++;

				if (_this.historyCursor >= _this.history.length) {
					_this.historyCursor--;
					return;
				}

				_this.args.input = _this.history[_this.historyCursor];
			}
		}, { wait: 1 });

		keyboard.keys.bindTo('ArrowDown', function (v) {
			if (v == 1) {
				_this.historyCursor--;

				if (_this.historyCursor <= -1) {
					_this.historyCursor++;
					_this.args.input = '';
					return;
				}

				_this.args.input = _this.history[_this.historyCursor];
			}
		}, { wait: 1 });

		return _this;
	}

	_createClass(RootView, [{
		key: 'postRender',
		value: function postRender() {
			var _this2 = this;

			this.args.bindTo('passwordMode', function (v) {
				if (v) {
					_this2.tags.input.element.style.display = 'none';
					_this2.tags.password.element.style.display = 'unset';
				} else {
					_this2.tags.input.element.style.display = 'unset';
					_this2.tags.password.element.style.display = 'none';
				}

				_this2.focus();
			}, { wait: 0 });
		}
	}, {
		key: 'fileLoaded',
		value: function fileLoaded(event) {
			var _this3 = this;

			if (this.fileChannel === false) {
				return;
			}

			var fileReader = new FileReader();
			var field = event.target;
			var file = event.target.files[0];

			fileReader.addEventListener('load', function (event) {
				_this3.args.output.push(':: Sending ' + file.name + '...');

				if (_this3.fileChannel == parseInt(_this3.fileChannel)) {
					_this3.socket.publish(_this3.fileChannel, event.target.result);
				} else {
					console.log(event.target);
					_this3.socket.publish(_this3.fileChannel, new TextDecoder("utf-8").decode(event.target.result));
				}

				_this3.fileChannel = false;
				field.value = '';
			});

			fileReader.readAsArrayBuffer(file);
		}
	}, {
		key: 'focus',
		value: function focus(event) {
			if (event && event.target.name == 'INPUT') {
				return;
			}

			if (window.getSelection().toString()) {
				return;
			}

			if (this.args.passwordMode) {
				this.tags.password.element.focus();
				return;
			}

			this.tags.input.element.focus();
		}
	}, {
		key: 'submit',
		value: function submit(event) {
			this.interpret(this.args.input);
		}
	}, {
		key: 'interpret',
		value: function interpret(command) {
			if (this.localLock) {
				if (command == '/quit') {
					this.localLock = false;
					this.args.prompt = '<<';
					this.args.output.push(':: Killed.');
					this.args.input = '';
					return;
				}
				this.localLock.pass(command, this);
				return;
			}

			this.history.unshift(command);
			this.historyCursor = -1;

			if (command.substring(0, 1) !== '/') {
				this.socket.send(command);

				this.args.output.push('<< ' + command);

				while (this.args.output.length > this.max) {
					this.args.output.shift();
				}

				this.args.input = '';

				return;
			}

			// let original = command;
			this.args.output.push(':: ' + command);

			command = command.substring(1);
			var args = command.split(' ');
			command = args.shift();

			switch (command) {
				case 'pub':
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

					this.socket.send(new Uint8Array(bytes));
					break;

				case 'login':
					this.args.output.push(':: Escape to cancel');
					this.localLock = new _Login.Login();
					this.args.prompt = '::';
					this.localLock.init(this);
					this.args.prompt = '::';
					break;

				case 'register':
					this.args.output.push(':: Escape to cancel');
					this.localLock = new _Register.Register();
					this.args.prompt = '::';
					this.localLock.init(this);
					break;

				case 'auth':
					this.auth();
					break;

				case 'clear':
					while (this.args.output.length) {
						this.args.output.pop();
					}
					break;

				case 'echo':
					if (args.length) {
						this.localEcho = parseInt(args[0]);
					}
					this.args.output.push('Echo is ' + (this.localEcho ? 'on' : 'off'));
					break;

				case 'cornfield':
					this.localLock = new _Cornfield.Cornfield(this);
					this.args.prompt = '::';
					break;

				case 'image':
					this.localLock = new _Image.Image(this, args);
					this.args.prompt = '::';
					break;

				case 'light':
					this.args.inverted = 'inverted';
					break;

				case 'dark':
					this.args.inverted = '';
					break;

				case 'file':
					if (!args.length) {
						this.args.output.push(':: Error: Please supply a channel to publish file.');
						break;
					}
					this.fileChannel = args[0];
					this.tags.file.element.click();
					break;

				case 'z':
					this.args.output.push(new _MeltingText.MeltingText({ input: 'lmao!' }));
					break;

				case 'commands':
					this.args.output.push(JSON.stringify({
						'/pub': 'CHAN BYTES... Publish raw bytes to a channel (hexadecimal)',
						'/auth': 'Run the auth procedure.',
						'/login': 'Run the login procedure.',
						'/register': 'Run the registration procedure.',
						'/clear': 'Clear the terminal.',
						'/echo': '[1|0] Enable/Disable/Check localEcho.',
						'/light': 'Light theme.',
						'/dark': 'Dark theme.',
						'/cornfield': 'Play Cornfield.'
					}, null, 4));
					break;
			}

			this.args.input = '';
		}
	}, {
		key: 'auth',
		value: function auth() {
			var _this4 = this;

			return fetch('/auth?api').then(function (response) {
				return response.text();
			}).then(function (token) {
				_this4.args.output.push(':: /auth');
				_this4.args.output.push('<< auth [token censored]');
				_this4.socket.send('auth ' + token);

				return true;
			});
		}
	}, {
		key: 'test',
		value: function test(event) {
			var _this5 = this;

			if (event.key == 'Enter') {
				var command = this.args.input;
				this.args.input = '';
				this.onTimeout(0, function () {
					_this5.interpret(command);
				});
			}
		}
	}]);

	return RootView;
}(_View2.View);
});

;require.register("TextMessageView.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TextMessageView = undefined;

var _View2 = require('curvature/base/View');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextMessageView = exports.TextMessageView = function (_View) {
	_inherits(TextMessageView, _View);

	function TextMessageView() {
		var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, TextMessageView);

		var _this = _possibleConstructorReturn(this, (TextMessageView.__proto__ || Object.getPrototypeOf(TextMessageView)).call(this, args));

		_this.template = '<span>&gt;&gt;&nbsp;</span><span class = "text">[[message]]</span>';
		return _this;
	}

	return TextMessageView;
}(_View2.View);
});

;require.register("initialize.js", function(exports, require, module) {
'use strict';

var _Tag = require('curvature/base/Tag');

var _RuleSet = require('curvature/base/RuleSet');

var _Router = require('curvature/base/Router');

var _RootView = require('./RootView');

var view = new _RootView.RootView();

_RuleSet.RuleSet.add('body', view);

_RuleSet.RuleSet.wait();

_Router.Router.wait(view);
});

require.register("kalisti/Channel.js", function(exports, require, module) {
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
});

;require.register("kalisti/Socket.js", function(exports, require, module) {
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

			if (1 || refresh || !this.sockets[url]) {
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
});

;require.register("root.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"main [[inverted]]\" cv-on = \"click:focus(event)\">\n\t<div class = \"top\">\n\t\t<div class = \"menu\"></div>\n\t\t<div class = \"terminal\">\n\t\t\t<div class = \"output\" cv-each = \"output:line:l\" cv-ref = \"output:curvature/base/Tag\">\n\t\t\t\t<p>[[line]]</p>\n\t\t\t</div>\n\t\t\t<div class = \"bottom\">\n\t\t\t\t<div>[[prompt]]&nbsp;</div>\n\t\t\t\t<div>\n\t\t\t\t\t<input\n\t\t\t\t\t\ttype = \"text\"\n\t\t\t\t\t\tcv-on = \"keydown:test(event)\"\n\t\t\t\t\t\tcv-bind = \"input\"\n\t\t\t\t\t\tcv-ref = \"input:curvature/base/Tag\"/>\n\t\t\t\t\t<input\n\t\t\t\t\t\tname = \"pw-input\"\n\t\t\t\t\t\ttype = \"password\"\n\t\t\t\t\t\tcv-on = \"keydown:test(event)\"\n\t\t\t\t\t\tcv-bind = \"input\"\n\t\t\t\t\t\tcv-ref = \"password:curvature/base/Tag\"/>\n\t\t\t\t\t<input\n\t\t\t\t\t\tname  = \"file-input\"\n\t\t\t\t\t\ttype  = \"file\"\n\t\t\t\t\t\tstyle = \"display: none\"\n\t\t\t\t\t\tcv-on = \"input:fileLoaded(event)\"\n\t\t\t\t\t\tcv-ref = \"file:curvature/base/Tag\"/>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\t<div class = \"scanlines\"></div>\n</div>\n"
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

'use strict';

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
      });

      // Hack to force page repaint after 25ms.
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