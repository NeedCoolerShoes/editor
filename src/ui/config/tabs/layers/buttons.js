import { css, html, LitElement } from "lit";
import * as THREE from "three";
import UpdateLayerTextureEntry from "../../../../editor/history/entries/update_layer_texture_entry";
import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../../../../constants";
import "@lit/localize/lit-localize.js";

class LayersTabButtons extends LitElement {
  static styles = css`
    #layer-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 0.25rem;
      column-gap: 0.5rem;
      padding: 0.5rem;
    }

    #layer-buttons ncrs-button {
      display: block;
      width: 100%;
    }

    #layer-buttons ncrs-button::part(button) {
      padding: 0.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      box-sizing: border-box;
    }

    #layer-buttons ncrs-icon {
      height: 2.6rem;
      width: auto;
      display: block;
      padding-top: 2px;
    }

    #layer-buttons p {
      margin: 0px;
      margin-top: 0.125rem;
      font-size: small;
      color: var(--text-color);
      opacity:0.5;
      text-align: center;
      width: 100%;
    }
  `;

  constructor(editor) {
    super();

    this.editor = editor;
    this.config = editor.toolConfig;
  }

  render() {
    return html`
      <div id="layer-buttons">
        <ncrs-button @click=${this.swapFrontBack} title="${msg(`Flip the skin's front with its back.`,{id:`layers.desc.flipFB`})}">
          <ncrs-icon icon="flip-front-back" color="var(--text-color)"></ncrs-icon>
          <p>${msg(`Flip Front / Back`,{id:`layers.label.flipFB`})}</p>
        </ncrs-button>
        <ncrs-button @click=${this.swapLeftRight} title="${msg(`Flip the current skin horizontally.`,{id:`layers.desc.flipLR`})}">
          <ncrs-icon icon="flip-left-right" color="var(--text-color)"></ncrs-icon>
          <p>${msg(`Flip Left / Right`,{id:`layers.label.flipLR`})}</p>
        </ncrs-button>
        <ncrs-button @click=${this.swapBodyOverlay} title="${msg(`Swap the base layer of the skin with its overlay.`,{id:`layers.desc.flipFrBa`})},{id:`layers.desc.swapBaseOver`})}">
          <ncrs-icon icon="swap-body-overlay" color="var(--text-color)"></ncrs-icon>
          <p>${msg(`Swap Base / Overlay`,{id:`layers.label.swapBaseOver`})}</p>
        </ncrs-button>
        <ncrs-button @click=${this.flattenLayerOverlay} title="${msg(`Flatten the overlay in to the base of the skin on the selected layer.`,{id:`layers.desc.flatten`})}">
          <ncrs-icon icon="flatten-overlay-base" color="var(--text-color)"></ncrs-icon>
          <p>${msg(`Flatten Overlay`,{id:`layers.label.flatten`})}</p>
        </ncrs-button>
        <ncrs-button @click=${this.clearLayerBase} title="${msg(`Erases the base of the skin on the selected layer.`,{id:`layers.desc.eraseBase`})}">
          <ncrs-icon icon="erase-base" color="var(--text-color)"></ncrs-icon>
          <p>${msg(`Erase Base`,{id:`layers.label.eraseBase`})}</p>
        </ncrs-button>
        <ncrs-button @click=${this.clearLayerOverlay} title="${msg(`Erases the overlay of the skin on the selected layer.`,{id:`layers.desc.eraseOver`})}">
          <ncrs-icon icon="erase-overlay" color="var(--text-color)"></ncrs-icon>
          <p>${msg(`Erase Overlay`,{id:`layers.label.eraseOver`})}</p>
        </ncrs-button>
      </div>
    `;
  }

  swapBodyOverlay() {
    const layers = this.editor.layers;
    const layer = this._getLayer();
    const canvas = layer.swapBodyOverlayTexture("classic");
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    layer.flush();

    this.editor.history.add(
      new UpdateLayerTextureEntry(layers, layer, texture)
    );
  }

  swapFrontBack() {
    const layers = this.editor.layers;
    const layer = this._getLayer();
    const canvas = layer.swapFrontBackTexture(this.editor.getVariant());
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    layer.flush();

    this.editor.history.add(
      new UpdateLayerTextureEntry(layers, layer, texture)
    );
  }

  swapLeftRight() {
    const layers = this.editor.layers;
    const layer = this._getLayer();
    const canvas = layer.swapLeftRightTexture(this.editor.getVariant());
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    layer.flush();

    this.editor.history.add(
      new UpdateLayerTextureEntry(layers, layer, texture)
    );
  }

  clearLayerBase() {
    const layers = this.editor.layers;
    const layer = this._getLayer();
    const canvas = layer.clearBase(this.editor.getVariant());
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    layer.flush();

    this.editor.history.add(
      new UpdateLayerTextureEntry(layers, layer, texture)
    );
  }

  clearLayerOverlay() {
    const layers = this.editor.layers;
    const layer = this._getLayer();
    const canvas = layer.clearOverlay(this.editor.getVariant());
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    layer.flush();

    this.editor.history.add(
      new UpdateLayerTextureEntry(layers, layer, texture)
    );
  }

  flattenLayerOverlay() {
    const layers = this.editor.layers;
    const layer = this._getLayer();
    const canvas = layer.flattenOverlay(this.editor.getVariant());
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    layer.flush();

    this.editor.history.add(
      new UpdateLayerTextureEntry(layers, layer, texture)
    );
  }

  _getLayer() {
    return this.editor.layers.getSelectedLayer();
  }
}

customElements.define("ncrs-layers-tab-buttons", LayersTabButtons);
export default LayersTabButtons;