import { Observable } from "rxjs";
import {
  distinctUntilChanged,
  flatMap,
  map,
  startWith,
  withLatestFrom,
  tap,
} from "rxjs/operators";

type Vector2 = {
  x: number;
  y: number;
};

export function createInputManager(scene: Phaser.Scene, tileSize: number) {
  const pointerMove$ = new Observable<Vector2>((subscriber) => {
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      subscriber.next({ x: pointer.x, y: pointer.y });
    });
  });
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

  const click$ = new Observable<void>((subscriber) => {
    scene.input.on("pointerdown", () => {
      subscriber.next();
    });
  });

  const clickTile$ = click$.pipe(
    withLatestFrom(pointerMoveToTile$),
    map(([_, nextTile]) => nextTile)
  );

  return {
    pointerMove$,
    clickTile$,
  };
}

export type InputManager = ReturnType<typeof createInputManager>;
