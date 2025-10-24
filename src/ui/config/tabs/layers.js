import { html } from "lit";
import Tab from "../../misc/tab.js";
import LayersTabFilters from "./layers/filters.js";
import LayersTabButtons from "./layers/buttons.js";

class LayersTab extends Tab {
  static styles = [
    Tab.styles,
  ];

  constructor(editor) {
    super({name: "Layer", title: "Layer [2]/[Alt+L]\nApply filters and edit current layer."});

    this.editor = editor;
    
    this.filters = new LayersTabFilters(this.editor);
    this.buttons = new LayersTabButtons(this.editor);
  }

  render() {
    return html`
      ${this.filters}
      ${this.buttons}
    `;
  }
}

customElements.define("ncrs-layers-tab", LayersTab);

export default LayersTab;
