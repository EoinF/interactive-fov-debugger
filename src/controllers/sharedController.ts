import { combineLatest } from "rxjs";
import { map, tap } from "rxjs/operators";
import { InputManager } from "./inputController";
import { TilemapController } from "./tilemapController";

export const createSharedController = (
  inputManager: InputManager,
  { clickTile$, tilemapConfig$ }: TilemapController
) => {
  const selectedTile$ = clickTile$;

  const selectedTilePosition$ = combineLatest([
    tilemapConfig$,
    selectedTile$,
  ]).pipe(
    map(([{ tileSize }, tile]) =>
      new Phaser.Math.Vector2(0.5 + tile.x, 0.5 + tile.y).scale(tileSize)
    )
  );

  const vectorFromSelectedTile$ = combineLatest([
    inputManager.pointerMove$,
    selectedTilePosition$,
  ]).pipe(
    map(([pointer, sourceTile]) => {
      return new Phaser.Math.Vector2(
        pointer.x - sourceTile.x,
        pointer.y - sourceTile.y
      );
    })
  );

  const angleFromSelectedTile$ = vectorFromSelectedTile$.pipe(
    map((vec) => {
      return Math.atan2(vec.y, vec.x);
    })
  );

  return {
    selectedTile$,
    selectedTilePosition$,
    vectorFromSelectedTile$,
    angleFromSelectedTile$,
  };
};

export type SharedController = ReturnType<typeof createSharedController>;
