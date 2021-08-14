import { combineLatest, interval, merge, of } from "rxjs";
import { map, mapTo, shareReplay, startWith, switchMap } from "rxjs/operators";
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
    map((speed) => 510 - speed * 5)
  );

  const tick$ = combineLatest([isPlaying$, playbackInterval$]).pipe(
    switchMap(([isPlaying, playbackSpeed]) =>
      isPlaying ? interval(playbackSpeed) : of<void>()
    )
  );

  return { tick$ };
}

export type PlaybackController = ReturnType<typeof createPlaybackController>;
