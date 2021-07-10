import { map, throttleTime } from "rxjs/operators";
import { inputController, sharedController } from "../controllers/init";
import { mapNumberToString } from "../utils";

const get = <T extends HTMLElement>(id: string): T => {
  const elem = document.getElementById(id);
  if (elem == null) throw new Error(`Couln't find element by id ${id}`);
  return elem as T;
};

sharedController.angleFromSelectedTile$
  .pipe(mapNumberToString, throttleTime(40))
  .subscribe((text) => {
    get("atan2").innerText = text;
  });

inputController.connectToElements({
  algorithm: get<HTMLSelectElement>("algorithm"),
});

inputController.algorithm$.subscribe((algorithm) => {
  get<HTMLSelectElement>("algorithm").value = algorithm;
});
