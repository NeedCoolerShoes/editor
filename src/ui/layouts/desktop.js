import BaseLayout from "./base";

import { css, html, unsafeCSS } from "lit";
import Toolbar from "../tools/toolbar.js";
import LayerList from "../layers/layer_list.js";
import Config from "../config/main.js";
import WarningManager from "../misc/warnings.js";

import imgGridDark from "../../../assets/images/grid-editor-dark.png";

class NCRSUIDesktopLayout extends BaseLayout {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      --ncrs-color-picker-height: 15rem;
    }

    #main {
      display: flex;
      width: 100%;
      height: 100%;
      position: relative;
    }

    ncrs-warning-manager {
      position: absolute;
      top: 8px;
      left: 4px;
      padding-right: 2.5rem;
      --text-color: var(--editor-icon-color);
    }

    :host(.minimized) {
      --ncrs-color-picker-height: 15rem;
    }

    :host(.fullscreen) {
      --ncrs-color-picker-height: 17rem;
    }

    #editor {
      background-color: #191919;
      background-image: var(--editor-bg, url(${unsafeCSS(imgGridDark)}));
      flex-grow: 1;
      position: relative;
    }

    #layers {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
    }

    #layers ncrs-layer-list {
      flex-grow: 1;
    }

    #editor ncrs-editor {
      width: 100%;
      height: 100%;
      min-width: 240px;
    }

    #history {
      display: flex;
      justify-content: center;
      padding: 0.5rem;
      gap: 0.5rem;
      background-color: rgb(19, 19, 21);
    }

    #history button {
      all: unset;
      cursor: pointer;
    }

    #history button:disabled {
      cursor: default;
    }

    #history button:focus-visible {
      outline: 1px solid white;
    }

    #history ncrs-icon {
      --icon-color: white;
      width: 24px;
      height: 24px;
    }

    #history button:disabled ncrs-icon {
      --icon-color: #aaaaaa;
    }

    #themeToggle {
      all: unset;
      display: block;
      cursor: pointer;
      position: absolute;
      top: 8px;
      right: 8px;
    }

    #themeToggle ncrs-icon {
      width: 24px;
      height: 24px;
    }

    #themeToggle .dark {
      display: var(--toggle-dark);
    }

    #themeToggle .gray {
      display: var(--toggle-gray);
    }

    #themeToggle .light {
      display: var(--toggle-light);
    }

    #fullscreenToggle {
      all: unset;
      display: block;
      cursor: pointer;
      position: absolute;
      top: 40px;
      right: 8px;
    }

    #fullscreenToggle ncrs-icon {
      width: 24px;
      height: 24px;
    }

    #fullscreenToggle .minimize {
      display: var(--toggle-minimize);
    }

    #fullscreenToggle .fullscreen {
      display: var(--toggle-fullscreen);
    }

    #warningPopup {
      position: absolute;
      pointer-events: none;
      top: calc(50% - 0.5rem);
      bottom: 0px;
      left: 0px;
      right: 0px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: start;
    }

    #warningPopup > div {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(0.25rem);
      color: white;
      animation: fadeOut 1.5s ease-out;
      opacity: 0;
      padding: 0.25rem;
      border-radius: 0.125rem;
    }

    #warningPopup > div:nth-child(n + 4) {
      display: none;
    }


    @keyframes fadeOut {
        0% { opacity: 1; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
  `;

  constructor(ui) {
    super(ui, "desktop");

    this.toolbar = new Toolbar(this.ui);
    this.layers = new LayerList(this.ui);
    this.config = new Config(this.ui);

    this._setupEvents();
  }

  firstUpdated() {
    super.firstUpdated();
  }

  displayWarningPopup(message) {
    const warning = document.createElement("div");
    warning.innerText = message;

    this.renderRoot.getElementById("warningPopup").prepend(warning);

    setTimeout(() => {
      warning.remove();
    }, 2000);

  }

  render() {
    return html`
      <div id="main">
        ${this.config}
        ${this.toolbar}
        <div id="editor">
          ${this.editor}
          ${this.warningManager}
          ${this._bgToggle()}
          ${this._fullscreenToggle()}
          <div id="warningPopup"></div>
        </div>
        <div id="layers">
          ${this._historyButtons()}
          ${this.layers}
        </div>
      </div>
    `;
  }

  _bgToggle() {
    return html`
      <button id="themeToggle" @click=${this.toggleEditorBackground}>
        <ncrs-icon title="Switch to dusk mode." icon="dusk-mode" color="var(--editor-icon-color)" class="dark"></ncrs-icon>
        <ncrs-icon title="Switch to light mode." icon="light-mode" color="var(--editor-icon-color)" class="gray"></ncrs-icon>
        <ncrs-icon title="Switch to dark mode." icon="dark-mode" color="var(--editor-icon-color)" class="light"></ncrs-icon>
      </button>
    `;
  }

  _fullscreenToggle() {
    return html`
      <button id="fullscreenToggle" @click=${this.toggleFullscreen}>
        <ncrs-icon class="fullscreen" title="Switch to Fullscreen." icon="fullscreen" color="var(--editor-icon-color)" class="minimized"></ncrs-icon>
        <ncrs-icon class="minimize" title="Minimize." icon="minimize" color="var(--editor-icon-color)" class="fullscreen"></ncrs-icon>
      </button>
    `;
  }

  _historyButtons() {
    const undoDisabled = !this.editor.history.canUndo();
    const redoDisabled = !this.editor.history.canRedo();

    return html`
      <div id="history">
        <button title="Undo [Ctrl + Z]" ?disabled=${undoDisabled} @click=${this._undo}>
          <ncrs-icon icon="undo" color="var(--icon-color)"></ncrs-icon>
        </button>
        <button title="Redo [Ctrl + Y]" ?disabled=${redoDisabled} @click=${this._redo}>
          <ncrs-icon icon="redo" color="var(--icon-color)"></ncrs-icon>
        </button>
      </div>
    `
  }

  _undo() {
    this.editor.history.undo();
  }

  _redo() {
    this.editor.history.redo();
  }

  _setupEvents() {
    this.editor.history.addEventListener("update", () => {
      this.requestUpdate();
    });

    this.editor.addEventListener("select-tool", event => {
      if (event.detail.wasActive) {
        this.config.select("tool");
      }
    });
  }
}

customElements.define("ncrs-ui-desktop-layout", NCRSUIDesktopLayout);

export default NCRSUIDesktopLayout;