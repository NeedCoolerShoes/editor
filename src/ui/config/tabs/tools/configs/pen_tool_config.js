import { html, nothing } from "lit";
import BaseToolConfig from "./base_tool_config";

class PenToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ];

  static properties = {
    size: {},
    shape: {},
    mirror: {},
    camo: {},
    blend: {},
  }

  constructor(config) {
    super(config, {
      size: {
        type: "select", number: true,
        options: [{icon: "size-1", value: 1}, {icon: "size-2", value: 2}, {icon: "size-3", value: 3}]
      },
      shape: {
        type: "select",
        options: [{icon: "square", value: "square"}, {icon: "circle", value: "circle"}],
      },
      mirror: {type: "toggle", icon: "mirror", title: "Toggle mirror\nMirrors the stroke across the skin"},
      camo: {type: "toggle", icon: "camo", title: "Toggle camo\nRandomly lightens and darkens the current color"},
      blend: {type: "toggle", icon: "blend", title: "Toggle blend\nRandomly selects colors from the blend palette"},
    });
  }

  render() {
    return html`
      <div id="main">
        <h2>Brush Tool</h2>
        <div class="group">
          <div>
            <p class="title">Size</p>
            ${this._sizeControl()}
          </div>
          <div>
            <p class="title">Shape</p>
            ${this._shapeControl()}
          </div>
        </div>
        <div>
          <p class="title">Effects</p>
          <div class="group-sm">
            ${this._mirrorControl()}
            ${this._camoControl()}
            ${this._blendControl()}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("ncrs-pen-tool-config", PenToolConfig);

export default PenToolConfig;
