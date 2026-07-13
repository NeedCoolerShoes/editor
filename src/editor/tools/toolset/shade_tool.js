import { msg } from "@lit/localize";
import BrushBaseTool from "../brush_tool.js";

// Scales the force
const SHADE_SCALAR = 5;

class ShadeTool extends BrushBaseTool {
  constructor(config) {
    super(config, {
      id: "shade",
      icon: "shading",
      name: msg(`Shade`, {id:`tool.shade.tooltip.name`})+" [S]",
      description: msg(`Makes pixels lighter/darker or adjusts their color based on the palette.\nUse the left mouse button to darken, and the right mouse button to lighten.`, {id:`tool.shade.description`}),
      providesColor: false, // Whether or not drawing with this tool adds to recent colors.,
      disableMirror: true, // Whether to disable the mirror.
      desktopLayout: true,
      mobileLayout: true,
    });
  }

  _visited = new Set();
  _lastPixel = "";
  _unsetLightenOnUp = false;

  down(toolData) {
    this._checkDarken(toolData);
    this.shade(toolData);

    return toolData.texture.toTexture();
  }

  move(toolData) {
    this._checkDarken(toolData);
    this.shade(toolData);

    return toolData.texture.toTexture();
  }

  up() {
    super.up();

    this._visited.clear();
    this._lastPixel = "";
    
    if (this._unsetLightenOnUp) {
      this.config.set("shadeLighten", false);
      this._unsetLightenOnUp = false;
    }
  }

  shade(toolData) {
    const texture = toolData.texture;
    const point = toolData.getCoords();
    this.cursor = point;
    
    const force = this.config.get("force", 1) * SHADE_SCALAR;
    const shadeOnce = this.config.get("shadeOnce", false);
    const shadeStyle = this.config.get("shadeStyle", "lighten");
    const lighten = !this.config.get("shadeLighten", false);

    const pointStr = `${point.x}:${point.y}`;
    if (shadeOnce && this._visited.has(pointStr)) { return; }
    if (this._lastPixel === pointStr) { return; }

    function getColor(point) {
      let color = texture.getPixel(point);
      
      if (shadeStyle === "saturate") {
        const scalar = 0.01;
        color = lighten ? color.saturate(force * scalar) : color.desaturate(force * scalar);
      } else {
        color.color[0] = lighten ? color.color[0]-force : color.color[0]+force;
        color.color[1] = lighten ? color.color[1]-force : color.color[1]+force;
        color.color[2] = lighten ? color.color[2]-force : color.color[2]+force;
      }

      return color;
    }

    this.draw(texture, toolData.parts[0], point, getColor, toolData.variant);

    this._visited.add(pointStr);
    this._lastPixel = pointStr;
  }

  _checkDarken(toolData) {
    if (this._unsetLightenOnUp || this.config.get("shadeLighten", false)) return;
    if (toolData.button !== 2) return;

    this.config.set("shadeLighten", true);
    this._unsetLightenOnUp = true;
  }
}

export default ShadeTool;
