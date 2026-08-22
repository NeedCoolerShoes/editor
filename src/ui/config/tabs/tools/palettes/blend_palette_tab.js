import Color from "color";
import { clamp } from "../../../../../helpers.js";
import Tab from "../../../../misc/tab.js";
import { css, html } from "lit";
import "../../../../misc/icon_button";
import "@lit/localize/lit-localize.js";

class BlendPaletteTab extends Tab {
  static styles = [
    Tab.styles,
    css`
      :host {
        --palette-width: 12;
      }

      p {
        margin: 0px;
        color: #aaaaaa;
        font-size: small;
        padding-bottom: 0.25rem;
      }

      #main {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.25rem;
        box-sizing: border-box;
        height: 100%;
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

      .palette-element {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        aspect-ratio: 1;
        border-radius: 0.125rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 3px inset, rgba(0, 0, 0, 0.25) 0px -1px 0px inset;
      }

      .color.current::after {
        content: "";
        display: block;
        position: absolute;
        width: 50%;
        height: 50%;
        border-radius: 9999px;
        outline: 2px solid white;
      }

      .color.current.light::after {
        outline-color: black;
      }

      .color:focus-visible {
        border: white solid 1px;
      }

      .color.light:focus-visible {
        border: black solid 1px;
      }

      #plus {
        background-color: #313436;
        color: white;
        text-align: center;
        line-height: 1rem;
      }

      #plus:focus-visible {
        border: 1px solid white;
      }

      #remove::part(button) {
        box-sizing: border-box;
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      #remove ncrs-icon {
        display: block;
        width: 0.75rem;
        height: 0.75rem;
      }
    `;
  ]

  constructor(ui, colorPicker) {
    super({name: `${msg(`Blend Palette`,{id:`palette.label.blend`})}`, buttonPart: "blend-palette"});

    this.ui = ui;
    this.editor = this.ui.editor;
    this.colorPicker = colorPicker;
    this.colors = this._loadColors();

    this.setDarkened(!this.editor.toolConfig.get("blend"));

    this._setupEvents();
  }

  render() {
    const colors = this.editor.toolConfig.get("blend-palette", []);

    const plusButton = document.createElement("button");
    plusButton.id = "plus";
    plusButton.classList.add("palette-element");
    plusButton.addEventListener("click", this._onPlusClick.bind(this));
    plusButton.textContent = `${msg(`+`,{id:`palette.label.plus`})}`;

    if (colors.length < 1) {
      return html`
        <div id="main">
          <div id="colors">
            ${plusButton}
          </div>
          <p>${msg(`Click the plus [+] button to add a color to the Blend Palette.</p>
          <p>Tools with the Blend Effect enabled will randomly sample colors.`,{id:`palette.desc.plus`})}
        </div>
      `;
    }

    const colorsDiv = document.createElement("div");
    colorsDiv.id = "colors";

    colorsDiv.appendChild(plusButton);
    colors.forEach(color => {
      colorsDiv.appendChild(this._createColor(color))
    });

    const hasColor = colors.includes(this.colorPicker.getColor().hex());

    return html`
      <div id="main">
        <div id="palette" part="palette">
          ${colorsDiv}
        </div>
        <div id="options">
          <ncrs-palette-scale-selector id="scale" scale=14 @update=${this._onScaleUpdate}></ncrs-palette-scale-selector>
          <ncrs-button id="remove" ?disabled=${!hasColor} @click=${this._removeSelected}>
            <ncrs-icon icon="remove" color="var(--text-color)"></ncrs-icon>
          </ncrs-button>
        </div>
      </div>
    `;
  }

  addColor(color) {
    const colors = [...this.editor.toolConfig.get("blend-palette", [])];

    if (colors.includes(color)) { return; }

    const len = colors.unshift(color);

    if (len > 47) {
      colors.pop();
    }

    this.editor.toolConfig.set("blend-palette", colors);
    this.ui.persistence.set("blendPalette", colors);
  }

  removeColor(color) {
    const colors = [...this.editor.toolConfig.get("blend-palette", [])];

    if (!colors.includes(color)) { return; }

    const index = colors.indexOf(color);
    const lastIndex = colors.length - 1;

    let nextIndex = index;
    if (index == lastIndex) {
      nextIndex -= 1;
    } else {
      nextIndex += 1;
    }

    colors.splice(index, 1);

    this.editor.toolConfig.set("blend-palette", colors);
    this.ui.persistence.set("blendPalette", colors);
    this.colors = colors;
  }

  _removeSelected() {
    this.removeColor(this.colorPicker.getColor().hex());
  }

  _loadColors() {
    const colors = this.ui.persistence.get("blendPalette", []);
    this.editor.toolConfig.set("blend-palette", colors);

    return colors;
  }

  _createColor(color) {
    const button = document.createElement("button");
    button.classList.add("color", "palette-element");

    const thisColor = new Color(color);
    const selectedColor = this.colorPicker.getColor();

    if (thisColor.rgb().string() == selectedColor.rgb().string()) {
      button.classList.add("current");
    }

    if (new Color(color).isLight()) {
      button.classList.add("light");
    }

    button.title = msg(`Set color to ${color}`,{id:`palette.desc.setColor`});

    button.style.backgroundColor = color;
    button.setAttribute("color", color);

    button.addEventListener("click", () => {
      this.colorPicker.setColor(color);
    });

    return button;
  }

  _onPlusClick() {
    this.addColor(this.colorPicker.getColor().hex());
  }

  _setupEvents() {
    const cfg = this.editor.toolConfig;

    cfg.addEventListener("blend-palette-change", () => {
      this.requestUpdate();
    })

    cfg.addEventListener("blend-change", event => {
      this.setDarkened(!event.detail);
    })

    this.addEventListener("wheel", this._onPaletteWheel.bind(this));

    this.colorPicker.addEventListener("color-change", event => {
      const color = event.detail.color.hex().toUpperCase();

      if (this.colors.find(value => value.toUpperCase() == color)) {
        this.requestUpdate();
      } else {
        if (!this.renderRoot) return;

        const selected = this.renderRoot.querySelector("#palette .color.current");
        if (!selected) return;

        this.requestUpdate();
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

customElements.define("ncrs-blend-palette-tab", BlendPaletteTab);
export default BlendPaletteTab;