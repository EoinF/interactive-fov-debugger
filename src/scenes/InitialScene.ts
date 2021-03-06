import Phaser from "phaser";
import { tilemapView } from "../views/tilemapView";
import { inputController, tilemapController } from "../controllers/init";
import { overlayView } from "../views/overlayView";

const tileSize = 32;

export default class InitialScene extends Phaser.Scene {
  constructor() {
    super("initial");
  }

  init() {
    const tilesX = Math.floor(this.cameras.main.width / tileSize);
    const tilesY = Math.floor(this.cameras.main.height / tileSize);
    tilemapController.setTilemapConfig({
      tilesX,
      tilesY,
      tileSize,
    });
    inputController.connectToPhaserScene(this);
  }

  create(): void {
    tilemapView(this, tilemapController);
    overlayView(this, tilemapController);
  }
}
