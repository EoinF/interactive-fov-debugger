import { createTilemapController } from "../controllers/tilemapController";
import Phaser from "phaser";
import { tilemapView } from "../views/tilemapView";
import { createInputManager } from "../controllers/inputManager";

export default class InitialScene extends Phaser.Scene {
  constructor() {
    super("initial");
  }

  create(): void {
    const controlsPanelWidth = 100;

    const tileSize = 32;
    const tilesX = Math.floor(
      (this.cameras.main.width - controlsPanelWidth) / tileSize
    );
    const tilesY = Math.floor(this.cameras.main.height / tileSize);
    const tilemapConfig = {
      tilesX,
      tilesY,
      tileSize,
    };
    const inputManager = createInputManager(this);
    const tilemapController = createTilemapController(tilemapConfig, inputManager)

    tilemapView(this, tilemapController);
  }
}
