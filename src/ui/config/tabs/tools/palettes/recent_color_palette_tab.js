import Color from "color";
import { clamp } from "../../../../../helpers.js";
import Tab from "../../../../misc/tab.js";
import { css, html } from "lit";
import "@lit/localize/lit-localize.js";

const defaultColors = [];

class RecentColorPaletteTab extends Tab {
  static styles = [
    Tab.styles,
    css`
      :host {
        --palette-width: 12;
      }

      #main {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.25rem;
        box-sizing: border-box;
        height: 100%;
      }

      p {
        margin: 0px;
        color: #aaaaaa;
        font-size: small;
        padding-bottom: 0.25rem;
      }

      #options {
        display: flex;
        justify-content: space-between;
        height: 22px;
      }

      #palette-select, #columns {
        color-scheme: dark;
        background-color: #232428;
        border: none;
        border-radius: 0.25rem;
        color: white;
      }

      #palette-label {
        color: white;
        font-size: small;
        margin-right: 0.25rem;
      }

      #palette {
        flex-grow: 1;
        height: 78px;
        overflow: auto;
        padding-right: 2px;
        scrollbar-color: #3d4042 #1a1a1a;
        scrollbar-width: thin;
      }

      #colors {
        display: grid;
        grid-template-columns: repeat(var(--palette-width), 1fr);
        gap: 0.125rem;
      }

      #columns {
        width: 2.5rem;
      }

      .color {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        aspect-ratio: 1;
        border-radius: 0.125rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 3px inset, rgba(0, 0, 0, 0.25) 0px -1px 0px inset;
      }

      .color.selected::after {
        content: "";
        display: block;
        width: 50%;
        height: 50%;
        border-radius: 9999px;
        outline: 2px solid white;
      }

      .color.selected.light::after {
        outline-color: black;
      }

      .color:focus-visible {
        border: white solid 1px;
      }

      .color.light:focus-visible {
        border: black solid 1px;
      }
    `;
  ]

  constructor(ui, colorPicker) {
    super({name: `${msg(`Recent Colors — Colors used in skin.`,{id:`palette.label.recent`})}`});

    this.ui = ui;
    this.editor = this.ui.editor;
    this.colorPicker = colorPicker;
    this.colors = this._loadColors();

    this.setDarkened(this.colors.length < 1);

    this._setupEvents();
  }

  render() {
    const colorsDiv = document.createElement("div");
    colorsDiv.id = "colors";

    if (this.colors.length < 1) {
      return html`
        <div id="main">
          <p>${msg(`Colors used in skin will show up here.`,{id:`palette.desc.noRecent`})}</p>
        </div>
      `;
    }

    this.colors.forEach(color => {
      colorsDiv.appendChild(this._createColor(color))
    });
    this.setDarkened(this.colors.length < 1);

    return html`
      <div id="main">
        <div id="palette" part="palette">
          ${colorsDiv}
        </div>
        <div id="options">
          <ncrs-palette-scale-selector id="scale" scale=14 @update=${this._onScaleUpdate}></ncrs-palette-scale-selector>
        </div>
      </div>
    `;
  }

  addColor(color) {
    if (this.colors.includes(color)) { return; }

    const len = this.colors.unshift(color);

    if (len > 48) {
      this.colors.pop();
    }

    this.ui.persistence.set("recentPalette", this.colors);
    this.requestUpdate();
  }

  _loadColors() {
    return this.ui.persistence.get("recentPalette", defaultColors);
  }

  _createColor(color) {
    const button = document.createElement("button");
    button.classList = ["color"];
    button.title = `${msg(`Set color to ${color}`,{id:`palette.desc.setColor`})}`

    button.style.backgroundColor = color;
    button.setAttribute("color", color);

    const thisColor = new Color(color);
    const selectedColor = this.colorPicker.getColor();

    if (thisColor.rgb().string() == selectedColor.rgb().string()) {
      button.classList.add("selected");
    }

    if (thisColor.isLight()) {
      button.classList.add("light");
    }

    button.addEventListener("click", () => {
      this.colorPicker.setColor(color);
    });

    return button;
  }

  _setupEvents() {
    this.editor.addEventListener("tool-up", () => {
      if (!this.editor.currentTool.properties.providesColor) { return; }

      const color = this.editor.toolConfig.get("color");

      this.addColor(color.hex().toLowerCase())
    });
    this.addEventListener("wheel", this._onPaletteWheel.bind(this));

    this.colorPicker.addEventListener("color-change", event => {
      const color = event.detail.color.hex().toUpperCase();

      if (this.colors.find(value => value.toUpperCase() == color)) {
        this.requestUpdate();
      } else {
        if (!this.renderRoot) return;

        const selected = this.renderRoot.querySelector("#palette .color.selected");
        if (!selected) return;

        selected.classList.remove("selected");
      }
    });
  }

  _onScaleUpdate(event) {
    this.style.setProperty("--palette-width", event.detail);
  }

  _onPaletteWheel(event) {
    if (!event.ctrlKey) { return; }
    event.preventDefault();

    const dir = event.deltaY > 0 ? -1 : 1;
    const scale = this.shadowRoot.getElementById("scale");
    scale.scale = Number(scale.scale) + dir;
  }
}

customElements.define("ncrs-recent-color-palette-tab", RecentColorPaletteTab);
export default RecentColorPaletteTab;