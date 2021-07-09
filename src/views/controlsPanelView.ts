import { map, throttleTime } from "rxjs/operators";
import { sharedController } from "../controllers/init";
const mapToString = map((value: number) => value.toFixed(3));

const get = (id: string) => {
  const elem = document.getElementById(id);
  if (elem == null) throw new Error(`Couln't find element by id ${id}`);
  return elem;
};
sharedController.angleFromSelectedTile$
  .pipe(mapToString, throttleTime(40))
  .subscribe((text) => {
    get("atan2").innerText = text;
  });

// sharedController.selectedAlgorithm$.pipe(mapToString).subscribe(text => {

// })
