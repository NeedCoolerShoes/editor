import { css, html, LitElement } from "lit";

class Tool extends LitElement {
  static styles = css`
    ncrs-button::part(button) {
      padding: 0.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    ncrs-icon {
      height: 1.75rem;
      width: auto;
      display: block;
    }
  `;

  static properties = {
    active: {reflect: true},
  }

  constructor(ui, tool) {
    super()
    this.active = false;
    this.ui = ui;
    this.tool = tool;
  }

  render() {
    this.active = (this.ui.editor.currentTool == this.tool);

    const properties = this.tool.properties;

    const icon = properties.icon;
    const title = properties.name + "\n" + properties.description;

    return html`
      <ncrs-button ?active=${this.active} title="${title}" @click=${this.select}>
        <ncrs-icon icon="${icon}" color="var(--text-color)"></ncrs-icon>
      </ncrs-button>
    `
  }

  select() {
    this.active = true;
    this.ui.editor.selectTool(this.tool);
  }
}

customElements.define("ncrs-tool", Tool);

export default Tool;