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

require.register("sixgram/Actions.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "sixgram");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HOME = exports.LEAVE = exports.ENTER = exports.INSERT = exports.IGNORE = void 0;
var IGNORE = 0;
exports.IGNORE = IGNORE;
var INSERT = 1;
exports.INSERT = INSERT;
var ENTER = 2;
exports.ENTER = ENTER;
var LEAVE = 3;
exports.LEAVE = LEAVE;
var HOME = 4;
exports.HOME = HOME;
  })();
});

require.register("sixgram/Chunk.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "sixgram");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Chunk = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Chunk = function Chunk() {
  _classCallCheck(this, Chunk);

  this.depth = 0;
  this.match = null;
  this.type = 'normal';
  this.list = [];
};

exports.Chunk = Chunk;
  })();
});

require.register("sixgram/Parser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "sixgram");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Parser = void 0;

var _Chunk = require("./Chunk");

var _Actions = require("./Actions");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Parser = /*#__PURE__*/function () {
  function Parser(tokens, modes) {
    _classCallCheck(this, Parser);

    this.tokens = tokens || {};
    this.modes = modes || {};
  }

  _createClass(Parser, [{
    key: "parse",
    value: function parse(source) {
      this.index = 0;
      this.mode = 'normal';
      this.stack = [];

      if (!(this.mode in this.modes)) {
        throw new Error("Mode ".concat(this.mode, " does not exist on parser."), this);
      }

      var chunk = new _Chunk.Chunk();
      var mode = this.modes[this.mode];
      chunk.type = this.mode;

      while (this.index < source.length) {
        var matched = false;

        for (var tokenName in mode) {
          var token = this.tokens[tokenName];
          var search = token.exec(source.substr(this.index));

          if (!search || search.index > 0) {
            continue;
          }

          if (!mode[tokenName]) {
            throw new Error("Invalid token type \"".concat(tokenName, "\" found in mode \"").concat(this.mode, "\"."));
            continue;
          }

          var value = search[0];
          var actions = _typeof(mode[tokenName]) === 'object' ? mode[tokenName] : [mode[tokenName]];
          matched = true;
          this.index += value.length;
          var type = 'normal';

          for (var i in actions) {
            var action = actions[i];

            if (typeof action === 'string') {
              if (!(action in this.modes)) {
                throw new Error("Mode \"".concat(action, "\" does not exist."));
              }

              this.mode = action;
              mode = this.modes[this.mode];
              type = action;
              continue;
            }

            switch (action) {
              case _Actions.INSERT:
                chunk.list.push(value);
                break;

              case _Actions.ENTER:
                var newChunk = new _Chunk.Chunk();
                newChunk.depth = chunk.depth + 1;
                newChunk.match = value;
                newChunk.groups = _toConsumableArray(value.match(token)).slice(1);
                newChunk.mode = type;
                newChunk.type = tokenName;
                chunk.list.push(newChunk);
                this.stack.push(chunk);
                chunk = newChunk; // this.mode = chunk.type;

                break;

              case _Actions.LEAVE:
                if (!this.stack.length) {// throw new Warning(`Already at the top of the stack.`)
                } else {
                  chunk = this.stack.pop();
                  this.mode = chunk.type;
                  mode = this.modes[this.mode];
                }

                break;

              case _Actions.HOME:
                this.stack.splice(0);
                mode = this.modes['normal'];
                break;
            }
          }

          break;
        }

        if (!matched) {
          break;
        }
      }

      if (this.stack.length) {
        throw new Error('Did not return to top of stack!');
      }

      return this.stack.shift() || chunk;
    }
  }]);

  return Parser;
}();

exports.Parser = Parser;
  })();
});

require.register("sixgram/Renderer.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "sixgram");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Renderer = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Renderer = /*#__PURE__*/function () {
  function Renderer(ops) {
    _classCallCheck(this, Renderer);

    this.ops = ops || {};
  }

  _createClass(Renderer, [{
    key: "process",
    value: function process(tree) {
      var output = '';

      for (var i in tree.list) {
        var chunk = tree.list[i];

        if (this.ops[tree.type]) {
          var processed = this.ops[tree.type](chunk, tree);

          if (processed !== false) {
            output += processed;
          }
        } else if (chunk !== false) {
          output += chunk;
        }
      }

      return output;
    }
  }]);

  return Renderer;
}();

exports.Renderer = Renderer;
  })();
});

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

var _EchoMessage = require("./view/EchoMessage");

var _Task = require("./Task");

var _Path = require("./Path");

var _Renderer = require("./ansi/Renderer");

