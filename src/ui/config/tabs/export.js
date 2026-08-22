import { css, html } from "lit";
import Tab from "../../misc/tab.js";
import ExportTabButtons from "./export/buttons.js";
import "@lit/localize/lit-localize.js";

class ExportTab extends Tab {
  static styles = [
    Tab.styles,
    css`
      #main {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      #form {
        flex-grow: 1;
      }
    `
  ]

  constructor(ui) {
    super({name: msg(`Save`,{id:`save.label`}), title: msg(`Save skins and project files, and share to gallery.`,{id:`save.desc`})});

    this.buttons = new ExportTabButtons(ui, ui.editor);

    this.ui = ui;
    this.editor = this.ui.editor;
  }

  render() {
    return html`
      <div id="main">
        ${this.buttons}
        <div id="form"></div>
      </div>
    `;
  }
}

customElements.define("ncrs-export-tab", ExportTab);
export default ExportTab;