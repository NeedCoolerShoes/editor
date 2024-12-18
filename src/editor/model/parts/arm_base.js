import { BasePart } from "../base";

class ArmBasePart extends BasePart {
  static models = ["classic", "slim"];

  constructor(texture) {
    super(texture);
  }

  size() {
    const width = 0.5;

    return {
      base: [width, 1.5, 0.5],
      overlay: [width + 0.0625, 1.5625, 0.5625]
    }
  }
}

export {ArmBasePart}