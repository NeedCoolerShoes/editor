import BaseToolConfig from "./base_tool_config.js";
import ShadeTool from "../../../../../editor/tools/toolset/shade_tool.js";

class ShadeToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ]

  static properties = {
    size: {},
    shape: {},
    force: {},
    shadeStyle: {},
    shadeOnce: {},
    shadeLighten: {},
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
      force: {
        type: "select",
        options: [{ icon: "force-1", value: 1 }, { icon: "force-2", value: 2 }, { icon: "force-3", value: 3 }, { icon: "force-4", value: 4 }, { icon: "force-5", value: 5 }]
      },
      shadeStyle: {
        type: "select",
        options: [{icon: "lighten", value: "lighten", title: `${msg(`Set shade style to Lighten`,{id:`shadetool.desc.lighten`})}`}, {icon: "saturate", value: "saturate", title: `${msg(`Set shade style to Saturate.`,{id:`shadetool.label.saturate`})}`}]
      },
      shadeOnce: {type: "toggle", icon: "shade-once", title: `${msg(`Only shade each pixel once in a stroke.`,{id:`shadetool.label.once`})}`},
      shadeLighten: {type: "toggle", icon: "shade-lighten", title: `${msg(`Lighten Shaded Pixels`,{id:`shadetool.label.lighten`})}`},
    }, mobile);
    this.tool = new ShadeTool(config);
  }

  renderDesktop() {
    return html`
      <div id="main">
        <h2>${msg(`Shade Tool`,{id:`shadetool.label`})}</h2>
        <div class="group">
          <div>
            <p class="title">${msg(`Size`,{id:`tools.label.size`})}</p>
            ${this._sizeControl()}
          </div>
          <div>
            <p class="title">${msg(`Shape`,{id:`tools.label.shape`})}</p>
            ${this._shapeControl()}
          </div>
          <div>
            <p class="title">${msg(`Style`,{id:`tools.label.style`})}</p>
            ${this._shadeStyleControl()}
          </div>
        </div>
        <div class="group">
          <div>
            <p class="title">${msg(`Force`,{id:`tools.label.force`})}</p>
            ${this._forceControl()}
          </div>
          <div>
            <p class="title">${msg(`Effects`,{id:`tools.label.effects`})}</p>
            <div class="group-sm">
              ${this._shadeOnceControl()}
              ${this._shadeLightenControl()}
            </div>
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
            ${this._shadeOnceControl()}
            ${this._shadeLightenControl()}
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
        <div>
          <p class="title">${msg(`Style`,{id:`tools.label.style`})}</p>
          ${this._shadeStyleControl()}
        </div>
        <div>
          <p class="title">${msg(`Force`,{id:`tools.label.force`})}</p>
          ${this._forceControl()}
        </div>
      </div>
    `;
  }
}

customElements.define("ncrs-shade-tool-config", ShadeToolConfig);
export default ShadeToolConfig;