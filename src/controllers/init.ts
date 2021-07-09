import { createInputController } from "./inputController";
import { createSharedController } from "./sharedController";
import { createTilemapController } from "./tilemapController";

const inputController = createInputController();
const tilemapController = createTilemapController(inputController);
const sharedController = createSharedController(
  inputController,
  tilemapController
);

export { inputController, sharedController, tilemapController };
