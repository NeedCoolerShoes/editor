import { html } from "lit";
import BaseToolConfig from "./base_tool_config";

class ShadeToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ];

  static properties = {
    size: {},
    shape: {},
    force: {},
  }

  constructor(config) {
    super(config, {
      size: {
        type: "select", number: true,
        options: [{icon: "square", value: 1}, {icon: "foursquare", value: 2}, {icon: "grid", value: 3}]
      },
      shape: {
        type: "select",
        options: [{icon: "square", value: "square"}, {icon: "circle", value: "circle"}]
      },
      force: {
        type: "select",
        options: [{icon: "force_1", value: 1}, {icon: "force_2", value: 2}, {icon: "force_3", value: 3}, {icon: "force_4", value: 4}, {icon: "force_5", value: 5}]
      },
    });
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
        </div>
        <div>
          <div>
            <p class="title">Force</p>
            ${this._forceControl()}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("ncrs-shade-tool-config", ShadeToolConfig);

export default ShadeToolConfig;
