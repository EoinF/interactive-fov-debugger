import { Observable } from "rxjs";

export function createInputManager(scene: Phaser.Scene) {
  const pointerMove$ = new Observable<Vector2>((subscriber) => {
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      subscriber.next(new Phaser.Math.Vector2(pointer.x, pointer.y));
    });
  });

  const click$ = new Observable<void>((subscriber) => {
    scene.input.on("pointerdown", () => {
      subscriber.next();
    });
  });

  return {
    pointerMove$,
    click$,
  };
}

export type InputManager = ReturnType<typeof createInputManager>;
