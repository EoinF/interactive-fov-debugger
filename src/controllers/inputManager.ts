import { Observable } from "rxjs";

export type Vector2 = {
  x: number;
  y: number;
};

export function createInputManager(scene: Phaser.Scene) {
  const pointerMove$ = new Observable<Vector2>((subscriber) => {
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      subscriber.next({ x: pointer.x, y: pointer.y });
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
