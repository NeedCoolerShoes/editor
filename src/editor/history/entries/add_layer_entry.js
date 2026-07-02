import { BaseEntry } from "../base_entry.js";

class AddLayerEntry extends BaseEntry {
  constructor(layers, params = {}) {
    super();

    this.layers = layers;
    
    this.texture = params.texture;
    this.layer = params.layer;
  }

  onPerform() {
    const idx = this.layers.selectedLayerIndex;
    this.layer = this.layer || this._createLayer();
    this.layers.insertLayer(this.layer, idx + 1);
  }

  onRevert() {
    this.layers.removeLayer(this.layer);
  }

  _createLayer() {
    if (this.texture) {
      return this.layers.createFromTexture(this.texture);
    }

    return this.layers.createBlank();
  }
}

export default AddLayerEntry;