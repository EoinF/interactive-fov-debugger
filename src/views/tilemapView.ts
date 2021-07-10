import { SharedController } from "../controllers/sharedController";
import { combineLatest, Subject } from "rxjs";
import {
  first,
  map,
  pairwise,
  startWith,
  withLatestFrom,
} from "rxjs/operators";
import {
  TilemapConfig,
  TilemapController,
} from "../controllers/tilemapController";
import { RayLineController } from "../controllers/rayLineController";

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
  { tilemapConfig$, lightSourceTile$ }: TilemapController,
  { lines$ }: RayLineController
) => {
  const objectPools$ = new Subject<ObjectPools>();

  // tileChanged$.pipe(withLatestFrom(viewObjects$)).subscribe(([{ type, tile: { x, y } }, {mainLayer}]) => {
  //     mainLayer.putTileAt(type, x, y);
  // });

  combineLatest([
    objectPools$,
    lightSourceTile$.pipe(startWith({ x: -1, y: -1 }), pairwise()),
  ]).subscribe(([{ mainLayer, lightLayer }, [previous, next]]) => {
    mainLayer.putTileAt(TileType.FLOOR, previous.x, previous.y);
    lightLayer.putTileAt(TileType.DARK_OVERLAY, previous.x, previous.y);
    mainLayer.putTileAt(TileType.LIGHT_SOURCE, next.x, next.y);
    lightLayer.putTileAt(TileType.LIGHT_OVERLAY, next.x, next.y);
  });

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

  tilemapConfig$.pipe(first()).subscribe((tilemapConfig) => {
    objectPools$.next(init(scene, tilemapConfig));
  });
};

const init = (
  scene: Phaser.Scene,
  { tilesX, tilesY, tileSize }: TilemapConfig
): ObjectPools => {
  const emptyMap: number[][] = new Array(tilesY)
    .fill(undefined)
    .map(() => new Array(tilesX).fill(TileType.FLOOR));

  const tilemap = scene.make.tilemap({
    key: "123",
    data: emptyMap,
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: tilesX,
    height: tilesY,
  });
  const tileset = tilemap.addTilesetImage("tiles", undefined, 32, 32, 0, 0);
  const mainLayer = tilemap.createLayer(0, tileset, 0, 0);
  const lightLayer = tilemap.createBlankLayer("lights", tileset, 0, 0);
  for (let y = 0; y < emptyMap.length; y++) {
    for (let x = 0; x < emptyMap[y].length; x++) {
      lightLayer.putTileAt(TileType.DARK_OVERLAY, x, y);
    }
  }

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
