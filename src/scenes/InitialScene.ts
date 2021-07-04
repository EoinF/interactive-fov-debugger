import { createTilemapController } from "../controllers/tilemapController";
import Phaser from "phaser";
import { tilemapView } from "../views/tilemapView";
import { createInputManager } from "../controllers/inputManager";
import { controlsPanelView } from "../views/controlsPanelView";
import { createSharedController } from "../controllers/sharedController";

export default class InitialScene extends Phaser.Scene {
  constructor() {
    super("initial");
  }

  create(): void {
    const controlsPanelMinWidth = 100;

    const tileSize = 32;
    const tilesX = Math.floor(
      (this.cameras.main.width - controlsPanelMinWidth) / tileSize
    );
    const tilesY = Math.floor(this.cameras.main.height / tileSize);
    const tilemapConfig = {
      tilesX,
      tilesY,
      tileSize,
    };
    const inputManager = createInputManager(this);
    const tilemapController = createTilemapController(
      tilemapConfig,
      inputManager
    );
    const sharedController = createSharedController(
      inputManager,
      tilemapController
    );

    const controlsPanelWidth = this.cameras.main.width - tileSize * tilesX;

    tilemapView(this, tilemapController, sharedController);
    controlsPanelView(
      this,
      {
        x: this.cameras.main.width - controlsPanelWidth,
        y: 0,
        width: controlsPanelWidth,
        height: this.cameras.main.height,
      },
      sharedController
    );
  }
}
