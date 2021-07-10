import { combineLatest, Observable } from "rxjs";
import { flatMap, map, mergeMap } from "rxjs/operators";
import { InputController } from "./inputController";
import { TilemapController } from "./tilemapController";

type Line = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export const createRayLineController = (
  { lightSourceTile$, hoveredTile$, tilemapConfig$ }: TilemapController,
  { algorithm$ }: InputController
) => {
  const rayCastLines$ = combineLatest([
    lightSourceTile$,
    hoveredTile$,
    tilemapConfig$,
  ]).pipe(
    map(([lightSourceTile, hoveredTile, { tileSize }]) => {
      let toX = (0.5 + hoveredTile.x) * tileSize;
      let toY = (0.5 + hoveredTile.y) * tileSize;

      const fromX = (0.5 + lightSourceTile.x) * tileSize;
      const fromY = (0.5 + lightSourceTile.y) * tileSize;

      return [{ fromX, fromY, toX, toY }];
    })
  );

  const twinCastLines$ = combineLatest([
    lightSourceTile$,
    hoveredTile$,
    tilemapConfig$,
  ]).pipe(
    map(([lightSourceTile, hoveredTile, { tileSize }]) => {
      const vec = hoveredTile.clone().subtract(lightSourceTile);

      let corner1X = hoveredTile.x;
      let corner1Y = hoveredTile.y;
      let corner2X = hoveredTile.x;
      let corner2Y = hoveredTile.y;

      /* These corners are calculated from a truth table of:
            | vx | vy | x1 | x2 | y1 | y2 |
            | -1 | -1 |  0 | +1 | +1 |  0 |
            |  0 | -1 |  0 | +1 | +1 | +1 |
            | +1 | -1 |  0 | +1 |  0 | +1 |
            | +1 |  0 |  0 |  0 | +1 |  0 |
            | +1 | +1 |  0 | +1 | +1 |  0 |
            |  0 | +1 |  0 | +1 |  0 |  0 |
            | -1 | +1 |  0 | +1 |  0 | +1 |
            | -1 |  0 | +1 | +1 |  0 | +1 |
        */
      corner1X += vec.x < 0 && vec.y == 0 ? 1 : 0;
      corner1Y +=
        (vec.x <= 0 && vec.y < 0) || (vec.x > 0 && vec.y >= 0) ? 1 : 0;

      corner2X += vec.x <= 0 || vec.y != 0 ? 1 : 0;
      corner2Y +=
        (vec.x < 0 && vec.y >= 0) || (vec.x >= 0 && vec.y < 0) ? 1 : 0;

      const fromX = (0.5 + lightSourceTile.x) * tileSize;
      const fromY = (0.5 + lightSourceTile.y) * tileSize;

      return [
        { fromX, fromY, toX: corner1X * tileSize, toY: corner1Y * tileSize },
        { fromX, fromY, toX: corner2X * tileSize, toY: corner2Y * tileSize },
      ];
    })
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

  return {
    lines$,
  };
};

export type RayLineController = ReturnType<typeof createRayLineController>;
