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

require.register("subspace-client/Channel.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-client");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Channel = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Channel = /*#__PURE__*/function () {
  function Channel() {
    _classCallCheck(this, Channel);
  }

  _createClass(Channel, null, [{
    key: "scalar",
    value: function scalar(data, type) {
      var buffer = new Uint8Array(data).buffer;

      if (type == 'float') {
        return new Float64Array(buffer)[0];
      } else if (type == 'Int32') {
        return new Int32Array(buffer)[0];
      }
    }
  }, {
    key: "namePart",
    value: function namePart(name, part) {
      return name.split(':')[part] || null;
    }
  }, {
    key: "isWildcard",
    value: function isWildcard(name) {
      return /\*/.exec(name);
    }
  }, {
    key: "isRange",
    value: function isRange(name) {// return /\*/.exec(name);
    }
  }, {
    key: "containsRange",
    value: function containsRange(name) {// return /\*/.exec(name);
    }
  }, {
    key: "compareNames",
    value: function compareNames(a, b) {
      var rangeForm = /^(\d+)\-?(\d+)?$/;
      var result = [];
      var splitA = a.toString().split(':');
      var splitB = b.toString().split(':');
      var nodes = splitA.length;
      var cmpA;
      var cmpB;

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
                returnNode = "".concat(a1, "-").concat(a2);
              } else if (a1 <= b1 && a2 > b2) {
                returnNode = "".concat(b1, "-").concat(b2);
              } else if (a2 <= b2 && a2 >= b1) {
                returnNode = "".concat(b1, "-").concat(a2);
              } else if (a1 <= b2 && a1 >= b1) {
                returnNode = "".concat(a1, "-").concat(b2);
              }

              if (b2 <= a2 && b2 >= a1) {
                returnNode = "".concat(a1, "-").concat(b2);
              } else if (b1 <= a2 && b1 >= a1) {
                returnNode = "".concat(b1, "-").concat(a2);
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

exports.Channel = Channel;
  })();
});

require.register("subspace-client/Socket.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-client");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Socket = void 0;

var _Channel = require("./Channel");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Socket = /*#__PURE__*/function () {
  _createClass(Socket, null, [{
    key: "get",
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
    key: "subscribe",
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
        this.send("sub ".concat(channel));
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

          if (_typeof(packet) !== 'object') {
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
    key: "unsubscribe",
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
        this.send("unsub ".concat(channel));
      }
    }
  }, {
    key: "publish",
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

      this.send("pub ".concat(channel, " ").concat(message));
    }
  }, {
    key: "say",
    value: function say(channel, users, message) {
      var cc = [];
      var bcc = [];

      if (Array.isArray(users)) {
        Object.assign(cc, users);
      } else if (users.cc || users.bcc) {
        if (Array.isArray(users.cc)) {
          Object.assign(cc, users.cc);
        }

        if (Array.isArray(users.bcc)) {
          Object.assign(bcc, users.bcc);
        }
      }

      if (!cc && !bcc) {
        var userListString = 'CANNOT STRINGIFY USERLIST';

        try {
          userListString = JSON.stringify(users);
        } catch (error) {
          userlistString += ' ' + error.message;
        }

        throw error('Invalid userlist provided:' + userListString);
      }

      var ccString = cc.length ? "".concat(cc.length, " ").concat(cc.join(' ')) : "0";
      var bccString = bcc.length ? "".concat(bcc.length, " ").concat(bcc.join(' ')) : "0";
      this.send("say ".concat(channel, " ").concat(ccString, " ").concat(bccString, " ").concat(message));
    }
  }, {
    key: "send",
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
    key: "onSend",
    value: function onSend(callback) {
      this._onSend.push(callback);
    }
  }, {
    key: "close",
    value: function close(message) {
      this.socket.close();
    }
  }, {
    key: "ping",
    value: function ping() {// this.socket.ping();
    }
  }, {
    key: "pong",
    value: function pong() {// this.socket.pong();
    }
  }]);

  return Socket;
}();

exports.Socket = Socket;
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

var _Bag = require("curvature/base/Bag");

