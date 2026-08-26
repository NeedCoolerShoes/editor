import { css, html, LitElement } from "lit";

class Quadroggle extends LitElement {
  static properties = {
    state: {reflect: true, type: String},
  }

  static styles = css`
    :host([state=off]) slot[name=on], :host([state=off]) slot[name=inner], :host([state=off]) slot[name=outer] {
      display: none;
    }

    :host([state=on]) slot[name=off], :host([state=on]) slot[name=inner], :host([state=on]) slot[name=outer] {
      display: none;
    }

    :host([state=outer]) slot[name=on], :host([state=outer]) slot[name=off], :host([state=outer]) slot[name=inner] {
      display: none;
    }

    :host([state=inner]) slot[name=on], :host([state=inner]) slot[name=off], :host([state=inner]) slot[name=outer] {
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
        <slot name="outer"></slot>
        <slot name="inner"></slot>
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
      this.state = "outer";
    } else if (state === "outer") {
      this.state = "inner";
    } else {
      this.state = "off";
    }

    this.dispatchEvent(new CustomEvent("quadroggle", {detail: this.state}))
  }
}

customElements.define("ncrs-quadroggle", Quadroggle);
export default Quadroggle;