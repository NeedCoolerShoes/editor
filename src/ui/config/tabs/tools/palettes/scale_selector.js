import { clamp } from "three/src/math/MathUtils.js";
import "../../../../misc/button.js";
import { css, html, LitElement } from "lit";

class NCRSPaletteScaleSelector extends LitElement {
  static properties = {
    scale: {type: Number},
    min: {type: Number},
    max: {type: Number},
  }

  static styles = css`
    :host {
      display: flex;
      gap: 0.125rem;
    }

    ncrs-button {
      width: 1.25rem;
      text-align: center;
    }

    input {
      width: 2.5rem;
      color-scheme: dark;
      background-color: #232428;
      border: none;
      border-radius: 0.25rem;
      color: white;
      font-size: 16px;
    }

    ncrs-icon {
      width: 0.75rem;
      height: 0.6rem;
      padding: 1px;
    }
  `;

  constructor() {
    super();

    this.scale = this.scale || 14;
    this.min = this.min || 4;
    this.max = this.max || 16;

    this._input = this._createInput();
  }

  render() {
    if (Number(this._input.value) !== this.scale) {
      this.scale = this._clampValue(this.scale);
      
      this._input.value = this.scale;
      this.dispatchEvent(new CustomEvent("update", {detail: this.scale}));
    }
    
    const decrementDisabled = this.scale <= this.min;
    const incrementDisabled = this.scale >= this.max;

    return html`
      <ncrs-button ?disabled=${decrementDisabled} @click=${this._onDecrement} title="Decrement scale.">
        <ncrs-icon icon="minus" color="#fff"></ncrs-icon>
      </ncrs-button>
      ${this._input}
      <ncrs-button ?disabled=${incrementDisabled} @click=${this._onIncrement} title="Increment scale.">
        <ncrs-icon icon="add" color="#fff"></ncrs-icon>
      </ncrs-button>
    `;
  }

  attributeChangedCallback(name, old, value) {
    super.attributeChangedCallback(name, old, value);

    if (name === "scale" && this._input) {
      this._setValue(value);
    }
  }

  _createInput() {
    const input = document.createElement("input");
    input.id = "input";
    input.title = "Palette width";
    input.type = "number";
    input.inputmode = "numeric";
    input.addEventListener("input", event => this._onInput(event));
    input.addEventListener("wheel", event => this._onWheel(event));
    input.value = this.scale;

    return input;
  }

  _clampValue(value) {
    return clamp(Number(value), this.min, this.max);
  }

  _setValue(value) {
    if (!this._input) return;
    const clampedValue = this._clampValue(value);
    this.scale = clampedValue;
  }

  _onIncrement() {
    this.scale = Number(this._input.value) + 1;
  }

  _onDecrement() {
    this.scale = Number(this._input.value) - 1;
  }

  _onWheel(event) {
    event.preventDefault();
    const dir = event.deltaY > 0 ? -1 : 1;
    this.scale = Number(event.target.value) + dir;
  }

  _onInput(event) {
    if (event.target.value == "") return;

    this.scale = event.target.value;
  }
}

customElements.define("ncrs-palette-scale-selector", NCRSPaletteScaleSelector);
export default NCRSPaletteScaleSelector;