import * as THREE from "three";
import CanvasHelper from "./canvas_helper.js";

class BaseTool {
  constructor(config, properties) {
    this.config = config;
    this.properties = properties;
  }
  properties;

  id() { return (this.properties || {}).id || "" }
  down(_texture, _part, _x, _y, _pointerButton) {}
  move(_part, _x, _y, _pointerButton) {}
  up(_x, _y) {}
  check(_parts, _event) { return true; }
  
  getCursorStyle(editor) {
    const layer = editor.layers.getSelectedLayer();
    if (!layer?.visible) {
      return "not-allowed"
    }

    return "crosshair"
  };

  tempCanvas() {
    return new CanvasHelper();
  }

  canvasToTexture(canvas) {
    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    return texture;
  }
}

export { BaseTool };