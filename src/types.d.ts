type Vector2 = Phaser.Math.Vector2;

export type TilemapConfig = {
  tilesX: number;
  tilesY: number;
  tileSize: number;
};

export type Line = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export type SetLightCommand = {
  type: "setLight";
  tileX: number;
  tileY: number;
};

export type SetLinesCommand = {
  type: "setLines";
  lines: Line[];
};
export type LightCastCommand = SetLightCommand | SetLinesCommand;
