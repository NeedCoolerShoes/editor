import Tab from "../../misc/tab.js";
import { css, html } from "lit";
import "@lit/localize/lit-localize.js";

class SettingsTab extends Tab {
  static styles = [
    Tab.styles,
    css`
      #main {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      #container {
        display: flex;
        flex-direction: column;
        flex-basis: 0;
        padding: 0.5rem;
        background-color: #1A1A1A;
      }

      h2 {
        margin: 0px;
        font-size: medium;
        color: white;
        text-align: center;
        width: 100%;
        margin-bottom: 0.5rem;
      }

      label {
        font-size: x-small;
        color: rgb(134, 137, 139);
      }

      hr {
        width: 100%;
        border-color: #494C4E;
        margin-bottom: 0.75rem;
        box-sizing: border-box;
      }

      .slider-container {
        width: 100%;
        height: 1.25rem;
      }

      .slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 24px;
        background-image: linear-gradient(to top, #1a1a1a, #131315);
        border-radius: 5px;
        box-shadow: #313436ee 0px 0px 0px 1px inset, #0f0f11 0px 3px 6px 1px inset;
        outline: none;
      }

      .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 21px;
        height: 19px;
        background-image: linear-gradient(to top, #24272a, #313436);
        box-shadow: #3d4042 0px 0px 0px 1px inset, #191a1c 0px 1px 3px, #1f2226 0px 4px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
        border: none;
        border-radius:5px;
        cursor: pointer;
      }

      .slider::-moz-range-thumb {
        transform: translate(0,-2px);
        width: 21px;
        height: 19px;
        background-image: linear-gradient(to top, #24272a, #313436);
        box-shadow: rgb(80, 82, 84) 0px 0px 0px 1px inset, rgb(25, 26, 28) 0px 0px 3px, rgb(39, 42, 45) 0px 4px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
        border: none;
        border-radius:5px;
        cursor: pointer;
      }
    `
  ]

  constructor(ui) {
    super({name: msg(`⚙ Settings`{id:`settings.label`})}, title: msg(`NCRS Editor Project Settings`,{id:`settings.desc`}));
    this.ui = ui;
    this.editor = this.ui.editor;

    this._setupEvents();
  }

  render() {
    return html`
      <div id="main">
        <div id="container">
          <h2>${msg(`Visual Preferences`{id:`settings.label.vizPrefs`})}</h2>
          <label for="fov-slider">${msg(`Field of View Angle: Minecraft default is 70`{id:`settings.desc.fov`})}</label>
          <div class="slider-container">
            <input type="range" min="30" max="180" value="90" step="1" id="fov-slider" class="slider">
          </div>
        </div>
        </div>
      </div>
    `;
  }

  _setupEvents() {
    this.addEventListener("input", (input) => {
      switch (input.originalTarget.id) {
        case "fov-slider":
          this.editor.camera.fov = Number(input.originalTarget.value)/2;
          this.editor.camera.updateProjectionMatrix();
          break;
      }
    });
  }
}

customElements.define("ncrs-settings-tab", SettingsTab);
export default SettingsTab;