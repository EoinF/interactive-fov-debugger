import { SharedController } from "../controllers/sharedController";
import { combineLatest, Subject } from "rxjs";
import { first, map } from "rxjs/operators";
import { TilemapController } from "../controllers/tilemapController";

export enum TileType {
    LIGHT_OVERLAY = 0,
    DARK_OVERLAY = 1,
    LIGHT_SOURCE = 2,
    FLOOR = 4,
}

type ViewObjects = {
    tilemap: Phaser.Tilemaps.Tilemap,
    mainLayer: Phaser.Tilemaps.TilemapLayer,
    lightLayer: Phaser.Tilemaps.TilemapLayer,
    selectionArrow: Phaser.GameObjects.Line,
}

export const tilemapView = (scene: Phaser.Scene, { tilemapSize$ }: TilemapController, { vectorFromSelectedTile$, selectedTilePosition$ }: SharedController) => {
    const viewObjects$ = new Subject<ViewObjects>();

    // tileChanged$.pipe(withLatestFrom(viewObjects$)).subscribe(([{ type, tile: { x, y } }, {mainLayer}]) => {
    //     mainLayer.putTileAt(type, x, y);
    // });
    
    combineLatest([
        selectedTilePosition$,
        vectorFromSelectedTile$,
        viewObjects$
    ]).subscribe(([tile, vec, {selectionArrow}]) => {
        selectionArrow.setTo(tile.x, tile.y, tile.x + vec.x, tile.y + vec.y);
    });

    tilemapSize$.pipe(first()).subscribe((tilemapSize) => {
        viewObjects$.next(init(scene, tilemapSize));
    });
};

const init = (scene: Phaser.Scene, { tilesX, tilesY, tileSize }: any): ViewObjects => {
    const emptyMap: number[][] = new Array(tilesY)
        .fill(undefined)
        .map(() => new Array(tilesX).fill(TileType.FLOOR));

    emptyMap[Math.floor(tilesY / 2)][Math.floor(tilesX / 2)] = TileType.LIGHT_SOURCE;

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
            lightLayer.putTileAt(TileType.DARK_OVERLAY, x, y);
        }
    }
    const midX = Math.floor(tilesX / 2);
    const midY = Math.floor(tilesY / 2);
    mainLayer.putTileAt(TileType.LIGHT_SOURCE, midX, midY);
    lightLayer.putTileAt(TileType.LIGHT_OVERLAY, midX, midY);

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

    const selectionArrow = scene.add.line(0, 0, 0, 0, 0, 0).setStrokeStyle(1, 0xffee55, 0.6);

    return { tilemap, mainLayer, lightLayer, selectionArrow };
}