import { InputController } from "./inputController";
import {
  distinctUntilChanged,
  first,
  map,
  startWith,
  withLatestFrom,
} from "rxjs/operators";
import { combineLatest, merge, of, ReplaySubject, Subject } from "rxjs";

export type TilemapConfig = {
  tilesX: number;
  tilesY: number;
  tileSize: number;
};

export const createTilemapController = ({
  click$,
  pointerMove$,
}: InputController) => {
  const tilemapConfig$ = new ReplaySubject<TilemapConfig>(1);

  const setTilemapConfig = (newConfig: TilemapConfig) => {
    tilemapConfig$.next(newConfig);
  };

  const hoveredTile$ = combineLatest([pointerMove$, tilemapConfig$]).pipe(
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

  const selectedTile$ = clickTile$;

  const lightSourceTile$ = tilemapConfig$.pipe(
    map(({ tilesX, tilesY }) => {
      return new Phaser.Math.Vector2(
        Math.floor(tilesX / 2),
        Math.floor(tilesY / 2)
      );
    })
  );

  // const tileChanged$ = clickTile$.pipe(
  //     map(tile => ({ tile, type: 3 })),
  //     share()
  // );

  return {
    // tileChanged$,
    lightSourceTile$,
    hoveredTile$,
    tilemapConfig$,
    clickTile$,
    selectedTile$,
    setTilemapConfig,
  };
};

export type TilemapController = ReturnType<typeof createTilemapController>;
