import { combineLatest } from "rxjs";
import { map, tap } from "rxjs/operators";
import { InputManager } from "./inputManager";
import { TilemapConfig, TilemapController } from "./tilemapController";

export const createSharedController = (inputManager: InputManager, {clickTile$, tilemapSize$}: TilemapController) => {
    const selectedTile$ = clickTile$;

    const selectedTilePosition$ = combineLatest([
        tilemapSize$,
        selectedTile$,
    ]).pipe(
        map(
            ([{tileSize}, tile]) => ({x : (0.5 + tile.x) * tileSize, y : (0.5 + tile.y) * tileSize})
        )
    );

    const vectorFromSelectedTile$ = combineLatest([
        inputManager.pointerMove$,
        selectedTilePosition$,
    ]).pipe(map(([pointer, sourceTile]) => {
        return {x: pointer.x - sourceTile.x, y: pointer.y - sourceTile.y};
    }));

    const angleFromSelectedTile$ = vectorFromSelectedTile$.pipe(map((vec) => {
        return Math.atan2(vec.y, vec.x);
    }));

    return {
        selectedTile$,
        selectedTilePosition$,
        vectorFromSelectedTile$,
        angleFromSelectedTile$,
    }
}

export type SharedController = ReturnType<typeof createSharedController>;