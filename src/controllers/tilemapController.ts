import { combineLatest, Observable, ReplaySubject } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  scan,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs/operators";
import { rayCast } from "../rayCast/rayCast";
import { twinCast } from "../twinCast/twinCast";
import { LightCastCommand, TilemapConfig } from "../types";
import { InputController } from "./inputController";
import { PlaybackController } from "./playbackController";

export const createTilemapController = (
  { algorithm$, click$, pointerMove$ }: InputController,
  { tick$ }: PlaybackController
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

  const tileMapCommands$: Observable<LightCastCommand[]> = combineLatest([
    algorithm$,
    lightSourceTile$,
    tilemapConfig$,
  ]).pipe(
    switchMap(([algorithm, lightSourceTile, tilemapConfig]) => {
      console.log("commands switch to", algorithm);
      return algorithm === "RayCast"
        ? rayCast(lightSourceTile, tilemapConfig)
        : twinCast(lightSourceTile, tilemapConfig);
    })
  );

  const nextCommand$: Observable<LightCastCommand> = tileMapCommands$.pipe(
    switchMap((commands) => {
      const firstCommand = { type: "resetLights" } as LightCastCommand;
      return tick$.pipe(
        mapTo(true),
        scan(
          ({ forwardBuffer, backwardBuffer, current }, isForward) => {
            const next = isForward ? forwardBuffer[0] : backwardBuffer[0];
            if (next !== undefined) {
              return {
                forwardBuffer: isForward
                  ? [...forwardBuffer.slice(1)]
                  : [...forwardBuffer, current],
                backwardBuffer: isForward
                  ? [...backwardBuffer, current]
                  : [...backwardBuffer.slice(1)],
                current: next,
              };
            } else {
              return { forwardBuffer, backwardBuffer, current };
            }
          },
          {
            current: firstCommand,
            forwardBuffer: commands,
            backwardBuffer: [] as LightCastCommand[],
          }
        ),
        filter(({ current }) => current !== undefined),
        map(({ current }) => current),
        startWith(firstCommand)
      );
    }),
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
