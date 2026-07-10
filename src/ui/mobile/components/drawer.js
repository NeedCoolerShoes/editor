import interact from "interactjs";
import { css, html, LitElement } from "lit";

const CLOSE_THRESHOLD = 30;
const CLOSE_SPEED_THRESHOLD = 25;
const REVERSE_CLOSE_THRESHOLD = -5;

class MobileDrawer extends LitElement {
  static properties = {
    open: {type: Boolean, reflect: true},
  }

  static styles = css`
    :host {
      --base-opacity: 0.75;
      --base-blur: 4px;
      --drawer-height: 100%;

      display: none;
      align-items: flex-end;
      position: absolute;
      inset: 0px;
      overflow: hidden;
      background-color: rgba(0, 0, 0, calc(var(--base-opacity) - var(--close-progress, 0)));
      backdrop-filter: blur(calc(var(--base-blur) * calc(1 - var(--close-progress, 0))));
      -webkit-backdrop-filter: blur(calc(var(--base-blur) * calc(1 - var(--close-progress, 0))));
      padding-top: 4rem;
      z-index: 50;
    }

    @-moz-document url-prefix() {
      :host {
        backdrop-filter: none;
      }
    }

    #drawer {
      background-color: rgb(26, 26, 26);
      height: var(--drawer-height);
      max-height: 100%;
      width: 100%;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
      z-index: 2;
    }

    #handle-section {
      display: flex;
      justify-content: center;
      padding: 0.25rem;
      padding-top: 0.5rem;
      margin-bottom: 0.5rem;
      position: relative;
      touch-action: none;
    }

    #handle {
      width: 4rem;
      height: 0.25rem;
      background-color: rgb(156, 163, 175);
      border-radius: 0.25rem;
    }

    #handle-overlay {
      position: absolute;
      left: 0px;
      right: 0px;
      bottom: -0.5rem;
      height: 5rem;
    }

    #body {
      height: 100%;
      max-height: calc(100% - 2rem);
      box-sizing: border-box;
    }

    :host([open]) {
      display: flex;
    }

    :host([open]) #drawer {
      transform: translateY(0%);
    }

    :host([open]:not(.open)) #drawer {
      transform: translateY(0%);
      animation: open 0.5s cubic-bezier(0.32,0.72,0,1);
    }

    :host(.closing) {
      animation: fade 0.5s;
    }

    :host(.closing) #drawer {
      animation: close 0.5s cubic-bezier(0.32,0.72,0,1);
    }

    :host(.snap) #drawer {
      animation: snap 0.5s cubic-bezier(0.32,0.72,0,1);
    }

    @keyframes open {
      from {
        transform: translateY(100%);
      }

      to {
        transform: translateY(0%);
      }
    }

    @keyframes snap {
      to {
        transform: translateY(0%);
      }
    }

    @keyframes close {
      to {
        transform: translateY(100%);
      }
    }

    @keyframes fade {
      to {
        opacity: 0;
      }
    }
  `;

  constructor() {
    super();

    this._setupEvents();
  }
  drawer;
  _translate = 0;
  _shouldClose = false;
  _lastDelta = 0;

  firstUpdated() {
    this._setupInteract();
  }

  render() {
    return html`
      <div id="drawer" part="drawer">
        <div id="handle-section">
          <div id="handle" part="handle"></div>
          <div id="handle-overlay"></div>
          <span id="debug"></span>
        </div>
        <div id="body" part="body">
          <slot></slot>
        </div>
      </div>
    `;
  }

  show() {
    this.open = true;
  }

  hide() {
    this.classList.add("closing");
  }

  _setupInteract() {
    this.drawer = this.renderRoot.getElementById("drawer");
    this.drawer.addEventListener("animationend", event => this._onAnimationEnd(event));
    this.drawer.addEventListener("click", event => event.stopImmediatePropagation());

    const handle = this.renderRoot.getElementById("handle-overlay");
    handle.addEventListener("click", () => {
      if (this._translate > 0) return;
      if (this.classList.contains("snap")) return;
      
      this.hide();
    });

    interact(handle).draggable({
      startAxis: "y",
      lockAxis: "y",
      listeners: {
        move: this._onDragMove.bind(this),
        end:  this._onDragEnd.bind(this),
      }
    });
  }

  _setTranslate(value) {
    this._translate = Math.max(value, 0);

    const progress = (this._translate / this.drawer.clientHeight);

    this.style.setProperty("--close-progress", progress);
    this.drawer.style.setProperty("transform", `translateY(${this._translate}px)`);
  }

  _onDragMove(event) {
    this._setTranslate(this._translate + event.delta.y);

    if (event.delta.y > CLOSE_SPEED_THRESHOLD) {
      this._shouldClose = true;
    } else if (event.delta.y < 0) {
      this._shouldClose = false;
    }

    this._lastDelta = event.delta.y;
  }

  _onDragEnd() {
    if (this._shouldClose) {
      return this.hide();
    }

    if (this._translate > CLOSE_THRESHOLD && this._lastDelta > REVERSE_CLOSE_THRESHOLD) {
      return this.hide();
    }

    if (this._translate < 0) {
      return;
    }

    this.classList.remove("dragging");
    this.classList.add("snap");
  }

  _reset() {
      this._translate = 0;
      this._shouldClose = false;
      this._lastDelta = 0;
      this.drawer.style.removeProperty("transform");
      this.style.removeProperty("--close-progress");
      this.classList.remove("closing", "open");
  }

  _onAnimationEnd(event) {
    if (event.animationName === "open") {
      this.classList.add("open");
      this.dispatchEvent(new CustomEvent("open"));
    }

    if (event.animationName === "close") {
      this.open = false;
      this._reset();
      this.dispatchEvent(new CustomEvent("close"));
    }

    if (event.animationName === "snap") {
      this.classList.remove("snap");
      this._setTranslate(0);
    }
  }

  _setupEvents() {
    this.addEventListener("click", () => {
      if (this.classList.contains("snap")) return;

      this.hide();
    })
  }
}

customElements.define("ncrs-mobile-drawer", MobileDrawer);
export default MobileDrawer;