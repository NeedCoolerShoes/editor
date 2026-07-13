import { css, html, LitElement } from "lit";
import { msg } from "@lit/localize";

class EditorToggles extends LitElement {
  static styles = css`
    :host {
      --icon-scale: 1;
    }

    .ncrs-toggle-row {
      display: flex;
      flex-direction: row;
      gap: 0;
      align-items: center;
      justify-content: center;
      padding-bottom: 2px;
      padding-top: 1px;
    }

    ncrs-toggle {
      display: block;
      width: calc(25px * var(--icon-scale));
    }

    ncrs-toggle ncrs-icon {
        width: calc(25px * var(--icon-scale));
        height: calc(25px * var(--icon-scale));
        display: block;
    }

    ncrs-toggle::part(button):focus-visible, ncrs-quadroggle::part(button):focus-visible {
      outline: 1px solid white;
    }

    .hidden {
      display: none;
    }

    .label {
      font-size: x-small;
      color: rgb(134, 137, 139);
      text-align: center;
      margin-top: 0.125rem;
      margin-bottom: 0;
    }

    .label-grid {
      margin-bottom: -0.125rem;
    }

    .row-grid {
      margin-bottom: -0.25rem;
    }
  `;

  constructor(editor) {
    super();

    this.editor = editor;
    this._setupEvents();
  }

  render() {
    const cfg = this.editor.config;

    const baseVisible = cfg.get("baseVisible");
    const overlayVisible = cfg.get("overlayVisible");
    const baseGridVisible = cfg.get("baseGridVisible", false);
    const overlayGridVisible = cfg.get("overlayGridVisible", false);
    const cullBackFace = cfg.get("cullBackFace", true);
    const cullGrid = cfg.get("cullGrid", true);

    return html`
      <p class="label">${msg(`Layer`, {id: `toolbar.label.layer`})}</p>
      <div class="ncrs-toggle-row">
        <ncrs-toggle title="${msg(`Toggle base`, {id: `toolbar.toggle.base`})} [Ctrl+Shift+L]" ?toggled=${baseVisible} @toggle=${this._toggleBase}>
          <ncrs-icon slot="off" icon="base" color="white"></ncrs-icon>
          <ncrs-icon slot="on" icon="base" color="#55b2ff"></ncrs-icon>
        </ncrs-toggle>
        <ncrs-toggle title="${msg(`Toggle overlay`, {id: `toolbar.toggle.overlay`})} [Shift+L]" ?toggled=${overlayVisible} @toggle=${this._toggleOverlay}>
          <ncrs-icon slot="off" icon="overlay" color="white"></ncrs-icon>
          <ncrs-icon slot="on" icon="overlay" color="#55b2ff"></ncrs-icon>
        </ncrs-toggle>
      </div>
      <p class="label  label-grid">${msg(`Grid`, {id: `toolbar.label.grid`})}</p>
      <div class="ncrs-toggle-row row-grid">
        <ncrs-toggle title="${msg(`Toggle base grid`, {id: `toolbar.toggle.base_grid`})} [Ctrl+Shift+O]" ?toggled=${baseGridVisible} @toggle=${this._toggleBaseGrid}>
          <ncrs-icon slot="off" icon="base-grid" color="white"></ncrs-icon>
          <ncrs-icon slot="on" icon="base-grid" color="#55b2ff"></ncrs-icon>
        </ncrs-toggle>
        <ncrs-toggle title="${msg(`Toggle overlay grid`, {id: `toolbar.toggle.overlay_grid`})} [Shift+O]" ?toggled=${overlayGridVisible} @toggle=${this._toggleOverlayGrid}>
          <ncrs-icon slot="off" icon="overlay-grid" color="white"></ncrs-icon>
          <ncrs-icon slot="on" icon="overlay-grid" color="#55b2ff"></ncrs-icon>
        </ncrs-toggle>
      </div>
      <p class="label">${msg(`Render`, {id: `toolbar.label.render`})}</p>
      <div class="ncrs-toggle-row">
        <ncrs-toggle title="${msg(`Toggle backface culling`, {id: `toolbar.toggle.backface_culling`})} [Shift+F]" ?toggled=${cullBackFace} @toggle=${this._toggleBackfaceCulling}>
          <ncrs-icon slot="off" icon="backface-culling" color="white"></ncrs-icon>
          <ncrs-icon slot="on" icon="backface-culling" color="#55b2ff"></ncrs-icon>
        </ncrs-toggle>
        <ncrs-toggle title="${msg(`Toggle grid culling`, {id: `toolbar.toggle.grid_culling`})} [Ctrl+Shift+F]" ?toggled=${cullGrid} @toggle=${this._toggleGridCulling}>
          <ncrs-icon slot="off" icon="grid-culling" color="white"></ncrs-icon>
          <ncrs-icon slot="on" icon="grid-culling" color="#55b2ff"></ncrs-icon>
        </ncrs-toggle>
      </div>
      <div class="hidden ncrs-toggle-row">
        <ncrs-toggle title="${msg(`Toggle shading`, {id: `toolbar.toggle.shading`})}" ?toggled=${cullBackFace} @toggle=${this._toggleShading}>
          <ncrs-icon slot="off" icon="shade" color="white"></ncrs-icon>
          <ncrs-icon slot="on" icon="shade" color="#55b2ff"></ncrs-icon>
        </ncrs-toggle>
        <ncrs-toggle title="${msg(`Blow up model`, {id: `toolbar.toggle.blow_up_model`})}" @toggle=${this._toggleBlowUp}>
          <ncrs-icon slot="off" icon="blow-up-model" color="white"></ncrs-icon>
          <ncrs-icon slot="on" icon="blow-up-model" color="#55b2ff"></ncrs-icon>
        </ncrs-toggle>
      </div>
    `;
  }

  _toggleOverlay(event) {
    this.editor.setOverlayVisible(event.detail);
  }

  _toggleBase(event) {
    this.editor.setBaseVisible(event.detail);
  }

  _toggleOverlayGrid(event) {
    this.editor.setOverlayGridVisible(event.detail);
  }

  _toggleBaseGrid(event) {
    this.editor.setBaseGridVisible(event.detail);
  }

  _toggleBackfaceCulling(event) {
    this.editor.config.set("cullBackFace", event.detail);
  }

  _toggleGridCulling(event) {
    this.editor.config.set("cullGrid", event.detail);
  }

  _setupEvents() {
    this.editor.config.addEventListener("baseVisible-change", event => {
      this.requestUpdate();
    })
    this.editor.config.addEventListener("overlayVisible-change", event => {
      this.requestUpdate();
    })
    this.editor.config.addEventListener("baseGridVisible-change", event => {
      this.requestUpdate();
    })
    this.editor.config.addEventListener("overlayGridVisible-change", event => {
      this.requestUpdate();
    })
    this.editor.config.addEventListener("cullBackFace-change", event => {
      this.requestUpdate();
    })
    this.editor.config.addEventListener("cullGrid-change", event => {
      this.requestUpdate();
    })
  }

}

customElements.define("ncrs-tools-editor-toggles", EditorToggles);
export default EditorToggles;