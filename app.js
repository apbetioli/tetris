const EMPTY = "#222";

class Tetromino {
  constructor(shape = [[]]) {
    this.shape = shape;
    this.position = {
      x: 5, //mid screen
      y: -this.shape.length,
    };
  }

  rotateClockwise() {
    const newShape = [];
    for (let scol = 0; scol < this.shape[0].length; scol++) {
      const row = [];
      for (let srow = this.shape.length - 1; srow >= 0; srow--) {
        row.push(this.shape[srow][scol]);
      }
      newShape.push(row);
    }
    this.shape = newShape;
  }

  rotateCounterClockwise() {
    const newShape = [];
    for (let scol = this.shape[0].length - 1; scol >= 0; scol--) {
      const row = [];
      for (let srow = 0; srow < this.shape.length; srow++) {
        row.push(this.shape[srow][scol]);
      }
      newShape.push(row);
    }
    this.shape = newShape;
  }
}

class I extends Tetromino {
  constructor() {
    const COLOR = "lightblue";
    super([[COLOR, COLOR, COLOR, COLOR]]);
  }
}

class O extends Tetromino {
  constructor() {
    const COLOR = "yellow";
    super([
      [COLOR, COLOR],
      [COLOR, COLOR],
    ]);
  }
}

class J extends Tetromino {
  constructor() {
    const COLOR = "blue";
    super([
      [COLOR, EMPTY, EMPTY],
      [COLOR, COLOR, COLOR],
    ]);
  }
}

class L extends Tetromino {
  constructor() {
    const COLOR = "orange";
    super([
      [EMPTY, EMPTY, COLOR],
      [COLOR, COLOR, COLOR],
    ]);
  }
}

class Z extends Tetromino {
  constructor() {
    const COLOR = "red";
    super([
      [COLOR, COLOR, EMPTY],
      [EMPTY, COLOR, COLOR],
    ]);
  }
}

class S extends Tetromino {
  constructor() {
    const COLOR = "green";
    super([
      [EMPTY, COLOR, COLOR],
      [COLOR, COLOR, EMPTY],
    ]);
  }
}

class T extends Tetromino {
  constructor() {
    const COLOR = "purple";
    super([
      [EMPTY, COLOR, EMPTY],
      [COLOR, COLOR, COLOR],
    ]);
  }
}

class Tetris {
  #observers = {};
  #points = 0;

  constructor(config = {}) {
    this.config = { size: 20, columns: 12, lines: 21, speed: 1000, ...config };
    const { size, columns, lines } = this.config;

    this.canvas = document.getElementById("canvas");
    canvas.setAttribute("width", columns * size);
    canvas.setAttribute("height", lines * size);

    this.ctx = canvas.getContext("2d");
  }

  addObserver(event, callback) {
    if (!this.#observers[event]) this.#observers[event] = [];
    this.#observers[event].push(callback);
  }

  reset() {
    this.speed = this.config.speed;
    this.gameOver = false;
    this.points = 0;

    this.#initializeMatrix(this.config.lines, this.config.columns);
    this.#spawn();
    this.update();

    this.#notify("pointschanged", 0);
    this.#notify("reset");
  }

  left() {
    const { x, y } = this.piece.position;
    if (this.#collided({ x: x - 1, y })) {
      return false;
    }
    this.piece.position.x--;
    this.#render();
    return true;
  }

  right() {
    const { x, y } = this.piece.position;

    if (this.#collided({ x: x + 1, y })) {
      return false;
    }

    this.piece.position.x++;
    this.#render();
    return true;
  }

  up() {
    if (!this.#rotate()) {
      return false;
    }
    this.#render();
    return true;
  }

  down() {
    const { x, y } = this.piece.position;
    if (this.#collided({ x, y: y + 1 })) {
      return false;
    }

    this.piece.position.y++;
    this.#render();
    return true;
  }

  #notify(event, data) {
    this.#observers[event]?.forEach((callback) => callback.call(this, data));
  }

  #initializeMatrix(lines, columns) {
    this.matrix = [];

