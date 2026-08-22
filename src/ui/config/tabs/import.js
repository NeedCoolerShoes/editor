import Tab from "../../misc/tab.js";
import { css, html } from "lit";
import QuickSearch from "./import/quick_search.js";
import ImportTabButtons from "./import/buttons.js";
import "@lit/localize/lit-localize.js";

class ImportTab extends Tab {
  static styles = [
    Tab.styles,
    css`
      #main {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      #browse {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 0.5rem;
      }

      #quicksearch {
        flex-grow: 1;
      }

      #quicksearch h2 {
        margin: 0px;
        margin-bottom: 0.25rem;
        font-size: medium;
        color: white;
      }
    `
  ]

  constructor(ui) {
    super({name: `${msg(`Import`,{id:`com.tab.import`})}` title: `${msg(`Load Skin images and NCRS files into current project.`,{id:`com.desc.import`})}`});
    this.ui = ui;
    this.editor = this.ui.editor;

    this.buttons = new ImportTabButtons(this.ui, this.editor);
    this.quicksearch = new QuickSearch(this.ui);
  }
  _hasEntered = false;

  render() {
    return html`
      <div id="main">
        ${this.buttons}
        <div id="browse">
          <div id="quicksearch">
            ${this.quicksearch}
          </div>
        </div>
      </div>
    `;
  }

  tabEnter() {
    if (this._hasEntered) { return; }

    this.quicksearch.load();
    this._hasEntered = true;
  }

  galleryOpen() {
    this.ui.galleryModal.show();
  }
}

customElements.define("ncrs-import-tab", ImportTab);
export default ImportTab;