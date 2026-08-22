import BaseToolConfig from "./base_tool_config.js";
import SculptTool from "../../../../../editor/tools/toolset/sculpt_tool.js";

class SculptToolConfig extends BaseToolConfig {
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
      mirror: {type: "toggle", icon: "mirror", title: `${msg(`Toggle Mirror — Mirrors stroke across the face of the skin.`,{id:`sculpttool.desc.mirror`})}`},
      sculptFlatten: {type: "toggle", icon: "merge", title: `${msg(`Toggle Flatten Mode — Moves pixels from Overlay to Base layer.`,{id:`sculpttool.desc.flatten `})}`},
      sculptGlobal: {type: "toggle", icon: "globe", title: `${msg(`Toggle Global Sculpt — Disabled: Sculpt only draws from active layer.`,{id:`sculpttool.desc.global`})}`}
    }, mobile);
    this.tool = new SculptTool(config);
  }

  renderDesktop() {
    return html`
      <div id="main">
        <h2>${msg(`Sculpt Tool`,{id:`sculpttool.label`})}</h2>
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
            ${this._sculptFlattenControl()}
            ${this._sculptGlobalControl()}
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
            ${this._sculptFlattenControl()}
            ${this._sculptGlobalControl()}
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

customElements.define("ncrs-sculpt-tool-config", SculptToolConfig);
export default SculptToolConfig;