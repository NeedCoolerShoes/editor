import { css } from "lit";
import MobileDrawer from "./components/drawer";
import TabGroup from "../misc/tab_group";
import PresetPaletteTab from "../config/tabs/tools/palettes/preset_palette_tab";
import RecentColorPaletteTab from "../config/tabs/tools/palettes/recent_color_palette_tab";
import BlendPaletteTab from "../config/tabs/tools/palettes/blend_palette_tab";
import ColorPicker from "../misc/color_picker";
import Color from "color";
import MobileTabGroup from "./components/tab_group";
import MobileTab from "./components/tab";

const COLOR_DRAWER_STYLES = css`
  :host {
    --ncrs-slider-font-size: normal;
    --ncrs-slider-input-width: 2rem;
    --ncrs-color-picker-font-size: normal;
  }

  ncrs-mobile-drawer::part(body) {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  ncrs-color-picker {
    display: block;
    width: 100%;
    height: 19rem;
    box-sizing: border-box;
    overscroll-behavior: none;
  }

  #color-picker-tab {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
  }

  ncrs-color-picker::part(sliders) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  ncrs-color-picker::part(slider) {
    height: 1.5rem;
  }

  #palettes {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: calc(100% - 1rem);
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
    height: 100%;
    background-color: #131315;
  }
`;

class ColorDrawer {
  constructor(ui) {
    this.ui = ui;
    this.editor = this.ui.editor;
    this.colorPicker = this._setupColorPicker();
    this.drawer = this._setupMobileDrawer();

    this.ui.style.setProperty("--current-color", this.editor.toolConfig.get("color", new Color("#000000")).hexa());
  }

  firstUpdated() {
    this.colorPicker.setColor(this.editor.toolConfig.get("color", new Color("#000000")).string());

    this.editor.toolConfig.addEventListener("color-change", event => {
      this.ui.style.setProperty("--current-color", event.detail.hexa());

      if (this.colorPicker.checkColor(event.detail)) { return; }

      this.colorPicker.setColor(event.detail.hexa());
    });
  }

  render() {
    return this.drawer;
  }

  show() {
    this.drawer.show();
  }

  toggleEyedropper() {
    this.colorPicker.toggleEyedropper();
  }

  _setupMobileDrawer() {
    const drawer = new MobileDrawer();
    drawer.id = "color-picker-drawer";

    const tabGroup = new MobileTabGroup();
    
    const colorPickerTab = new MobileTab();
    colorPickerTab.id = "color-picker-tab";
    colorPickerTab.name = "Color Picker";
    colorPickerTab.appendChild(this.colorPicker);
    tabGroup.appendChild(colorPickerTab);
    
    const paletteTab = new MobileTab();
    paletteTab.name = "Palettes";
    paletteTab.appendChild(this._createPaletteTabs());
    tabGroup.appendChild(paletteTab);

    drawer.appendChild(tabGroup);

    return drawer;
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

  _setupColorPicker() {
    const colorPicker = new ColorPicker(this.editor);

    colorPicker.addEventListener("color-change", this._onColorChange.bind(this));
    colorPicker.addEventListener("easteregg", this._onEasterEgg.bind(this));

    return colorPicker;
  }

  _onColorChange(event) {
    const currentColor = this.editor.toolConfig.get("color", new Color("#000000"));
    const newColor = event.detail.color;

    if (newColor.hexa() == currentColor.hexa()) { return false; }

    this.editor.toolConfig.set("color", event.detail.color);
  }

  _onEasterEgg(event) {
    this.editor.easterEgg(event.detail);
  }
}

export {ColorDrawer, COLOR_DRAWER_STYLES};