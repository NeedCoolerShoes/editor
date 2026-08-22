import { css, html, LitElement } from "lit";

class IconButton extends LitElement {
  static styles = css`
    :host {
      --icon-color: white;
      --icon-color-hover: #ccc;
      --icon-color-pressed: #aaa;
      --icon-height: 1.75rem;
      display: block;
      cursor: pointer;
      user-select: none;
      margin-bottom: 0.375rem;
      border-radius: 0.25rem;
      border-width: 1px;
      border-color: #232428;
      border-bottom-color: #1e2326;
      background-image: linear-gradient(to top, #24272a, #313436);
      box-shadow: #3d4042 0px 0px 0px 1px inset, #191a1c 0px 1px 3px, #1f2226 0px 4px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
    }

    :host(:hover) {
      --icon-color: var("--icon-color-hover");
      box-shadow: #505254 0px 0px 0px 1px inset, #191a1c 0px 0px 3px, #272a2d 0px 4px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
    }

    :host([active=true]), :host(:active) {
      --icon-color: var("--icon-color-pressed");
      margin-top: 0.125rem;
      margin-bottom: 0.25rem;
      background-image: linear-gradient(to top, rgb(49, 52, 54), rgb(36, 39, 42));
    }

    :host([disabled]) {
      --icon-color: #565758;
      margin-bottom: 0.375rem;
      margin-top: 0px;
      background-image: linear-gradient(to top, #222427, #2a2d2f);
      box-shadow: #1c1e1f 0px 0px 0px 1px inset, #191a1c 0px 1px 3px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
      cursor: initial
    }

    button {
      all: unset;
      display: block;
      width: 100%;
      padding: 0.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      box-sizing: border-box;
    }

    ncrs-icon {
      height: var(--icon-height);
      width: auto;
      display: block;
    }
  `;

  static properties = {
    icon: {reflect: true},
  }

  constructor(icon = undefined, callback = undefined) {
    super();

    if (icon) {
      this.icon = icon;
    }
    this.callback = callback;
  }

  render() {
    return html`
      <button part="button" @click="${this.callback}">
        <ncrs-icon part="icon" icon=${this.icon} color="var(--icon-color)"></ncrs-icon>
      </button>`
  }
}

customElements.define("ncrs-icon-button", IconButton);
export default IconButton;