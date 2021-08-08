import { combineLatest, from, merge, Observable, of, Subject } from "rxjs";
import {
  map,
  switchMap,
  take,
  mapTo,
  tap,
  concatMap,
  withLatestFrom,
  shareReplay,
  mergeMap,
} from "rxjs/operators";
import {
  LightCastCommand,
  ResetLightsCommand,
  SetLightCommand,
  TilemapConfig,
  Vector2,
  SetLinesCommand,
} from "../types";
import { lineGenerator } from "./lineGenerator";

export const rayCast = (
  lightSourceTile$: Observable<Vector2>,
  selectedTile$: Observable<Vector2>,
  tilemapConfig$: Observable<TilemapConfig>
) => {
  const rayCastLines$: Observable<Vector2> = lightSourceTile$.pipe(
    switchMap((lightSourceTile) => {
      const lines: Vector2[] = [];
      const range = 5;
      for (let i = -range; i <= +range; i++) {
        const destTile = lightSourceTile.clone().add({ x: i, y: -range });
        lines.push(destTile);
      }
      for (let j = -range + 1; j < range; j++) {
        const destTile = lightSourceTile.clone().add({ x: -range, y: j });
        lines.push(destTile);
      }
      for (let i = -range; i <= +range; i++) {
        const destTile = lightSourceTile.clone().add({ x: i, y: +range });
        lines.push(destTile);
      }
      for (let j = -range + 1; j < range; j++) {
        const destTile = lightSourceTile.clone().add({ x: +range, y: j });
        lines.push(destTile);
      }
      return from(lines);
    })
  );

  const setLightCommands$: Observable<SetLightCommand> = rayCastLines$.pipe(
    withLatestFrom(lightSourceTile$),
    concatMap(([destTile, lightSourceTile]) => {
      return lineGenerator(lightSourceTile, destTile).pipe(take(100));
    }),
    map(({ x, y }) => {
      return {
        type: "setLight",
        tileX: x,
        tileY: y,
      };
    })
  );

  const resetLightsCommands$: Observable<ResetLightsCommand> = merge(
    of({
      type: "resetLights",
    } as ResetLightsCommand)
  );

  const setLinesCommands$: Observable<SetLinesCommand> = combineLatest([
    lightSourceTile$,
    selectedTile$,
    tilemapConfig$,
  ]).pipe(
    map(([lightSourceTile, selectedTile, { tileSize }]) => {
      let toX = (0.5 + selectedTile.x) * tileSize;
      let toY = (0.5 + selectedTile.y) * tileSize;

      const fromX = (0.5 + lightSourceTile.x) * tileSize;
      const fromY = (0.5 + lightSourceTile.y) * tileSize;

      return { type: "setLines", lines: [{ fromX, fromY, toX, toY }] };
    })
  );

  const rayCastCommands$: Observable<LightCastCommand> = merge(
    resetLightsCommands$,
    setLinesCommands$,
    setLightCommands$
  );

  return { rayCastCommands$ };
};
