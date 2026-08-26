import { css, html, LitElement } from "lit";

class Troggle extends LitElement {
  static properties = {
    state: {reflect: true, type: String},
  }

  static styles = css`
    :host([state=off]) slot[name=on], :host([state=off]) slot[name=half] {
      display: none;
    }

    :host([state=on]) slot[name=off], :host([state=on]) slot[name=half] {
      display: none;
    }

    :host([state=half]) slot[name=on], :host([state=half]) slot[name=off] {
      display: none;
    }

    button {
      all: unset;
      display: block;
      cursor: pointer;
      user-select: none;
    }
  `;

  constructor() {
    super();
  }

  render() {
    this.state = this.state || "off";

    return html`
      <button part="button" @click=${this.toggle}>
        <slot name="before"></slot>
        <slot name="off"></slot>
        <slot name="half"></slot>
        <slot name="on"></slot>
        <slot name="after"></slot>
      </button>
    `;
  }

  toggle() {
    const state = this.state || "off";
    if (state === "off") {
      this.state = "on";
    } else if (state === "on") {
      this.state = "half";
    } else {
      this.state = "off";
    }

    this.dispatchEvent(new CustomEvent("troggle", {detail: this.state}))
  }
}

customElements.define("ncrs-troggle", Troggle);
export default Troggle;