import { from, merge, Observable, of } from "rxjs";
import { concatMap, map, switchMap, take, toArray } from "rxjs/operators";
import {
  LightCastCommand,
  SetLightCommand,
  SetLinesCommand,
  TilemapConfig,
  Vector2,
} from "../types";
import { lineGenerator } from "./lineGenerator";

export const rayCast = (
  lightSourceTile: Vector2,
  { tileSize }: TilemapConfig
) => {
  const rayCastLines$: Observable<Vector2> = of(lightSourceTile).pipe(
    switchMap((tile) => {
      const lines: Vector2[] = [];
      const range = 5;
      for (let i = -range; i <= +range; i++) {
        const destTile = tile.clone().add({ x: i, y: -range });
        lines.push(destTile);
      }
      for (let j = -range + 1; j < range; j++) {
        const destTile = tile.clone().add({ x: -range, y: j });
        lines.push(destTile);
      }
      for (let i = -range; i <= +range; i++) {
        const destTile = tile.clone().add({ x: i, y: +range });
        lines.push(destTile);
      }
      for (let j = -range + 1; j < range; j++) {
        const destTile = tile.clone().add({ x: +range, y: j });
        lines.push(destTile);
      }
      return from(lines);
    })
  );

  const commands$: Observable<LightCastCommand> = rayCastLines$.pipe(
    concatMap((destTile) => {
      let toX = (0.5 + destTile.x) * tileSize;
      let toY = (0.5 + destTile.y) * tileSize;

      const fromX = (0.5 + lightSourceTile.x) * tileSize;
      const fromY = (0.5 + lightSourceTile.y) * tileSize;

      const setLines$: Observable<SetLinesCommand> = of({
        type: "setLines",
        lines: [{ fromX, fromY, toX, toY }],
      });
      const setLights$: Observable<SetLightCommand> = lineGenerator(
        lightSourceTile,
        destTile
      ).pipe(
        take(100),
        map(({ x, y }) => {
          return {
            type: "setLight",
            tileX: x,
            tileY: y,
          };
        })
      );
      return merge(setLines$, setLights$);
    })
  );

  const rayCastCommands$: Observable<LightCastCommand[]> = commands$.pipe(
    toArray()
  );

  return rayCastCommands$;
};
