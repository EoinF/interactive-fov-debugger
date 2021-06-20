import { Subject } from "rxjs";
import { first, withLatestFrom } from "rxjs/operators";
import { TilemapController } from "../controllers/tilemapController";

type ViewObjects = {
    tilemap: Phaser.Tilemaps.Tilemap,
    mainLayer: Phaser.Tilemaps.TilemapLayer,
    lightLayer: Phaser.Tilemaps.TilemapLayer
}

export const tilemapView = (scene: Phaser.Scene, { tileChanged$, tilemapSize$ }: TilemapController) => {
    const viewObjects$ = new Subject<ViewObjects>();

    tileChanged$.pipe(withLatestFrom(viewObjects$)).subscribe(([{ type, tile: { x, y } }, {mainLayer}]) => {
        mainLayer.putTileAt(type, x, y);
    });
    tilemapSize$.pipe(first()).subscribe((tilemapSize) => {
        viewObjects$.next(init(scene, tilemapSize));
    });
};

const init = (scene: Phaser.Scene, { tilesX, tilesY, tileSize }: any): ViewObjects => {
    const emptyMap: number[][] = new Array(tilesY)
        .fill(undefined)
        .map(() => new Array(tilesX).fill(4));

    emptyMap[Math.floor(tilesY / 2)][Math.floor(tilesX / 2)] = 2;

    const tilemap = scene.make.tilemap({
        key: "123",
        data: emptyMap,
        tileWidth: tileSize,
        tileHeight: tileSize,
        width: tilesX,
        height: tilesY,
    });
    const tileset = tilemap.addTilesetImage("tiles", undefined, 32, 32, 0, 0);
    const mainLayer = tilemap.createLayer(0, tileset, 0, 0);
    const lightLayer = tilemap.createBlankLayer("lights", tileset, 0, 0);
    for (let y = 0; y < emptyMap.length; y++) {
        for (let x = 0; x < emptyMap[y].length; x++) {
            lightLayer.putTileAt(1, x, y);
        }
    }
    const midX = Math.floor(tilesX / 2);
    const midY = Math.floor(tilesY / 2);
    mainLayer.putTileAt(2, midX, midY);
    lightLayer.putTileAt(0, midX, midY);

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
        0x0,
        0.2
    );

    return { tilemap, mainLayer, lightLayer };
}