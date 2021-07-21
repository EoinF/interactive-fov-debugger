import { combineLatest, generate, merge, Observable, of } from "rxjs";
import {
  endWith,
  map,
  skip,
  switchMap,
  take,
  mapTo,
  tap,
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
  const setLightCommands$: Observable<SetLightCommand> = combineLatest([
    selectedTile$,
    lightSourceTile$,
    tilemapConfig$,
  ]).pipe(
    switchMap(([selectedTile, lightSourceTile]) =>
      lineGenerator(lightSourceTile, selectedTile).pipe(take(100))
    ),
    map(({ x, y }) => {
      return {
        type: "setLight",
        tileX: x,
        tileY: y,
      };
    }),
    tap(console.log)
  );

  const resetLightsCommands$: Observable<ResetLightsCommand> = merge(
    of({
      type: "resetLights",
    } as ResetLightsCommand),
    selectedTile$.pipe(
      mapTo({
        type: "resetLights",
      } as ResetLightsCommand)
    )
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
