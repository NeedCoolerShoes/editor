import Tab from "../../misc/tab";
import { css, html } from "lit";
import PenToolConfig from "./tools/configs/pen_tool_config";
import TabGroup from "../../misc/tab_group";
import RecentColorPaletteTab from "./tools/palettes/recent_color_palette_tab";
import ColorPicker from "../../misc/color_picker";
import PresetPaletteTab from "./tools/palettes/preset_palette_tab";
import BlendPaletteTab from "./tools/palettes/blend_palette_tab";
import EraseToolConfig from "./tools/configs/erase_tool_config";
import SculptToolConfig from "./tools/configs/sculpt_tool_config";
import ShadeToolConfig from "./tools/configs/shade_tool_config";
import BucketToolConfig from "./tools/configs/bucket_tool_config";
import Color from "color";

class ToolTab extends Tab {
  static styles = [
    Tab.styles,
    css`
      ncrs-color-picker {
        width: 100%;
        height: 15rem;
        box-sizing: border-box;
        margin-bottom: 0.5rem;
      }

      #main {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      #colors {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-basis: 0;
        background-color: #1A1A1A;
        padding: 0.5rem;
      }

      #palettes {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      #palettes::part(buttons) {
        display: flex;
        gap: 0.25rem;
      }

      #palettes::part(button) {
        all: unset;
        flex-grow: 1;
        display: block;
        cursor: pointer;
        text-align: center;
        color: white;
        font-size: small;
        user-select: none;
        padding: 0.25rem;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
        border-width: 0px;
        border-top-width: 2px;
        border-color: #232428;
        border-style: solid;
        background-color: #232428;
      }

      #palettes::part(button):hover {
        color: #ccc;
      }

      #palettes::part(button selected),
      #palettes::part(button):active {
        border-color: #313436;
      }

      #palettes::part(button selected) {
        background-color: #131315;
      }

      #palettes::part(button):focus {
        border-color: #494d50;
      }

      #palettes::part(darkened) {
        color: #aaaaaa;
      }

      #palettes::part(tabs) {
        flex-grow: 1;
      }

      #palettes::part(tab) {
        height: 112px;
        background-color: #131315;
      }

      #config {
        max-height: 200px;
        flex-grow: 1;
        flex-basis: 0;
      }
    `
  ]

  static properties = {
    tool: {}
  }

  constructor(ui) {
    super({name: "Tools"});

    this.ui = ui;
    this.editor = this.ui.editor;

    this.editor.addEventListener("select-tool", event => {
      const tool = event.detail.tool;
      this.tool = tool.properties.id;
    })

    this.tool = this.editor.currentTool.properties.id;
    this.colorPicker = this._setupColorPicker();
    this.palette = this._createPaletteTabs();

    this._setupToolConfigs();
  }
  toolConfigs;

  render() {
    const config = this.toolConfigs[this.tool];
    if (config) {
      config.id = "config";
    }

    return html`
      <div id="main">
        <div id="colors">
          ${this.colorPicker}
          ${this.palette}
        </div>
        ${config}
      </div>
    `
  }

  firstUpdated() {
    this.colorPicker.setColor(this.editor.config.get("color", new Color("#000000")).string());

    this.editor.config.addEventListener("color-change", event => {
      if (this.colorPicker.checkColor(event.detail)) { return; }

      this.colorPicker.setColor(event.detail.hexa());
    });
  }

  _createPaletteTabs() {
    const tabGroup = new TabGroup();
    tabGroup.id = "palettes";
    tabGroup.side = "top";

    tabGroup.registerTab(new PresetPaletteTab(this.colorPicker));
    tabGroup.registerTab(new RecentColorPaletteTab(this.ui, this.colorPicker));
    tabGroup.registerTab(new BlendPaletteTab(this.ui, this.colorPicker));

    return tabGroup;
  }

  _setupToolConfigs() {
    const config = this.editor.config;

    this.toolConfigs = {
      pen: new PenToolConfig(config),
      eraser: new EraseToolConfig(config),
      bucket: new BucketToolConfig(config),
      shade: new ShadeToolConfig(config),
      sculpt: new SculptToolConfig(config),
    }
  }

  _setupColorPicker() {
    const colorPicker = new ColorPicker(this.editor);

    colorPicker.addEventListener("color-change", this._onColorChange.bind(this));
    colorPicker.addEventListener("easteregg", this._onEasterEgg.bind(this));

    return colorPicker;
  }

  _onColorChange(event) {
    const currentColor = this.editor.config.get("color", new Color("#000000"));
    const newColor = event.detail.color;

    if (newColor.hexa() == currentColor.hexa()) { return false; }

    this.editor.config.set("color", event.detail.color);
  }

  _onEasterEgg(event) {
    this.editor.easterEgg(event.detail);
  }

  _onSelect(event) {
    console.log(event);
  }
}

customElements.define("ncrs-tool-tab", ToolTab);

export default ToolTab;