var _Parser = require("./ansi/Parser");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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
    _this.template = "<div class = \"terminal [[inverted]]\" cv-on = \"click:focus(event);:keydown(event):c;:keyup(event)c\">\n\t<div class = \"output\" cv-each = \"output:line:l\" cv-ref = \"output:curvature/base/Tag\">\n\t\t<p>[[line]]</p>\n\t</div>\n\t<div class = \"bottom\">\n\t\t<div>[[prompt]]&nbsp;</div>\n\t\t<div>\n\t\t\t<form cv-on = \"submit:cancel(event)\">\n\t\t\t\t<textarea\n\t\t\t\t\tcv-bind = \"input\"\n\t\t\t\t\tcv-ref  = \"input:curvature/base/Tag\"\n\t\t\t\t\trow     = \"1\"\n\t\t\t\t></textarea>\n\t\t\t</form>\n\n\t\t\t<form cv-on = \"submit:cancel(event)\">\n\t\t\t\t<input\n\t\t\t\t\tautocomplete = \"one-time-code\"\n\t\t\t\t\tname    = \"pw-input\"\n\t\t\t\t\ttype    = \"password\"\n\t\t\t\t\tcv-bind = \"input\"\n\t\t\t\t\tcv-ref  = \"password:curvature/base/Tag\"\n\t\t\t\t/>\n\t\t\t</form>\n\n\t\t\t<input\n\t\t\t\tcv-on  = \"input:fileLoaded(event)\"\n\t\t\t\tcv-ref = \"file:curvature/base/Tag\"\n\t\t\t\tname   = \"file-input\"\n\t\t\t\ttype   = \"file\"\n\t\t\t\tstyle  = \"display: none\"\n\t\t\t/>\n\t\t</div>\n\t</div>\n</div>\n\n<div class = \"scanlines\"></div>\n";
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
    _this.max = 10;
    _this.historyCursor = -1;
    _this.history = [];
    _this.env = new Map();

    _this.args.output.___after(function (t, k, o, a) {
      if (k !== 'push') {
        return;
      }

      _this.onNextFrame(function () {
        return _this.scrollToBottom();
      });
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
            var output = new _EchoMessage.EchoMessage({
              message: command
            });

            _this2.args.output.push(output);
          }

          var unescaped = _this2.unescape(command.substr(1));

          task = _this2.interpret(unescaped);
        } else if (_this2.tasks.length) {
          if (!_this2.args.passwordMode) {
            var _output = new _EchoMessage.EchoMessage({
              message: command,
              prompt: _this2.tasks[0].prompt
            });

            _this2.args.output.push(_output);
          }

          var _unescaped = _this2.unescape(command);

          task = _this2.tasks[0].write(_unescaped) || Promise.resolve();
        } else {
          if (!_this2.args.passwordMode) {
            _this2.args.output.push(":: ".concat(command));
          }

          var _unescaped2 = _this2.unescape(command);

          task = _this2.interpret(_unescaped2);
        }

        if (!(task instanceof _Task.Task) && !(task instanceof Promise)) {
          task = Promise.resolve(task);

          _this2.args.output.push(":: ".concat(command));
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
      this.args.bindTo('input', function (v) {// inputBox.style.height = 'auto';
        // inputBox.style.height = inputBox.scrollHeight + 'px';
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
              var line = event.detail;

              if (_typeof(line) === 'object') {
                _this5.args.output.push(line);
              } else {
                var prompt = task.outPrompt || task.prompt || _this5.args.prompt || '::';

                var rendered = _this5.parseAnsi(line, prompt);

                _this5.args.output.push(rendered);
              }
            };

            var error = function error(event) {
              console.error(event);
              var line = event.detail;
              var errorPrompt = task.errorPrompt || '!!';

              var rendered = _this5.parseAnsi(line, errorPrompt);

              _this5.args.output.push(rendered);
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
          {
            this.onNextFrame(function () {
              return _this6.scrollToBottom();
            });
            this.historyCursor--;

            if (this.historyCursor <= -1) {
              this.historyCursor = -1;
              this.args.input = this.originalInput;
              return;
            }

            this.args.input = this.history[this.historyCursor];
            var element = this.tags.input.element;
            element.selectionStart = element.value.length;
            element.selectionEnd = element.value.length;
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
            break;
          }

        case 'ArrowUp':
          {
            this.onNextFrame(function () {
              return _this6.scrollToBottom();
            });

            if (this.historyCursor == -1) {
              this.originalInput = this.args.input;
            }

            this.historyCursor++;

            if (this.historyCursor >= this.history.length) {
              this.historyCursor--;
              return;
            }

            this.args.input = this.history[this.historyCursor];
            var _element = this.tags.input.element;
            _element.selectionStart = _element.value.length;
            _element.selectionEnd = _element.value.length;
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
            break;
          }

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
  }, {
    key: "parseAnsi",
    value: function parseAnsi(line, prompt) {
      line = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var renderer = new _Renderer.Renderer();

      var parsed = _Parser.Parser.parse(line);

      var wrapped = renderer.process(parsed);

      if (!prompt) {
        return _View2.View.from("<span class =\"ansi\">".concat(wrapped, "</span>"));
      }

      var promptEsc = prompt.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      var rendered = _View2.View.from("".concat(promptEsc, " <span class =\"ansi\">").concat(wrapped, "</span>"));

      return rendered;
    }
  }, {
    key: "unescape",
    value: function unescape(string) {
      return string.replace(/\\n/gm, '\n').replace(/\\r/gm, '\r').replace(/\\t/gm, '\t').replace(/\\e/gm, "\x1B").replace(/\\u001b/gm, "\x1B");
    }
  }, {
    key: "write",
    value: function write() {
      for (var _len = arguments.length, lines = new Array(_len), _key = 0; _key < _len; _key++) {
        lines[_key] = arguments[_key];
      }

      for (var _i = 0, _lines = lines; _i < _lines.length; _i++) {
        var line = _lines[_i];

        if (typeof line === 'string') {
          var unescaped = this.unescape(line);
          var parsed = this.parseAnsi(unescaped);
          this.args.output.push(parsed);
          continue;
        }

        this.args.output.push(line);
      }
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

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Task = void 0;

var _Bindable = require("curvature/base/Bindable");

var _Mixin = require("curvature/base/Mixin");

var _Target = require("./mixin/Target");

var _TaskSignals = require("./mixin/TaskSignals");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

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

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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

require.register("subspace-console/ansi/Colors255.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Colors255 = void 0;
var Colors255 = {
  "0": {
    "r": 0,
    "g": 0,
    "b": 0
  },
  "1": {
    "r": 128,
    "g": 0,
    "b": 0
  },
  "2": {
    "r": 0,
    "g": 128,
    "b": 0
  },
  "3": {
    "r": 128,
    "g": 128,
    "b": 0
  },
  "4": {
    "r": 0,
    "g": 0,
    "b": 128
  },
  "5": {
    "r": 128,
    "g": 0,
    "b": 128
  },
  "6": {
    "r": 0,
    "g": 128,
    "b": 128
  },
  "7": {
    "r": 192,
    "g": 192,
    "b": 192
  },
  "8": {
    "r": 128,
    "g": 128,
    "b": 128
  },
  "9": {
    "r": 255,
    "g": 0,
    "b": 0
  },
  "10": {
    "r": 0,
    "g": 255,
    "b": 0
  },
  "11": {
    "r": 255,
    "g": 255,
    "b": 0
  },
  "12": {
    "r": 0,
    "g": 0,
    "b": 255
  },
  "13": {
    "r": 255,
    "g": 0,
    "b": 255
  },
  "14": {
    "r": 0,
    "g": 255,
    "b": 255
  },
  "15": {
    "r": 255,
    "g": 255,
    "b": 255
  },
  "16": {
    "r": 0,
    "g": 0,
    "b": 0
  },
  "17": {
    "r": 0,
    "g": 0,
    "b": 95
  },
  "18": {
    "r": 0,
    "g": 0,
    "b": 135
  },
  "19": {
    "r": 0,
    "g": 0,
    "b": 175
  },
  "20": {
    "r": 0,
    "g": 0,
    "b": 215
  },
  "21": {
    "r": 0,
    "g": 0,
    "b": 255
  },
  "22": {
    "r": 0,
    "g": 95,
    "b": 0
  },
  "23": {
    "r": 0,
    "g": 95,
    "b": 95
  },
  "24": {
    "r": 0,
    "g": 95,
    "b": 135
  },
  "25": {
    "r": 0,
    "g": 95,
    "b": 175
  },
  "26": {
    "r": 0,
    "g": 95,
    "b": 215
  },
  "27": {
    "r": 0,
    "g": 95,
    "b": 255
  },
  "28": {
    "r": 0,
    "g": 135,
    "b": 0
  },
  "29": {
    "r": 0,
    "g": 135,
    "b": 95
  },
  "30": {
    "r": 0,
    "g": 135,
    "b": 135
  },
  "31": {
    "r": 0,
    "g": 135,
    "b": 175
  },
  "32": {
    "r": 0,
    "g": 135,
    "b": 215
  },
  "33": {
    "r": 0,
    "g": 135,
    "b": 255
  },
  "34": {
    "r": 0,
    "g": 175,
    "b": 0
  },
  "35": {
    "r": 0,
    "g": 175,
    "b": 95
  },
  "36": {
    "r": 0,
    "g": 175,
    "b": 135
  },
  "37": {
    "r": 0,
    "g": 175,
    "b": 175
  },
  "38": {
    "r": 0,
    "g": 175,
    "b": 215
  },
  "39": {
    "r": 0,
    "g": 175,
    "b": 255
  },
  "40": {
    "r": 0,
    "g": 215,
    "b": 0
  },
  "41": {
    "r": 0,
    "g": 215,
    "b": 95
  },
  "42": {
    "r": 0,
    "g": 215,
    "b": 135
  },
  "43": {
    "r": 0,
    "g": 215,
    "b": 175
  },
  "44": {
    "r": 0,
    "g": 215,
    "b": 215
  },
  "45": {
    "r": 0,
    "g": 215,
    "b": 255
  },
  "46": {
    "r": 0,
    "g": 255,
    "b": 0
  },
  "47": {
    "r": 0,
    "g": 255,
    "b": 95
  },
  "48": {
    "r": 0,
    "g": 255,
    "b": 135
  },
  "49": {
    "r": 0,
    "g": 255,
    "b": 175
  },
  "50": {
    "r": 0,
    "g": 255,
    "b": 215
  },
  "51": {
    "r": 0,
    "g": 255,
    "b": 255
  },
  "52": {
    "r": 95,
    "g": 0,
    "b": 0
  },
  "53": {
    "r": 95,
    "g": 0,
    "b": 95
  },
  "54": {
    "r": 95,
    "g": 0,
    "b": 135
  },
  "55": {
    "r": 95,
    "g": 0,
    "b": 175
  },
  "56": {
    "r": 95,
    "g": 0,
    "b": 215
  },
  "57": {
    "r": 95,
    "g": 0,
    "b": 255
  },
  "58": {
    "r": 95,
    "g": 95,
    "b": 0
  },
  "59": {
    "r": 95,
    "g": 95,
    "b": 95
  },
  "60": {
    "r": 95,
    "g": 95,
    "b": 135
  },
  "61": {
    "r": 95,
    "g": 95,
    "b": 175
  },
  "62": {
    "r": 95,
    "g": 95,
    "b": 215
  },
  "63": {
    "r": 95,
    "g": 95,
    "b": 255
  },
  "64": {
    "r": 95,
    "g": 135,
    "b": 0
  },
  "65": {
    "r": 95,
    "g": 135,
    "b": 95
  },
  "66": {
    "r": 95,
    "g": 135,
    "b": 135
  },
  "67": {
    "r": 95,
    "g": 135,
    "b": 175
  },
  "68": {
    "r": 95,
    "g": 135,
    "b": 215
  },
  "69": {
    "r": 95,
    "g": 135,
    "b": 255
  },
  "70": {
    "r": 95,
    "g": 175,
    "b": 0
  },
  "71": {
    "r": 95,
    "g": 175,
    "b": 95
  },
  "72": {
    "r": 95,
    "g": 175,
    "b": 135
  },
  "73": {
    "r": 95,
    "g": 175,
    "b": 175
  },
  "74": {
    "r": 95,
    "g": 175,
    "b": 215
  },
  "75": {
    "r": 95,
    "g": 175,
    "b": 255
  },
  "76": {
    "r": 95,
    "g": 215,
    "b": 0
  },
  "77": {
    "r": 95,
    "g": 215,
    "b": 95
  },
  "78": {
    "r": 95,
    "g": 215,
    "b": 135
  },
  "79": {
    "r": 95,
    "g": 215,
    "b": 175
  },
  "80": {
    "r": 95,
    "g": 215,
    "b": 215
  },
  "81": {
    "r": 95,
    "g": 215,
    "b": 255
  },
  "82": {
    "r": 95,
    "g": 255,
    "b": 0
  },
  "83": {
    "r": 95,
    "g": 255,
    "b": 95
  },
  "84": {
    "r": 95,
    "g": 255,
    "b": 135
  },
  "85": {
    "r": 95,
    "g": 255,
    "b": 175
  },
  "86": {
    "r": 95,
    "g": 255,
    "b": 215
  },
  "87": {
    "r": 95,
    "g": 255,
    "b": 255
  },
  "88": {
    "r": 135,
    "g": 0,
    "b": 0
  },
  "89": {
    "r": 135,
    "g": 0,
    "b": 95
  },
  "90": {
    "r": 135,
    "g": 0,
    "b": 135
  },
  "91": {
    "r": 135,
    "g": 0,
    "b": 175
  },
  "92": {
    "r": 135,
    "g": 0,
    "b": 215
  },
  "93": {
    "r": 135,
    "g": 0,
    "b": 255
  },
  "94": {
    "r": 135,
    "g": 95,
    "b": 0
  },
  "95": {
    "r": 135,
    "g": 95,
    "b": 95
  },
  "96": {
    "r": 135,
    "g": 95,
    "b": 135
  },
  "97": {
    "r": 135,
    "g": 95,
    "b": 175
  },
  "98": {
    "r": 135,
    "g": 95,
    "b": 215
  },
  "99": {
    "r": 135,
    "g": 95,
    "b": 255
  },
  "100": {
    "r": 135,
    "g": 135,
    "b": 0
  },
  "101": {
    "r": 135,
    "g": 135,
    "b": 95
  },
  "102": {
    "r": 135,
    "g": 135,
    "b": 135
  },
  "103": {
    "r": 135,
    "g": 135,
    "b": 175
  },
  "104": {
    "r": 135,
    "g": 135,
    "b": 215
  },
  "105": {
    "r": 135,
    "g": 135,
    "b": 255
  },
  "106": {
    "r": 135,
    "g": 175,
    "b": 0
  },
  "107": {
    "r": 135,
    "g": 175,
    "b": 95
  },
  "108": {
    "r": 135,
    "g": 175,
    "b": 135
  },
  "109": {
    "r": 135,
    "g": 175,
    "b": 175
  },
  "110": {
    "r": 135,
    "g": 175,
    "b": 215
  },
  "111": {
    "r": 135,
    "g": 175,
    "b": 255
  },
  "112": {
    "r": 135,
    "g": 215,
    "b": 0
  },
  "113": {
    "r": 135,
    "g": 215,
    "b": 95
  },
  "114": {
    "r": 135,
    "g": 215,
    "b": 135
  },
  "115": {
    "r": 135,
    "g": 215,
    "b": 175
  },
  "116": {
    "r": 135,
    "g": 215,
    "b": 215
  },
  "117": {
    "r": 135,
    "g": 215,
    "b": 255
  },
  "118": {
    "r": 135,
    "g": 255,
    "b": 0
  },
  "119": {
    "r": 135,
    "g": 255,
    "b": 95
  },
  "120": {
    "r": 135,
    "g": 255,
    "b": 135
  },
  "121": {
    "r": 135,
    "g": 255,
    "b": 175
  },
  "122": {
    "r": 135,
    "g": 255,
    "b": 215
  },
  "123": {
    "r": 135,
    "g": 255,
    "b": 255
  },
  "124": {
    "r": 175,
    "g": 0,
    "b": 0
  },
  "125": {
    "r": 175,
    "g": 0,
    "b": 95
  },
  "126": {
    "r": 175,
    "g": 0,
    "b": 135
  },
  "127": {
    "r": 175,
    "g": 0,
    "b": 175
  },
  "128": {
    "r": 175,
    "g": 0,
    "b": 215
  },
  "129": {
    "r": 175,
    "g": 0,
    "b": 255
  },
  "130": {
    "r": 175,
    "g": 95,
    "b": 0
  },
  "131": {
    "r": 175,
    "g": 95,
    "b": 95
  },
  "132": {
    "r": 175,
    "g": 95,
    "b": 135
  },
  "133": {
    "r": 175,
    "g": 95,
    "b": 175
  },
  "134": {
    "r": 175,
    "g": 95,
    "b": 215
  },
  "135": {
    "r": 175,
    "g": 95,
    "b": 255
  },
  "136": {
    "r": 175,
    "g": 135,
    "b": 0
  },
  "137": {
    "r": 175,
    "g": 135,
    "b": 95
  },
  "138": {
    "r": 175,
    "g": 135,
    "b": 135
  },
  "139": {
    "r": 175,
    "g": 135,
    "b": 175
  },
  "140": {
    "r": 175,
    "g": 135,
    "b": 215
  },
  "141": {
    "r": 175,
    "g": 135,
    "b": 255
  },
  "142": {
    "r": 175,
    "g": 175,
    "b": 0
  },
  "143": {
    "r": 175,
    "g": 175,
    "b": 95
  },
  "144": {
    "r": 175,
    "g": 175,
    "b": 135
  },
  "145": {
    "r": 175,
    "g": 175,
    "b": 175
  },
  "146": {
    "r": 175,
    "g": 175,
    "b": 215
  },
  "147": {
    "r": 175,
    "g": 175,
    "b": 255
  },
  "148": {
    "r": 175,
    "g": 215,
    "b": 0
  },
  "149": {
    "r": 175,
    "g": 215,
    "b": 95
  },
  "150": {
    "r": 175,
    "g": 215,
    "b": 135
  },
  "151": {
    "r": 175,
    "g": 215,
    "b": 175
  },
  "152": {
    "r": 175,
    "g": 215,
    "b": 215
  },
  "153": {
    "r": 175,
    "g": 215,
    "b": 255
  },
  "154": {
    "r": 175,
    "g": 255,
    "b": 0
  },
  "155": {
    "r": 175,
    "g": 255,
    "b": 95
  },
  "156": {
    "r": 175,
    "g": 255,
    "b": 135
  },
  "157": {
    "r": 175,
    "g": 255,
    "b": 175
  },
  "158": {
    "r": 175,
    "g": 255,
    "b": 215
  },
  "159": {
    "r": 175,
    "g": 255,
    "b": 255
  },
  "160": {
    "r": 215,
    "g": 0,
    "b": 0
  },
  "161": {
    "r": 215,
    "g": 0,
    "b": 95
  },
  "162": {
    "r": 215,
    "g": 0,
    "b": 135
  },
  "163": {
    "r": 215,
    "g": 0,
    "b": 175
  },
  "164": {
    "r": 215,
    "g": 0,
    "b": 215
  },
  "165": {
    "r": 215,
    "g": 0,
    "b": 255
  },
  "166": {
    "r": 215,
    "g": 95,
    "b": 0
  },
  "167": {
    "r": 215,
    "g": 95,
    "b": 95
  },
  "168": {
    "r": 215,
    "g": 95,
    "b": 135
  },
  "169": {
    "r": 215,
    "g": 95,
    "b": 175
  },
  "170": {
    "r": 215,
    "g": 95,
    "b": 215
  },
  "171": {
    "r": 215,
    "g": 95,
    "b": 255
  },
  "172": {
    "r": 215,
    "g": 135,
    "b": 0
  },
  "173": {
    "r": 215,
    "g": 135,
    "b": 95
  },
  "174": {
    "r": 215,
    "g": 135,
    "b": 135
  },
  "175": {
    "r": 215,
    "g": 135,
    "b": 175
  },
  "176": {
    "r": 215,
    "g": 135,
    "b": 215
  },
  "177": {
    "r": 215,
    "g": 135,
    "b": 255
  },
  "178": {
    "r": 215,
    "g": 175,
    "b": 0
  },
  "179": {
    "r": 215,
    "g": 175,
    "b": 95
  },
  "180": {
    "r": 215,
    "g": 175,
    "b": 135
  },
  "181": {
    "r": 215,
    "g": 175,
    "b": 175
  },
  "182": {
    "r": 215,
    "g": 175,
    "b": 215
  },
  "183": {
    "r": 215,
    "g": 175,
    "b": 255
  },
  "184": {
    "r": 215,
    "g": 215,
    "b": 0
  },
  "185": {
    "r": 215,
    "g": 215,
    "b": 95
  },
  "186": {
    "r": 215,
    "g": 215,
    "b": 135
  },
  "187": {
    "r": 215,
    "g": 215,
    "b": 175
  },
  "188": {
    "r": 215,
    "g": 215,
    "b": 215
  },
  "189": {
    "r": 215,
    "g": 215,
    "b": 255
  },
  "190": {
    "r": 215,
    "g": 255,
    "b": 0
  },
  "191": {
    "r": 215,
    "g": 255,
    "b": 95
  },
  "192": {
    "r": 215,
    "g": 255,
    "b": 135
  },
  "193": {
    "r": 215,
    "g": 255,
    "b": 175
  },
  "194": {
    "r": 215,
    "g": 255,
    "b": 215
  },
  "195": {
    "r": 215,
    "g": 255,
    "b": 255
  },
  "196": {
    "r": 255,
    "g": 0,
    "b": 0
  },
  "197": {
    "r": 255,
    "g": 0,
    "b": 95
  },
  "198": {
    "r": 255,
    "g": 0,
    "b": 135
  },
  "199": {
    "r": 255,
    "g": 0,
    "b": 175
  },
  "200": {
    "r": 255,
    "g": 0,
    "b": 215
  },
  "201": {
    "r": 255,
    "g": 0,
    "b": 255
  },
  "202": {
    "r": 255,
    "g": 95,
    "b": 0
  },
  "203": {
    "r": 255,
    "g": 95,
    "b": 95
  },
  "204": {
    "r": 255,
    "g": 95,
    "b": 135
  },
  "205": {
    "r": 255,
    "g": 95,
    "b": 175
  },
  "206": {
    "r": 255,
    "g": 95,
    "b": 215
  },
  "207": {
    "r": 255,
    "g": 95,
    "b": 255
  },
  "208": {
    "r": 255,
    "g": 135,
    "b": 0
  },
  "209": {
    "r": 255,
    "g": 135,
    "b": 95
  },
  "210": {
    "r": 255,
    "g": 135,
    "b": 135
  },
  "211": {
    "r": 255,
    "g": 135,
    "b": 175
  },
  "212": {
    "r": 255,
    "g": 135,
    "b": 215
  },
  "213": {
    "r": 255,
    "g": 135,
    "b": 255
  },
  "214": {
    "r": 255,
    "g": 175,
    "b": 0
  },
  "215": {
    "r": 255,
    "g": 175,
    "b": 95
  },
  "216": {
    "r": 255,
    "g": 175,
    "b": 135
  },
  "217": {
    "r": 255,
    "g": 175,
    "b": 175
  },
  "218": {
    "r": 255,
    "g": 175,
    "b": 215
  },
  "219": {
    "r": 255,
    "g": 175,
    "b": 255
  },
  "220": {
    "r": 255,
    "g": 215,
    "b": 0
  },
  "221": {
    "r": 255,
    "g": 215,
    "b": 95
  },
  "222": {
    "r": 255,
    "g": 215,
    "b": 135
  },
  "223": {
    "r": 255,
    "g": 215,
    "b": 175
  },
  "224": {
    "r": 255,
    "g": 215,
    "b": 215
  },
  "225": {
    "r": 255,
    "g": 215,
    "b": 255
  },
  "226": {
    "r": 255,
    "g": 255,
    "b": 0
  },
  "227": {
    "r": 255,
    "g": 255,
    "b": 95
  },
  "228": {
    "r": 255,
    "g": 255,
    "b": 135
  },
  "229": {
    "r": 255,
    "g": 255,
    "b": 175
  },
  "230": {
    "r": 255,
    "g": 255,
    "b": 215
  },
  "231": {
    "r": 255,
    "g": 255,
    "b": 255
  },
  "232": {
    "r": 8,
    "g": 8,
    "b": 8
  },
  "233": {
    "r": 18,
    "g": 18,
    "b": 18
  },
  "234": {
    "r": 28,
    "g": 28,
    "b": 28
  },
  "235": {
    "r": 38,
    "g": 38,
    "b": 38
  },
  "236": {
    "r": 48,
    "g": 48,
    "b": 48
  },
  "237": {
    "r": 58,
    "g": 58,
    "b": 58
  },
  "238": {
    "r": 68,
    "g": 68,
    "b": 68
  },
  "239": {
    "r": 78,
    "g": 78,
    "b": 78
  },
  "240": {
    "r": 88,
    "g": 88,
    "b": 88
  },
  "241": {
    "r": 98,
    "g": 98,
    "b": 98
  },
  "242": {
    "r": 108,
    "g": 108,
    "b": 108
  },
  "243": {
    "r": 118,
    "g": 118,
    "b": 118
  },
  "244": {
    "r": 128,
    "g": 128,
    "b": 128
  },
  "245": {
    "r": 138,
    "g": 138,
    "b": 138
  },
  "246": {
    "r": 148,
    "g": 148,
    "b": 148
  },
  "247": {
    "r": 158,
    "g": 158,
    "b": 158
  },
  "248": {
    "r": 168,
    "g": 168,
    "b": 168
  },
  "249": {
    "r": 178,
    "g": 178,
    "b": 178
  },
  "250": {
    "r": 188,
    "g": 188,
    "b": 188
  },
  "251": {
    "r": 198,
    "g": 198,
    "b": 198
  },
  "252": {
    "r": 208,
    "g": 208,
    "b": 208
  },
  "253": {
    "r": 218,
    "g": 218,
    "b": 218
  },
  "254": {
    "r": 228,
    "g": 228,
    "b": 228
  },
  "255": {
    "r": 238,
    "g": 238,
    "b": 238
  }
};
exports.Colors255 = Colors255;
  })();
});

require.register("subspace-console/ansi/Parser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Parser = void 0;

var _Actions = require("sixgram/Actions");

var _Parser = require("sixgram/Parser");

var tokens = {
  reset: /\u001b\[(0);?m/,
  graphics: /\u001b\[(\d+);?(\d+)?;?([\d;]*)?./,
  escaped: /\\([^e])/,
  characters: /[\s\S]+?(?=\x1B|$)/
};
var modes = {
  normal: {
    reset: [_Actions.IGNORE, _Actions.ENTER, _Actions.LEAVE],
    escaped: [_Actions.IGNORE, _Actions.ENTER, _Actions.LEAVE],
    graphics: [_Actions.IGNORE, _Actions.ENTER, _Actions.LEAVE],
    characters: [_Actions.INSERT]
  }
};
var Parser = new _Parser.Parser(tokens, modes);
exports.Parser = Parser;
  })();
});

