import { css, html, LitElement } from "lit";
import "@lit/localize/lit-localize.js";

class Tool extends LitElement {
  static styles = css`
    :host {
      --icon-height: var(--ncrs-icon-height, 1.75rem);
    }

    ncrs-button::part(button) {
      padding: 0.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      position: relative;
    }

    ncrs-icon {
      --expand-icon-color: var(--text-color);
      height: var(--icon-height);
      width: auto;
      display: block;
    }

    #expand {
      display: none;
      height: 0.75rem;
      width: 0.75rem;
      position: absolute;
      right: 0.25rem;
      top: 0px;
    }

    :host([mobile][expandable]) #expand {
      display: block;
    }

    #expand ncrs-icon {
      width: 100%;
      height: 100%;
      display: none;
    }

    :host([active]) #expand .closed {
      display: var(--tool-closed);
    }

    :host([active]) #expand .open {
      display: var(--tool-open);
    }
  `;

  static properties = {
    active: {type: Boolean, reflect: true},
    disabled: {type: Boolean, reflect: true},
    mobile: {type: Boolean, reflect: true},
    expandable: {type: Boolean, reflect: true},
  }

  constructor(editor, tool, mobile = false, expandable = true) {
    super()
    this.active = false;
    this.disabled = false;
    this.mobile = mobile;
    this.expandable = expandable;
    this.expanded = false;
    this.editor = editor;
    this.tool = tool;
  }

  render() {
    this.active = (this.editor.currentTool == this.tool);

    const properties = this.tool.properties;

    const icon = properties.icon;
    const title = properties.name + "\n" + properties.description + (this.disabled ? msg(`\n\n(Disabled)`,{id:`tool.__disabled`}) : "");

    return html`
      <ncrs-button ?active=${this.active} ?disabled=${this.disabled} title="${title}" @click=${this.select}>
        <ncrs-icon icon="${icon}" color="var(--text-color)"></ncrs-icon>
        <div id="expand">
          <ncrs-icon class="closed" icon="arrow-up" color="var(--expand-icon-color)" style="filter: drop-shadow(0px -1px 1px #25282b);"></ncrs-icon>
          <ncrs-icon class="open" icon="arrow-down" color="var(--expand-icon-color)" style="filter: drop-shadow(0px -1px 1px #25282b);"></ncrs-icon>
        </div>
      </ncrs-button>
    `;
  }

  select() {
    this.editor.selectTool(this.tool, this.active);
  }
}

customElements.define("ncrs-tool", Tool);
export default Tool;