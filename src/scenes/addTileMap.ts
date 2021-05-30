export type TileMapConfig = {
  tilesX: number;
  tilesY: number;
  tileSize: number;
};

export const addTileMap = (
  scene: Phaser.Scene,
  { tilesX, tilesY, tileSize }: TileMapConfig
) => {
  let currentTile = {
    x: 0,
    y: 0,
  };
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

  scene.input.on("pointerdown", () => {
    layer.putTileAt(1, currentTile.x, currentTile.y);
  });

  scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    const tileX = Math.floor(pointer.x / tileSize);
    const tileY = Math.floor(pointer.y / tileSize);
    if (currentTile.x !== tileX || currentTile.y !== tileY) {
      currentTile = {
        x: tileX,
        y: tileY,
      };
      if (pointer.isDown) {
        layer.putTileAt(1, currentTile.x, currentTile.y);
      }
    }
  });
};
