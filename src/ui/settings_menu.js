import { css, html, LitElement } from "lit";

class SettingsMenu extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    
    #container {
      display: flex;
      flex-direction: column;
      flex-basis: 0;
      padding: 0.5rem;
      background-color: #1A1A1A;
      flex-grow: 1;
    }

    h1 {
      margin: 0px;
      font-size: x-large;
      color: white;
      margin-bottom: 0.5rem;
    }

    h2 {
      margin: 0px;
      font-size: medium;
      color: white;
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
      width: 12rem;
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
  `;

  constructor(ui) {
    super();

    this.ui = ui;
    this.uiConfig = this.ui.config;

    this.editor = ui.editor;
    this.editorConfig = this.editor.config;
  }

  firstUpdated() {
    this._setupEvents();
  }

  render() {
    return html`
      <div id="container">
        <h1>Settings</h1>
        <h2>Visual Preferences</h2>
        <label for="fov-slider">FOV</label>
        <div class="slider-container">
          <input type="range" min="30" max="180" value="90" step="1" id="fov-slider" class="slider">
        </div>
      </div>
    `;
  }

  _setupEvents() {
    const fovSlider = this.renderRoot.getElementById("fov-slider");

    fovSlider.addEventListener("input", input => {
      this.editor.camera.fov = Number(input.originalTarget.value) / 2;
      this.editor.camera.updateProjectionMatrix();
    });
  }
}

customElements.define("ncrs-settings-menu", SettingsMenu);
export default SettingsMenu;