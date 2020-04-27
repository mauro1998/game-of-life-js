(() => {
  window.setupGameScene = (() => {
    class Util {
      static setCellSize(size) {
        Util._cellSize = size;
      }

      static getCanvasPreferredSize(size) {
        let wd, wh;

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
          height: wh,
        };
      }

      static isDivisibleByCellSize(x) {
        return x % Util._cellSize === 0;
      }

      static getNearestDivisibleByCellSize(x) {
        return x - (x % Util._cellSize);
      }

      static getBasePolygonPoints(x = 0, y = 0) {
        return [
          { x: x * Util._cellSize, y: y * Util._cellSize },
          { x: (x + 1) * Util._cellSize, y: y * Util._cellSize },
          { x: (x + 1) * Util._cellSize, y: (y + 1) * Util._cellSize },
          { x: x * Util._cellSize, y: (y + 1) * Util._cellSize },
        ];
      }

      static generateGridPoints(numCellsX, numCellsY) {
        const siblings = {};
        const positions = [];
        const getPos = (n) => Util._cellSize * n;
        const mod = (a, b) => ((a % b) + b) % b;

        for (let x = 0; x < numCellsX; x++) {
          for (let y = 0; y < numCellsY; y++) {
            const pos = [getPos(x), getPos(y)];
            const xl = mod(x - 1, numCellsX);
            const xr = mod(x + 1, numCellsX);
            const yt = mod(y - 1, numCellsY);
            const yb = mod(y + 1, numCellsY);
            const map = {
              left: [getPos(xl), getPos(y)].toString(),
              topLeft: [getPos(xl), getPos(yt)].toString(),
              bottomLeft: [getPos(xl), getPos(yb)].toString(),
              right: [getPos(xr), getPos(y)].toString(),
              topRight: [getPos(xr), getPos(yt)].toString(),
              bottomRight: [getPos(xr), getPos(yb)].toString(),
              top: [getPos(x), getPos(yt)].toString(),
              bottom: [getPos(x), getPos(yb)].toString(),
            };

            siblings[pos.toString()] = map;
            positions.push(pos);
          }
        }

        return { siblings, positions };
      }
    }

    return (settings) => {
      const { theme = {}, options = {} } = settings || {};
      let {
        cellSize: CELL_SIZE = 20,
        canvasSize = {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        speed: SPEED = 200,
        controls,
      } = options;

      const MAX_SPEED = 400;
      const MIN_SPEED = 0;
      const SPEED_STEP = 100;

      if (!controls) {
        throw new Error("Missing game controls!");
      }

      const {
        cellAliveColor: ALIVE_COLOR = 0xffffff,
        cellAliveColorAlpha: ALIVE_COLOR_ALPHA = 1,
        cellAliveStrokeColor: ALIVE_STROKE_COLOR = 0x12005e,
        cellAliveStrokeColorAlpha: ALIVE_STROKE_COLOR_ALPHA = 0.5,
        cellDeadColor: DEAD_COLOR = 0x4a148c,
        cellDeadColorAlpha: DEAD_COLOR_ALPHA = 1,
        cellDeadStrokeColor: DEAD_STROKE_COLOR = 0x12005e,
        cellDeadStrokeColorAlpha: DEAD_STROKE_COLOR_ALPHA = 0.5,
        cellStrokeWidth: STROKE_WIDTH = 2,
      } = theme;

      Util.setCellSize(CELL_SIZE);

      const CANVAS_SIZE = Util.getCanvasPreferredSize(canvasSize);
      const NUM_CELLS_X = Math.floor(CANVAS_SIZE.width / CELL_SIZE);
      const NUM_CELLS_Y = Math.floor(CANVAS_SIZE.height / CELL_SIZE);

      const MainGameScene = Phaser.Class({
        initialize() {
          Phaser.Scene.call(this, { key: "game-of-life" });

          this.paused = true;
          this.drawingMode = false;
          this.erasingMode = false;

          this._boardHasCellsAlive;
          this._iterationTimeElapsed = 0;
          this._firstRun = true;
          this._currentPatternIndex = null;

          // disable right-click default behavior
          window.addEventListener(
            "contextmenu",
            (e) => e.preventDefault(),
            false
          );
        },

        generateGrid() {
          const points = Util.getBasePolygonPoints();
          this.grid = Util.generateGridPoints(NUM_CELLS_X, NUM_CELLS_Y);
          this.cells = this.grid.positions.map(([x, y]) => {
            return this.drawCell(x, y, points);
          });
        },

        drawCell(x, y, points) {
          const cell = this.add.polygon(x, y, points);
          cell.setFillStyle(DEAD_COLOR, DEAD_COLOR_ALPHA);
          cell.setStrokeStyle(
            STROKE_WIDTH,
            DEAD_STROKE_COLOR,
            DEAD_STROKE_COLOR_ALPHA
          );
          cell.setOrigin(0, 0);
          cell.setInteractive();
          cell.__alive = false;
          cell.__id = [x, y].toString();
          return cell;
        },

        setupGridInteraction() {
          const handlePointerCollision = (cell, pointer) => {
            if (this.paused) {
              const canEnableCell =
                (pointer.leftButtonDown() || this.drawingMode) && !cell.__alive;
              const canKillCell =
                (pointer.rightButtonDown() || this.erasingMode) && cell.__alive;

              if (canEnableCell) {
                this.enable(cell);
              } else if (canKillCell) {
                this.kill(cell);
              }
            }
          };

          this.cells.forEach((cell) => {
            this.grid.siblings[cell.__id].cell = cell;

            cell.on("pointermove", (pointer) => {
              handlePointerCollision(cell, pointer);
            });

            cell.on("pointerdown", (pointer) => {
              if (pointer.downElement.nodeName != "CANVAS") return;
              handlePointerCollision(cell, pointer);
            });
          });
        },

        setupControls() {
          this.input.on("pointerdown", (pointer) => {
            if (this.paused) {
              this.drawingMode = pointer.leftButtonDown();
              this.erasingMode = pointer.rightButtonDown();
            }
          });

          this.input.on("pointerup", () => {
            if (this.paused) {
              this.drawingMode = false;
              this.erasingMode = false;
            }
          });

          const spacebar = this.input.keyboard.addKey("SPACE");
          const keyDel = this.input.keyboard.addKey("DELETE");
          const keyUp = this.input.keyboard.addKey("UP");
          const keyDown = this.input.keyboard.addKey("DOWN");
          const keyRight = this.input.keyboard.addKey("RIGHT");
          const keyLeft = this.input.keyboard.addKey("LEFT");

          spacebar.on("down", () => {
            if (this.paused) this.play();
            else this.pause();
          });

          keyDel.on("down", () => this.clear());
          keyUp.on("down", () => this._changeSpeed(1));
          keyRight.on("down", () => this._changeSpeed(1));
          keyDown.on("down", () => this._changeSpeed(-1));
          keyLeft.on("down", () => this._changeSpeed(-1));

          controls.on(controls.actions.PLAY, this.play.bind(this));
          controls.on(controls.actions.PAUSE, this.pause.bind(this));
          controls.on(controls.actions.STOP, this.stop.bind(this));
          controls.on(
            controls.actions.UNDO,
            this.loadPreviousPattern.bind(this)
          );
          controls.on(controls.actions.REDO, this.loadNextPattern.bind(this));
          controls.on(controls.actions.SAVE, this.save.bind(this));
          controls.on(
            controls.actions.SPEED_UP,
            this._changeSpeed.bind(this, 1)
          );

          controls.on(
            controls.actions.SPEED_DOWN,
            this._changeSpeed.bind(this, -1)
          );
        },

        getGamePattern() {
          return this.cells.map((cell) => +cell.__alive);
        },

        saveToLocalStorage() {
          try {
            let state = [];

            if (localStorage.length) {
              state = JSON.parse(localStorage.getItem("state"));
            }

            const pattern = this.getGamePattern();
            const serialized = JSON.stringify(pattern);
            const exists = state.some((p) => JSON.stringify(p) === serialized);

            if (exists) return;

            state.push(pattern);
            this._currentPatternIndex = state.length - 1;
            localStorage.setItem("state", JSON.stringify(state));
          } catch (e) {
            console.error("Error trying to save state to local storage", e);
          }
        },

        _getStateFromLocalStorage() {
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

        _loadPatternFromLocalHistory(index) {
          const state = this._getStateFromLocalStorage();
          if (state[index]) {
            this.drawPattern(state[index]);
            this._currentPatternIndex = index;
            this._checkLocalHistoryAndControls();
          }
        },

        loadNextPattern() {
          const next =
            this._currentPatternIndex != null
              ? this._currentPatternIndex + 1
              : -1;
          this._loadPatternFromLocalHistory(next);
        },

        loadPreviousPattern() {
          const prev =
            this._currentPatternIndex != null
              ? this._currentPatternIndex - 1
              : -1;
          this._loadPatternFromLocalHistory(prev);
        },

        _checkLocalHistoryAndControls(options) {
          if (this.paused) {
            const { drawInitialIndex = true } = options || {};
            const state = this._getStateFromLocalStorage();

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
              const next = state[this._currentPatternIndex + 1];
              const prev =
                state[
                  !this._boardHasCellsAlive
                    ? this._currentPatternIndex
                    : this._currentPatternIndex - 1
                ];

              if (next) controls.enable(controls.actions.REDO);
              else controls.disable(controls.actions.REDO);

              if (prev) controls.enable(controls.actions.UNDO);
              else controls.disable(controls.actions.UNDO);
            }
          } else {
            controls.disable(controls.actions.UNDO);
            controls.disable(controls.actions.REDO);
          }
        },

        _resetHistoryState() {
          this._currentPatternIndex = null;
          this._checkLocalHistoryAndControls({ drawInitialIndex: false });
          this._currentPatternIndex = this._currentPatternIndex + 1;
        },

        drawPattern(pattern) {
          if (!this.cells || !pattern) return;

          const draw = (sequence) => {
            this.cells.forEach((cell, i) => {
              cell.__alive = !!sequence[i];
              if (cell.__alive) this.enable(cell);
              else this.kill(cell);
            });
          };

          if (this.cells.length >= pattern.length) {
            draw(pattern);
          } else {
            draw(pattern.slice(0, this.cells.length));
          }

          this._checkCellsState();
        },

        save() {
          if (this.paused && this._boardHasCellsAlive) {
            const state = this.getGamePattern();
          }
        },

        _changeSpeed(val) {
          if (!this.paused) {
            if (val < 0 && SPEED < MAX_SPEED) {
              SPEED += SPEED_STEP;
            } else if (val > 0 && SPEED > MIN_SPEED) {
              SPEED -= SPEED_STEP;
            }

            this._checkSpeedControls();
          }
        },

        _checkSpeedControls() {
          const max = MAX_SPEED / SPEED_STEP;
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

        play() {
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

        pause() {
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

        stop() {
          this.pause();
          this.clear();
        },

        enable(cell) {
          cell.__alive = true;
          cell.setFillStyle(ALIVE_COLOR, ALIVE_COLOR_ALPHA);
          cell.setStrokeStyle(
            STROKE_WIDTH,
            ALIVE_STROKE_COLOR,
            ALIVE_STROKE_COLOR_ALPHA
          );
        },

        kill(cell) {
          cell.__alive = false;
          cell.setFillStyle(DEAD_COLOR, DEAD_COLOR_ALPHA);
          cell.setStrokeStyle(
            STROKE_WIDTH,
            DEAD_STROKE_COLOR,
            DEAD_STROKE_COLOR_ALPHA
          );
        },

        clear() {
          if (this.paused) {
            this._firstRun = true;
            this.cells.forEach((cell) => this.kill(cell));
            this._checkCellsState();
            this._resetHistoryState();
          }
        },

        isAlive(id) {
          return this.grid.siblings[id].cell.__alive ? 1 : 0;
        },

        getNeighborsAlive(cell) {
          const siblings = this.grid.siblings[cell.__id];
          const count = [
            siblings.left,
            siblings.topLeft,
            siblings.bottomLeft,
            siblings.right,
            siblings.topRight,
            siblings.bottomRight,
            siblings.top,
            siblings.bottom,
          ].reduce((count, id) => count + this.isAlive(id), 0);
          return count;
        },

        onCellsStateChanged() {
          if (this._boardHasCellsAlive && this.paused) {
            controls.enable(controls.actions.PLAY);
            controls.enable(controls.actions.SAVE);
            controls.enable(controls.actions.STOP);
          } else if (!this._boardHasCellsAlive && this.paused) {
            controls.disable(controls.actions.PLAY);
            controls.disable(controls.actions.SAVE);
            controls.disable(controls.actions.STOP);
          } else if (!this._boardHasCellsAlive && !this.paused) {
            setTimeout(() => this.pause(), 500);
          }
        },

        _checkCellsState() {
          const hasCellsAlive = this.cells.some((cell) => cell.__alive);

          if (this._boardHasCellsAlive != hasCellsAlive) {
            this._boardHasCellsAlive = hasCellsAlive;
            this.onCellsStateChanged();
          }
        },

        _runGame() {
          if (!this.paused) {
            this.cells.forEach((cell) => {
              const nAliveCount = this.getNeighborsAlive(cell);

              // Rule #1: a dead cell with 3 neighbors alive; "survives"
              if (!cell.__alive && nAliveCount === 3) {
                cell.__nextGen = true;
              }
              // Rule #2: a live cell with less than 2 or more than 3 neighbors alive; "dies"
              else if (cell.__alive && (nAliveCount < 2 || nAliveCount > 3)) {
                cell.__nextGen = false;
              } else {
                cell.__nextGen = cell.__alive;
              }
            });

            this.cells.forEach((cell) => {
              if (cell.__nextGen) this.enable(cell);
              else this.kill(cell);
            });
          }

          this._checkCellsState();
        },

        create() {
          this.generateGrid();
          this.setupGridInteraction();
          this.setupControls();
          this.pause();
          this._checkCellsState();
        },

        update(time) {
          if (!this._iterationTimeElapsed) {
            this._iterationTimeElapsed = time;
          } else if (time - this._iterationTimeElapsed > SPEED) {
            this._iterationTimeElapsed = time;
            this._runGame();
          }
        },
      });

      return {
        type: Phaser.AUTO,
        width: CANVAS_SIZE.width,
        height: CANVAS_SIZE.height,
        scene: [MainGameScene],
      };
    };
  })();
})();
