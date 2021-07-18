import { combineLatest, generate, merge, Observable } from "rxjs";
import { endWith, map, skip, switchMap, take } from "rxjs/operators";
import {
  LightCastCommand,
  ResetLightsCommand,
  SetLightCommand,
  TilemapConfig,
  Vector2,
  SetLinesCommand,
} from "../types";

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
      bresenhamLineGenerator$(lightSourceTile, selectedTile).pipe(take(100))
    ),
    map(({ x, y }) => {
      return {
        type: "setLight",
        tileX: x,
        tileY: y,
      };
    })
  );

  const resetLightsCommands$: Observable<ResetLightsCommand> =
    selectedTile$.pipe(
      skip(1),
      map(() => ({
        type: "resetLights",
      }))
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

type BresenhamLineConfig = {
  deltaX: number;
  deltaY: number;
  xStep: number;
  yStep: number;
  isSteep: boolean;
  startState: { x: number; y: number; error: number };
};

const getBresenhamLineConfig = (
  from: Vector2,
  to: Vector2
): BresenhamLineConfig => {
  const isSteep = Math.abs(to.y - from.y) > Math.abs(to.x - from.x);
  let fromX = isSteep ? from.y : from.x;
  let fromY = isSteep ? from.x : from.y;
  let toX = isSteep ? to.y : to.x;
  let toY = isSteep ? to.x : to.y;

  const deltaX = Math.abs(toX - fromX);
  const deltaY = Math.abs(toY - fromY);

  const xStep = fromY > toX ? -1 : 1;
  const yStep = fromY > toY ? -1 : 1;

  return {
    deltaX,
    deltaY,
    xStep,
    yStep,
    isSteep,
    startState: { x: fromX, y: fromY, error: deltaX * 0.5 },
  };
};

const bresenhamLineGenerator$ = (
  from: Vector2,
  to: Vector2
): Observable<{ x: number; y: number }> => {
  const { startState, deltaX, deltaY, xStep, yStep, isSteep } =
    getBresenhamLineConfig(from, to);
  console.log(`line from ${from.x},${from.y} to ${to.x},${to.y}`);

  const compareSteep = ({ x }: { x: number }) => x != to.y;

  const compareNormal = ({ x }: { x: number }) => x != to.x;

  const shouldContinue = isSteep ? compareSteep : compareNormal;

  return generate(startState, shouldContinue, ({ x, y, error }) => {
    let currentY = y;
    error -= deltaY;
    if (error < 0) {
      currentY += yStep;
      error += deltaX;
    }

    return { x: x + xStep, y: currentY, error };
  }).pipe(
    map(({ x, y }) => (isSteep ? { x: y, y: x } : { x, y })),
    endWith({ x: to.x, y: to.y })
  );
};
