import { InputManager } from "../controllers/createInputManager";

export type TileMapConfig = {
  tilesX: number;
  tilesY: number;
  tileSize: number;
};

export const addTileMap = (
  scene: Phaser.Scene,
  { tilesX, tilesY, tileSize }: TileMapConfig,
  { clickTile$ }: InputManager
) => {
  const emptyMap: number[][] = new Array(tilesY)
    .fill(undefined)
    .map(() => new Array(tilesX).fill(0));

  emptyMap[Math.floor(tilesY / 2)][Math.floor(tilesX / 2)] = 2;
  const map = scene.make.tilemap({
    data: emptyMap,
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: tilesX,
    height: tilesY,
  });

  const tileset = map.addTilesetImage("tiles", undefined, 32, 32, 0, 0);
  const layer = map.createLayer(0, tileset, 0, 0);

  clickTile$.subscribe(({ x, y }) => {
    layer.putTileAt(1, x, y);
  });
};
