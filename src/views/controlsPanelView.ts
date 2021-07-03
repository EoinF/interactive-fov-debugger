import { SharedController } from "../controllers/sharedController";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
const mapToString = map((value: number) => value.toPrecision(2));

type PanelBounds = {x: number, y: number, width: number, height: number};

const panelBackgroundColour = 0x224031;
const panelBorderColour = 0x1A3326;

const addLabelledField = (scene: Phaser.Scene, container: Phaser.GameObjects.Container, labelText: string, fieldText$: Observable<string>, offsetY: number = 10) => {
    const label = new Phaser.GameObjects.Text(scene, 0, offsetY, labelText, {});
    const field = new Phaser.GameObjects.Text(scene, 0, offsetY + label.height + 2, "", {});
    label.x = (container.width - label.width) / 2;
    field.x = (container.width - field.width) / 2;
    container.add(label);
    container.add(field);

    fieldText$.subscribe((fieldText) => {
        field.setText(fieldText);
        field.x = (container.width - field.width) / 2;
    })
}


export const controlsPanelView = (scene: Phaser.Scene, {x, y, width, height}: PanelBounds, sharedController: SharedController) => {
    const container = scene.add.container(x, y);
    container.width = width;
    container.height = height;
    container.add(new Phaser.GameObjects.Rectangle(scene, 1, 1, container.width - 2, container.height - 2, panelBackgroundColour).setStrokeStyle(1, panelBorderColour).setOrigin(0, 0));

    addLabelledField(scene, container, "Angle", sharedController.angleFromSelectedTile$.pipe(mapToString));
}
