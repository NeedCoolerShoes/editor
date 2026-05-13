import "./misc/icon";
import "./misc/button";
import "./misc/toggle";
import "./misc/troggle";
import "./misc/quadroggle";
import "./misc/modal";
import "./misc/window";
import "./misc/skin_2d";

import { css, html, unsafeCSS, LitElement } from "lit";
import Editor from "../editor/main.js";
import PersistenceManager from "../persistence.js";
import Modal from "./misc/modal.js";

import { GALLERY_URL, SKIN_LOOKUP_URL } from "../constants.js";
import passesColorAccuracyTest from "./misc/color_accuracy_test.js";
import setupKeybinds from "./keybinds.js";
import NCRSUIDesktopLayout from "./layouts/desktop.js";
import NCRSUIMobileLayout from "./layouts/mobile.js";

import imgGridDark from "../../assets/images/grid-editor-dark.png";
import imgGridGray from "../../assets/images/grid-editor-gray.png";
import imgGridLight from "../../assets/images/grid-editor-light.png";
import { isIOS } from "../helpers.js";

const DESKTOP_MIN_WIDTH = 670;

class UI extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
    }

    :host(.fullscreen) {
      --toggle-fullscreen: none;
      --toggle-minimize: block;
    }

    :host(.fullscreen-browser) {
      --mobile-header-padding: 1.5rem;
    }

    :host(.minimized) {
      --toggle-fullscreen: block;
      --toggle-minimize: none;
    }

    :host(.editor-dark) {
      --editor-bg: url(${unsafeCSS(imgGridDark)});
      --editor-icon-color: #ffffff66;
      --toggle-dark: block;
      --toggle-gray: none;
      --toggle-light: none;
    }

    :host(.editor-gray) {
      --editor-bg: url(${unsafeCSS(imgGridGray)});
      --editor-icon-color: #ffffff66;
      --toggle-dark: none;
      --toggle-gray: block;
      --toggle-light: none;
    }

    :host(.editor-light) {
      --editor-bg: url(${unsafeCSS(imgGridLight)});
      --editor-icon-color: #00000088;
      --toggle-dark: none;
      --toggle-gray: none;
      --toggle-light: block;
    }

    :host(.hide-controls) {
      --controls-fullscreen: none;
    }

    #main {
      display: flex;
      width: 100%;
      height: 100%;
      position: relative;
    }

    #color-check-modal {
      justify-content: center;
      position: absolute;
    }
    
    #color-check {
      color: white;
      background-color: #1A1A1A;
      padding: 1rem;
      border-radius: 0.25rem;
      max-width: 32rem;
    }

    #color-check h2 {
      margin: 0px;
      text-align: center;
    }

    #color-check a {
      color: white;
    }

    #color-check div {
      display: flex;
      gap: 0.25rem;
      margin-top: 1rem;
    }

    #color-check ncrs-button {
      flex-grow: 1;
      flex-basis: 0;
    }

    #color-check ncrs-button::part(button) {
      padding: 0.25rem;
      text-align: center;
      font-size: large;
    }

    #export-form {
      z-index: 100;
    }
  `;

  static properties = {
    src: {type: String},
    _warning: {type: String, state: true},
  }

  static desktopLayoutMinWidth = DESKTOP_MIN_WIDTH;

  constructor() {
    super();

    this.persistence = new PersistenceManager("ncrs-ui");
    this.editor = new Editor();

    this.exportModal = this._setupModal("export-form");

    this.layout = new NCRSUIDesktopLayout(this);

    this.classList.add("minimized");

    this._setupResizeObserver();
    this._setEditorTheme();
    this._pwaCheck();
    this._iosCheck();
    this._setupEvents();
  }
  disableKeybinds = false;
  _browserFullScreen = false;

  firstUpdated() {
    setupKeybinds(this, this.editor);
  }

  render() {
    return html`
      <div id="main">
        ${this.layout}
        ${this._setupColorCheckModal()}
      </div>
      ${this.exportModal}
      ${this.galleryModal}
      <slot name="footer"></slot>
    `;
  }

  galleryURL() {
    if (!this.src) { return GALLERY_URL };

    const url = new URL(this.src);

    return `${url.origin}/gallery/skins`;
  }

  skinLookupURL() {
    if (!this.src) { return SKIN_LOOKUP_URL };

    const url = new URL(this.src);

    return `${url.origin}/api/skin`;
  }

  toggleFullscreen() {
    if (this.classList.contains("minimized")) {
      this.classList.replace("minimized", "fullscreen");

      if (!isIOS && this._getValidLayout() === "mobile") {
        this.requestFullscreen().then(() => {
          this._browserFullScreen = true;
          this.classList.add("fullscreen-browser");
        });
      }

    } else if (this.classList.contains("fullscreen")) {
      if (this._browserFullScreen) {
        document.exitFullscreen();      
      } else {
        this.classList.replace("fullscreen", "minimized");
      }
    }
  }

  toggleEditorBackground() {
    if (this.classList.contains("editor-gray")) {
      this.classList.replace("editor-gray", "editor-light");
      this.persistence.set("theme", "light");
    } else if (this.classList.contains("editor-light")) {
      this.classList.replace("editor-light", "editor-dark");
      this.persistence.set("theme", "dark");
    } else {
      this.classList.remove("editor-dark", "editor-light");
      this.classList.add("editor-gray");
      this.persistence.set("theme", "gray");
    }
  }

  selectConfigTab(tab) {
    if (this.layout instanceof NCRSUIDesktopLayout) {
      this.layout.config.select(tab);
    }
  }

  displayWarningPopup(message) {
    this.layout.displayWarningPopup(message);
  }

  _getValidLayout() {
    if (this.clientWidth >= DESKTOP_MIN_WIDTH) {
      return "desktop";
    } else {
      return "mobile";
    }
  }

  _getLayout(id) {
    const layouts = {
      desktop: new NCRSUIDesktopLayout(this),
      mobile: new NCRSUIMobileLayout(this),
    }

    return layouts[id];
  }

  _setupModal(name) {
    const modal = new Modal();
    modal.part = name;
    modal.id = name;
    
    const slot = document.createElement("slot");
    slot.name = name;

    modal.appendChild(slot);

    return modal
  }

  _setupColorCheckModal() {
    return html`
      <ncrs-modal id="color-check-modal">
        <div id="color-check">
          <h2>🚨 Color Inaccuracies Detected 🚨</h2>
          <p>We have detected that your browser may have issues with color accuracy.</p>
          <p>
            To protect against fingerprinting, browsers can sometimes add visual noise to the canvas.
            This method is known as <a href="https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/#what-is-farbling">farbling</a>.
            This is not ideal for a pixel art editor.
          </p>
          <p>
            If small amounts of noise / randomly coloured pixels in your skin is an issue, follow our guide below to fix the issue.
          </p>
          <a href="https://wiki.needcoolershoes.com/troubleshooting/inaccurate_colors/" target="_blank">Learn how to fix</a>
          <p>
            Please note that we do not perform any fingerprinting on our site.
          </p>
          <a href="https://needcoolershoes.com/privacy">Our privacy policy</a>
          <div>
            <ncrs-button @click=${this._closeColorModal}>Close</ncrs-button>
            <ncrs-button @click=${this._ignoreColorModal}>Do Not Show Again</ncrs-button>
          </div>
        </div>
      </ncrs-modal>
    `;
  }

  _closeColorModal() {
    this.shadowRoot.getElementById("color-check-modal").hide();
  }

  _ignoreColorModal() {
    this.persistence.set("ignoreColorCheck", true);
    this.shadowRoot.getElementById("color-check-modal").hide();
  }

  _runColorCheck() {
    if (this.persistence.get("ignoreColorCheck", false)) { return; }
    if (passesColorAccuracyTest()) { return; }

    this.shadowRoot.getElementById("color-check-modal").show();
  }

  _setEditorTheme() {
    if (
      !this.classList.contains("editor-dark") ||
      !this.classList.contains("editor-gray") ||
      !this.classList.contains("editor-light")
    ) {
      const theme = this.persistence.get("theme", "dark");
      this.classList.add(`editor-${theme}`);
    }
  }

  _setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      const validLayout = this._getValidLayout();

      if (this.layout.id === validLayout) return;

      this.editor.mobile = (validLayout === "mobile");

      delete this.layout;
      this.layout = this._getLayout(validLayout);

      this.requestUpdate();
    });

    resizeObserver.observe(this);
  }

  _pwaCheck() {
    if (window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches) {
      this.classList.add("fullscreen", "hide-controls");
    }
  }

  _iosCheck() {
    if (isIOS) {
      this.classList.add("platform-ios")
    }
  }

  _setupEvents() {
    this.addEventListener("dragover", event => event.preventDefault());
    this.addEventListener("drop", event => {
      event.preventDefault();
      [...event.dataTransfer.items].forEach(item => {
        const file = item.getAsFile();

        if (item.type === "image/png") { 
          this.editor.addLayerFromFile(file);
        } else if (file.name.endsWith(".ncrs")) {
          this.editor.loadProjectFromFile(file);
        }
      })
    });

    this.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) return;

      this.classList.remove("fullscreen-browser");
      this.classList.replace("fullscreen", "minimized");
      this._browserFullScreen = false;
    })

    window.addEventListener("load", () => {
      this._runColorCheck();
    });

    this.exportModal.addEventListener("show", () => {
      this.disableKeybinds = true;
    });

    this.exportModal.addEventListener("hide", () => {
      this.disableKeybinds = false;
    });

    this.editor.addEventListener("tool-warning", event => {
      this.displayWarningPopup(event.detail.message);
    })
  }
}

customElements.define("ncrs-ui", UI);

export default UI;