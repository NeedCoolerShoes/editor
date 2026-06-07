import { BaseEntry } from "../base_entry.js";

class UpdateLayerTextureEntry extends BaseEntry {
  constructor(layers, layer, texture) {
    super();

    this.layers = layers;
    this.layer = layer;
    this.texture = texture;
  }

  oldTexture;

  onPerform() {
    this.oldTexture = this.oldTexture || this.layer.oldTexture;
    this.layer.flush();
    this.layer.replaceTexture(this.texture);
    this.layers.renderTexture();
  }

  onRevert() {
    this.layer.replaceTexture(this.oldTexture);
    this.layer.flush();
    this.layers.renderTexture();
  }
}

export default UpdateLayerTextureEntry;