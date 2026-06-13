import { css, html, LitElement } from "lit";
import ProjectLoader from "../../../../editor/format/project_loader";
import { download, isIOS } from "../../../../helpers";

class ExportTabButtons extends LitElement {
  static styles = css`
    #buttons {
      display: flex;
      flex-direction: column;
      flex-basis: 0;
      padding: 0.5rem;
      background-color: #1A1A1A;
    }

    #buttons ncrs-button {
      text-align: center;
      font-size: large;
      font-weight: bold;
    }

    #buttons ncrs-button::part(button) {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }
    
    hr {
      width: 100%;
      border-color: #494C4E;
      margin-bottom: 0.75rem;
      box-sizing: border-box;
    }
  `;

  constructor(ui, editor) {
    super();

    this.ui = ui;
    this.editor = editor;
  }

  render() {
    return html`
      <div id="buttons">
        <ncrs-button @click=${this.downloadPNG} title="Export current skin as a PNG image file.">Export Image (.png)</ncrs-button>
        <ncrs-button @click=${this.downloadNCRS} title="Export current skin project, including layers.">Export Project (.ncrs)</ncrs-button>
        <hr>
        <ncrs-button @click=${this.showExportForm}>Share to Gallery</ncrs-button>
      </div>
    `;
  }

  downloadPNG() {
    const layers = this.editor.layers;
    const texture = layers.render();

    texture.convertToBlob().then(blob => {
      this.download(`${this._filename()}.png`, blob, "image/png");
      // download(`${this._filename()}.png`, URL.createObjectURL(blob));
    });
  }

  downloadNCRS() {
    const data = ProjectLoader.export(this.editor);
    const blob = new Blob([JSON.stringify(data)], {type: "attachment/plain"});

    this.download(`${this._filename()}.ncrs`, blob, "attachment/plain");
    // download(`${this._filename()}.ncrs`, URL.createObjectURL(blob));
  }

  download(filename, blob, type) {
    // If the platform is iOS, use the Share API instead of regular download.
    const file = new File([blob], filename, {type: type});

    if (isIOS && navigator.canShare && navigator.canShare({files: [file]})) {
      navigator.share({files: [file]});
    } else {
      download(filename, URL.createObjectURL(blob));
    }
  }

  showExportForm() {
    this.ui.exportModal.show();
  }

  _filename() {
    const date = new Date();

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `ncrs_skin_${year}${month}${day}_${hours}${minutes}`;
  }
}

customElements.define("ncrs-export-tab-buttons", ExportTabButtons);
export default ExportTabButtons;