import { createInputController } from "./inputController";
import { createPlaybackController } from "./playbackController";
import { createSharedController } from "./sharedController";
import { createTilemapController } from "./tilemapController";

const inputController = createInputController();
const playbackController = createPlaybackController(inputController);
const tilemapController = createTilemapController(
  inputController,
  playbackController
);
const sharedController = createSharedController(
  inputController,
  tilemapController
);

export {
  inputController,
  sharedController,
  tilemapController,
  playbackController,
};
