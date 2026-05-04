import { css, html, LitElement } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import Color from "color";
import { clamp } from "../../helpers.js";
import NAMED_COLORS from "./named_colors.js";
import Slider from "./slider.js";

const EASTEREGG_VALUES = ["#MOXVALLIX", "#DINNERBONE", "#GRUMM", "#AUSTRALIA", "#DEADMAU5", "#EARS", "#JAX"]

class ColorPicker extends LitElement {
  static properties = {
    hue: {},
    saturation: {},
    lightness: {},
    alpha: {},
    _eyedropper: {state: true}
  };

  static styles = css`
    :host {
      position: relative;
      display: block;
    }

    :host > div {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      --current-hue: 0deg;
      --current-color: #ff0000;
      --current-color-alpha: #ff0000;
    }

    button {
      all: unset;
    }

    #gradient {
      flex-grow: 1;
      border-radius: 0.25rem;
      background-image: linear-gradient(rgba(0, 0, 0, 0), #000),
        linear-gradient(90deg, #fff, hsl(var(--current-hue), 100%, 50%));
    }

    #gradient::part(cursor) {
      background-color: var(--current-color);
    }

    #sliders {
      box-sizing: border-box;
      margin-top: 0.75rem;
      width: 100%;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }

    #hue-slider::part(slider) {
      background-image: linear-gradient(
        to right,
        hsl(0, 100%, 50%),
        hsl(60, 100%, 50%),
        hsl(120, 100%, 50%),
        hsl(180, 100%, 50%),
        hsl(240, 100%, 50%),
        hsl(300, 100%, 50%),
        hsl(0, 100%, 50%)
      );
    }

    #hue-slider::part(cursor) {
      background-color: hsl(var(--current-hue) 100% 50%);
    }

    #saturation-slider::part(slider) {
      background: linear-gradient(to right, hsl(0 0% calc(var(--current-lightness)*2)), hsl(var(--current-hue) 100% var(--current-lightness)));
    }

    #saturation-slider::part(cursor), #lightness-slider::part(cursor) {
      background-color: var(--current-color);
    }

    #lightness-slider::part(slider) {
      background: linear-gradient(to right, hsl(var(--current-hue) var(--current-saturation) 0%), hsl(var(--current-hue) var(--current-saturation) calc( 75% - (0.25 * var(--current-saturation) ))));
    }

    #alpha-slider::part(slider) {
      background: linear-gradient(to right, transparent, var(--current-color)),
        repeating-conic-gradient(#aaa 0% 25%, #888 0% 50%) 50%/ 8px 8px;
    }

    #alpha-slider::part(cursor) {
      background: linear-gradient(var(--current-color-alpha), var(--current-color-alpha)),
        repeating-conic-gradient(#aaa 0% 25%, #888 0% 50%) 50%/ 8px 8px;
    }

    ncrs-slider {
      height: 0.75rem;
    }

    ncrs-slider::part(input) {
      height: 100%;
      padding: 0px;
    }

    ncrs-slider::part(slider) {
      width: 100%;
      height: 100%;
      border-radius: 0.25rem;
    }

    ncrs-slider::part(slider) {
      margin-bottom: 0.375rem;
      top:3px;
    }

    #input {
      margin-top: 0.5rem;
      display: flex;
      justify-content: center;
      gap: 0.25rem;
      padding-left: 0.25rem;
      padding-right: 0.25rem;
    }

    #color-button {
      display: block;
      width: 2rem;
      height: 2rem;
      min-width: 2rem;
      border-radius: 100%;
      background: linear-gradient(var(--current-color-alpha), var(--current-color-alpha)),
        repeating-conic-gradient(#aaa 0% 25%, #888 0% 50%) 50%/ 8px 8px;
      cursor: pointer;
    }

    #color-button:focus {
      outline: white solid 1px;
    }

    #color-input {
      display: none;
    }

    #text-input {
      font-size: var(--ncrs-color-picker-font-size, small);

      color: white;
      text-align: center;
      background-color: #131315;
      border-style: solid;
      border-width: 2px;
      border-radius: 6px;
      border-color: #313436;
      box-shadow: none;
      max-width: 180px;
      width: 100%;
    }

    #text-input:focus {
      border-color: white;
      outline: none;
    }

    #eyedropper {
      padding: 0.125rem;
      width: 34px;
      min-width: 34px;
      height: 34px;
      box-sizing: border-box;
    }

    ncrs-icon {
      padding: 0.25rem;
      height: 26px;
      width: 100%;
      box-sizing: border-box;
    }
  `;

