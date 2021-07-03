import { InputManager, Vector2 } from "./inputManager";
import {
    distinctUntilChanged,
    map,
    share,
    startWith,
    withLatestFrom,
} from "rxjs/operators";
import { of } from "rxjs";

export type TilemapConfig = {
    tilesX: number;
    tilesY: number;
    tileSize: number;
};

export const createTilemapController = (
    { tilesX, tilesY, tileSize }: TilemapConfig,
    { click$, pointerMove$ }: InputManager
) => {
    const pointerMoveToTile$ = pointerMove$.pipe(
        map(
            ({ x, y }) =>
            ({
                x: Math.floor(x / tileSize),
                y: Math.floor(y / tileSize),
            } as Vector2)
        ),
        distinctUntilChanged(
            (next, previous) => next.x === previous.x && next.y === previous.y
        ),
        startWith({ x: -1, y: -1 } as Vector2)
    );
    const clickTile$ = click$.pipe(
        withLatestFrom(pointerMoveToTile$),
        map(([_, nextTile]) => nextTile)
    );

    // const tileChanged$ = clickTile$.pipe(
    //     map(tile => ({ tile, type: 3 })),
    //     share()
    // );

    const tilemapSize$ = of({ tilesX, tilesY, tileSize }).pipe(share())

    return {
        // tileChanged$,
        tilemapSize$,
        clickTile$
    }
};

export type TilemapController = ReturnType<typeof createTilemapController>;
export type TilemapSize$ = ReturnType<typeof createTilemapController>["tilemapSize$"];