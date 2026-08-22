import BaseToolConfig from "./base_tool_config.js";
import EraseTool from "../../../../../editor/tools/toolset/erase_tool.js";

class EraseToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ]

  static properties = {
    size: {},
    shape: {},
    mirror: {},
  }

  constructor(config, mobile = false) {
    super(config, {
      size: {
        type: "select", number: true,
        options: [{icon: "size-1", value: 1}, {icon: "size-2", value: 2}, {icon: "size-3", value: 3}]
      },
      shape: {
        type: "select",
        options: [{icon: "square", value: "square"}, {icon: "circle", value: "circle"}]
      },
      mirror: {type: "toggle", icon: "mirror", title: `${msg(`Toggle Mirror — Mirrors the stroke across the skin.`,{id:`tools.desc.mirror`})}`},
    }, mobile);

    this.tool = new EraseTool(config);
  }

  renderDesktop() {
    return html`
      <div id="main">
        <h2>${msg(`Erase Tool`,{id:`erasetool.label`})}</h2>
        <div class="group">
          <div>
            <p class="title">${msg(`Size`,{id:`tools.label.size`})}</p>
            ${this._sizeControl()}
          </div>
          <div>
            <p class="title">${msg(`Shape`,{id:`tools.label.shape`})}</p>
            ${this._shapeControl()}
          </div>
        </div>
        <div>
          <p class="title">${msg(`Effects`,{id:`tools.label.effects`})}</p>
          <div class="group-sm">
            ${this._mirrorControl()}
          </div>
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
            ${this._mirrorControl()}
          </div>
        </div>
        <div>
          <p class="title">${msg(`Size`,{id:`tools.label.size`})}</p>
          ${this._sizeControl()}
        </div>
        <div>
          <p class="title">${msg(`Shape`,{id:`tools.label.shape`})}</p>
          ${this._shapeControl()}
        </div>
      </div>
    `;
  }
}

customElements.define("ncrs-erase-tool-config", EraseToolConfig);
export default EraseToolConfig;