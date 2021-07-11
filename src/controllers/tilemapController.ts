import { combineLatest, ReplaySubject, Observable } from "rxjs";
import {
  distinctUntilChanged,
  map,
  startWith,
  withLatestFrom,
} from "rxjs/operators";
import { InputController } from "./inputController";
import { rayCast } from "../rayCast/rayCast";
import { TilemapConfig, Line } from "../types";
import { twinCast } from "../twinCast/twinCast";

export const createTilemapController = ({
  algorithm$,
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

  const { rayCastLines$, rayCastCommands$ } = rayCast(
    lightSourceTile$,
    selectedTile$,
    tilemapConfig$
  );
  const { twinCastLines$ } = twinCast(
    lightSourceTile$,
    hoveredTile$,
    tilemapConfig$
  );

  const lines$: Observable<Line[]> = combineLatest([
    algorithm$,
    rayCastLines$,
    twinCastLines$,
  ]).pipe(
    map(([algorithm, rayCast, twinCast]) => {
      return algorithm === "RayCast" ? rayCast : twinCast;
    })
  );

  const tileMapCommands$ = rayCastCommands$;

  return {
    tileMapCommands$,
    lightSourceTile$,
    hoveredTile$,
    tilemapConfig$,
    clickTile$,
    selectedTile$,
    lines$,
    setTilemapConfig,
  };
};

export type TilemapController = ReturnType<typeof createTilemapController>;