    for (let mrow = 0; mrow < lines; mrow++) {
      this.matrix[mrow] = [];

      for (let mcol = 0; mcol < columns; mcol++) {
        if (mrow === lines - 1 || mcol === 0 || mcol === columns - 1) {
          // Walls
          this.matrix[mrow][mcol] = "gray";
        } else {
          // Void
          this.matrix[mrow][mcol] = EMPTY;
        }
      }
    }
  }

  #collided(newPosition) {
    for (let srow = 0; srow < this.piece.shape.length; srow++) {
      for (let scol = 0; scol < this.piece.shape[srow].length; scol++) {
        if (this.piece.shape[srow][scol] === EMPTY) {
          continue;
        }

        let mrow = newPosition.y + srow;
        let mcol = newPosition.x + scol;
        if (mrow < 0 || mcol < 0) continue;

        if (this.matrix[mrow][mcol] !== EMPTY) {
          return true;
        }
      }
    }
  }

  update() {
    this.#nextTick();
    this.#render();

    if (this.timeoutId) [clearTimeout(this.timeoutId)];

    if (!this.gameOver) {
      this.timeoutId = setTimeout(() => {
        this.update();
      }, this.speed);
    }
  }

  #nextTick() {
    if (!this.down()) {
      if (this.piece.position.y < 0) {
        this.gameOver = true;
        this.#notify("gameover");
      }
      this.#merge();
      this.#checkPoints();
      this.#spawn();
    }
  }

  #merge() {
    for (let srow = 0; srow < this.piece.shape.length; srow++) {
      for (let scol = 0; scol < this.piece.shape[srow].length; scol++) {
        let mrow = this.piece.position.y + srow;
        let mcol = this.piece.position.x + scol;
        if (mrow < 0 || mcol < 0) continue;
        if (this.piece.shape[srow][scol] !== EMPTY) {
          this.matrix[mrow][mcol] = this.piece.shape[srow][scol];
        }
      }
    }
  }

  #checkPoints() {
    const removeIndexes = [];
    for (let mrow = this.config.lines - 2; mrow >= 0; mrow--) {
      const row = this.matrix[mrow].filter((block) => block === EMPTY);
      if (row.length === 0) {
        this.#points += 100;
        this.speed = this.config.speed - this.points / 10;
        this.#notify("pointschanged", this.#points);
        removeIndexes.push(mrow);
      }
    }
    removeIndexes.forEach((index) => this.matrix.splice(index, 1));
    for (let i = 0; i < removeIndexes.length; i++) {
      const row = ["gray"];
      for (let c = 0; c < this.config.columns - 2; c++) {
        row.push(EMPTY);
      }
      row.push("gray");
      this.matrix.unshift(row);
    }
  }

  #spawn() {
    const index = Math.round(Math.random() * 6);
    const shapes = [I, O, T, S, Z, J, L];
    this.piece = new shapes[index]();
    for (let i = 0; i < Math.round(Math.random() * 3); i++) {
      this.#rotate();
    }
  }

  #render() {
    this.#renderMatrix();
    this.#renderPiece();
  }

  #renderMatrix() {
    for (let mrow = 0; mrow < this.config.lines; mrow++) {
      for (let mcol = 0; mcol < this.config.columns; mcol++) {
        this.ctx.fillStyle = this.matrix[mrow][mcol];
        this.ctx.fillRect(
          mcol * this.config.size,
          mrow * this.config.size,
          this.config.size - 1,
          this.config.size - 1
        );
      }
    }
  }

  #renderPiece() {
    // Render current piece
    for (let srow = 0; srow < this.piece.shape.length; srow++) {
      for (let scol = 0; scol < this.piece.shape[0].length; scol++) {
        if (this.piece.position.y + srow < 0) {
          continue;
        }
        const mrow = srow + this.piece.position.y;
        const mcol = scol + this.piece.position.x;

        if (this.piece.shape[srow][scol] === EMPTY) continue;

        this.ctx.fillStyle = this.piece.shape[srow][scol];
        this.ctx.fillRect(
          mcol * this.config.size,
          mrow * this.config.size,
          this.config.size - 1,
          this.config.size - 1
        );
      }
    }
  }

  #rotate() {
    this.piece.rotateClockwise();
    if (this.#collided(this.piece.position)) {
      this.piece.rotateCounterClockwise();
      return false;
    }
    return true;
  }
}

const tetris = new Tetris({ speed: 200 });
window.addEventListener("load", () => tetris.reset());
window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      tetris.left();
      break;
    case "ArrowRight":
      tetris.right();
      break;
    case "ArrowUp":
      tetris.up();
      break;
    case "ArrowDown":
      tetris.down();
      break;
  }
});

tetris.addObserver("pointschanged", (data) => {
  document.querySelector("#points").textContent = data;
});

tetris.addObserver("gameover", () => {
  document.querySelector("#gameover").removeAttribute("hidden");
});

tetris.addObserver("reset", () => {
  document.querySelector("#gameover").setAttribute("hidden", true);
});

document.querySelector("#resetButton").addEventListener("click", () => {
  tetris.reset();
});