require.register("subspace-console/ansi/Renderer.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Renderer = void 0;

var _Renderer = require("sixgram/Renderer");

var _pallete = require("./pallete");

var _Colors = require("./Colors255");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var audio = new AudioContext();
var gainNode = audio.createGain();
gainNode.connect(audio.destination);
gainNode.gain.value = 10 * 0.01;

var Renderer = /*#__PURE__*/function (_BaseRenderer) {
  _inherits(Renderer, _BaseRenderer);

  var _super = _createSuper(Renderer);

  function Renderer() {
    var _this;

    _classCallCheck(this, Renderer);

    _this = _super.call(this, {
      normal: function normal(chunk, parent) {
        return _this.setGraphicsMode(chunk, parent);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "style", {});

    return _this;
  }

  _createClass(Renderer, [{
    key: "reset",
    value: function reset() {
      for (var _i = 0, _Object$entries = Object.entries(this.style); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 1),
            k = _Object$entries$_i[0];

        delete this.style[k];
      }
    }
  }, {
    key: "beep",
    value: function beep() {
      var oscillator = audio.createOscillator();
      oscillator.connect(gainNode);
      oscillator.frequency.value = 840;
      oscillator.type = "square";
      oscillator.start(audio.currentTime);
      oscillator.stop(audio.currentTime + 200 * 0.001);
    }
  }, {
    key: "setGraphicsMode",
    value: function setGraphicsMode(chunk, parent) {
      if (typeof chunk === 'string') {
        if (chunk === '') {
          return false;
        }

        var styleString = '';

        for (var _i2 = 0, _Object$entries2 = Object.entries(this.style); _i2 < _Object$entries2.length; _i2++) {
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
              key = _Object$entries2$_i[0],
              val = _Object$entries2$_i[1];

          styleString += "".concat(key, ": ").concat(val, "; ");
        }

        return "<span class = \"ansi\" style = \"".concat(styleString, "\">").concat(chunk, "</span>");
      }

      if (_typeof(chunk) === 'object') {
        if (chunk.type === 'escaped' && chunk.groups[0] === 'a') {
          this.beep();
        }

        if (chunk.type === 'graphics' || chunk.type === 'reset') {
          for (var g = 0; g < chunk.groups.length; g++) {
            var group = Number(chunk.groups[g]);

            if (chunk.groups[g] === '') {
              return false;
            }

            switch (group) {
              case 0:
                for (var _key in this.style) {
                  delete this.style[_key];
                }

                break;

              case 1:
                this.style['filter'] = 'contrast(1.25)'; // this.style['text-shadow'] = '1px 1px 1px rgba(0,0,0,0.25), 0px 0px 1px rgba(0,0,0,0.125)';

                this.style['font-weight'] = 'bold';
                this.style['opacity'] = 1;
                break;

              case 2:
                this.style['filter'] = 'brightness(0.85)';
                this.style['font-weight'] = 'light';
                this.style['opacity'] = 0.75;
                break;

              case 3:
                this.style['font-style'] = 'italic';
                break;

              case 4:
                this.style['text-decoration'] = 'underline';
                break;

              case 5:
                this.style['animation'] = 'var(--ansiBlink)';
                break;

              case 7:
                this.style['filter'] = 'invert(1)';
                break;

              case 8:
                this.style['filter'] = 'contrast(0.5)';
                this.style['opacity'] = 0.1;
                break;

              case 9:
                this.style['text-decoration'] = 'line-through';
                break;

              case 10:
                this.style['font-family'] = 'var(--base-font))';
                break;

              case 11:
              case 12:
              case 13:
              case 14:
              case 15:
              case 16:
              case 17:
              case 18:
              case 19:
                this.style['font-family'] = "var(--alt-font-no-".concat(group, ")");
                break;

              case 20:
                this.style['font-family'] = 'var(--alt-font-fraktur)';
                this.style['font-size'] = '1.1rem';
                break;

              case 21:
                this.style['font-weight'] = 'initial';
                break;

              case 22:
                this.style['font-weight'] = 'initial';
                break;

              case 23:
                this.style['font-weight'] = 'initial';
                this.style['font-style'] = 'initial';
                break;

              case 24:
                this.style['text-decoration'] = 'none';
                this.style['font-family'] = 'sans-serif';
                this.style['font-size'] = '12pt';
                break;

              case 25:
                this.style['animation'] = 'none';
                break;

              case 26:
                this.style['text-transform'] = 'full-width';
                break;

              case 27:
                this.style['filter'] = 'initial';
                break;

              case 28:
                this.style['opacity'] = 'initial';
                break;

              case 29:
                this.style['text-decoration'] = 'initial';
                break;

              case 30:
                this.style['color'] = _pallete.pallete.black;
                break;

              case 31:
                this.style['color'] = _pallete.pallete.red;
                break;

              case 32:
                this.style['color'] = _pallete.pallete.green;
                break;

              case 33:
                this.style['color'] = _pallete.pallete.yellow;
                break;

              case 34:
                this.style['color'] = _pallete.pallete.blue;
                break;

              case 35:
                this.style['color'] = _pallete.pallete.magenta;
                break;

              case 36:
                this.style['color'] = _pallete.pallete.cyan;
                break;

              case 37:
                this.style['color'] = _pallete.pallete.white;
                break;

              case 38:
                if (chunk.groups[1 + g] == 2) {
                  var _chunk$groups$split = chunk.groups[2 + g].split(';'),
                      _chunk$groups$split2 = _slicedToArray(_chunk$groups$split, 3),
                      rd = _chunk$groups$split2[0],
                      gr = _chunk$groups$split2[1],
                      bl = _chunk$groups$split2[2];

                  this.style['color'] = "rgb(".concat(rd, ",").concat(gr, ",").concat(bl, ")");
                }

                if (chunk.groups[1 + g] == 5) {
                  var _Colors255$Number = _Colors.Colors255[Number(chunk.groups[2 + g])],
                      _rd = _Colors255$Number.r,
                      _gr = _Colors255$Number.g,
                      _bl = _Colors255$Number.b;

                  this.style['color'] = "rgb(".concat(_rd, ",").concat(_gr, ",").concat(_bl, ")");
                }

                g += 2;
                break;

              case 39:
                this.style['color'] = 'var(--fgColor)';
                break;

              case 40:
                this.style['background-color'] = _pallete.pallete.black;
                break;

              case 41:
                this.style['background-color'] = _pallete.pallete.red;
                break;

              case 42:
                this.style['background-color'] = _pallete.pallete.green;
                break;

              case 43:
                this.style['background-color'] = _pallete.pallete.yellow;
                break;

              case 44:
                this.style['background-color'] = _pallete.pallete.blue;
                break;

              case 45:
                this.style['background-color'] = _pallete.pallete.magenta;
                break;

              case 46:
                this.style['background-color'] = _pallete.pallete.cyan;
                break;

              case 47:
                this.style['background-color'] = _pallete.pallete.white;
                break;

              case 48:
                if (chunk.groups[1 + g] == 2) {
                  var _chunk$groups$split3 = chunk.groups[2 + g].split(';'),
                      _chunk$groups$split4 = _slicedToArray(_chunk$groups$split3, 3),
                      _rd2 = _chunk$groups$split4[0],
                      _gr2 = _chunk$groups$split4[1],
                      _bl2 = _chunk$groups$split4[2];

                  this.style['background-color'] = "rgb(".concat(_rd2, ",").concat(_gr2, ",").concat(_bl2, ")");
                }

                if (chunk.groups[1 + g] == 5) {
                  var _Colors255$Number2 = _Colors.Colors255[Number(chunk.groups[2 + g])],
                      _rd3 = _Colors255$Number2.r,
                      _gr3 = _Colors255$Number2.g,
                      _bl3 = _Colors255$Number2.b;

                  this.style['background-color'] = "rgb(".concat(_rd3, ",").concat(_gr3, ",").concat(_bl3, ")");
                }

                g += 2;
                break;

              case 49:
                this.style['background-color'] = 'var(--bgColor)';
                break;

              case 50:
                this.style['text-transform'] = 'initial';
                break;

              case 51:
                this.style['border'] = '1px solid currentColor';
                break;

              case 52:
                this.style['border'] = '1px solid currentColor';
                this.style['border-radius'] = '1em';
                break;

              case 53:
                this.style['text-decoration'] = 'overline';
                break;

              case 54:
                this.style['border'] = 'initial';
                break;

              case 55:
                this.style['border'] = 'initial';
                break;
            }
          }
        }

        return false;
      }
    }
  }]);

  return Renderer;
}(_Renderer.Renderer);

exports.Renderer = Renderer;
  })();
});

