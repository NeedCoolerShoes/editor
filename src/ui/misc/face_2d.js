import { css, LitElement } from "lit";
import { MODEL_MAP } from "../../editor/model/uv.js";
import { SkinModel } from "../../editor/model/model.js";
import { nonPolyfilledCtx } from "../../helpers.js";

const LAYOUT = [
  {uv: ['head_base_front', 'head_overlay_front'], coordinates: [0, 0]},
];

const SCALE = 4;
const WIDTH = 8;
const HEIGHT = 8;

class Face2d extends LitElement {
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
  }

  render() {
    if (this.src) {
      this._drawFromSrc(this.src, this.variant);
    }

    return this.canvas;
  }

  drawImage(image, variant = this.variant) {
    const ctx = nonPolyfilledCtx(this.canvas.getContext('2d'));

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
    const uvmap = MODEL_MAP["classic"];

    ctx.scale(SCALE, SCALE);
    ctx.translate(0.25, 0.5);
    
    LAYOUT.forEach(segment => {
      segment.uv.forEach((area, idx) => {
        const from = uvmap[area];
        const to = segment.coordinates;
        
        const destW = from[2];
        const destH = from[3];


        if (idx === 1) {
          const scalar = 0.5;

          ctx.drawImage(image, ...from, to[0] - scalar, to[1] - scalar, destW + scalar * 2, destH + scalar * 2);
        } else {
          ctx.drawImage(image, ...from, ...to, destW, destH);
        }
      });
    });

    ctx.resetTransform();
  
    return this.canvas;
  }

  _drawFromSrc(src) {
    const img = new Image();

    img.onload = () => {
      this.drawImage(img);
    }

    img.src = src;
  }
}

customElements.define("ncrs-face-2d", Face2d);

export default Face2d;