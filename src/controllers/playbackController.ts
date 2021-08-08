import { combineLatest, interval, merge, of } from "rxjs";
import {
  map,
  mapTo,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs/operators";
import { InputController } from "./inputController";

export function createPlaybackController({
  play$,
  pause$,
  playbackSpeed$,
}: InputController) {
  const isPlaying$ = merge(
    play$.pipe(mapTo(true)),
    pause$.pipe(mapTo(false))
  ).pipe(startWith(false), shareReplay());

  const playbackInterval$ = playbackSpeed$.pipe(
    startWith(50),
    map((speed) => 510 - speed * 5)
  );

  const tickForward$ = combineLatest([isPlaying$, playbackInterval$]).pipe(
    switchMap(([isPlaying, playbackSpeed]) =>
      isPlaying ? interval(playbackSpeed) : of<void>()
    )
  );

  return { tickForward$ };
}

export type PlaybackController = ReturnType<typeof createPlaybackController>;
