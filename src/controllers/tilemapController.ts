import { combineLatest, Observable, of, ReplaySubject, zip } from "rxjs";
import {
  concatMap,
  delay,
  distinctUntilChanged,
  map,
  share,
  shareReplay,
  startWith,
  switchMap,
  takeWhile,
  withLatestFrom,
} from "rxjs/operators";
import { rayCast } from "../rayCast/rayCast";
import { twinCast } from "../twinCast/twinCast";
import { LightCastCommand, TilemapConfig } from "../types";
import { InputController } from "./inputController";
import { PlaybackController } from "./playbackController";

export const createTilemapController = (
  { algorithm$, click$, pointerMove$ }: InputController,
  { tickForward$ }: PlaybackController
) => {
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

  const { rayCastCommands$ } = rayCast(
    lightSourceTile$,
    selectedTile$,
    tilemapConfig$
  );
  const { twinCastCommands$ } = twinCast(
    lightSourceTile$,
    selectedTile$,
    tilemapConfig$
  );

  const tileMapCommands$: Observable<LightCastCommand> = algorithm$.pipe(
    switchMap((algorithm) =>
      algorithm === "RayCast" ? rayCastCommands$ : twinCastCommands$
    )
  );

  const nextCommand$ = zip(tickForward$, tileMapCommands$).pipe(
    map(([_, command]) => command),
    share()
  );

  return {
    nextCommand$,
    lightSourceTile$,
    hoveredTile$,
    tilemapConfig$,
    clickTile$,
    selectedTile$,
    setTilemapConfig,
  };
};

export type TilemapController = ReturnType<typeof createTilemapController>;
