import { css, LitElement } from "lit";
import { MODEL_MAP } from "../../editor/model/uv.js";
import { SkinModel } from "../../editor/model/model.js";
import { nonPolyfilledCtx } from "../../helpers.js";

const LAYOUT = {
  classic: [
    {uv: ['leg_right_base_front', 'leg_right_overlay_front'], coordinates: [4, 20]},
    {uv: ['leg_right_base_back', 'leg_right_overlay_back'], coordinates: [28, 20]},
    {uv: ['leg_left_base_front', 'leg_left_overlay_front'], coordinates: [8, 20]},
    {uv: ['leg_left_base_back', 'leg_left_overlay_back'], coordinates: [24, 20]},
    {uv: ['arm_right_base_front', 'arm_right_overlay_front'], coordinates: [0, 8]},
    {uv: ['arm_right_base_back', 'arm_right_overlay_back'], coordinates: [32, 8]},
    {uv: ['arm_left_base_front', 'arm_left_overlay_front'], coordinates: [12, 8]},
    {uv: ['arm_left_base_back', 'arm_left_overlay_back'], coordinates: [20, 8]},
    {uv: ['torso_base_front', 'torso_overlay_front'], coordinates: [4, 8]},
    {uv: ['torso_base_back', 'torso_overlay_back'], coordinates: [24, 8]},
    {uv: ['head_base_front', 'head_overlay_front'], coordinates: [4, 0]},
    {uv: ['head_base_back', 'head_overlay_back'], coordinates: [24, 0]},
  ],
  slim: [
    {uv: ['leg_right_base_front', 'leg_right_overlay_front'], coordinates: [4, 20]},
    {uv: ['leg_right_base_back', 'leg_right_overlay_back'], coordinates: [28, 20]},
    {uv: ['leg_left_base_front', 'leg_left_overlay_front'], coordinates: [8, 20]},
    {uv: ['leg_left_base_back', 'leg_left_overlay_back'], coordinates: [24, 20]},
    {uv: ["arm_right_base_front", "arm_right_overlay_front"], coordinates: [1, 8]},
    {uv: ["arm_right_base_back", "arm_right_overlay_back"], coordinates: [32, 8]},
    {uv: ["arm_left_base_front", "arm_left_overlay_front"], coordinates: [12, 8]},
    {uv: ["arm_left_base_back", "arm_left_overlay_back"], coordinates: [21, 8]},
    {uv: ['torso_base_front', 'torso_overlay_front'], coordinates: [4, 8]},
    {uv: ['torso_base_back', 'torso_overlay_back'], coordinates: [24, 8]},
    {uv: ['head_base_front', 'head_overlay_front'], coordinates: [4, 0]},
    {uv: ['head_base_back', 'head_overlay_back'], coordinates: [24, 0]},
  ]
}

const SCALE = 4;
const WIDTH = 36;
const HEIGHT = 32;

class Skin2d extends LitElement {
  static properties = {
    src: {},
    variant: {reflect: true},
  }

  static styles = css`
    :host {
      display: block;
      image-rendering: pixelated;
    }

    canvas {
      image-rendering: pixelated;
      width: 100%;
      height: auto;
    }
  `;

  constructor() {
    super();

    this.canvas = document.createElement("canvas");
    this.canvas.width = (WIDTH * SCALE) + (SCALE / 2);
    this.canvas.height = (HEIGHT * SCALE) + SCALE;

    this.variant = this.variant || "classic";
  }

  render() {
    if (!SkinModel.isValidVariant(this.variant)) {
      this.variant = "classic";
    }

    if (this.src) {
      this._drawFromSrc(this.src, this.variant);
    }

    return this.canvas;
  }

  drawImage(image, variant = this.variant) {
    if (!SkinModel.isValidVariant(variant)) {
      throw "Invalid variant!";
    }

    const ctx = nonPolyfilledCtx(this.canvas.getContext('2d'));

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const uvmap = MODEL_MAP[variant];
    const layout = LAYOUT[variant];

    ctx.scale(SCALE, SCALE);
    ctx.translate(0.25, 0.5);

    layout.forEach(segment => {
      segment.uv.forEach((area, idx) => {
        const from = uvmap[area];
        const to = segment.coordinates;

        const destW = from[2];
        const destH = from[3];


        if (idx === 1) {
          const scalar = area.startsWith("head") ? 0.5 : 0.25;

          ctx.drawImage(image, ...from, to[0] - scalar, to[1] - scalar, destW + scalar * 2, destH + scalar * 2);
        } else {
          ctx.drawImage(image, ...from, ...to, destW, destH);
        }
      });
    });

    ctx.resetTransform();

    return this.canvas;
  }

  _drawFromSrc(src, variant) {
    const img = new Image();

    img.onload = () => {
      this.drawImage(img, variant);
    }

    img.src = src;
  }
}

customElements.define("ncrs-skin-2d", Skin2d);
export default Skin2d;