require.register("subspace-console/ansi/pallete.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pallete = void 0;
var pallete = {
  black: 'var(--ansi-black, #000000)',
  dBlack: 'var(--ansi-black-dark, #343434)',
  bBlack: 'var(--ansi-black-light, #888888)',
  red: 'var(--ansi-red, #c0002c)',
  dRed: 'var(--ansi-red-dark, #4a132b)',
  bRed: 'var(--ansi-red-light, #ff7869)',
  green: 'var(--ansi-green, #80a763)',
  dGreen: 'var(--ansi-green-dark, #326f38)',
  bGreen: 'var(--ansi-green-light, #93d393)',
  yellow: 'var(--ansi-yellow, #e3c651)',
  dYellow: 'var(--ansi-yellow-dark, #baa447)',
  bYellow: 'var(--ansi-yellow-light, #fdc253)',
  blue: 'var(--ansi-blue, #5485c0)',
  dBlue: 'var(--ansi-blue-dark, #38577d)',
  bBlue: 'var(--ansi-blue-light, #77aff2)',
  magenta: 'var(--ansi-magenta, #C61B6E)',
  dMagenta: 'var(--ansi-magenta-dark, #935894)',
  bMagenta: 'var(--ansi-magenta-light, #bf83c0)',
  cyan: 'var(--ansi-cyan, #57c2c0)',
  dCyan: 'var(--ansi-cyan-dark, #2d5695)',
  bCyan: 'var(--ansi-cyan-light, #cef6f5)',
  white: 'var(--ansi-cyan, #e0e0e0)',
  dWhite: 'var(--ansi-cyan-dark, #b0b0b0)',
  bWhite: 'var(--ansi-cyan-light, #ffffff)'
};
exports.pallete = pallete;
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

require.register("subspace-console/view/EchoMessage.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EchoMessage = void 0;

var _View2 = require("curvature/base/View");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var EchoMessage = /*#__PURE__*/function (_View) {
  _inherits(EchoMessage, _View);

  var _super = _createSuper(EchoMessage);

  function EchoMessage() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, EchoMessage);

    _this = _super.call(this, args);
    _this.args.prompt = _this.args.prompt || '<<';
    _this.template = "<span>[[prompt]]&nbsp;</span><span class = \"text\">[[message]]</span>";
    return _this;
  }

  return EchoMessage;
}(_View2.View);

exports.EchoMessage = EchoMessage;
  })();
});

require.register("subspace-console/view/MeltingText.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "subspace-console");
  (function() {
    "use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeltingText = void 0;

var _View = require("curvature/base/View");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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