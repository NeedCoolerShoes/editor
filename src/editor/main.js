import { LitElement, css, html } from "lit";
import * as THREE from "three";
import { Controls } from "./controls.js";
import { Layers } from "./layers/layers.js";
import { SkinModel } from "./model/model.js";
import { Renderer } from "./renderer.js";
import { HistoryManager } from "./history/history_manager.js";
import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../constants.js";
import AddLayerEntry from "./history/entries/add_layer_entry.js";
import ToolConfig from "./tools/tool_config.js";
import UpdateLayerTextureEntry from "./history/entries/update_layer_texture_entry.js";
import ToolData from "./tools/tool_data.js";
import PenTool from "./tools/toolset/pen_tool.js";
import BucketTool from "./tools/toolset/bucket_tool.js";
import EraseTool from "./tools/toolset/erase_tool.js";
import SculptTool from "./tools/toolset/sculpt_tool.js";
import ShadeTool from "./tools/toolset/shade_tool.js";
import SelectLayerEntry from "./history/entries/select_layer_entry.js";
import GroupedEntry from "./history/entries/grouped_entry.js";
import DeleteLayerEntry from "./history/entries/delete_layer_entry.js";
import ReorderLayersEntry from "./history/entries/reorder_layers_entry.js";
import MergeLayersEntry from "./history/entries/merge_layers_entry.js";
import CloneLayerEntry from "./history/entries/clone_layer_entry.js";
import Config from "./config.js";

import imgFacingIndicator from "../../assets/images/facing-indicator.svg";
import ReplaceLayerMetadataEntry from "./history/entries/replace_layer_metadata_entry.js";
import UpdateLayerAttributionEntry from "./history/entries/update_layer_attribution_entry.js";
import PersistLayerChangesEntry from "./history/entries/persist_layers_entry.js";
import MoveTool from "./tools/toolset/move_tool.js";
import { genUUID, nonPolyfilledCtx } from "../helpers.js";
import ProjectLoader from "./format/project_loader.js";
import ProjectData from "./format/project_data.js";

const FORMAT = ProjectLoader.version.format;

const CONFIG_VALUES = {
  variant: {default: "classic", persistence: true},
  selectedTool: {persistence: true},
  partVisibility: {
    default: {
      head: true,
      arm_left: true,
      torso: true,
      arm_right: true,
      leg_left: true,
      leg_right: true,
      ear_left: true,
      ear_right: true
    },
    persistence: true
  },
  baseVisible: {default: true, persistence: true},
  overlayVisible: {default: false, persistence: true},
  baseGridVisible: {default: true, persistence: true},
  overlayGridVisible: {default: true, persistence: true},
  cullBackFace: {default: true, persistence: true},
  cullGrid: {default: true, persistence: true},
}

