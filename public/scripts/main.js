"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function () {
  window.setupGameScene = function () {
    var Util = /*#__PURE__*/function () {
      function Util() {
        _classCallCheck(this, Util);
      }

      _createClass(Util, null, [{
        key: "setCellSize",
        value: function setCellSize(size) {
          Util._cellSize = size;
        }
      }, {
        key: "getCanvasPreferredSize",
        value: function getCanvasPreferredSize(size) {
          var wd, wh;

          if (size && size.width && size.height) {
            wd = size.width;
            wh = size.height;
          } else {
            wd = window.innerWidth;
            wh = window.innerHeight;
          }

          if (!Util.isDivisibleByCellSize(wd)) {
            wd = Util.getNearestDivisibleByCellSize(wd);
          }

          if (!Util.isDivisibleByCellSize(wh)) {
            wh = Util.getNearestDivisibleByCellSize(wh);
          }

          return {
            width: wd,
            height: wh
          };
        }
      }, {
        key: "isDivisibleByCellSize",
        value: function isDivisibleByCellSize(x) {
          return x % Util._cellSize === 0;
        }
      }, {
        key: "getNearestDivisibleByCellSize",
        value: function getNearestDivisibleByCellSize(x) {
          return x - x % Util._cellSize;
        }
      }, {
        key: "getBasePolygonPoints",
        value: function getBasePolygonPoints() {
          var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          return [{
            x: x * Util._cellSize,
            y: y * Util._cellSize
          }, {
            x: (x + 1) * Util._cellSize,
            y: y * Util._cellSize
          }, {
            x: (x + 1) * Util._cellSize,
            y: (y + 1) * Util._cellSize
          }, {
            x: x * Util._cellSize,
            y: (y + 1) * Util._cellSize
          }];
        }
      }, {
        key: "generateGridPoints",
        value: function generateGridPoints(numCellsX, numCellsY) {
          var siblings = {};
          var positions = [];

          var getPos = function getPos(n) {
            return Util._cellSize * n;
          };

          var mod = function mod(a, b) {
            return (a % b + b) % b;
          };

          for (var x = 0; x < numCellsX; x++) {
            for (var y = 0; y < numCellsY; y++) {
              var pos = [getPos(x), getPos(y)];
              var xl = mod(x - 1, numCellsX);
              var xr = mod(x + 1, numCellsX);
              var yt = mod(y - 1, numCellsY);
              var yb = mod(y + 1, numCellsY);
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
        }
      }]);

      return Util;
    }();

    return function (settings) {
      var _ref = settings || {},
          _ref$theme = _ref.theme,
          theme = _ref$theme === void 0 ? {} : _ref$theme,
          _ref$options = _ref.options,
          options = _ref$options === void 0 ? {} : _ref$options;

      var _options$cellSize = options.cellSize,
          CELL_SIZE = _options$cellSize === void 0 ? 20 : _options$cellSize,
          _options$canvasSize = options.canvasSize,
          canvasSize = _options$canvasSize === void 0 ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : _options$canvasSize,
          _options$speed = options.speed,
          SPEED = _options$speed === void 0 ? 200 : _options$speed,
          controls = options.controls;
      var MAX_SPEED = 400;
      var MIN_SPEED = 0;
      var SPEED_STEP = 100;

      if (!controls) {
        throw new Error("Missing game controls!");
      }

      var _theme$cellAliveColor = theme.cellAliveColor,
          ALIVE_COLOR = _theme$cellAliveColor === void 0 ? 0xffffff : _theme$cellAliveColor,
          _theme$cellAliveColor2 = theme.cellAliveColorAlpha,
          ALIVE_COLOR_ALPHA = _theme$cellAliveColor2 === void 0 ? 1 : _theme$cellAliveColor2,
          _theme$cellAliveStrok = theme.cellAliveStrokeColor,
          ALIVE_STROKE_COLOR = _theme$cellAliveStrok === void 0 ? 0x12005e : _theme$cellAliveStrok,
          _theme$cellAliveStrok2 = theme.cellAliveStrokeColorAlpha,
          ALIVE_STROKE_COLOR_ALPHA = _theme$cellAliveStrok2 === void 0 ? 0.5 : _theme$cellAliveStrok2,
          _theme$cellDeadColor = theme.cellDeadColor,
          DEAD_COLOR = _theme$cellDeadColor === void 0 ? 0x4a148c : _theme$cellDeadColor,
          _theme$cellDeadColorA = theme.cellDeadColorAlpha,
          DEAD_COLOR_ALPHA = _theme$cellDeadColorA === void 0 ? 1 : _theme$cellDeadColorA,
          _theme$cellDeadStroke = theme.cellDeadStrokeColor,
          DEAD_STROKE_COLOR = _theme$cellDeadStroke === void 0 ? 0x12005e : _theme$cellDeadStroke,
          _theme$cellDeadStroke2 = theme.cellDeadStrokeColorAlpha,
          DEAD_STROKE_COLOR_ALPHA = _theme$cellDeadStroke2 === void 0 ? 0.5 : _theme$cellDeadStroke2,
          _theme$cellStrokeWidt = theme.cellStrokeWidth,
          STROKE_WIDTH = _theme$cellStrokeWidt === void 0 ? 2 : _theme$cellStrokeWidt;
      Util.setCellSize(CELL_SIZE);
      var CANVAS_SIZE = Util.getCanvasPreferredSize(canvasSize);
      var NUM_CELLS_X = Math.floor(CANVAS_SIZE.width / CELL_SIZE);
      var NUM_CELLS_Y = Math.floor(CANVAS_SIZE.height / CELL_SIZE);
      var MainGameScene = Phaser.Class({
        initialize: function initialize() {
          Phaser.Scene.call(this, {
            key: "game-of-life"
          });
          this.paused = true;
          this.drawingMode = false;
          this.erasingMode = false;
          this._boardHasCellsAlive;
          this._iterationTimeElapsed = 0;
          this._firstRun = true;
          this._currentPatternIndex = null; // disable right-click default behavior

          window.addEventListener("contextmenu", function (e) {
            return e.preventDefault();
          }, false);
        },
        generateGrid: function generateGrid() {
          var _this = this;

          var points = Util.getBasePolygonPoints();
          this.grid = Util.generateGridPoints(NUM_CELLS_X, NUM_CELLS_Y);
          this.cells = this.grid.positions.map(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                x = _ref3[0],
                y = _ref3[1];

            return _this.drawCell(x, y, points);
          });
        },
        drawCell: function drawCell(x, y, points) {
          var cell = this.add.polygon(x, y, points);
          cell.setFillStyle(DEAD_COLOR, DEAD_COLOR_ALPHA);
          cell.setStrokeStyle(STROKE_WIDTH, DEAD_STROKE_COLOR, DEAD_STROKE_COLOR_ALPHA);
          cell.setOrigin(0, 0);
          cell.setInteractive();
          cell.__alive = false;
          cell.__id = [x, y].toString();
          return cell;
        },
        setupGridInteraction: function setupGridInteraction() {
          var _this2 = this;

          var handlePointerCollision = function handlePointerCollision(cell, pointer) {
            if (_this2.paused) {
              var canEnableCell = (pointer.leftButtonDown() || _this2.drawingMode) && !cell.__alive;

              var canKillCell = (pointer.rightButtonDown() || _this2.erasingMode) && cell.__alive;

              if (canEnableCell) {
                _this2.enable(cell);
              } else if (canKillCell) {
                _this2.kill(cell);
              }
            }
          };

          this.cells.forEach(function (cell) {
            _this2.grid.siblings[cell.__id].cell = cell;
            cell.on("pointermove", function (pointer) {
              handlePointerCollision(cell, pointer);
            });
            cell.on("pointerdown", function (pointer) {
              if (pointer.downElement.nodeName != "CANVAS") return;
              handlePointerCollision(cell, pointer);
            });
          });
        },
        setupControls: function setupControls() {
          var _this3 = this;

          this.input.on("pointerdown", function (pointer) {
            if (_this3.paused) {
              _this3.drawingMode = pointer.leftButtonDown();
              _this3.erasingMode = pointer.rightButtonDown();
            }
          });
          this.input.on("pointerup", function () {
            if (_this3.paused) {
              _this3.drawingMode = false;
              _this3.erasingMode = false;
            }
          });
          var spacebar = this.input.keyboard.addKey("SPACE");
          var keyDel = this.input.keyboard.addKey("DELETE");
          var keyUp = this.input.keyboard.addKey("UP");
          var keyDown = this.input.keyboard.addKey("DOWN");
          var keyRight = this.input.keyboard.addKey("RIGHT");
          var keyLeft = this.input.keyboard.addKey("LEFT");
          spacebar.on("down", function () {
            if (_this3.paused) _this3.play();else _this3.pause();
          });
          keyDel.on("down", function () {
            return _this3.clear();
          });
          keyUp.on("down", function () {
            return _this3._changeSpeed(1);
          });
          keyRight.on("down", function () {
            return _this3._changeSpeed(1);
          });
          keyDown.on("down", function () {
            return _this3._changeSpeed(-1);
          });
          keyLeft.on("down", function () {
            return _this3._changeSpeed(-1);
          });
          controls.on(controls.actions.PLAY, this.play.bind(this));
          controls.on(controls.actions.PAUSE, this.pause.bind(this));
          controls.on(controls.actions.STOP, this.stop.bind(this));
          controls.on(controls.actions.UNDO, this.loadPreviousPattern.bind(this));
          controls.on(controls.actions.REDO, this.loadNextPattern.bind(this));
          controls.on(controls.actions.SAVE, this.save.bind(this));
          controls.on(controls.actions.SPEED_UP, this._changeSpeed.bind(this, 1));
          controls.on(controls.actions.SPEED_DOWN, this._changeSpeed.bind(this, -1));
        },
        getGamePattern: function getGamePattern() {
          return this.cells.map(function (cell) {
            return +cell.__alive;
          });
        },
        saveToLocalStorage: function saveToLocalStorage() {
          try {
            var state = [];

            if (localStorage.length) {
              state = JSON.parse(localStorage.getItem("state"));
            }

            var pattern = this.getGamePattern();
            var serialized = JSON.stringify(pattern);
            var exists = state.some(function (p) {
              return JSON.stringify(p) === serialized;
            });
            if (exists) return;
            state.push(pattern);
            this._currentPatternIndex = state.length - 1;
            localStorage.setItem("state", JSON.stringify(state));
          } catch (e) {
            console.error("Error trying to save state to local storage", e);
          }
        },
        _getStateFromLocalStorage: function _getStateFromLocalStorage() {
          try {
            if (localStorage.length) {
              return JSON.parse(localStorage.getItem("state"));
            } else {
              return [];
            }
          } catch (e) {
            console.error("Error trying to load state from local storage", e);
            return [];
          }
        },
        _loadPatternFromLocalHistory: function _loadPatternFromLocalHistory(index) {
          var state = this._getStateFromLocalStorage();

          if (state[index]) {
            this.drawPattern(state[index]);
            this._currentPatternIndex = index;

            this._checkLocalHistoryAndControls();
          }
        },
        loadNextPattern: function loadNextPattern() {
          var next = this._currentPatternIndex != null ? this._currentPatternIndex + 1 : -1;

          this._loadPatternFromLocalHistory(next);
        },
        loadPreviousPattern: function loadPreviousPattern() {
          var prev = this._currentPatternIndex != null ? this._currentPatternIndex - 1 : -1;

          this._loadPatternFromLocalHistory(prev);
        },
        _checkLocalHistoryAndControls: function _checkLocalHistoryAndControls(options) {
          if (this.paused) {
            var _ref4 = options || {},
                _ref4$drawInitialInde = _ref4.drawInitialIndex,
                drawInitialIndex = _ref4$drawInitialInde === void 0 ? true : _ref4$drawInitialInde;

            var state = this._getStateFromLocalStorage();

            if (this._currentPatternIndex === null) {
              this._currentPatternIndex = state.length - 1;

              if (drawInitialIndex) {
                this._loadPatternFromLocalHistory(this._currentPatternIndex);
              }
            }

            if (!state.length) {
              controls.disable(controls.actions.UNDO);
              controls.disable(controls.actions.REDO);
            } else {
              var next = state[this._currentPatternIndex + 1];
              var prev = state[!this._boardHasCellsAlive ? this._currentPatternIndex : this._currentPatternIndex - 1];
              if (next) controls.enable(controls.actions.REDO);else controls.disable(controls.actions.REDO);
              if (prev) controls.enable(controls.actions.UNDO);else controls.disable(controls.actions.UNDO);
            }
          } else {
            controls.disable(controls.actions.UNDO);
            controls.disable(controls.actions.REDO);
          }
        },
        _resetHistoryState: function _resetHistoryState() {
          this._currentPatternIndex = null;

          this._checkLocalHistoryAndControls({
            drawInitialIndex: false
          });

          this._currentPatternIndex = this._currentPatternIndex + 1;
        },
        drawPattern: function drawPattern(pattern) {
          var _this4 = this;

          if (!this.cells || !pattern) return;

          var draw = function draw(sequence) {
            _this4.cells.forEach(function (cell, i) {
              cell.__alive = !!sequence[i];
              if (cell.__alive) _this4.enable(cell);else _this4.kill(cell);
            });
          };

          if (this.cells.length >= pattern.length) {
            draw(pattern);
          } else {
            draw(pattern.slice(0, this.cells.length));
          }

          this._checkCellsState();
        },
        save: function save() {
          if (this.paused && this._boardHasCellsAlive) {
            var state = this.getGamePattern();
          }
        },
        _changeSpeed: function _changeSpeed(val) {
          if (!this.paused) {
            if (val < 0 && SPEED < MAX_SPEED) {
              SPEED += SPEED_STEP;
            } else if (val > 0 && SPEED > MIN_SPEED) {
              SPEED -= SPEED_STEP;
            }

            this._checkSpeedControls();
          }
        },
        _checkSpeedControls: function _checkSpeedControls() {
          var max = MAX_SPEED / SPEED_STEP;
          controls.setSpeed(max - SPEED / SPEED_STEP + 1);

          if (SPEED > MIN_SPEED) {
            controls.enable(controls.actions.SPEED_UP);
          } else {
            controls.disable(controls.actions.SPEED_UP);
          }

          if (SPEED < MAX_SPEED) {
            controls.enable(controls.actions.SPEED_DOWN);
          } else {
            controls.disable(controls.actions.SPEED_DOWN);
          }
        },
        play: function play() {
          if (this._boardHasCellsAlive) {
            if (this._firstRun) {
              this.saveToLocalStorage();
              this._firstRun = false;
            }

            controls.disable(controls.actions.PLAY);
            controls.enable(controls.actions.PAUSE);
            controls.enable(controls.actions.STOP);
            controls.disable(controls.actions.SAVE);
            controls.setDrawingMode(false);

            this._checkSpeedControls();

            this.paused = false;

            this._checkLocalHistoryAndControls();
          }
        },
        pause: function pause() {
          controls.enable(controls.actions.PLAY);
          controls.disable(controls.actions.PAUSE);
          controls.enable(controls.actions.STOP);
          controls.disable(controls.actions.SPEED_UP);
          controls.disable(controls.actions.SPEED_DOWN);
          controls.enable(controls.actions.SAVE);
          controls.setDrawingMode(true);
          this.paused = true;

          this._checkLocalHistoryAndControls();
        },
        stop: function stop() {
          this.pause();
          this.clear();
        },
        enable: function enable(cell) {
          cell.__alive = true;
          cell.setFillStyle(ALIVE_COLOR, ALIVE_COLOR_ALPHA);
          cell.setStrokeStyle(STROKE_WIDTH, ALIVE_STROKE_COLOR, ALIVE_STROKE_COLOR_ALPHA);
        },
        kill: function kill(cell) {
          cell.__alive = false;
          cell.setFillStyle(DEAD_COLOR, DEAD_COLOR_ALPHA);
          cell.setStrokeStyle(STROKE_WIDTH, DEAD_STROKE_COLOR, DEAD_STROKE_COLOR_ALPHA);
        },
        clear: function clear() {
          var _this5 = this;

          if (this.paused) {
            this._firstRun = true;
            this.cells.forEach(function (cell) {
              return _this5.kill(cell);
            });

            this._checkCellsState();

            this._resetHistoryState();
          }
        },
        isAlive: function isAlive(id) {
          return this.grid.siblings[id].cell.__alive ? 1 : 0;
        },
        getNeighborsAlive: function getNeighborsAlive(cell) {
          var _this6 = this;

          var siblings = this.grid.siblings[cell.__id];
          var count = [siblings.left, siblings.topLeft, siblings.bottomLeft, siblings.right, siblings.topRight, siblings.bottomRight, siblings.top, siblings.bottom].reduce(function (count, id) {
            return count + _this6.isAlive(id);
          }, 0);
          return count;
        },
        onCellsStateChanged: function onCellsStateChanged() {
          var _this7 = this;

          if (this._boardHasCellsAlive && this.paused) {
            controls.enable(controls.actions.PLAY);
            controls.enable(controls.actions.SAVE);
            controls.enable(controls.actions.STOP);
          } else if (!this._boardHasCellsAlive && this.paused) {
            controls.disable(controls.actions.PLAY);
            controls.disable(controls.actions.SAVE);
            controls.disable(controls.actions.STOP);
          } else if (!this._boardHasCellsAlive && !this.paused) {
            setTimeout(function () {
              return _this7.pause();
            }, 500);
          }
        },
        _checkCellsState: function _checkCellsState() {
          var hasCellsAlive = this.cells.some(function (cell) {
            return cell.__alive;
          });

          if (this._boardHasCellsAlive != hasCellsAlive) {
            this._boardHasCellsAlive = hasCellsAlive;
            this.onCellsStateChanged();
          }
        },
        _runGame: function _runGame() {
          var _this8 = this;

          if (!this.paused) {
            this.cells.forEach(function (cell) {
              var nAliveCount = _this8.getNeighborsAlive(cell); // Rule #1: a dead cell with 3 neighbors alive; "survives"


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
              if (cell.__nextGen) _this8.enable(cell);else _this8.kill(cell);
            });
          }

          this._checkCellsState();
        },
        create: function create() {
          this.generateGrid();
          this.setupGridInteraction();
          this.setupControls();
          this.pause();

          this._checkCellsState();
        },
        update: function update(time) {
          if (!this._iterationTimeElapsed) {
            this._iterationTimeElapsed = time;
          } else if (time - this._iterationTimeElapsed > SPEED) {
            this._iterationTimeElapsed = time;

            this._runGame();
          }
        }
      });
      return {
        type: Phaser.AUTO,
        width: CANVAS_SIZE.width,
        height: CANVAS_SIZE.height,
        scene: [MainGameScene]
      };
    };
  }();
})();