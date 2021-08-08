import { interval, merge, of } from "rxjs";
import { mapTo, startWith, switchMap } from "rxjs/operators";
import { InputController } from "./inputController";

export function createPlaybackController({ play$, pause$ }: InputController) {
  const isPlaying$ = merge(
    play$.pipe(mapTo(true)),
    pause$.pipe(mapTo(false))
  ).pipe(startWith(false));

  const tickForward$ = isPlaying$.pipe(
    switchMap((isPlaying) => (isPlaying ? interval(150) : of<void>()))
  );

  return { tickForward$ };
}

export type PlaybackController = ReturnType<typeof createPlaybackController>;