class Editor extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      cursor: grab;
    }
  `;

  constructor(mobile = false) {
    super();

    this.mobile = mobile;

    this.project = new ProjectData();
    this.config = new Config("ncrs-editor-config", CONFIG_VALUES);

    this._upgradeFormat();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, this.clientWidth / this.clientHeight);
    this.renderer = new Renderer(this.scene, this.camera);
    this.controls = new Controls(this);
    this.layers = new Layers(IMAGE_WIDTH, IMAGE_HEIGHT);
    this.history = new HistoryManager();
    this.toolConfig = new ToolConfig();
    this.tools = this._setupTools();
    this.currentTool = this.tools[this.mobile ? 1 : 0];

    this._loadSkin().then(() => {
      this._setupMesh(this.layers.texture);
      this._startRender();
    });
    
    this._setupResizeObserver();
    this._setupEvents();
  }

  skinMesh;
  baseGroup;
  model;

  render() {
    this.camera.layers.enable(1);
    this.camera.layers.enable(2);

    return this.renderer.canvas();
  }

  firstUpdated() {
    this.updateVisibility();

    const toolId = this.config.get("selectedTool", undefined);
    const tool = this.tools.find(tool => tool.properties.id == toolId);

    this.selectTool(tool || this.getToolById("pen"));
  }

  sceneRender() {
    this.renderer.render();
    if (this.style.cursor !== this.controls.getCursorStyle()) {
      this.style.cursor = this.controls.getCursorStyle();
    }

    this.dispatchEvent(new CustomEvent("render"));
  }

  centerModel() {
    const orbit = this.controls.orbit;

    const bounds = new THREE.Box3();
    bounds.setFromObject(this.skinMesh);

    const size = new THREE.Vector3();
    bounds.getSize(size);

    this.skinMesh.position.y = (size.y / 3) - 0.14; // Remove 0.14, to account for ears.

    orbit.saveState();
    orbit.reset();
  }

  toolCheck(parts, pointerEvent) {
    if (this.config.get("pick-color", false)) {
      const toolData = this._createToolData(parts, pointerEvent.buttons);
      this._pickColor(toolData);
      if (this.currentTool == this.getToolById("eraser")) {
        this.selectTool(this.getToolById("pen"));
      }
      return false;
    }

    const layer = this.layers.getSelectedLayer();
    if (!layer?.visible) {
      this.dispatchEvent(new CustomEvent("tool-warning", {detail: {message: "Current layer is not editable (hidden)."}}));
      return false;
    }

    if (!this.config.get("overlayVisible", false) && this.currentTool === this.getToolById("sculpt")) {
      this.dispatchEvent(new CustomEvent("tool-warning", {detail: {message: "Cannot sculpt without overlay being visible."}}));
      return false;
    }

    return this.currentTool.check(parts, pointerEvent);
  }

  toolCursor() {
    if (!this.currentTool) return "crosshair";

    return this.currentTool.getCursorStyle(this);
  }

  toolDown(parts, pointerEvent) {
    const toolData = this._createToolData(parts, pointerEvent.buttons);
    const texture = this.currentTool.down(toolData);

    const layer = this.layers.getSelectedLayer();
    layer.flush();
    layer.replaceTexture(texture);
    this.layers.renderTexture();

    this.dispatchEvent(new CustomEvent("tool-down"));
  }

  toolMove(parts, pointerEvent) {
    const toolData = this._createToolData(parts, pointerEvent.buttons);
    const texture = this.currentTool.move(toolData);

    this.layers.getSelectedLayer().replaceTexture(texture);
    this.layers.renderTextureCached();

    this.dispatchEvent(new CustomEvent("tool-move"));
  }

  toolUp() {
    this.currentTool.up();
    const layer = this.layers.getSelectedLayer();

    this.history.add(new UpdateLayerTextureEntry(this.layers, layer, layer.texture));

    this.dispatchEvent(new CustomEvent("tool-up"));
  }

  zoom(zoom) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
  }

  setPartVisible(name, visible) {
    const partVisibility = this.config.get("partVisibility", {});
    partVisibility[name] = visible;
    this.config.set("partVisibility", partVisibility, true);

    this.updatePartsVisibility();
  }

  updatePartsVisibility() {
    const partVisibility = this.config.get("partVisibility", {});

    this.model.parts.forEach((part) => {
      if (Object.keys(partVisibility).includes(part.name())) {
        part.setVisible(partVisibility[part.name()]);
      }
    });
  }

  setBaseVisible(visible) {
    this.config.set("baseVisible", visible);
    this.updateVisibility();
  }

  setOverlayVisible(visible) {
    this.config.set("overlayVisible", visible);
    this.updateVisibility();
  }

  setBaseGridVisible(visible) {
    this.config.set("baseGridVisible", visible);
    this.updateVisibility();
  }

  setOverlayGridVisible(visible) {
    this.config.set("overlayGridVisible", visible);
    this.updateVisibility();
  }

  toggleBaseVisible() {
    this.setBaseVisible(!this.config.get("baseVisible"));
    
  }

  toggleOverlayVisible() {
    this.setOverlayVisible(!this.config.get("overlayVisible"));
  }

  toggleBaseGridVisible() {
    this.setBaseGridVisible(!this.config.get("baseGridVisible"));
  }

  toggleOverlayGridVisible() {
    this.setOverlayGridVisible(!this.config.get("overlayGridVisible"));
  }

  toggleBackfaceCulling() {
    this.config.set("cullBackFace", !this.config.get("cullBackFace"));
    this.updateVisibility();
  }

  toggleGridCulling() {
    this.config.set("cullGrid", !this.config.get("cullGrid"));
    this.updateVisibility();
  }

  updateVisibility() {
    const baseVisible = this.config.get("baseVisible");
    const overlayVisible = this.config.get("overlayVisible");
    const baseGridVisible = this.config.get("baseGridVisible");
    const overlayGridVisible = this.config.get("overlayGridVisible");

    if (baseVisible) {
      this.camera.layers.enable(1);
    } else {
      this.camera.layers.disable(1);
    }

    if (overlayVisible) {
      this.camera.layers.enable(2);
    } else {
      this.camera.layers.disable(2);
    }

    this.model.baseGrid.visible = baseGridVisible && baseVisible;
    this.model.overlayGrid.visible = overlayGridVisible && overlayVisible;
  }

  getVariant() {
    return this.project.get("variant", "classic");
  }

  getToolById(id) {
    return this.tools.find(tool => tool.id() == id);
  }

  selectTool(tool, wasActive) {
    if (!this.tools.includes(tool)) { return false; }

    this.currentTool = tool;
    this.config.set("selectedTool", tool.properties.id);
    this.dispatchEvent(new CustomEvent("select-tool", {detail: {tool, wasActive}}));
  }

  selectToolById(id, wasActive = false) {
    this.selectTool(this.getToolById(id), wasActive);
  }

  selectLayer(layer) {
    if (layer === this.layers.getSelectedLayer()) return;

    this.history.add(
      new SelectLayerEntry(this.layers, {layer})
    );
  }

  addLayer(optionalLayer = undefined, setMetadata = {}) {
    const layer = optionalLayer || this.layers.createBlank();

    this.history.add(
      new GroupedEntry(
        new AddLayerEntry(this.layers, {layer}),
        new ReplaceLayerMetadataEntry(layer, setMetadata),
        new SelectLayerEntry(this.layers, {layer})
      )
    );
  }

  addCanvasLayer(canvas, setMetadata = {}) {
    const layer = this.layers.createFromCanvas(canvas);
    this.addLayer(layer, setMetadata);
  }

  addLayerFromImage(image, setMetadata = undefined) {
    const currentLayer = this.layers.getSelectedLayer();
    const texture = new THREE.Texture(image);

    if (currentLayer.isBlank()) {
      if (setMetadata) {
        this.history.add(
          new GroupedEntry(
            new UpdateLayerTextureEntry(this.layers, currentLayer, texture),
            new ReplaceLayerMetadataEntry(currentLayer, setMetadata),
            new PersistLayerChangesEntry(this.project, this.layers),
          )
        );
      } else {
        this.history.add(
          new GroupedEntry(
            new UpdateLayerTextureEntry(this.layers, currentLayer, texture),
            new UpdateLayerAttributionEntry(currentLayer),
            new PersistLayerChangesEntry(this.project, this.layers),
          )
        );
      }

      return currentLayer;
    } else {
      const layer = this.layers.createFromTexture(texture);
      this.addLayer(layer, setMetadata);

      return layer;
    }
  }

  addLayerFromImageURL(url, setMetadata = undefined) {
    const img = new Image();

    img.onload = () => {
      this.addLayerFromImage(img, setMetadata);
    }

    img.src = url;
  }

  addLayerFromFile(file, setMetadata = undefined) {
    const reader = new FileReader();

    reader.onload = () => {
      this.addLayerFromImageURL(reader.result, setMetadata);
    }

    reader.readAsDataURL(file);
  }

  loadProjectFromFile(file) {
    const reader = new FileReader();

    reader.onload = () => {
      let confirmText = "Load new Project?";
      confirmText += "\nThis will replace your current project, and you will lose your history.";
      confirmText += "\nMake sure you have saved the current project."

      const check = confirm(confirmText);
      if (!check) { return; }

      const text = reader.result;
      const json = JSON.parse(text);

      const projectLoader = new ProjectLoader(json);
      projectLoader.load(this);
    }

    reader.readAsText(file);
  }

  resetProject() {
    this.history.wipe();
    this.layers.layers = [];

    this.project.reset();
  }

  removeLayer() {
    const layers = this.layers;
    const layer = this.layers.getSelectedLayer();
    let entry;

    if (layers.layers.length == 1) {
      entry = new GroupedEntry(
        new DeleteLayerEntry(layers, layer),
        new AddLayerEntry(layers),
        new SelectLayerEntry(layers, {index: 0})
      );
    } else {
      entry = new GroupedEntry(
        new DeleteLayerEntry(layers, layer),
      );
    }

    this.history.add(entry);
  }

  cloneLayer() {
    this.history.add(
      new CloneLayerEntry(this.layers, this.layers.getSelectedLayer())
    );
  }

  mergeLayer() {
    const layers = this.layers;

    if (layers.selectedLayerIndex < 1) { return false; }
    const source = layers.getSelectedLayer();
    const target = layers.getLayerAtIndex(layers.selectedLayerIndex - 1);

    this.history.add(
      new MergeLayersEntry(this.layers, target, source)
    );
  }

  reorderLayers(fromIndex, toIndex) {
    if (fromIndex === toIndex) { return; }
    
    this.history.add(
      new ReorderLayersEntry(this.layers, fromIndex, toIndex)
    );
  }

  forEachLayer(callback) {
    this.layers.layers.forEach(callback);
  }

  renderLayers() {
    this.layers.renderTexture();
  }

  easterEgg(input) {
    if (["#MOXVALLIX", "#DINNERBONE", "#GRUMM", "#AUSTRALIA"].includes(input)) {
      this.baseGroup.rotateZ(Math.PI);
    }

    if (["#DEADMAU5", "#EARS", "#JAX"].includes(input)) {
      const partVisibility = this.config.get("partVisibility", {});
      this.setPartVisible("ears", !partVisibility["ears"]);
    }
  }

  setVariant(variant) {
    if (!SkinModel.isValidVariant(variant)) { return false; }

    const yPos = this.skinMesh.position.y;
    const r = this.baseGroup.rotation.clone();

    this.project.set("variant", variant);

    this.model = new SkinModel(this.layers.texture, this.project.get("variant"));
    
    // Update model from settings
    this.model.setMaterialSide(this.config.get("cullBackFace") ? THREE.FrontSide : THREE.DoubleSide);
    this.model.setGridCulling(this.config.get("cullGrid"));

    this.skinMesh = this.model.mesh;

    this.scene.remove(this.baseGroup);
    this.baseGroup = this._setupBaseGroup(this.skinMesh);
    this.baseGroup.rotation.set(r.x, r.y, r.z);
    this.scene.add(this.baseGroup);

    this.skinMesh.position.y = yPos;

    this.updateVisibility();
    this.updatePartsVisibility();
  }

  skinToCanvas() {
    return this.layers.render();
  }

  skinToDataURL() {
    const canvas = document.createElement("canvas");
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;

    const ctx = nonPolyfilledCtx(canvas.getContext("2d"));
    ctx.drawImage(this.skinToCanvas(), 0, 0);

    return canvas.toDataURL();
  }

  resetCamera() {
    this.controls.orbit.reset();

    this.camera.position.set(0, 0, 3);
    this.baseGroup.rotation.set(0, 0, 0);
    this.zoom(0.45);
  }

  _upgradeFormat() {
    const format = this.project.get("format", -1);

    if (format < FORMAT) {
      // Create project
      const project = {
        format,
        variant: this.project.get("variant", "classic"),
        layers: this.project.get("layers", []),
        blendPalette: [],
      }

      const data = new ProjectLoader(project).serialize();
      
      // Remove legacy field
      this.project.persistence.remove("selectedTool");

      // Load project data
      this.project.set("format", FORMAT);
      this.project.set("variant", data.variant);
      this.project.set("layers", data.layers);
    }
  }

  _pickColor(toolData) {
    const point = toolData.getCoords();
    let color = toolData.globalTexture.getPixel({ x: point.x, y: point.y });

    if (color.alpha() <= 0 && toolData.hasOverlay()) {
      const point2 = toolData.getCoords(1);
      color = toolData.globalTexture.getPixel({ x: point2.x, y: point2.y });
    }
    
    if (this.config.get("pick-color-toggle")) {
      setTimeout(() => {
        this.config.set("pick-color-toggle", false);
        this.config.set("pick-color", false);
      }, 100)
    }

    this.toolConfig.set("color", color);
  }

  _createToolData(parts, button) {
    const layer = this.layers.getSelectedLayer();
    const texture = layer.texture.image;

    const globalTexture = this.layers.render();

    return new ToolData({ texture, globalTexture, parts, button, variant: this.project.get("variant") });
  }

  _setupResizeObserver() {
    const obs = new ResizeObserver((e) => {
      const target = e[0].target;
      this.renderer.updateSize(target.clientWidth, target.clientHeight);

      this.camera.aspect = target.clientWidth / target.clientHeight;
      this.camera.updateProjectionMatrix();

      requestAnimationFrame(this._forceWebKitCanvasRender.bind(this));
    });
    obs.observe(this);
  }

  _forceWebKitCanvasRender() {
    const canvas = this.renderer.canvas();
    if (!canvas) return;
    canvas.style.transform = "translateZ(0)";
    canvas.offsetHeight;
    canvas.style.transform = "none";
  }

  async _loadSkin() {
    const layerData = this.project.get("layers", []);
    if (layerData.length > 0) {
      this._loadSkinFromData(layerData);
    } else {
      this._loadDefaultSkin();
    }    
  }

  async _loadSkinFromData(layerData) {
    for (const data of layerData) {
      const layer = await this.layers.deserializeLayer(data);
      this.layers.addLayer(layer);
    }
  }

  _loadDefaultSkin() {
    this.layers.addBlankLayer();
    this.layers.selectLayer(0);
  }

  _createIndicatorMesh() {
    const size = 0.25;
    const yPos = -2.175; // + Up / - Down
    const zPos = 0.6; // + Forward / - Backward

    const geometry = new THREE.PlaneGeometry(size, size);
    const texture = new THREE.TextureLoader().load(imgFacingIndicator, newTexture => {
      newTexture.magFilter = THREE.NearestFilter;
      newTexture.minFilter = THREE.NearestFilter;
    })

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = yPos;
    mesh.position.z = zPos;
    mesh.rotateX(Math.PI / 2);

    return mesh;
  }

  _setupMesh(texture) {
    this.model = new SkinModel(texture, this.project.get("variant", "classic"));

    if (!this.config.get("cullBackFace", true)) {
      this.model.setMaterialSide(THREE.DoubleSide);
    }
    this.model.setGridCulling(this.config.get("cullGrid"));

    this.skinMesh = this.model.mesh;
    this.baseGroup = this._setupBaseGroup(this.skinMesh);
    this.scene.add(this.baseGroup);

    this.updatePartsVisibility();
  }

  _setupBaseGroup(mesh) {
    const group = new THREE.Group();
    group.add(mesh);
    group.add(this._createIndicatorMesh());

    return group;
  }

  _startRender() {
    this.resetCamera();
    this.centerModel();

    this.renderer.setAnimationLoop(() => {
      this.sceneRender();
    });
  }

  _setupTools() {
    const tools = [
      new MoveTool(this.toolConfig),
      new PenTool(this.toolConfig),
      new EraseTool(this.toolConfig),
      new BucketTool(this.toolConfig),
      new ShadeTool(this.toolConfig),
      new SculptTool(this.toolConfig),
    ]

    return tools;
  }

  _setupEvents() {
    const persistenceListeners = ["layers-update", "layers-render", "layers-select"];
    persistenceListeners.forEach(listener => {
      this.layers.addEventListener(listener, () => {
        new PersistLayerChangesEntry(this.project, this.layers).perform();
      })
    });

    this.config.addEventListener("cullBackFace-change", event => {
      this.model.setMaterialSide(event.detail ? THREE.FrontSide : THREE.DoubleSide);
    })

    this.config.addEventListener("cullGrid-change", event => {
      this.model.setGridCulling(event.detail);
    })
  }
}

customElements.define("ncrs-editor", Editor);

export default Editor;
