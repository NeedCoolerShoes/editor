import { css, html, LitElement, unsafeCSS } from "lit";
import imgGridGray from "../../../assets/images/grid-editor-gray.png";
import "../misc/skin_2d";
import "../misc/face_2d";

const GLOBAL_STYLES = css`
  :host {
    --text-color: white;
    --icon-color: white;
  }

  :host(:hover) {
    --text-color: #BBBBBB;
  }

  :host([selected]) {
    --text-color: #55b2ff;
  }
`;

const DESKTOP_STYLES = css`
  :host(:not([mobile]):hover) {
    --text-color: #BBBBBB;
  }

  :host(:not([mobile])[selected]) #main {
    background-color: #1A1A1A;
    margin-top: 0px;
    font-weight: bold;
  }

  :host(:not([mobile])) {
    & {
      height: 100%;
      display: flex;
    }
    
    span {
      display:inline-block;
      padding: 2px;
      min-width: 40px;
    }

    span:focus {
      border: 0;
      border-radius:4px;
      outline: #55b2ff solid 2px;
    }

    #main {
      display: flex;
      position: relative;
      border-top-right-radius: 0.25rem;
      border-top-left-radius: 0.25rem;
      border-width: 0px;
      border-top-width: 2px;
      border-color: #232428;
      background-color: #232428;
      border-style: solid;
      background-color: #232428;
      margin-top: 0.25rem;
    }

    #cross {
      position: absolute;
      display: flex;
      align-items: center;
      top: 0px;
      bottom: 0px;
      right: 0.25rem;
    }

    button {
      all: unset;
      display: block;
      cursor: pointer;
      user-select: none;
    }

    #tab-button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      width: 100%;
      height: 100%;
      padding: 0rem 0.5rem;
      padding-right: 2rem;
      flex-grow: 1;
      color: var(--text-color);
    }

    #cross button {
      width: 12px;
      height: 12px;
    }

    ncrs-icon {
      display: block;
      width: 100%;
      height: 100%;
    }

    #thumbnail-bg {
      display: inline-block;
      background-image: url(${unsafeCSS(imgGridGray)});
      width: 16px;
      height: 16px;
    }

    #thumbnail {
      image-rendering: pixelated;
      width: 100%;
      height: 100%;
    }

    m3e-tooltip {
      --m3e-tooltip-padding: 0px;
    }

    #tooltip-bg {
      border: 2px solid #313436;
      background-image: url(${unsafeCSS(imgGridGray)});
      padding: 0.5rem;
    }
  }
`;

const MOBILE_STYLES = css`
  :host([mobile]) {
    & {
      --background-color: transparent;
      color: var(--text-color);
      max-height: fit-content;
      overflow: hidden;
      cursor: pointer;
    }

    button {
      all: unset;
      display: block;
      cursor: pointer;
      user-select: none;
    }

    #main {
      padding: 0.5rem;
      border: 2px solid #232428;
      border-radius: 0.5rem;
      background-color: var(--background-color);
    }

    #title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    #title span {
      text-wrap: nowrap;
      overflow: hidden;
    }

    #thumbnail-bg {
      display: inline-block;
      background-image: url(${unsafeCSS(imgGridGray)});
      width: 100%;
      height: auto;
      padding: 0.25rem;
      box-sizing: border-box;
    }

    #thumbnail {
      image-rendering: pixelated;
      width: 100%;
      height: 100%;
    }

    #cross button {
      width: 12px;
      height: 12px;
    }

    ncrs-icon {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  :host([mobile][selected]) {
    --background-color: #131315;

    font-weight: bold;
    overflow: hidden;
  }
`;

class ProjectTab extends LitElement {
  static styles = [GLOBAL_STYLES, DESKTOP_STYLES, MOBILE_STYLES];

  static properties = {
    id: {type: String, reflect: true},
    selected: {type: Boolean, reflect: true},
    thumbnail: {type: String},
    mobile: {type: Boolean, reflect: true}
  }

  constructor(id, name, thumbnail, variant, mobile = false) {
    super();

    this.id = id;
    this.name = name;
    this.thumbnail = thumbnail;
    this.mobile = mobile;
    this.variant = variant;

    this._nameTemp = name;
  }

  render() {
    if (this.mobile) {
      return html`
        <div id="main" @click=${this.select} tabindex="0">
          <div id="title">
            <span
            id="name"
            spellcheck="false"
            aria-label="Editable project name"
            @keydown=${this._onKeyDown}
            @input=${this._onInput}
            @focusout=${this.rename}
            part="name"
            contenteditable=${this.selected ? "plaintext-only" : "none"}
            >${this.name}</span>              
            <div id="cross">
              <button @click=${this.delete}><ncrs-icon icon="cross" color="var(--icon-color)"></ncrs-icon></button>
            </div>
          </div>
          <div id="thumbnail-bg">
            <ncrs-skin-2d src=${this.thumbnail} variant=${this.variant} id="thumbnail">
          </div>
        </div>
      `;
    } else {
      return html`
        <div id="main">
          <button @click=${this.select} id="tab-button">
            <div id="thumbnail-bg">
              <ncrs-face-2d src=${this.thumbnail} id="thumbnail">
            </div>
            <span
              id="name"
              spellcheck="false"
              aria-label="Editable project name"
              @keydown=${this._onKeyDown}
              @input=${this._onInput}
              @focusout=${this.rename}
              contenteditable=${this.selected ? "plaintext-only" : "none"}
              part="name"
            >${this.name}</span>
          </button>
          <div id="cross">
            <button @click=${this.delete}><ncrs-icon icon="cross" color="var(--icon-color)"></ncrs-icon></button>
          </div>
        </div>
        <m3e-tooltip for="main" show-delay="750" ?disabled=${this.selected}>
          <div id="tooltip-bg">
            <ncrs-skin-2d src=${this.thumbnail} variant=${this.variant} id="thumbnail">
          </div>
        </m3e-tooltip>
      `;
    }
  }

  rename() {
    if (this._nameTemp == this.name) return;

    if (this._nameTemp.length > 0) {
      this.dispatchEvent(new CustomEvent("rename", {detail: {name: this._nameTemp}}));
    } else {
      this.renderRoot.getElementById("name").innerText = this.name;
      this._nameTemp = this.name;
    }
  }

  focusName() {
    this.renderRoot.getElementById("name").select();
  }

  select() {
    if (this.selected) return;

    this.dispatchEvent(new CustomEvent("select", {detail: {id: this.id}}));
  }

  delete() {
    let confirmText = "Delete Project?";
    confirmText += "\nThis will permanently delete your project.";
    confirmText += "\nAre you sure you wish to continue?"

    const check = confirm(confirmText);
    if (!check) { return; }

    this.dispatchEvent(new CustomEvent("delete", {detail: {id: this.id}}));
  }

  _onInput(event) {
    if (event.inputType === "insertLineBreak") {
      event.target.innerText = this._nameTemp;
      return this.rename();
    }
    
    this._nameTemp = event.target.innerText.trim();
  }

  _onClick(event) {
    window.getSelection().selectAllChildren(event.target);
  }

  _onKeyDown(event) {
    if (event.key === "Escape") {
      const nameField = this.renderRoot.getElementById("name");
      nameField.innerText = this.name;
      this._nameTemp = this.name;

      nameField.blur();
    }
  }

  _setupThumbnailCanvas() {
    const canvas = document.createElement("canvas");
    
  }
}

customElements.define("ncrs-ui-project-tab", ProjectTab);
export default ProjectTab;