import Config from "../config.js";
import Color from "color";
import { getRandomInt, pickFromArray } from "../../helpers.js";

function saveColor(color) {
  return color.hexa();
}

function loadColor(color) {
  return new Color(color);
}

const VALUE_MAP = {
  size: {default: 1, persistence: true},
  shape: {default: "square", persistence: true},
  color: {default: new Color("#E8453C"), persistence: {save: saveColor, load: loadColor}},
  camo: {default: false, persistence: true},
  blend: {default: false, persistence: true},
  "blend-palette": {default: [], persistence: true},
  force: {default: 5, persistence: true},
  mirror: {default: false, persistence: true},
  shadeStyle: {default: "lighten", persistence: true},
  shadeLighten:  {default: false, persistence: true},
  shadeOnce: {default: false, persistence: true},
  fillStyle: {default: "fill-cube-connected", persistence: true},
  bucketErase: {default: false, persistence: true},
  sculptFlatten: {default: false, persistence: true},
}

class ToolConfig extends Config {
  constructor() {
    super("ncrs-tool-config", VALUE_MAP);
  }

  getColor() {
    let color = this.get("color");

    if (this.get("blend")) {
      const palette = this.get("blend-palette", [color.hex()]);

      color = new Color(pickFromArray(palette));
    }

    if (this.get("camo")) {
      let rand = getRandomInt(50);
      rand -= 25;
      rand /= 100;
      
      color = color.lighten(rand);
    }

    return color;
  }
}

export default ToolConfig;
