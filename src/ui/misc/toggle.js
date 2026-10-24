import { css, html, LitElement } from "lit";

class BasicToggle extends LitElement {
  static properties = {
    toggled: {reflect: true, type: Boolean},
  }

  static styles = css`
    slot[name=on] {
      display: none;
    }

    :host([toggled]) slot[name=off] {
      display: none;
    }

    :host([toggled]) slot[name=on] {
      display: initial;
    }

    button {
      all: unset;
      display: block;
      cursor: pointer;
      user-select: none;
    }
  `;

  render() {
    return html`
      <button part="button" @click=${this.toggle}>
        <slot name="before"></slot>
        <slot name="off"></slot>
        <slot name="on"></slot>
        <slot name="after"></slot>
      </button>
    `;
  }

  toggle() {
    this.toggled = this.toggled || false;
    this.toggled = !this.toggled;
    this.dispatchEvent(new CustomEvent("toggle", {detail: this.toggled}))
  }
}

customElements.define("ncrs-toggle", BasicToggle);
export default BasicToggle;