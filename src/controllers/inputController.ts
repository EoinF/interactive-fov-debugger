import { Subject } from "rxjs";

export function createInputController() {
  const pointerMove$ = new Subject<Vector2>();
  const click$ = new Subject<void>();

  const connectToPhaserScene = (scene: Phaser.Scene) => {
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      pointerMove$.next(new Phaser.Math.Vector2(pointer.x, pointer.y));
    });

    scene.input.on("pointerdown", () => {
      click$.next();
    });
  };

  return {
    pointerMove$,
    click$,
    connectToPhaserScene,
  };
}

export type InputManager = ReturnType<typeof createInputController>;
