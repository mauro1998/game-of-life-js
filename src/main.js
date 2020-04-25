(() => {
  const CELL_SIZE = 20;
  const ALIVE_COLOR = 0xf50057;
  const ALIVE_STROKE_COLOR = 0xab003c;
  const DEAD_COLOR = 0x263238;
  const DEAD_STROKE_COLOR = 0x607d8b;

  const isDivisibleByCellSize = (x) => x % CELL_SIZE === 0;
  const getNearestDivisibleByCellSize = (x) => x - (x % CELL_SIZE);
  const getCanvasSize = () => {
    let wd = window.innerWidth;
    let wh = window.innerHeight;

    if (!isDivisibleByCellSize(wd)) {
      wd = getNearestDivisibleByCellSize(wd);
    }

    if (!isDivisibleByCellSize(wh)) {
      wh = getNearestDivisibleByCellSize(wh);
    }

    return {
      width: wd,
      height: wh,
    };
  };

  const canvasSize = getCanvasSize();

  const gameOfLife = new Phaser.Class({
    initialize: function () {
      Phaser.Scene.call(this, { key: "game-of-life" });
      this.numCellsX = Math.floor(canvasSize.width / CELL_SIZE);
      this.numCellsY = Math.floor(canvasSize.height / CELL_SIZE);

      this.paused = true;
      this.drawingMode = false;
      this.erasingMode = false;

      // disable right-click default behavior
      window.addEventListener("contextmenu", (e) => e.preventDefault(), false);
    },

    getBasePolygonPoints(x = 0, y = 0) {
      return [
        { x: x * CELL_SIZE, y: y * CELL_SIZE },
        { x: (x + 1) * CELL_SIZE, y: y * CELL_SIZE },
        { x: (x + 1) * CELL_SIZE, y: (y + 1) * CELL_SIZE },
        { x: x * CELL_SIZE, y: (y + 1) * CELL_SIZE },
      ];
    },

    generateGridPoints() {
      const siblings = {};
      const positions = [];
      const getPos = (n) => CELL_SIZE * n;
      const mod = (a, b) => ((a % b) + b) % b;

      for (let x = 0; x < this.numCellsX; x++) {
        for (let y = 0; y < this.numCellsY; y++) {
          const pos = [getPos(x), getPos(y)];
          const xl = mod(x - 1, this.numCellsX);
          const xr = mod(x + 1, this.numCellsX);
          const yt = mod(y - 1, this.numCellsY);
          const yb = mod(y + 1, this.numCellsY);
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
    },

    drawCell(x, y, points) {
      const cell = this.add.polygon(x, y, points);
      cell.setFillStyle(DEAD_COLOR, 1);
      cell.setStrokeStyle(2, DEAD_STROKE_COLOR, 1);
      cell.setOrigin(0, 0);
      cell.setInteractive();
      cell.__alive = false;
      cell.__id = [x, y].toString();
      return cell;
    },

    enable(cell) {
      cell.__alive = true;
      cell.setFillStyle(ALIVE_COLOR, 1);
      cell.setStrokeStyle(2, ALIVE_STROKE_COLOR, 1);
    },

    kill(cell) {
      cell.__alive = false;
      cell.setFillStyle(DEAD_COLOR, 1);
      cell.setStrokeStyle(2, DEAD_STROKE_COLOR, 1);
    },

    create() {
      const points = this.getBasePolygonPoints();

      this.grid = this.generateGridPoints();
      this.cells = this.grid.positions.map(([x, y]) =>
        this.drawCell(x, y, points)
      );

      this.cells.forEach((cell) => {
        this.grid.siblings[cell.__id].cell = cell;

        const handleCollision = (pointer) => {
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

        cell.on("pointermove", handleCollision);
        cell.on("pointerdown", handleCollision);
      });

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
      const keyR = this.input.keyboard.addKey("R");

      spacebar.on("down", () => (this.paused = !this.paused));
      keyR.on("down", () => {
        if (this.paused) {
          this.reset();
        }
      });

      this.time.addEvent({
        delay: 200,
        callback: this.updateGame,
        callbackScope: this,
        loop: true,
      });
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

    updateGame() {
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
    },

    reset() {
      for (let index = 0; index < this.cells.length; index++) {
        const cell = this.cells[index];
        this.kill(cell);
      }
    },
  });

  const config = {
    type: Phaser.AUTO,
    width: canvasSize.width,
    height: canvasSize.height,
    scene: [gameOfLife],
  };

  const game = new Phaser.Game(config);
})();
