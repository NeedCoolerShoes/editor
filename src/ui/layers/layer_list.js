import { Sortable } from "sortablejs";
import { css, html, LitElement } from "lit";
import Layer from "./layer.js";

class LayerList extends LitElement {
  static properties = {
    mobile: {type: Boolean, reflect: true},
  }

  static styles = css`
    :host {
      display: block;
      width: 5rem;
      background-color: #131315dd;
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      border-left: 1px solid #1f2025;
      box-sizing: border-box;
      padding: 0.25rem;
    }

    @-moz-document url-prefix() {
      :host {
        backdrop-filter: none;
      }
    }

    #list {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      height: 100%;
    }

    #layers-wrapper {
      position: relative;
      flex-grow: 1;
      width: 72px;
      overflow: auto;
    }

    #layers-overflow {
      position: absolute;
      display: flex;
      flex-direction: column;

      top: 0px;
      bottom: 0px;
      left: 0px;
      right: 0px;
    }

    #layers-spacer {
      flex-grow: 1;
    }

    #layers {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow: auto;
      overflow-x: hidden;
      scrollbar-width: none;
    }

    #buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.125rem;
      width: 100%;
    }

    :host([mobile]) #layers .handle {
      display: flex;
    }

    #layers .handle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      background-color: #232428cc;
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
      cursor: grab;
    }

    #layers .handle ncrs-icon {
      width: 1rem;
      height: 1rem;
      touch-action: none;
      --icon-color: rgb(73, 76, 78);
    }

    #layers .layer {
      width: 100%;
      height: 100%;
      display: flex;
    }

    #layers .layer.sortable-chosen,  #layers .handle.sortable-chosen{
      cursor: grabbing;
    }

    ncrs-button {
      flex-grow: 1;
    }

    ncrs-button::part(button) {
      padding: 0.125rem;
      padding-top: 0.42rem;
      padding-bottom: 0.42rem;
    }

    #add-button, #remove-button {
      margin-bottom: -0.25rem;
    }

    #clone-button::part(button) {
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0px;
    }

    #merge-button::part(button) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0.5rem;
    }

    ncrs-icon {
      display: block;
      box-sizing: border-box;
      height: 0.8rem;
      width: auto;
    }

    :host([mobile]) {
      width: 7.25rem;
    }

    :host([mobile]) #layers-wrapper {
      width: 6.5rem;
    }

    :host([mobile]) ncrs-layer {
      width: 5.25rem;
      --icon-size: 1.75rem;
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
    }
  `;

  constructor(ui) {
    super();
    this.ui = ui;
  }
  sortable;

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    this.ui.editor.layers.addEventListener("layers-update", () => {
      this.requestUpdate();
    });

    this.ui.editor.layers.addEventListener("layers-select", () => {
      this.requestUpdate();
    });
  }

  render() {
    const layersDiv = this._setupLayers();
    const mergeDisabled = this.ui.editor.layers.selectedLayerIndex == 0;

    return html`
      <div id="list">
        ${layersDiv}
        <div id="buttons">
          <ncrs-button id="add-button" @click=${this._addLayer} title="Add layer [Shift+N]">
            <ncrs-icon part="icon" icon="add" color="var(--text-color)"></ncrs-icon>
          </ncrs-button>
          <ncrs-button id="remove-button" @click=${this._removeLayer} title="Remove current layer [Del]">
            <ncrs-icon part="icon" icon="remove" color="var(--text-color)"></ncrs-icon>
          </ncrs-button>
          <ncrs-button id="clone-button" @click=${this._cloneLayer} title="Clone current layer [Shift+D]">
            <ncrs-icon part="icon" icon="clone" color="var(--text-color)"></ncrs-icon>
          </ncrs-button>
          <ncrs-button id="merge-button" @click=${this._mergeLayer} title="Merge current layer with below [Shift+M]" ?disabled=${mergeDisabled}>
            <ncrs-icon part="icon" icon="merge" color="var(--text-color)"></ncrs-icon>
          </ncrs-button>
        </div>
      </div>
    `;
  }

  _setupLayers() {
    const inner = document.createElement("div");
    inner.id = "layers"

    this.sortable = this._setupSortable(inner);

    this.ui.editor.forEachLayer((layer) => {
      const layerDiv = document.createElement("div");
      layerDiv.classList.add("layer");

      const handleDiv = document.createElement("div");
      handleDiv.classList.add("handle");

      const handleIcon = document.createElement("ncrs-icon");
      handleIcon.icon = "move-layer";
      handleIcon.color = "var(--icon-color)";
      handleDiv.appendChild(handleIcon);

      layerDiv.appendChild(handleDiv);
      layerDiv.appendChild(new Layer(this.ui, layer));

      inner.prepend(layerDiv);
    })

    return html`
      <div id="layers-wrapper">
        <div id="layers-overflow">
          <div id="layers-spacer"></div>
          ${inner}
        </div>
      </div>
    `;
  }

  _setupSortable(target) {
    const handle = this.mobile ? ".handle" : ".layer";

    const sortable = new Sortable(target, {
      draggable: ".layer",
      handle: handle,
      distance: 2,
      onEnd: (event) => {
        const count = target.querySelectorAll(".layer").length - 1;

        const fromIndex = count - event.oldDraggableIndex;
        const toIndex = count - event.newDraggableIndex;

        this.ui.editor.reorderLayers(fromIndex, toIndex);
      }
    });

    return sortable;
  }

  _addLayer() {
    this.ui.editor.addLayer();
  }

  _removeLayer() {
    this.ui.editor.removeLayer();
  }

  _cloneLayer() {
    this.ui.editor.cloneLayer();
  }

  _mergeLayer() {
    this.ui.editor.mergeLayer();
  }
}

customElements.define("ncrs-layer-list", LayerList);

export default LayerList;