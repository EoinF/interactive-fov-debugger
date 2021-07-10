import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { InputController } from "./inputController";
import { TilemapController } from "./tilemapController";

export const createSharedController = (
  inputManager: InputController,
  { lightSourceTile$, tilemapConfig$ }: TilemapController
) => {
  const lightSourcePosition$ = combineLatest([
    tilemapConfig$,
    lightSourceTile$,
  ]).pipe(
    map(([{ tileSize }, tile]) =>
      new Phaser.Math.Vector2(0.5 + tile.x, 0.5 + tile.y).scale(tileSize)
    )
  );

  const vectorFromLightSource$ = combineLatest([
    inputManager.pointerMove$,
    lightSourcePosition$,
  ]).pipe(
    map(([pointer, sourceTile]) => {
      return new Phaser.Math.Vector2(
        pointer.x - sourceTile.x,
        pointer.y - sourceTile.y
      );
    })
  );

  const angleFromSelectedTile$ = vectorFromLightSource$.pipe(
    map((vec) => {
      return Math.atan2(vec.y, vec.x);
    })
  );

  return {
    angleFromSelectedTile$,
  };
};

export type SharedController = ReturnType<typeof createSharedController>;
