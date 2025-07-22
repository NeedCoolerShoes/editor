import { html } from "lit";
import BaseToolConfig from "./base_tool_config";
import ShadeTool from "../../../../../editor/tools/toolset/shade_tool";

class ShadeToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ];

  static properties = {
    size: {},
    shape: {},
    force: {},
    shadeOnce: {},
  }

  constructor(config) {
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
        options: [{icon: "lighten", value: "lighten", title: "Set shade style to lighten"}, {icon: "saturate", value: "saturate", title: "Set shade style to saturate"}]
      },
      shadeOnce: {type: "toggle", icon: "shade-once", title: "Shade only once\nShade any pixel only once in a stroke."},
    });
    this.tool = new ShadeTool(config);
  }

  render() {
    return html`
      <div id="main">
        <h2>Shade Tool</h2>
        <div class="group">
          <div>
            <p class="title">Size</p>
            ${this._sizeControl()}
          </div>
          <div>
            <p class="title">Shape</p>
            ${this._shapeControl()}
          </div>
          <div>
            <p class="title">Style</p>
            ${this._shadeStyleControl()}
          </div>
        </div>
        <div class="group">
          <div>
            <p class="title">Force</p>
            ${this._forceControl()}
          </div>
          <div>
            <p class="title">Effects</p>
            <div class="group-sm">
              ${this._shadeOnceControl()}
            </div>
          </div>
        </div>
        <p class="description">${this.tool.properties.description}</p>
      </div>
    `;
  }
}

customElements.define("ncrs-shade-tool-config", ShadeToolConfig);

export default ShadeToolConfig;
