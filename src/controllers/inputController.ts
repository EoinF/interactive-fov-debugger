import { fromEvent, Observable, ReplaySubject, Subject } from "rxjs";
import { startWith } from "rxjs/operators";
import { Vector2 } from "../types";
import { mapTargetIntValue, mapTargetValue } from "../utils";

type LightCastAlgorithm = "RayCast" | "Twincast";

export function createInputController() {
  const pointerMove$ = new Subject<Vector2>();
  const click$ = new Subject<void>();
  const algorithm$ = new ReplaySubject<LightCastAlgorithm>(1);
  const play$ = new Subject<any>();
  const pause$ = new Subject<any>();
  const playbackSpeed$ = new ReplaySubject<number>(1);

  const connectToPhaserScene = (scene: Phaser.Scene) => {
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      pointerMove$.next(new Phaser.Math.Vector2(pointer.x, pointer.y));
    });

    scene.input.on("pointerdown", () => {
      click$.next();
    });
  };

  const connectToElements = (inputs: {
    algorithm: HTMLSelectElement;
    play: HTMLElement;
    pause: HTMLElement;
    playbackSpeed: HTMLInputElement;
  }) => {
    (
      fromEvent(inputs.algorithm, "change")
        .pipe(mapTargetValue)
        .pipe(startWith("RayCast")) as Observable<LightCastAlgorithm>
    ).subscribe(algorithm$);
    fromEvent(inputs.play, "click").subscribe(play$);
    fromEvent(inputs.pause, "click").subscribe(pause$);
    fromEvent(inputs.playbackSpeed, "click")
      .pipe(mapTargetIntValue, startWith(50))
      .subscribe(playbackSpeed$);
  };

  return {
    playbackSpeed$,
    pointerMove$,
    click$,
    algorithm$,
    play$,
    pause$,
    connectToPhaserScene,
    connectToElements,
  };
}

export type InputController = ReturnType<typeof createInputController>;
