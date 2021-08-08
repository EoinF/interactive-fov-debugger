import { map } from "rxjs/operators";

export const mapNumberToString = map((value: number) => value.toFixed(3));

export const mapTargetValue = map(
  (event: Event) => (event.target as HTMLInputElement).value
);

export const mapTargetIntValue = map((event: Event) =>
  parseInt((event.target as HTMLInputElement).value)
);
