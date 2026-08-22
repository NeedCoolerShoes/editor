import { css, html, LitElement } from "lit";

class MobileTab extends LitElement {
  static properties = {
    name: {type: String},
  }

  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("ncrs-mobile-tab", MobileTab);
export default MobileTab;