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
import { SetLightCommand, SetLinesCommand, TilemapConfig } from "../types";

export enum TileType {
  LIGHT_OVERLAY = 0,
  DARK_OVERLAY = 1,
  LIGHT_SOURCE = 2,
  FLOOR = 4,
}

type ObjectPools = {
  lines: Phaser.GameObjects.Line[];
  highlightSquare: Phaser.GameObjects.Shape;
};

export const overlayView = (
  scene: Phaser.Scene,
  { tilemapConfig$, nextCommand$ }: TilemapController
) => {
  const objectPools$ = new Subject<ObjectPools>();

  const lines$ = nextCommand$.pipe(
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

  nextCommand$
    .pipe(
      filter(
        (command): command is SetLightCommand => command.type === "setLight"
      ),
      withLatestFrom(objectPools$, tilemapConfig$)
    )
    .subscribe(([{ tileX, tileY }, { highlightSquare }, { tileSize }]) => {
      highlightSquare.x = (tileX + 0.5) * tileSize;
      highlightSquare.y = (tileY + 0.5) * tileSize;
    });

  tilemapConfig$.pipe(first()).subscribe((tilemapConfig) => {
    objectPools$.next(init(scene, tilemapConfig));
  });
};

const init = (
  scene: Phaser.Scene,
  { tilesX, tilesY, tileSize }: TilemapConfig
): ObjectPools => {
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

  const highlightSquare = scene.add.rectangle(
    -99999,
    -99999,
    tileSize,
    tileSize,
    0xffff00,
    0.2
  );

  return { lines, highlightSquare };
};
