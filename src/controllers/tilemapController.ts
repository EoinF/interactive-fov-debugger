import { InputManager } from "./inputManager";
import {
  distinctUntilChanged,
  first,
  map,
  mergeAll,
  share,
  startWith,
  withLatestFrom,
} from "rxjs/operators";
import { combineLatest, merge, of } from "rxjs";

export type TilemapConfig = {
  tilesX: number;
  tilesY: number;
  tileSize: number;
};

export const createTilemapController = (
  tilemapConfig: TilemapConfig,
  { click$, pointerMove$ }: InputManager
) => {
  const tilemapSize$ = of(tilemapConfig).pipe(share());

  const hoveredTile$ = combineLatest([pointerMove$, tilemapSize$]).pipe(
    map(
      ([{ x, y }, { tileSize }]) =>
        new Phaser.Math.Vector2(
          Math.floor(x / tileSize),
          Math.floor(y / tileSize)
        )
    ),
    distinctUntilChanged(
      (next, previous) => next.x === previous.x && next.y === previous.y
    ),
    startWith(new Phaser.Math.Vector2(-1, -1))
  );
  const clickTile$ = click$.pipe(
    withLatestFrom(hoveredTile$),
    map(([_, nextTile]) => nextTile)
  );

  const selectedTile$ = merge(
    clickTile$,
    tilemapSize$.pipe(
      first(),
      map(({ tilesX, tilesY }) => {
        return new Phaser.Math.Vector2(
          Math.floor(tilesX / 2),
          Math.floor(tilesY / 2)
        );
      })
    )
  );

  // const tileChanged$ = clickTile$.pipe(
  //     map(tile => ({ tile, type: 3 })),
  //     share()
  // );

  return {
    // tileChanged$,
    hoveredTile$,
    tilemapSize$,
    clickTile$,
    selectedTile$,
  };
};

export type TilemapController = ReturnType<typeof createTilemapController>;
