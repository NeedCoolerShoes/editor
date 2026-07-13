import { msg } from "@lit/localize";
import Color from "color";
import BrushBaseTool from "../brush_tool.js";

class SculptTool extends BrushBaseTool {
  constructor(config) {
    super(config, {
      id: "sculpt",
      icon: "sculpt",
      name: msg(`Sculpt`, {id:`tool.sculpt.tooltip.name`})+" [Shift+S]",
      description: msg(`Copy pixels from base layer to overlay.\nOnly works when overlay is visible.\nUse the left mouse copy pixels up, and the right mouse button to copy them down.`, {id:`tool.sculpt.description`}),
      providesColor: false, // Whether or not drawing with this tool adds to recent colors.
      desktopLayout: true,
      mobileLayout: true,
    });
  }
  _unsetFlattenOnUp = false;

  down(toolData) {
    return this.process(toolData);
  }

  move(toolData) {
    return this.process(toolData);
  }

  getCursorStyle(editor) {
    const cursor = super.getCursorStyle(editor);

    if (cursor === "crosshair" && !editor.config.get("overlayVisible", false)) {
      return "not-allowed";
    } else {
      return cursor;
    }
  }

  process(toolData) {
    this._checkFlatten(toolData);

    const texture = toolData.texture;
    const colorTexture = this.config.get("sculptGlobal", true) ? toolData.globalTexture : toolData.texture;
    const part = toolData.parts[0];
    const point = toolData.getCoords();

    this.cursor = point;

    const flatten = this.config.get("sculptFlatten", false);

    function getColor(offsetX, offsetY) {
      return function (pos) {
        const currentColor = colorTexture.getPixel(pos);
        if (currentColor.valpha !== 0) { return currentColor; }

        return colorTexture.getPixel({x: pos.x + offsetX, y: pos.y + offsetY})
      };
    }

    function getColor2(pos) {
      const currentColor = colorTexture.getPixel({x: point.x + pos.offsetX, y: point.y + pos.offsetY});

      if (currentColor.valpha === 0) { return colorTexture.getPixel(pos); }

      return currentColor;
    }

    const alphaIsZero = texture.getPixel({ x: point.x, y: point.y }).valpha === 0;

    if (point.x >= 32 && point.x <= 64 && point.y >= 0 && point.y <= 15 && !flatten && alphaIsZero) {
      // Head
      this.draw(texture, part, point, getColor(-32, 0), toolData.variant, false);
    }
    else if (point.x >= 0 && point.x <= 55 && point.y >= 32 && point.y <= 47 && !flatten && alphaIsZero) {
      // Right Arm, Right Leg and Torso
      this.draw(texture, part, point, getColor(0, -16), toolData.variant, false);
    }
    else if (point.x >= 0 && point.x <= 15 && point.y >= 48 && point.y <= 63 && !flatten && alphaIsZero) {
      // Left Leg
      this.draw(texture, part, point, getColor(16, 0), toolData.variant, false);
    }
    else if (point.x >= 48 && point.x <= 63 && point.y >= 48 && point.y <= 63 && !flatten && alphaIsZero) {
      // Left Arm
      this.draw(texture, part, point, getColor(-16, 0), toolData.variant, false);
    }

    else if (point.x >= 32 && point.x <= 64 && point.y >= 0 && point.y <= 15 && flatten && !alphaIsZero) {
      // Head
      this.draw(texture, part, { x: point.x-32, y: point.y }, getColor2, toolData.variant, false);
      this.draw(texture, part, point, new Color(0).alpha(0), toolData.variant, false);
    }
    else if (point.x >= 0 && point.x <= 55 && point.y >= 32 && point.y <= 47 && flatten && !alphaIsZero) {
      // Right Arm, Right Leg and Torso
      this.draw(texture, part, { x: point.x, y: point.y-16 }, getColor2, toolData.variant, false);
      this.draw(texture, part, point, new Color(0).alpha(0), toolData.variant, false);
    }
    else if (point.x >= 0 && point.x <= 15 && point.y >= 48 && point.y <= 63 && flatten && !alphaIsZero) {
      // Left Leg
      this.draw(texture, part, { x: point.x+16, y: point.y }, getColor2, toolData.variant, false);
      this.draw(texture, part, point, new Color(0).alpha(0), toolData.variant, false);
    }
    else if (point.x >= 48 && point.x <= 63 && point.y >= 48 && point.y <= 63 && flatten && !alphaIsZero) {
      // Left Arm
      this.draw(texture, part, { x: point.x-16, y: point.y }, getColor2, toolData.variant, false);
      this.draw(texture, part, point, new Color(0).alpha(0), toolData.variant, false);
    }

    return texture.toTexture();
  }

  up() {
    super.up();

    if (this._unsetFlattenOnUp) {
      this.config.set("sculptFlatten", false);
      this._unsetFlattenOnUp = false;
    }
  }

  _checkFlatten(toolData) {
    if (this._unsetFlattenOnUp || this.config.get("sculptFlatten", false)) return;
    if (toolData.button !== 2) return;

    this.config.set("sculptFlatten", true);
    this._unsetFlattenOnUp = true;
  }
}

export default SculptTool;
