import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../../main";
import { BaseEntry } from "../base_entry";
import GroupedEntry from "./grouped_entry";
import UpdateLayerFiltersEntry from "./update_layer_filters_entry";
import UpdateLayerTexture from "./update_layer_texture";
import * as THREE from "three";

class MergeFiltersEntry extends BaseEntry {
  constructor(layers, layer) {
    super();

    this.subEntry = this._createSubEntry(layers, layer);
  }
  
  onPerform() {
    return this.subEntry.perform();
  }

  onRevert() {
    return this.subEntry.revert();
  }

  _createSubEntry(layers, layer) {
    const canvas = layer.render();
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    return new GroupedEntry(
      new UpdateLayerTexture(layers, layer, texture),
      new UpdateLayerFiltersEntry(layers, layer, [], false)
    )
  }
}

export default MergeFiltersEntry;