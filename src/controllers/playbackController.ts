import { interval, merge, of } from "rxjs";
import { mapTo, shareReplay, startWith, switchMap } from "rxjs/operators";
import { InputController } from "./inputController";

export function createPlaybackController({ play$, pause$ }: InputController) {
  const isPlaying$ = merge(
    play$.pipe(mapTo(true)),
    pause$.pipe(mapTo(false))
  ).pipe(startWith(false), shareReplay());

  const tickForward$ = isPlaying$.pipe(
    switchMap((isPlaying) => (isPlaying ? interval(100) : of<void>()))
  );

  return { tickForward$ };
}

export type PlaybackController = ReturnType<typeof createPlaybackController>;