  constructor(editor) {
    super();

    this.editor = editor;
    this.config = editor.config;

    this.hue = 0;
    this.saturation = 0;
    this.lightness = 0;
    this.alpha = 100;

    this.oldValues = {hue: 0, saturation: 0, lightness: 0, alpha: 100};

    this.gradient = this._createGradient();
    this.hueSlider = this._createHueSlider();
    this.saturationSlider = this._createSaturationSlider();
    this.lightnessSlider = this._createLightnessSlider();
    this.alphaSlider = this._createAlphaSlider();

    this._setupEvents();
  }  

  render() {
    const color = this.getColor();
    const colorWithAlpha = this.getColorWithAlpha();

    this.syncSliders(colorWithAlpha);

    const colorInput = document.createElement("input");
    colorInput.id = "color-input";
    colorInput.type = "color";
    colorInput.value = colorWithAlpha.string();
    colorInput.addEventListener("change", (event) => this.setColor(event.target.value));

    const textInput = document.createElement("input");
    textInput.id = "text-input";
    textInput.type = "text";
    textInput.value = this._colorString(colorWithAlpha);
    textInput.oninput = this._onTextInput.bind(this);
    textInput.onchange = this._onTextChange.bind(this);

    function showColorInput() {
      colorInput.click();
    }

    const styles = {
      "--current-hue": `${this.hue}deg`,
      "--current-saturation": `${this.saturation}%`,
      "--current-lightness": `${this.lightness / 2}%`,
      "--current-color": color.string(),
      "--current-color-alpha": colorWithAlpha.string(),
    };

    if (this._isColorDifferent()) {
      this.dispatchEvent(new CustomEvent("color-change", { detail: { color: this.getColorWithAlpha() } }));
    }

    if (colorWithAlpha.isLight()) {
      this.gradient.classList.add("light");
    } else {
      this.gradient.classList.remove("light");
    }

    return html`
      <div style=${styleMap(styles)}>
        ${this.gradient}
        <div id="sliders" part="sliders">
          ${this.hueSlider}
          ${this.saturationSlider}
          ${this.lightnessSlider}
          ${this.alphaSlider}
        </div>
        <div id="input">
          <button @click=${showColorInput} id="color-button" aria-label="Open system color picker"></button>
          ${colorInput} ${textInput}
          <ncrs-button id="eyedropper" title="Toggle eyedropper [I] or hold [Ctrl]/[Alt]" @click=${this.toggleEyedropper} ?active=${this._eyedropper}>
            <ncrs-icon icon="eyedropper" color="var(--text-color)"></ncrs-icon>
          </ncrs-button>
        </div>
      </div>
    `;
  }

  checkColor(color) {
    const currentColor = this.getColorWithAlpha();
    return color.hexa() == currentColor.hexa();
  }

  getColor() {
    return Color({ h: this.hue, s: this.saturation, v: this.lightness });
  }

  getColorWithAlpha() {
    return this.getColor().alpha(this.alpha);
  }

  setColor(color) {
    const currentColor = this.getColor();
    const newColor = Color(color).hsv();
    
    if (newColor.hexa() == currentColor.hexa()) { return false; }

    this.hue = newColor.hue();
    this.saturation = newColor.saturationv();
    this.lightness = newColor.value();
    this.alpha = newColor.alpha();
  }

