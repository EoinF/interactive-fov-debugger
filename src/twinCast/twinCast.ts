import { combineLatest, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import {
  Vector2,
  TilemapConfig,
  LightCastCommand,
  SetLinesCommand,
} from "../types";

export const twinCast = (
  lightSourceTile$: Observable<Vector2>,
  selectedTile$: Observable<Vector2>,
  tilemapConfig$: Observable<TilemapConfig>
) => {
  const setLinesCommands$: Observable<SetLinesCommand> = combineLatest([
    lightSourceTile$,
    selectedTile$,
    tilemapConfig$,
  ]).pipe(
    map(([lightSourceTile, tile, { tileSize }]) => {
      const vec = tile.clone().subtract(lightSourceTile);

      let corner1X = tile.x;
      let corner1Y = tile.y;
      let corner2X = tile.x;
      let corner2Y = tile.y;

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

      return {
        type: "setLines",
        lines: [
          { fromX, fromY, toX: corner1X * tileSize, toY: corner1Y * tileSize },
          { fromX, fromY, toX: corner2X * tileSize, toY: corner2Y * tileSize },
        ],
      };
    })
  );

  const twinCastCommands$: Observable<LightCastCommand> = setLinesCommands$;

  return {
    twinCastCommands$,
  };
};
