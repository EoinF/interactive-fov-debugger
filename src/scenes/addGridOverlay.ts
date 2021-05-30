import { TileMapConfig } from "./addTileMap";
import { Scene } from "phaser";

export const addGridOverlay = (
  scene: Phaser.Scene,
  { tilesX, tilesY, tileSize }: TileMapConfig
) => {
  const gridWidth = tilesX * tileSize;
  const gridHeight = tilesY * tileSize;

  scene.add.grid(
    gridWidth / 2,
    gridHeight / 2,
    gridWidth,
    gridHeight,
    tileSize,
    tileSize,
    0xffffff,
    0,
    0x888888,
    0.5
  );
};
