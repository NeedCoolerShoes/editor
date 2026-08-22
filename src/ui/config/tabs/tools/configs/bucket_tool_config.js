import BaseToolConfig from "./base_tool_config.js";
import BucketTool from "../../../../../editor/tools/toolset/bucket_tool.js";

class BucketToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ]

  static properties = {
    camo: {},
    blend: {},
    bucketErase: {},
    fillStyle: {},
  }

  constructor(config, mobile = false) {
    super(config, {
      camo: {type: "toggle", icon: "camo", title: `${msg(`Toggle Camo — Randomizes brightness of selected color.`,{id:`tools.desc.camo`})}`},
      blend: {type: "toggle", icon: "blend", title: `${msg(`Toggle Blend — Randomly selects colors from the Blend Palette.`,{id:`tools.desc.blend`})}`},
      bucketErase: {type: "toggle", icon: "eraser", title: `${msg(`Toggle Eraser`,{id:`tools.desc.eraser`})}`},
      fillStyle: {
        type: "select",
        options: [
          {
            icon: "fill-cube-connected",
            value: "fill-cube-connected",
            title: `${msg(`Cube Connected (Default) — Fills all connected pixels of the same color on all sides of the cube.`,{id:`buckettool.desc.conCube`})}`
          },
          {
            icon: "fill-face-connected",
            value: "fill-face-connected",
            title: `${msg(`Face Connected — Fills all connected pixels of the same color on one side of the cube.`,{id:`buckettool.desc.conFace`})}`
          },
          {
            icon: "fill-cube-replace",
            value: "fill-cube-replace",
            title: `${msg(`Flood Fill Cube — One color fills all pixels on all sides of the cube.`,{id:`buckettool.desc.floodCube`})}`
          },
          {
            icon: "fill-face-replace",
            value: "fill-face-replace",
            title: `${msg(`Flood Fill Face — One color fills all pixels on one side of the cube.`,{id:`buckettool.desc.floodFace`})}`
          },
          {
            icon: "replace-color",
            value: "replace-color",
            title: `${msg(`Replace Color — Replaces all pixels of the same color on all sides of all parts of the active layer, even if the part is hidden.`,{id:`buckettool.desc.replace`})}`
          },
        ],
      },
    }, mobile);

    this.tool = new BucketTool(config);
  }

  renderDesktop() {
    return html`
      <div id="main">
        <h2>${msg(`Bucket Tool`,{id:`buckettool.label`})}</h2>
        <div class="group">
          <div>
            <p class="title">${msg(`Effects`,{id:`tools.label.effects`})}</p>
            <div class="group-sm">
              ${this._camoControl()}
              ${this._blendControl()}
              ${this._bucketEraseControl()}
            </div>
          </div>
        </div>
        <p class="title">${msg(`Style`,{id:`tools.label.style`})}</p>
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
          <p class="title">${msg(`Effects`,{id:`tools.label.effects`})}</p>
          <div class="group-sm">
            ${this._camoControl()}
            ${this._blendControl()}
            ${this._bucketEraseControl()}
          </div>
        </div>
        <div>
          <p class="title">${msg(`Style`,{id:`tools.label.style`})}</p>
          ${this._fillStyleControl()}
        </div>
      </div>
    `;
  }
}

customElements.define("ncrs-bucket-tool-config", BucketToolConfig);
export default BucketToolConfig;