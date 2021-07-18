import { fromEvent, Observable, ReplaySubject, Subject } from "rxjs";
import { Vector2 } from "../types";
import { mapTargetValue } from "../utils";

type LightCastAlgorithm = "RayCast" | "Twincast";

export function createInputController() {
  const pointerMove$ = new Subject<Vector2>();
  const click$ = new Subject<void>();
  const algorithm$ = new ReplaySubject<LightCastAlgorithm>();

  const connectToPhaserScene = (scene: Phaser.Scene) => {
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      pointerMove$.next(new Phaser.Math.Vector2(pointer.x, pointer.y));
    });

    scene.input.on("pointerdown", () => {
      click$.next();
    });
  };

  const connectToElements = (inputs: { algorithm: HTMLSelectElement }) => {
    const algorithmChange$ = fromEvent(inputs.algorithm, "change").pipe(
      mapTargetValue
    ) as Observable<LightCastAlgorithm>;
    algorithmChange$.subscribe(algorithm$);
    algorithm$.next("RayCast");
  };

  return {
    pointerMove$,
    click$,
    algorithm$,
    connectToPhaserScene,
    connectToElements,
  };
}

export type InputController = ReturnType<typeof createInputController>;
