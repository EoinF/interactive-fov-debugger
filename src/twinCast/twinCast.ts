import { Observable, of } from "rxjs";
import { map, toArray } from "rxjs/operators";
import {
  LightCastCommand,
  SetLinesCommand,
  TilemapConfig,
  Vector2,
} from "../types";

export const twinCast = (
  lightSourceTile: Vector2,
  { tileSize }: TilemapConfig
) => {
  const setLinesCommands$: Observable<SetLinesCommand> = of(
    lightSourceTile
  ).pipe(
    map((from) => {
      const to = new Phaser.Math.Vector2(4, 3);
      const vec = to.clone().subtract(from);

      let corner1X = to.x;
      let corner1Y = to.y;
      let corner2X = to.x;
      let corner2Y = to.y;

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

  const twinCastCommands$: Observable<LightCastCommand[]> =
    setLinesCommands$.pipe(toArray());

  return twinCastCommands$;
};
