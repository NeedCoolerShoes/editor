import { css, html, LitElement, unsafeCSS } from "lit";
import { msg } from "@lit/localize";

import imgSteveAlex from "../../../assets/images/steve_alex.png";

class ModelToggle extends LitElement {
  static styles = css`
    #toggle-variant {
      display: block;
      margin-bottom: 0.5rem;
    }

    #toggle-variant > div {
      padding-left: 0.25rem;
      width: 48px;
      height: 36px;
      image-rendering: pixelated;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        display: block;
        width: 20px;
        height: 20px;
        background: var(--background-before);
        background-size: 40px;
        filter: brightness(80%);
      }

      &::after {
        content: "";
        position: absolute;
        display: block;
        width: 24px;
        height: 24px;
        background: var(--background-after);
        background-size: 48px;
        right: 10px;
        top: 10px;
        outline: 2px white solid;
      }
    }

    #toggle-classic {
      --background-before: url(${unsafeCSS(imgSteveAlex)}) 20px 0px;
      --background-after: url(${unsafeCSS(imgSteveAlex)}) 0px 0px;
    }

    #toggle-slim {
      --background-before: url(${unsafeCSS(imgSteveAlex)}) 0px 0px;
      --background-after: url(${unsafeCSS(imgSteveAlex)}) 24px 0px;
    }
  `;

  constructor(editor) {
    super();

    this.editor = editor;

    editor.project.addEventListener("variant-change", () => {
      this.requestUpdate();
    })
  }

  render() {
    const isSlim = this.editor.getVariant() == "slim";

    return html`
      <ncrs-toggle title="${msg(`Toggle skin model`, {id: `toolbar.toggle.model`})}" id="toggle-variant" ?toggled=${isSlim} @toggle=${this._toggleSkinModel}>
        <div id="toggle-classic" slot="off">
        </div>
        <div id="toggle-slim" slot="on">
        </div>
      </ncrs-toggle>
    `;
  }

  _toggleSkinModel(event) {
    const model = event.detail ? "slim" : "classic";
    this.editor.setVariant(model);
  }
}

customElements.define("ncrs-tools-model-toggle", ModelToggle);
export default ModelToggle;