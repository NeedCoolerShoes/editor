import { css, html, LitElement } from "lit";
import { SKIN_LOOKUP_URL } from "../../../../constants.js";

class MinecraftImport extends LitElement {
  static properties = {
    _processing: {type: Boolean, state: true}
  }

  static styles = css`
    form {
      display: flex;
      flex-direction: column;
    }

    input {
      font-size: medium;
      margin-bottom: 0.25rem;
      box-sizing: border-box;
      color: white;
      background-color: #131315;
      border-style: solid;
      border-width: 0px;
      border-radius: 4px;
      box-shadow: 0 0 0 2px #313436;
      padding-left: 0.25rem;
    }

    ncrs-button {
      position: relative;
      text-align: center;
      font-size: large;
      font-weight: bold;
    }

    ncrs-button::part(button) {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }

    ncrs-button:after {
      --height: 10px;
      content: "";
      width: 0;
      height: 0;
      border-left: var(--height) solid transparent;
      border-right: var(--height) solid transparent;
      border-top: var(--height) solid #131315;
      position: absolute;
      z-index: 99;
      left: 50%;
      top: -5px;
      margin-left: calc(var(--height) * -1);
    }
  `

  constructor(ui) {
    super();

    this.ui = ui;
    this.editor = this.ui.editor;
    this.input = this._createInput();
  }

  render() {
    return html`
      <form @submit=${this._formSubmit}>
        ${this.input}
        <ncrs-button ?disabled=${this._processing} @click=${this._buttonSubmit}>
          ${this._processing ? "Processing..." : "Import Skin from Minecraft" }
        </ncrs-button>
      </form>
    `;
  }

  _createInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Steve";

    return input;
  }

  _formSubmit(event) {
    event.preventDefault();
    this._loadSkin();
  }

  _buttonSubmit() {
    this._loadSkin();
  }

  _loadSkin() {
    this._processing = true;
    const username = encodeURI(this.input.value);
    const url = this.ui.skinLookupURL() + "/" + username;

    fetch(url).then(res => {
      res.blob().then(blob => {
        const uuid = res.headers.get("X-NeedCoolerShoes-UUID");
        const model = res.headers.get("X-NeedCoolerShoes-Model");

        if (model !== this.editor.getVariant() && this.editor.layers.isBlank()) {
          this.editor.setVariant(model);
        }

        if (blob.type === "image/png") {
          this.editor.addLayerFromFile(blob, {attribution: `minecraft:java/${uuid}\n${username}`});
        }
        this._processing = false;
      }, () => {
        this._processing = false;
      })
    }, () => {
      this._processing = false;
    })
  }
}

customElements.define("ncrs-import-minecraft", MinecraftImport);

export default MinecraftImport;