import Phaser from "phaser";
import { addTileMap } from "./addTileMap";
import { addGridOverlay } from "./addGridOverlay";
import { createInputManager } from "../controllers/createInputManager";

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
    const tileMapConfig = {
      tilesX,
      tilesY,
      tileSize,
    };

    const inputManager = createInputManager(this, tileSize);
    addTileMap(this, tileMapConfig, inputManager);
    addGridOverlay(this, tileMapConfig);
  }
}
