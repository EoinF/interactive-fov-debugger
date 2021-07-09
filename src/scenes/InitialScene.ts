import Phaser from "phaser";
import { tilemapView } from "../views/tilemapView";
import {
  inputController,
  sharedController,
  tilemapController,
} from "../controllers/init";

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
    tilemapView(this, tilemapController, sharedController);
  }
}
