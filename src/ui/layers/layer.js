import { css, html, LitElement } from "lit";

class Layer extends LitElement {
  static styles = css`
    :host {
      width: 68px;
      height: 48px;
      image-rendering: pixelated;
      border-style: solid;
      border-width: 2px;
      border-radius: 4px;
      border-color: #232428;
    }

    :host([active=true]) {
      border-color: #494c4e;
    }

    #layer {
      position: relative;
      width: 100%;
      height: 100%;
    }

    button {
      all: unset;
      position: absolute;
      display: flex;
    }

    #layer-button {
      cursor: grab;
      padding: 0.375rem;
      padding-left: 0.125rem;

      top: 0px;
      bottom: 0px;
      left: 0px;
      right: 0px;
    }

    #layer-button:active {
      cursor: grabbing;
    }

    #layer-button:focus-visible {
      outline: 1px white solid;
    }

    #visibility-toggle {
      cursor: pointer;
      width: 16px;
      height: 16px;
      right: 0.125rem;
      top: 16px;
    }

    #visibility-toggle:focus-visible {
      outline: 1px white solid;
    }

    :host(.sortable-drag) #visibility-toggle {
      display: none;
    }

    ncrs-icon {
      --icon-color: white;
      width: 16px;
      height: auto;
    }
  `

  static properties = {
    active: {reflect: true},
    visible: {},
  }

  constructor(ui, layer) {
    super();

    this.ui = ui;
    this.layer = layer;
    if (this.layer == undefined) {
      this.blank = true;
      return;
    }
    
    this.visible = layer.visible;

    this.canvas = this._setupCanvas();
    this.active = layer.selected;

    this.layer.addEventListener("layer-update", () => {
      this.requestUpdate();
    })

    this.layer.addEventListener("layer-select", event => {
      this.active = event.detail.selected;
    })
  }
  blank = false;

  render() {
    if (!this.blank) {
      const image = this.layer.toPreview();
      const ctx = this.canvas.getContext("2d");
  
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.drawImage(image, 0, 0);
    }

    return html`
      <div id="layer">
        <button id="layer-button" @click=${this.select}>${this.canvas}</button>
        <button id="visibility-toggle" @click=${this.toggleVisibile}>
          <ncrs-icon icon="${this.visible ? "eye-open" : "eye-closed"}" color="var(--icon-color)">
          </ncrs-icon>
        </button>
      </div>
    `;
  }

  select() {
    if (this.blank) { return; }

    this.ui.editor.selectLayer(this.layer);
    this.active = true;
  }

  toggleVisibile() {
    if (this.blank) { return; }

    this.visible = !this.visible;
    this.layer.visible = this.visible;

    this.ui.editor.renderLayers();
  }

  _setupCanvas() {
    const canvas = document.createElement("canvas");
    canvas.id = "preview";
    canvas.width = 36;
    canvas.height = 32;

    return canvas;
  }
}

customElements.define("ncrs-layer", Layer);

export default Layer;