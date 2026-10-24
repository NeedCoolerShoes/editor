import { html, nothing } from "lit";
import BaseToolConfig from "./base_tool_config.js";
import BucketTool from "../../../../../editor/tools/toolset/bucket_tool.js";

class BucketToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ];

  static properties = {
    camo: {},
    blend: {},
    bucketErase: {},
    fillStyle: {},
  }

  constructor(config, mobile = false) {
    super(config, {
      camo: {type: "toggle", icon: "camo", title: "Toggle camo\nRandomly lightens and darkens the current color"},
      blend: {type: "toggle", icon: "blend", title: "Toggle blend\nRandomly selects colors from the blend palette"},
      bucketErase: {type: "toggle", icon: "eraser", title: "Toggle erase mode"},
      fillStyle: {
        type: "select",
        options: [
          {
            icon: "fill-cube-connected",
            value: "fill-cube-connected",
            title: "Cube connected (default)\nFills all connected pixels of the same color on all sides of the cube"
          },
          {
            icon: "fill-face-connected",
            value: "fill-face-connected",
            title: "Face connected\nFills all connected pixels of the same color on the face"
          },
          {
            icon: "fill-cube-replace",
            value: "fill-cube-replace",
            title: "Cube replace\nFills the whole cube with the selected color"
          },
          {
            icon: "fill-face-replace",
            value: "fill-face-replace",
            title: "Face replace\nFills the whole face with the selected color"
          },
          {
            icon: "replace-color",
            value: "replace-color",
            title: "Replace Color\nIf enabled, will replace all pixels of the same color, on the whole canvas ignoring boundaries"
          },
        ],
      },
    }, mobile);
    this.tool = new BucketTool(config);
  }

  renderDesktop() {
    return html`
      <div id="main">
        <h2>Bucket Tool</h2>
        <div class="group">
          <div>
            <p class="title">Effects</p>
            <div class="group-sm">
              ${this._camoControl()}
              ${this._blendControl()}
              ${this._bucketEraseControl()}
            </div>
          </div>
        </div>
        <p class="title">Fill Style</p>
        <div>
          ${this._fillStyleControl()}
        </div>
        <p class="description">${this.tool.properties.description}</p>
      </div>
    `;
  }

  renderMobile() {
    return html`
      <div id="main-mobile" class="group">
        <div>
          <p class="title">Effects</p>
          <div class="group-sm">
            ${this._camoControl()}
            ${this._blendControl()}
            ${this._bucketEraseControl()}
          </div>
        </div>
        <div>
          <p class="title">Fill Style</p>
          ${this._fillStyleControl()}
        </div>
      </div>
    `;
  }
}

customElements.define("ncrs-bucket-tool-config", BucketToolConfig);
export default BucketToolConfig;