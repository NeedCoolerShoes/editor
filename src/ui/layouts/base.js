import { LitElement } from "lit";
import { msg } from "@lit/localize";
import WarningManager from "../misc/warnings";

class BaseLayout extends LitElement {
  constructor(ui, id) {
    super();

    this.ui = ui;
    this.id = id;
    this.persistence = this.ui.persistence;
    this.editor = this.ui.editor;
    this.warningManager = new WarningManager();


    this.classList.add("minimized");

    this.#setupEvents();
  }

  toggleFullscreen() {
    this.ui.toggleFullscreen();
  }

  toggleEditorBackground() {
    this.ui.toggleEditorBackground();
  }

  firstUpdated() {
    this.#updateWarning();
  }

  displayWarningPopup(message) {}

  #updateWarning() {
    const layer = this.editor.layers.getSelectedLayer();

    if (!layer) { return; }

    if (!layer.visible) {
      this.warningManager.add("layer-invisible", "invisible", msg(`Current layer is hidden, and cannot be edited.`, {id:`warning.layer.layer_hidden`}));
    } else {
      this.warningManager.remove("layer-invisible");
    }

    if (layer.hasFilters()) {
      this.warningManager.add("layer-filters", "tool-config", msg(`Colors drawn on the current layer will appear altered by filters.`, {id:`warning.layer.filters`}));
    } else {
      this.warningManager.remove("layer-filters");
    }

    if (this.editor.toolConfig.get("blend", false)) {
      this.warningManager.add(
        "blend-enabled", "blend",
        msg(`Blend palette enabled. Colors drawn might not match color picker.`, {id:`warning.blend.blend_enabled`})
      );
    } else {
      this.warningManager.remove("blend-enabled");
    }
  }

  #setupEvents() {
    const layers = this.editor.layers;
    layers.addEventListener("layers-render", () => {
      this.#updateWarning();
    });

    layers.addEventListener("update-filters", () => {
      this.#updateWarning();
    });

    layers.addEventListener("layers-select", () => {
      this.#updateWarning();
    });

    this.editor.toolConfig.addEventListener("blend-change", () => {
      this.#updateWarning();
    });
  }
}

export default BaseLayout;