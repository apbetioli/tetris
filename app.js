import { Tetris } from "./tetris.js";

const tetris = new Tetris({ speed: 500 });
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
