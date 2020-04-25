"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function () {
  var CELL_SIZE = 20;
  var ALIVE_COLOR = 0xf50057;
  var ALIVE_STROKE_COLOR = 0xab003c;
  var DEAD_COLOR = 0x263238;
  var DEAD_STROKE_COLOR = 0x607d8b;

  var isDivisibleByCellSize = function isDivisibleByCellSize(x) {
    return x % CELL_SIZE === 0;
  };

  var getNearestDivisibleByCellSize = function getNearestDivisibleByCellSize(x) {
    return x - x % CELL_SIZE;
  };

  var getCanvasSize = function getCanvasSize() {
    var wd = window.innerWidth;
    var wh = window.innerHeight;

    if (!isDivisibleByCellSize(wd)) {
      wd = getNearestDivisibleByCellSize(wd);
    }

    if (!isDivisibleByCellSize(wh)) {
      wh = getNearestDivisibleByCellSize(wh);
    }

    return {
      width: wd,
      height: wh
    };
  };

  var canvasSize = getCanvasSize();
  var gameOfLife = new Phaser.Class({
    initialize: function initialize() {
      Phaser.Scene.call(this, {
        key: "game-of-life"
      });
      this.numCellsX = Math.floor(canvasSize.width / CELL_SIZE);
      this.numCellsY = Math.floor(canvasSize.height / CELL_SIZE);
      this.paused = true;
      this.drawingMode = false;
      this.erasingMode = false; // disable right-click default behavior

      window.addEventListener("contextmenu", function (e) {
        return e.preventDefault();
      }, false);
    },
    getBasePolygonPoints: function getBasePolygonPoints() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return [{
        x: x * CELL_SIZE,
        y: y * CELL_SIZE
      }, {
        x: (x + 1) * CELL_SIZE,
        y: y * CELL_SIZE
      }, {
        x: (x + 1) * CELL_SIZE,
        y: (y + 1) * CELL_SIZE
      }, {
        x: x * CELL_SIZE,
        y: (y + 1) * CELL_SIZE
      }];
    },
    generateGridPoints: function generateGridPoints() {
      var siblings = {};
      var positions = [];

      var getPos = function getPos(n) {
        return CELL_SIZE * n;
      };

      var mod = function mod(a, b) {
        return (a % b + b) % b;
      };

      for (var x = 0; x < this.numCellsX; x++) {
        for (var y = 0; y < this.numCellsY; y++) {
          var pos = [getPos(x), getPos(y)];
          var xl = mod(x - 1, this.numCellsX);
          var xr = mod(x + 1, this.numCellsX);
          var yt = mod(y - 1, this.numCellsY);
          var yb = mod(y + 1, this.numCellsY);
          var map = {
            left: [getPos(xl), getPos(y)].toString(),
            topLeft: [getPos(xl), getPos(yt)].toString(),
            bottomLeft: [getPos(xl), getPos(yb)].toString(),
            right: [getPos(xr), getPos(y)].toString(),
            topRight: [getPos(xr), getPos(yt)].toString(),
            bottomRight: [getPos(xr), getPos(yb)].toString(),
            top: [getPos(x), getPos(yt)].toString(),
            bottom: [getPos(x), getPos(yb)].toString()
          };
          siblings[pos.toString()] = map;
          positions.push(pos);
        }
      }

      return {
        siblings: siblings,
        positions: positions
      };
    },
    drawCell: function drawCell(x, y, points) {
      var cell = this.add.polygon(x, y, points);
      cell.setFillStyle(DEAD_COLOR, 1);
      cell.setStrokeStyle(2, DEAD_STROKE_COLOR, 1);
      cell.setOrigin(0, 0);
      cell.setInteractive();
      cell.__alive = false;
      cell.__id = [x, y].toString();
      return cell;
    },
    enable: function enable(cell) {
      cell.__alive = true;
      cell.setFillStyle(ALIVE_COLOR, 1);
      cell.setStrokeStyle(2, ALIVE_STROKE_COLOR, 1);
    },
    kill: function kill(cell) {
      cell.__alive = false;
      cell.setFillStyle(DEAD_COLOR, 1);
      cell.setStrokeStyle(2, DEAD_STROKE_COLOR, 1);
    },
    create: function create() {
      var _this = this;

      var points = this.getBasePolygonPoints();
      this.grid = this.generateGridPoints();
      this.cells = this.grid.positions.map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            x = _ref2[0],
            y = _ref2[1];

        return _this.drawCell(x, y, points);
      });
      this.cells.forEach(function (cell) {
        _this.grid.siblings[cell.__id].cell = cell;

        var handleCollision = function handleCollision(pointer) {
          if (_this.paused) {
            var canEnableCell = (pointer.leftButtonDown() || _this.drawingMode) && !cell.__alive;

            var canKillCell = (pointer.rightButtonDown() || _this.erasingMode) && cell.__alive;

            if (canEnableCell) {
              _this.enable(cell);
            } else if (canKillCell) {
              _this.kill(cell);
            }
          }
        };

        cell.on("pointermove", handleCollision);
        cell.on("pointerdown", handleCollision);
      });
      this.input.on("pointerdown", function (pointer) {
        if (_this.paused) {
          _this.drawingMode = pointer.leftButtonDown();
          _this.erasingMode = pointer.rightButtonDown();
        }
      });
      this.input.on("pointerup", function () {
        if (_this.paused) {
          _this.drawingMode = false;
          _this.erasingMode = false;
        }
      });
      var spacebar = this.input.keyboard.addKey("SPACE");
      var keyR = this.input.keyboard.addKey("R");
      spacebar.on("down", function () {
        return _this.paused = !_this.paused;
      });
      keyR.on("down", function () {
        if (_this.paused) {
          _this.reset();
        }
      });
      this.time.addEvent({
        delay: 200,
        callback: this.updateGame,
        callbackScope: this,
        loop: true
      });
    },
    isAlive: function isAlive(id) {
      return this.grid.siblings[id].cell.__alive ? 1 : 0;
    },
    getNeighborsAlive: function getNeighborsAlive(cell) {
      var _this2 = this;

      var siblings = this.grid.siblings[cell.__id];
      var count = [siblings.left, siblings.topLeft, siblings.bottomLeft, siblings.right, siblings.topRight, siblings.bottomRight, siblings.top, siblings.bottom].reduce(function (count, id) {
        return count + _this2.isAlive(id);
      }, 0);
      return count;
    },
    updateGame: function updateGame() {
      var _this3 = this;

      if (!this.paused) {
        this.cells.forEach(function (cell) {
          var nAliveCount = _this3.getNeighborsAlive(cell); // Rule #1: a dead cell with 3 neighbors alive; "survives"


          if (!cell.__alive && nAliveCount === 3) {
            cell.__nextGen = true;
          } // Rule #2: a live cell with less than 2 or more than 3 neighbors alive; "dies"
          else if (cell.__alive && (nAliveCount < 2 || nAliveCount > 3)) {
              cell.__nextGen = false;
            } else {
              cell.__nextGen = cell.__alive;
            }
        });
        this.cells.forEach(function (cell) {
          if (cell.__nextGen) _this3.enable(cell);else _this3.kill(cell);
        });
      }
    },
    reset: function reset() {
      for (var index = 0; index < this.cells.length; index++) {
        var cell = this.cells[index];
        this.kill(cell);
      }
    }
  });
  var config = {
    type: Phaser.AUTO,
    width: canvasSize.width,
    height: canvasSize.height,
    scene: [gameOfLife]
  };
  var game = new Phaser.Game(config);
})();