import { css, html, LitElement } from "lit";
import "@lit/localize/lit-localize.js";

class GallerySkin extends LitElement {
  static styles = css`
    button {
      all: unset;
      position: relative;
      display: block;
      cursor: pointer;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    #info {
      display: none;
      position: absolute;
      bottom: 0px;
      left: 0px;
      right: 0px;
      top: 25%;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
    }

    button:hover #info {
      display: block;
    }

    #info p {
      text-align: center;
      padding: 0.125rem;
      margin: 0px;
      line-height: 1rem;
      display: -webkit-box;
      overflow: hidden;
      word-break: break-word;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  `;

  constructor(metadata = {}) {
    super();

    this.metadata = metadata;
  }

  render() {
    const meta = this.metadata;
    let title = msg(`Click to add skin to project.<p>`,{id:`gallery.desc.meta`});
    title += meta.name + "\n";
    title += msg(`by `,{id:`gallery.label.by`}) + meta.author.name;

    return html`
      <button @click=${this._addSkin} title=${title}>
        <ncrs-skin-2d src=${meta.image} variant=${meta.model}></ncrs-skin-2d>
        <div id="info">
          <p>${meta.name}</p>
        </div>
      </button>
    `;
  }

  _addSkin() {
    this.dispatchEvent(new CustomEvent("add-skin", {detail: this.metadata}));
  }
}

customElements.define("ncrs-gallery-skin", GallerySkin);
export default GallerySkin;