var _MeltingText = require("./view/MeltingText");

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

    _this = _super.call(this, args);
    var defaults = {
      init: false,
      path: _Path.Path
    };
    var allOptions = Object.assign({}, defaults, options);
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
    _this.taskList = new _Bag.Bag();
    _this.taskList.type = _Task.Task;
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

      _this.scrollToBottom();
    });

    if (allOptions.init) {
      _this.runScript(allOptions.init);
    }

    _this.scroller = allOptions.scroller || document.body;
    _this.path = allOptions.path || {};
    _this.originalInput = '';
    return _this;
  }

  _createClass(Console, [{
    key: "runCommand",
    value: function runCommand(command) {
      var _this2 = this;

      if (this.historyCursor != 0) {
        this.history.unshift(command);
      }

      return new Promise(function (accept) {
        var task;

        if (command.substring(0, 1) === '/') {
          if (!_this2.args.passwordMode) {
            _this2.args.output.push(":: ".concat(command));
          }

          task = _this2.interpret(command.substr(1));
        } else if (_this2.tasks.length) {
          if (!_this2.args.passwordMode) {
            _this2.args.output.push("".concat(_this2.tasks[0].prompt, " ").concat(command));
          }

          task = _this2.tasks[0].write(command) || Promise.resolve();
        } else {
          if (!_this2.args.passwordMode) {
            _this2.args.output.push(":: ".concat(command));
          }

          task = _this2.interpret(command);
        }

        if (!(task instanceof _Task.Task) && !(task instanceof Promise)) {
          task = Promise.resolve(task);
        }

        _this2.historyCursor = -1;
        _this2.originalInput = _this2.args.input = '';
        task.then(function (result) {
          return accept(result);
        });
      })["catch"](function (error) {
        _this2.args.output.push("Unexpected error: ".concat(error));
      });
    }
  }, {
    key: "runScript",
    value: function runScript(url) {
      var _this3 = this;

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
            _this3.args.output.push(line.substring(1));

            process(lines);
          } else if (line) {
            _this3.runCommand(line).then(function () {
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
      var _this4 = this;

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
        _this4.focus(null, v);
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
    value: function interpret(input) {
      var _this5 = this;

      this.historyCursor = -1;
      var expressions = input.split(/\s*\;\s*/);
      var lastTask = null;

      var _iterator = _createForOfIteratorHelper(expressions),
          _step;

      try {
        var _loop = function _loop() {
          var expression = _step.value;

          var task = _this5.pipe(expression.split(/\s*\|\s*/));

          if (task) {
            _this5.tasks.unshift(task);

            var output = function output(event) {
              var prompt = task.outPrompt || task.prompt || _this5.args.prompt || '::';

              _this5.args.output.push("".concat(prompt, " ").concat(event.detail));
            };

            var error = function error(event) {
              var errorPrompt = task.errorPrompt || '!!';

              _this5.args.output.push("".concat(errorPrompt, " ").concat(event.detail));
            };

            task.addEventListener('output', output);
            task.addEventListener('error', error);
            task.execute();
            task["catch"](function (error) {
              return console.error(error);
            });
            task["catch"](function (error) {
              return _this5.args.output.push("!! ".concat(error));
            });
            _this5.args.prompt = task.prompt;
            task["finally"](function (done) {
              task.removeEventListener('error', error);
              task.removeEventListener('output', output);

              _this5.tasks.shift();

              if (_this5.tasks.length) {
                _this5.args.prompt = _this5.tasks[0].prompt;
              } else {
                _this5.args.prompt = '::';
              }
            });
          }

          lastTask = task;
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return lastTask;
    }
  }, {
    key: "pipe",
    value: function pipe(commands, previousTask) {
      var task = null;
      var commandString = commands.shift();
      var args = commandString.trim().split(' ');
      var command = args.shift().trim();

      if (command.length > 1 && command.substr(-1) == "?") {
        command = command.substr(0, command.length - 1);

        if (command in this.path) {
          this.args.output.push("?? ".concat(this.path[command].helpText));
          this.args.output.push("?? ".concat(this.path[command].useText));
        }

        return;
      }

      if (command in this.path) {
        var cmdClass = this.path[command];
        task = new cmdClass(args, previousTask, this);
      } else {
        switch (command) {
          case 'clear':
            this.args.output.splice(0);
            break;

          case 'z':
            this.args.output.splice(0);
            this.args.output.push(new _MeltingText.MeltingText({
              input: '!!!'
            }));
            break;

          case 'commands':
          case '?':
            this.args.output.push("   Subspace Console 0.29a \xA92018-2021 Sean Morris");

            for (var cmd in this.path) {
              this.args.output.push(" * ".concat(cmd, " - ").concat(this.path[cmd].helpText));
              this.path[cmd].useText && this.args.output.push("   ".concat(this.path[cmd].useText));
              this.args.output.push("  ");
            }

            break;

          default:
            this.args.output.push("!! Bad command: ".concat(command));
        }
      }

      if (commands.length) {
        return this.pipe(commands, task);
      }

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
      var _this6 = this;

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
            var element = _this6.tags.input.element;
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
            var element = _this6.tags.input.element;
            element.selectionStart = element.value.length;
            element.selectionEnd = element.value.length;
          });
          break;

        case 'Escape':
          if (this.tasks.length) {
            console.log(_Task.Task.KILL);
            this.tasks[0]["finally"](function () {
              return _this6.args.output.push(":: Killed.");
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
          this.args.input = '';
          break;

        default:
          this.historyCursor = -1;
          this.scrollToBottom();
          break;
      }
    }
  }, {
    key: "cancel",
    value: function cancel(event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, {
    key: "scrollToBottom",
    value: function scrollToBottom() {
      var scroller = (this.scroller === document.body ? window : this.scroller) || window;
      var scrollTo = (this.scroller === document.body ? this.scroller : document.body).scrollHeight;
      this.onNextFrame(function () {
        scroller.scrollTo({
          behavior: 'smooth',
          left: 0,
          top: scrollTo
        });
      });
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

var Path = {};
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

      var onOutputEvent = function onOutputEvent(_ref) {
        var detail = _ref.detail;
        return _this2.write(detail);
      };

      var init = this.init.apply(this, _toConsumableArray(this.args));
      var prev = this.prev;

      if (prev) {
        prev.addEventListener('output', onOutputEvent);
      }

      if (!(init instanceof Promise)) {
        init = Promise.resolve(init);
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
        return Promise.allSettled([init]).then(function (result) {
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
}(_Mixin.Mixin["with"](_Target.Target, _TaskSignals.TaskSignals));

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
var Target = (_Target = {}, _defineProperty(_Target, _Mixin.Mixin.Constructor, function () {
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

require.register("subspace-console/view/MeltingText.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
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
  })();
});
require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

"use strict";/* jshint ignore:start */(function(){var WebSocket=window.WebSocket||window.MozWebSocket,br=window.brunch=window.brunch||{},ar=br["auto-reload"]=br["auto-reload"]||{};if(WebSocket&&!ar.disabled&&!window._ar){window._ar=!0;var cacheBuster=function(a){var b=Math.round(Date.now()/1e3).toString();return a=a.replace(/(\&|\\?)cacheBuster=\d*/,""),a+(0<=a.indexOf("?")?"&":"?")+"cacheBuster="+b},browser=navigator.userAgent.toLowerCase(),forceRepaint=ar.forceRepaint||-1<browser.indexOf("chrome"),reloaders={page:function page(){window.location.reload(!0)},stylesheet:function stylesheet(){[].slice.call(document.querySelectorAll("link[rel=stylesheet]")).filter(function(a){var b=a.getAttribute("data-autoreload");return a.href&&"false"!=b}).forEach(function(a){a.href=cacheBuster(a.href)}),forceRepaint&&setTimeout(function(){document.body.offsetHeight},25)},javascript:function javascript(){var scripts=[].slice.call(document.querySelectorAll("script")),textScripts=scripts.map(function(a){return a.text}).filter(function(a){return 0<a.length}),srcScripts=scripts.filter(function(a){return a.src}),loaded=0,all=srcScripts.length,onLoad=function(){++loaded,loaded===all&&textScripts.forEach(function(script){eval(script)})};srcScripts.forEach(function(a){var b=a.src;a.remove();var c=document.createElement("script");c.src=cacheBuster(b),c.async=!0,c.onload=onLoad,document.head.appendChild(c)})}},port=ar.port||9485,host=br.server||window.location.hostname||"localhost",connect=function(){var a=new WebSocket("ws://"+host+":"+port);a.onmessage=function(a){if(!ar.disabled){var b=a.data,c=reloaders[b]||reloaders.page;c()}},a.onerror=function(){a.readyState&&a.close()},a.onclose=function(){window.setTimeout(connect,1e3)}};connect()}})();
;
//# sourceMappingURL=vendor.js.map