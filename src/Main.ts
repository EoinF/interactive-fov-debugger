import Phaser from "phaser";

import PreloaderScene from "./scenes/PreloaderScene";
import InitialScene from "./scenes/InitialScene";
import "./views/controlsPanelView";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
    },
  },
  scene: [PreloaderScene, InitialScene],
  backgroundColor: "#000000",
};

const game = new Phaser.Game(config);
game.canvas.oncontextmenu = function (e) {
  e.preventDefault();
};

export default game;
