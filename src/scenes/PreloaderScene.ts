import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload(): void {
    this.load.image("tiles", "assets/tiles.png");
  }

  create(): void {
    this.scene.start("initial");
  }
}
