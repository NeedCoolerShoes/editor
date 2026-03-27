import * as THREE from "three";
import { clamp } from "three/src/math/MathUtils.js";
import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../../constants.js";
import Layer from "./layer.js";
import { nonPolyfilledCtx } from "../../helpers.js";

class Layers extends EventTarget {
  constructor(width, height) {
    super();

    this.canvas = new OffscreenCanvas(width, height);
    this.texture = this._setupTexture();

    const scope = this;
    this.filtersUpdateCallback = function () {
      scope.renderTexture();
      scope.dispatchEvent(new CustomEvent("update-filters"));
    }
  }
  lastLayerId = 0;
  selectedLayerIndex = 0;
  layers = [];

  textureCacheBottom;
  textureCacheTop;

  getLayer(id) {
    const index = this.layers.findIndex((layer) => layer.id == id);
    if (index < 0) {
      return;
    }
    return this.layers[index];
  }

  getLayerAtIndex(index) {
    if (index < 0 || index > this.layers.length - 1) { return false }

    return this.layers[index];
  }

  getSelectedLayerIndex() {
    return this.selectedLayerIndex = clamp(
      this.selectedLayerIndex,
      0,
      this.layers.length - 1
    );
  }

  getSelectedLayer() {
    return this.layers[this.getSelectedLayerIndex()];
  }

  createFromTexture(texture) {
    return new Layer(this.lastLayerId++, texture);
  }

  createBlank() {
    const canvas = new OffscreenCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    return new Layer(this.lastLayerId++, texture);
  }

  createFromLayer(layer) {
    const newLayer = this.createFromTexture(layer.texture.clone());
    newLayer.compositor.applyFilters(layer.compositor.getFilters());
    newLayer.metadata = structuredClone(layer.metadata);

    return newLayer;
  }

  createFromCanvas(canvas) {
    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);
    return this.createFromTexture(texture);
  }

  deserializeLayer(serializedLayer) {
    return new Promise((resolve, _err) => {
      const img = new Image();
      const canvas = new OffscreenCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
      const ctx = nonPolyfilledCtx(canvas.getContext("2d"));
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const layer = this.createFromCanvas(canvas);

        layer.metadata = serializedLayer.metadata || {};
        layer.compositor.deserializeFilters(serializedLayer.filters);
        layer.selected = serializedLayer.selected;
        layer.visible = serializedLayer.visible;

        resolve(layer);
      }

      img.src = serializedLayer.data;
    });
  }

  serializeLayers() {
    const output = [];
    this.layers.forEach(layer => output.push(layer.serialize()));
    return output;
  }

  deserializeLayers(serializedLayers) {
    this.layers = [];

    if (serializedLayers.length > 0) {
      serializedLayers.forEach(layer => {
        this.deserializeLayer(layer).then(newLayer => {
          this.addLayer(newLayer);
        })
      });
    } else {
      this.addBlankLayer();
      this.selectLayer(0);
    }
  }

  layerIndex(layer) {
    return this.layers.findIndex((element) => {
      return layer.id == element.id;
    });
  }

  addLayer(layer) {
    this.layers.push(layer);
    layer.compositor.addEventListener("update-filters", this.filtersUpdateCallback);

    if (layer.selected) {
      this.selectLayer(this.layerIndex(layer));
    }

    this.renderTexture();
    this._sendUpdateEvent();
  }

  addBlankLayer() {
    this.addLayer(this.createBlank());
  }

  insertLayer(layer, index) {
    if (index < 0) { return false; }
    if (index > this.layers.length - 1) {
      this.layers.push(layer);
    } else {
      this.layers.splice(index, 0, layer);
    }

    layer.compositor.addEventListener("update-filters", this.filtersUpdateCallback);

    this.renderTexture();
    this._sendUpdateEvent();
  }

  removeLayer(layer) {
    const index = this.layerIndex(layer);

    if (index < 0) { return false; }
    layer.compositor.removeEventListener("update-filters", this.filtersUpdateCallback);

    this.layers.splice(index, 1);

    this.renderTexture();
    this._sendUpdateEvent();
  }

  selectLayer(index) {
    if (index < 0 || index > this.layers.length - 1) { return false }

    this.selectedLayerIndex = index;

    this.layers.forEach((layer, idx) => {
      layer.select(this.selectedLayerIndex == idx);
    })

    this.dispatchEvent(new CustomEvent("layers-select", {detail: {layer: index}}));
  }

  reorderLayers(fromIndex, toIndex) {
    const max = this.layers.length - 1;
    if (fromIndex < 0 || fromIndex > max || toIndex < 0 || toIndex > max) { return false; }

    const currentLayer = this.getSelectedLayer();
    this.layers.splice(toIndex, 0, this.layers.splice(fromIndex, 1)[0]);

    const idx = this.layerIndex(currentLayer);
    this.selectLayer(idx);

    this.renderTexture();
    this._sendUpdateEvent();
  }

  render() {
    const canvas = new OffscreenCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
    const ctx = nonPolyfilledCtx(canvas.getContext("2d"));

    this.layers.forEach((layer) => {
      if (!layer.visible) { return; }

      ctx.drawImage(layer.render(), 0, 0);
    });

    return canvas;
  }

  renderTexture() {
    const ctx = nonPolyfilledCtx(this.canvas.getContext("2d"));
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.textureCacheBottom = new OffscreenCanvas(this.canvas.width, this.canvas.height);
    this.textureCacheTop = new OffscreenCanvas(this.canvas.width, this.canvas.height);

    const selectedIdx = this.getSelectedLayerIndex();

    const ctxBottom = nonPolyfilledCtx(this.textureCacheBottom.getContext("2d"));
    const ctxTop = nonPolyfilledCtx(this.textureCacheTop.getContext("2d"));

    this.layers.forEach((layer, idx) => {
      if (!layer.visible) { return; }

      const render = layer.render();

      if (idx < selectedIdx) {
        ctxBottom.drawImage(render, 0, 0);
      } else if (idx > selectedIdx) {
        ctxTop.drawImage(render, 0, 0);
      }

      ctx.drawImage(layer.render(), 0, 0);
    });

    this._sendRenderEvent();
    this.texture.needsUpdate = true;
  }

  renderTextureCached() {
    if (!this.textureCacheBottom || !this.textureCacheTop) { return this.renderTexture() };

    const ctx = nonPolyfilledCtx(this.canvas.getContext("2d"));
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.drawImage(this.textureCacheBottom, 0, 0);
    ctx.drawImage(this.getSelectedLayer().render(), 0, 0);
    ctx.drawImage(this.textureCacheTop, 0, 0);

    this.texture.needsUpdate = true;
  }

  isBlank() {
    const canvas = this.render();
    const ctx = nonPolyfilledCtx(canvas.getContext("2d"));

    return !ctx.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data.some(pixel => pixel !== 0);
  }

  _setupTexture() {
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }

  _sendUpdateEvent() {
    this.dispatchEvent(new CustomEvent("layers-update"));
  }

  _sendRenderEvent() {
    this.dispatchEvent(new CustomEvent("layers-render"));
  }
}

export { Layers, Layer };
