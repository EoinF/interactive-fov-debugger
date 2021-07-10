import { createInputController } from "./inputController";
import { createRayLineController } from "./rayLineController";
import { createSharedController } from "./sharedController";
import { createTilemapController } from "./tilemapController";

const inputController = createInputController();
const tilemapController = createTilemapController(inputController);
const sharedController = createSharedController(
  inputController,
  tilemapController
);
const rayLineController = createRayLineController(
  tilemapController,
  inputController
);

export {
  inputController,
  sharedController,
  tilemapController,
  rayLineController,
};
