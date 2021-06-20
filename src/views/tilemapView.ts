import { TilemapController, TilemapSize$ } from "../controllers/tilemapController";
import { first, map, share, shareReplay, withLatestFrom } from "rxjs/operators";
import { combineLatest } from "rxjs";

export const tilemapView = (scene: Phaser.Scene, { tileChanged$, tilemapSize$ }: TilemapController) => {
    const { tilemap$, mainLayer$ } = init(scene, tilemapSize$);

    tileChanged$.pipe(withLatestFrom(mainLayer$)).subscribe(([{ type, tile: { x, y } }, mainLayer]) => {
        mainLayer.putTileAt(type, x, y);
    });
};

const init = (scene: Phaser.Scene, tilemapSize$: TilemapSize$) => {
    const initialTilemapConfig$ = tilemapSize$.pipe(first());

    const tilemap$ = initialTilemapConfig$.pipe(
        map(({ tilesX, tilesY, tileSize }) => {
            const emptyMap: number[][] = new Array(tilesY)
                .fill(undefined)
                .map(() => new Array(tilesX).fill(0));

            emptyMap[Math.floor(tilesY / 2)][Math.floor(tilesX / 2)] = 2;

            return scene.make.tilemap({
                data: emptyMap,
                tileWidth: tileSize,
                tileHeight: tileSize,
                width: tilesX,
                height: tilesY,
            });
        }),
        shareReplay()
    );
    const mainLayer$ = combineLatest([
        initialTilemapConfig$,
        tilemap$
    ]).pipe(
        map(([_, tilemap]) => {
            const tileset = tilemap.addTilesetImage("tiles", undefined, 32, 32, 0, 0);
            return tilemap.createLayer(0, tileset, 0, 0);
        }),
        shareReplay()
    );

    combineLatest([
        initialTilemapConfig$,
        mainLayer$
    ])
        .subscribe(([{ tilesX, tilesY, tileSize }]) => {
            const gridWidth = tilesX * tileSize;
            const gridHeight = tilesY * tileSize;

            scene.add.grid(
                gridWidth / 2,
                gridHeight / 2,
                gridWidth,
                gridHeight,
                tileSize,
                tileSize,
                0xffffff,
                0,
                0x888888,
                0.5
            );
        });

    return { tilemap$, mainLayer$ };
}