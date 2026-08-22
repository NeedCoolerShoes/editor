import { css, html, LitElement } from "lit";
import "@lit/localize/lit-localize.js";

class ToggleControl extends LitElement {
  static properties = {
    icon: { reflect: true },
    selected: { reflect: true, type: Boolean },
    touchTooltip: {type: String, attribute: "touch-tooltip"},
  }

  static styles = css`
    :host {
      --icon-color: white;
    }

    :host(:hover) {
      --icon-color: #f5f8cc;
    }

    ncrs-button {
      width: fit-content;
    }

    ncrs-button::part(button) {
      width: 24px;
      height: 38px;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      padding: 0.25rem;
      text-align: center;
    }

    ncrs-icon {
      width: 100%;
      height: 100%;
    }
  `;

  constructor() {
    super();

    this.selected = false;
  }

  render() {
    return html`
      <ncrs-button @click=${this._onClick} ?active=${this.selected} touch-tooltip=${this.touchTooltip}>
        <ncrs-icon icon=${this.icon} color="var(--text-color)"></ncrs-icon>
      </ncrs-button>
    `;
  }

  _onClick() {
    this.selected = !this.selected;
    this.dispatchEvent(new CustomEvent("toggle", {detail: {toggle: this.selected}}));
  }
}

class OptionControl extends LitElement {
  static properties = {
    selected: { reflect: true },
  }

  static styles = css`
    :host {
      display: flex;
      gap: 0.125rem;
    }
  `;

  _buttons = [];

  firstUpdated() {
    this._manageChildButtons();
    if (this._buttons.length > 0) {
      this.select(this.selected || this._buttons[0].name);
      this._selectButton();
    }
  }

  render() {
    this._selectButton();
    return html` <slot id="slot" @slotchange=${this._manageChildButtons}></slot> `;
  }

  select(name) {
    this.selected = name;
    this.dispatchEvent(new CustomEvent("select", { detail: { name: name } }));
  }

  _selectButton() {
    this._buttons.forEach((button) => {
      button.selected = (button.name === this.selected);
    });
  }

  _manageChildButtons() {
    const slot = this.shadowRoot.getElementById("slot");
    const elements = slot.assignedElements({ flatten: true });

    this._buttons = [];

    elements.forEach((element) => {
      if (!(element instanceof OptionControlButton)) {
        return;
      }

      element.callback = (event) => {
        this.select(event.name);
      }

      this._buttons.push(element);
    });
  }
}

class OptionControlButton extends LitElement {
  static properties = {
    icon: { reflect: true },
    name: { reflect: true },
    selected: { reflect: true },
    touchTooltip: {type: String, attribute: "touch-tooltip"},
  }

  static styles = css`
    :host {
      display: inline-block;
      box-sizing: border-box;
      --icon-color: white;
    }

    :host(:hover) {
      --icon-color: #f5f8cc;
    }

    ncrs-button::part(button) {
      width: 26px;
      height: 34px;
      box-sizing: border-box;
      padding: 0.25rem;
    }

    :host(:first-child) ncrs-button::part(button) {
      border-bottom-left-radius: 0.5rem;
    }

    :host(:last-child) ncrs-button::part(button) {
      border-bottom-right-radius: 0.5rem;
    }

    ncrs-icon {
      width: 100%;
      height: 100%;
    }
  `;

  constructor() {
    super();
  }
  callback;

  render() {
    return html`
      <ncrs-button @click=${this._onClick} ?active=${this.selected} touch-tooltip=${this.touchTooltip}>
        <ncrs-icon icon=${this.icon} color="var(--text-color)"></ncrs-icon>
      </ncrs-button>
    `;
  }

  _onClick() {
    if (this.callback) {
      this.callback(this);
    }
  }
}

customElements.define("ncrs-option-control", OptionControl);
customElements.define("ncrs-option-control-button", OptionControlButton);
customElements.define("ncrs-toggle-control", ToggleControl);
export { OptionControl, OptionControlButton, ToggleControl };