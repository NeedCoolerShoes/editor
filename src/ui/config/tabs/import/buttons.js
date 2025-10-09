import { css, html, LitElement } from "lit";
import ReferenceImageManager from "./reference_image";
import MinecraftImport from "./minecraft";
import ProjectLoader from "../../../../editor/format/project_loader";

class ImportTabButtons extends LitElement {
  static styles = css`
      #buttons {
        display: flex;
        flex-direction: column;
        flex-basis: 0;
        padding: 0.5rem;
        background-color: #1A1A1A;
      }

      ncrs-button {
        text-align: center;
        font-size: large;
        font-weight: bold;
      }

      ncrs-button::part(button) {
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
      }

      ncrs-button ncrs-icon {
        width: 24px;
        height: 24px;
      }

      hr {
        width: 100%;
        border-color: #494C4E;
        margin-bottom: 0.75rem;
        box-sizing: border-box;
      }

      input {
        font-size: medium;
        margin-bottom: 0.25rem;
        flex-grow: 1;
        box-sizing: border-box;
        color: white;
        background-color: #131315;
        border-style: solid;
        border-width: 0px;
        border-radius: 4px;
        box-shadow: 0 0 0 2px #313436;
        padding-left: 0.25rem;
      }

      #import-username {
        position: relative;
      }

      #import-username:after {
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

      .hidden {
        display: none;
      }
  `;

  constructor(ui, editor) {
    super();

    this.ui = ui;
    this.editor = editor;

    this.referenceImages = new ReferenceImageManager(this.editor);

    this.pngFileInput = this._createFileInput();
    this.ncrsFileInput = this._createFileInput();
    this.referenceFileInput = this._createFileInput();

    this.pngFileInput.addEventListener("change", this._pngFileRead.bind(this));
    this.pngFileInput.accept = "image/png";

    this.ncrsFileInput.accept = ".ncrs"
    this.ncrsFileInput.addEventListener("change", this._ncrsFileRead.bind(this));
    
    this.referenceFileInput.accept = "image/*";
    this.referenceFileInput.addEventListener("change", this._referenceFileRead.bind(this));

    this.minecraftImport = new MinecraftImport(this.ui);

  }

  render() {
    return html`
      <div id="buttons">
        ${this.pngFileInput}
        ${this.ncrsFileInput}
        ${this.referenceFileInput}
        <div part="minecraft-import">
          ${this.minecraftImport}
          <hr>
        </div>
        <ncrs-button part="png-import" @click=${this.pngOpen} title="Import a skin .png file as a new layer.">Import Skin from File (.png)</ncrs-button>
        <ncrs-button part="ncrs-import" @click=${this.ncrsOpen} title="Import a .ncrs project file.">Import Project from File (.ncrs)</ncrs-button>
        <div part="reference-image">
          <hr>
          <ncrs-button @click=${this.referenceImageOpen} title="Add a reference image.">Add Reference Image</ncrs-button>
        </div>
      </div>`;
  }

  pngOpen() {
    this.pngFileInput.value = null;
    this.pngFileInput.click();
  }

  ncrsOpen() {
    this.ncrsFileInput.value = null;
    this.ncrsFileInput.click();
  }

  referenceImageOpen() {
    this.referenceFileInput.value = null;
    this.referenceFileInput.click();
  }

  _pngFileRead(event) {
    const file = event.target.files[0];
    this.editor.addLayerFromFile(file);
  }

  _ncrsFileRead(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      let confirmText = "Load new Project?";
      confirmText += "\nThis will replace your current project, and you will lose your history.";
      confirmText += "\nMake sure you have saved the current project."

      const check = confirm(confirmText);
      if (!check) { return; }

      const text = reader.result;
      const json = JSON.parse(text);

      const projectLoader = new ProjectLoader(json);
      projectLoader.load(this.editor);
    }

    reader.readAsText(file);
  }

  _referenceFileRead(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        this.referenceImages.addImage(img);
      }

      img.src = reader.result;
    }

    reader.readAsDataURL(file);
  }

  _createFileInput() {
    const input = document.createElement("input");
    input.classList.add("hidden");
    input.type = "file";

    return input;
  }
}

customElements.define("ncrs-import-tab-buttons", ImportTabButtons);
export default ImportTabButtons;