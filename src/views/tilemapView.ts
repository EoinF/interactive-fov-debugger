import { combineLatest, Subject } from "rxjs";
import {
  filter,
  first,
  map,
  pairwise,
  startWith,
  withLatestFrom,
} from "rxjs/operators";
import { TilemapController } from "../controllers/tilemapController";
import { SetLinesCommand, TilemapConfig } from "../types";

export enum TileType {
  LIGHT_OVERLAY = 0,
  DARK_OVERLAY = 1,
  LIGHT_SOURCE = 2,
  FLOOR = 4,
}

type ObjectPools = {
  tilemap: Phaser.Tilemaps.Tilemap;
  mainLayer: Phaser.Tilemaps.TilemapLayer;
  lightLayer: Phaser.Tilemaps.TilemapLayer;
  lines: Phaser.GameObjects.Line[];
};

export const tilemapView = (
  scene: Phaser.Scene,
  { tilemapConfig$, lightSourceTile$, tileMapCommands$ }: TilemapController
) => {
  const objectPools$ = new Subject<ObjectPools>();

  const emptyTilemap$ = tilemapConfig$.pipe(
    map(
      ({ tilesX, tilesY }) =>
        new Array(tilesY)
          .fill(undefined)
          .map(() => new Array(tilesX).fill(TileType.FLOOR)) as number[][]
    )
  );

  tileMapCommands$
    .pipe(withLatestFrom(objectPools$), withLatestFrom(emptyTilemap$))
    .subscribe(([[command, { lightLayer }], emptyTilemap]) => {
      switch (command.type) {
        case "setLight":
          lightLayer.putTileAt(
            TileType.LIGHT_OVERLAY,
            command.tileX,
            command.tileY
          );
          break;
        case "resetLights":
          const fullDarkOverlay = emptyTilemap.map((row) =>
            row.map(() => TileType.DARK_OVERLAY)
          );
          lightLayer.putTilesAt(fullDarkOverlay, 0, 0);
          break;
      }
    });

  combineLatest([
    objectPools$,
    lightSourceTile$.pipe(startWith({ x: -1, y: -1 }), pairwise()),
  ]).subscribe(([{ mainLayer, lightLayer }, [previous, next]]) => {
    mainLayer.putTileAt(TileType.FLOOR, previous.x, previous.y);
    lightLayer.putTileAt(TileType.DARK_OVERLAY, previous.x, previous.y);
    mainLayer.putTileAt(TileType.LIGHT_SOURCE, next.x, next.y);
    lightLayer.putTileAt(TileType.LIGHT_OVERLAY, next.x, next.y);
  });

  const lines$ = tileMapCommands$.pipe(
    filter(
      (command): command is SetLinesCommand => command.type === "setLines"
    ),
    map(({ lines }) => lines),
    startWith([])
  );

  combineLatest([objectPools$, lines$.pipe(pairwise())]).subscribe(
    ([objectPools, [previousLines, nextLines]]) => {
      const difference = previousLines.length - nextLines.length;
      for (let i = 0; i < difference; i++) {
        objectPools.lines[nextLines.length + i].setVisible(false);
      }
      nextLines.forEach(({ fromX, fromY, toX, toY }, index) => {
        objectPools.lines[index].setVisible(true);
        objectPools.lines[index].setTo(fromX, fromY, toX, toY);
      });
    }
  );

  tilemapConfig$
    .pipe(first(), withLatestFrom(emptyTilemap$))
    .subscribe(([tilemapConfig, emptyTilemap]) => {
      objectPools$.next(init(scene, tilemapConfig, emptyTilemap));
    });
};

const init = (
  scene: Phaser.Scene,
  { tilesX, tilesY, tileSize }: TilemapConfig,
  emptyTilemap: number[][]
): ObjectPools => {
  const tilemap = scene.make.tilemap({
    key: "123",
    data: emptyTilemap,
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: tilesX,
    height: tilesY,
  });
  const tileset = tilemap.addTilesetImage("tiles", undefined, 32, 32, 0, 0);
  const mainLayer = tilemap.createLayer(0, tileset, 0, 0);
  const lightLayer = tilemap.createBlankLayer("lights", tileset, 0, 0);

  const fullDarkOverlay = emptyTilemap.map((row) =>
    row.map(() => TileType.DARK_OVERLAY)
  );
  lightLayer.putTilesAt(fullDarkOverlay, 0, 0);

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
    0x0,
    0.2
  );

  const lines = Array(2)
    .fill(undefined)
    .map(() =>
      scene.add.line(0, 0, 0, 0, 0, 0).setStrokeStyle(1, 0xffee55, 0.6)
    );

  return { tilemap, mainLayer, lightLayer, lines };
};