  syncSliders(color) {
    this.gradient.progressX = color.saturationv() / 100;
    this.gradient.progressY = (100 - color.value()) / 100;

    this.hueSlider.progress = color.hue() / 360;
    this.saturationSlider.progress = color.saturationv() / 100;
    this.lightnessSlider.progress = color.value() / 100;
    this.alphaSlider.progress = color.alpha();
  }

  toggleEyedropper() {
    const eyedropperEnabled = this.config.get("pick-color", false);

    if (!eyedropperEnabled) {
      this.config.set("pick-color-toggle", true);
    }

    this.config.set("pick-color", !eyedropperEnabled);
  }

  _isColorDifferent() {
    if (
      this.hue == this.oldValues.hue
      && this.saturation == this.oldValues.saturation
      && this.lightness == this.oldValues.lightness
      && this.alpha == this.oldValues.alpha
    ) { return false; }

    this.oldValues = {
      hue: this.hue,
      saturation: this.saturation,
      lightness: this.lightness,
      alpha: this.alpha,
    }

    return true;
  }

  _createGradient() {
    const gradient = new ColorPickerRegion();
    gradient.id = "gradient";
    gradient.part = "gradient";
    gradient.addEventListener("region-set", event => { this._gradientChanged(event) });

    return gradient;
  }

  _createHueSlider() {
    const hueSlider = new Slider();
    hueSlider.id = "hue-slider";
    hueSlider.part = "slider hue-slider";
    hueSlider.addEventListener("slider-set", event => { this._hueChanged(event) });
    hueSlider.steps = 360;
    hueSlider.max = 359;

    return hueSlider;
  }

  _createSaturationSlider() {
    const saturationSlider = new Slider();
    saturationSlider.id = "saturation-slider";
    saturationSlider.part = "slider saturation-slider";
    saturationSlider.addEventListener("slider-set", event => { this._saturationChanged(event) });

    return saturationSlider;
  }

  _createLightnessSlider() {
    const lightnessSlider = new Slider();
    lightnessSlider.id = "lightness-slider";
    lightnessSlider.part = "slider lightness-slider";
    lightnessSlider.addEventListener("slider-set", event => { this._lightnessChanged(event) });

    return lightnessSlider;
  }

  _createAlphaSlider() {
    const alphaSlider = new Slider();
    alphaSlider.id = "alpha-slider";
    alphaSlider.part = "slider alpha-slider";
    alphaSlider.addEventListener("slider-set", event => { this._alphaChanged(event) });

    return alphaSlider;
  }

  _gradientChanged(event) {
    const px = event.detail.progressX;
    const py = event.detail.progressY;

    this.saturation = clamp(px * 100, 0, 100);
    this.lightness = clamp(100 - py * 100, 0, 100);
  }

  _hueChanged(event) {
    this.hue = event.detail.progress * 360;
  }

  _saturationChanged(event) {
    this.saturation = event.detail.progress * 100;
  }

  _lightnessChanged(event) {
    this.lightness = event.detail.progress * 100;
  }

  _alphaChanged(event) {
    this.alpha = event.detail.progress;
  }

  _onTextInput(event) {
    let value = event.target.value.toUpperCase();
    value = value.replaceAll("#", "");

    event.target.value = "#" + value;
  }

  _onTextChange(event) {
    const oldValue = this.getColorWithAlpha().hexa();

    if (EASTEREGG_VALUES.includes(event.target.value)) {
      this.dispatchEvent(new CustomEvent("easteregg", { detail: event.target.value }));
    }

    if (event.target.value === "#RANDOM") { 
      event.target.value = '#'+Math.floor(Math.random()*16777215).toString(16);
    }

    const colorName = event.target.value.toLowerCase().replaceAll("#", "").replaceAll(" ", "_");
    if (Object.keys(NAMED_COLORS).includes(colorName)) {
      event.target.value = NAMED_COLORS[colorName];
    }

    try {
      this.setColor(event.target.value);
    } catch (_) {
      event.target.value = oldValue;
    }
  }

