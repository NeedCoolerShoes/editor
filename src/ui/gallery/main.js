import { css, html, LitElement } from "lit";
import GallerySkin from "./skin.js";

class Gallery extends LitElement {
  static properties = {
    url: {}
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      padding: 2rem;
      box-sizing: border-box;
      pointer-events: none;
    }

    #main {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 2fr 8fr;
      background-color: rgba(35, 36, 40, 0.75);
      pointer-events: all;
    }

    #filters {
      background-color: red;
    }

    #skins {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #skins > div {
      display: flex;
      flex-wrap: wrap;
      max-width: max-content;
    }

    ncrs-gallery-skin {
      aspect-ratio: 1;
      width: 10rem;
      height: 10rem;
    }
  `;

  constructor(ui) {
    super();

    this.ui = ui;
    this.editor = this.ui.editor;
  }

  render() {
    return html`
      <div id="main">
        <div id="filters"></div>
        <div id="browse">
          <div id="tabs"></div>
          <div id="skins">
            ${this._renderSkins()}
          </div>
          <div id="pagination"></div>
        </div>
      </div>
    `;
  }

  getURL() {
    return this.url + "/1?items=32";
  }

  getGalleryData() {
    const headers = {
      "Accept": "application/json",
    }

    return fetch(this.getURL(), {headers});
  }

  _renderSkins() {
    const div = document.createElement("div");

    this.getGalleryData().then(data => {
      data.json().then(json => {
        json.skins.forEach(skin => {
          const gallerySkin = new GallerySkin(skin);

          div.appendChild(gallerySkin);
        });
      });
    });

    return div;
  }
}

customElements.define("ncrs-gallery", Gallery);
export {Gallery};