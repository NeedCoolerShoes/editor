import { css, html, LitElement } from "lit";
import { msg } from "@lit/localize";
import PartToggles from "./part_toggles.js";

import EditorToggles from "./editor_toggles.js";
import ModelToggle from "./model_toggle.js";
import Toolset from "./toolset.js";

class Toolbar extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: auto;
      padding: 0.25rem;
      min-width: 3.75rem;
      background-color: #131315;
      box-sizing: border-box;
      overflow: auto;
    }

    #toolbar {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.25rem;
    }

    ncrs-tools-toolset {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .hidden {
      display: none;
    }

    .label {
      font-size: x-small;
      color: rgb(134, 137, 139);
      text-align: center;
      margin-top: 0.25rem;
      margin-bottom: 0.125rem;
    }

    .label-grid {
      margin-bottom: -0.125rem;
    }

    .row-grid {
      margin-bottom: -0.25rem;
    }

    ncrs-tools-part-toggles {
      margin-bottom: 0.5rem;
    }
  `;

  constructor(ui) {
    super();

    this.ui = ui;
    this.editor = this.ui.editor;

    this.toolSet = new Toolset(this.editor);
    this.partToggles = new PartToggles(this.editor);
    this.modelToggle = new ModelToggle(this.editor);
    this.editorToggles = new EditorToggles(this.editor);
  }

  render() {
    return html`
      <div id="toolbar">
        ${this.toolSet}
        <div>
          <p class="label">${msg(`Parts`, {id: `toolbar.label.parts`})}</p>
          ${this.partToggles}
          <p class="label">${msg(`Model`, {id: `toolbar.label.model`})}</p>
          ${this.modelToggle}
          ${this.editorToggles}
        </div>
      </div>
    `;
  }
}

customElements.define("ncrs-toolbar", Toolbar);

export default Toolbar;