  _colorString(color) {
    if (color.alpha() == 1) {
      return color.hex();
    }

    return color.hexa();
  }

  _setupEvents() {
    this.config.addEventListener("pick-color-change", event => {
      this._eyedropper = event.detail;

      if (!this._eyedropper) {
        this.config.set("pick-color-toggle", false);
      }
    });
  }
}

class ColorPickerRegion extends LitElement {
  static properties = {
    progressX: { reflect: true },
    progressY: { reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      position: relative;
      cursor: pointer;
      touch-action: none;
    }

    :host(:focus) {
      outline: white solid 1px;
    }

    #background {
      all: unset;
      display: block;
      width: 100%;
      height: 100%;
    }

    #cursor {
      pointer-events: none;
      position: absolute;
      top: 0px;
      height: 8px;
      width: 8px;
      outline: 0.125rem solid white;
      border-radius: 100%;
    }

    :host(.light) #cursor {
      outline-color: black;
    }
  `;

  constructor() {
    super();

    this.progressX = this.progressX || 1;
    this.progressY = this.progressY || 0;

    const scope = this;

    const pointerMove = function (event) {
      scope.onMove(event);
    };

    const pointerUp = function (_event) {
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerup", pointerUp);
    };

    this._onPointerDown = event => {
      document.addEventListener("pointermove", pointerMove);
      document.addEventListener("pointerup", pointerUp);
      event.stopPropagation();
    };

    this.addEventListener("touchmove", e => e.preventDefault());

    this._setupResizeObserver();
  }
  _clientWidth = this.clientWidth;
  _clientHeight = this.clientHeight;

  render() {
    const pos = this._getPos();

    return html`
      <button @pointerdown=${this.onClick} @keydown=${this.onKeyDown} id="background"></button>
      <div id="cursor" part="cursor" style="left: ${pos.x - 4}px; top: ${pos.y - 4}px;"></div>
    `;
  }

  attributeChangedCallback(name, _old, value) {
    super.attributeChangedCallback(name, _old, value);

    if (name === "progressx" || name === "progressy") {
      this.dispatchEvent(
        new CustomEvent("region-change", { detail: { progressX: this.progressX, progressY: this.progressY } })
      );
    }
  }

  onClick(event) {
    this._onPointerDown(event);
    this.onMove(event);
  }

  onMove(event) {
    const rect = this.getBoundingClientRect();
    this.setProgress((event.clientX - rect.x) / this.clientWidth, (event.clientY - rect.y) / this.clientHeight);
  }

  onKeyDown(event) {
    if (event.key === "Tab") {
      return;
    }
    event.preventDefault();

    const key = event.key;
    const stepSize = 0.00390625; // 1 / 256
    const shiftMultiplier = 5;

    let step = stepSize;
    if (event.shiftKey) {
      step *= shiftMultiplier;
    }

    let progressX = this.progressX;
    let progressY = this.progressY;

    switch (key) {
      case "ArrowRight":
        progressX += step;
        break;
      case "ArrowLeft":
        progressX -= step;
        break;
      case "ArrowUp":
        progressY -= step;
        break;
      case "ArrowDown":
        progressY += step;
        break;
    }

    this.setProgress(progressX, progressY);
  }

  setProgress(x, y) {
    this.progressX = clamp(x, 0, 1);
    this.progressY = clamp(y, 0, 1);

    this.dispatchEvent(
      new CustomEvent("region-set", { detail: { progressX: this.progressX, progressY: this.progressY } })
    );
  }

  _getPos() {
    return {
      x: this._clientWidth * this.progressX,
      y: this._clientHeight * this.progressY,
    };
  }

  _setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this._clientWidth = this.clientWidth;
      this._clientHeight = this.clientHeight;
      this.requestUpdate();
    })

    resizeObserver.observe(this);
  }
}

customElements.define("ncrs-color-picker", ColorPicker);
customElements.define("ncrs-color-picker-region", ColorPickerRegion);

export default ColorPicker;
