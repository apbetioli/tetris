import { Tetris } from "./tetris.js";

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");

  const tetris = new Tetris(canvas);

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
});
