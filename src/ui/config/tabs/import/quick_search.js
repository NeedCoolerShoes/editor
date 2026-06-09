import { css, html, LitElement } from "lit";
import GallerySkin from "../../../gallery/skin.js";
import { clamp } from "../../../../helpers.js";

class QuickSearch extends LitElement {
  static properties = {
    _galleryData: {state: true},
    ignoreModel: {type: Boolean},
  }

  static styles = css`
    #search {
      display: flex;
      align-items: flex-start;
      gap: 0.25rem;
    }

    ncrs-icon {
      width: 20px;
      height: 20px;
    }

    #search-button::part(button) {
      padding: var(--search-button-padding, 0px);
    }

    input {
      flex-grow: 1;
      font-size: medium;
      box-sizing: border-box;
      color: white;
      background-color: #131315;
      border-style: solid;
      border-width: 0px;
      border-radius: 4px;
      box-shadow: 0 0 0 2px #313436;
      padding-left: 0.25rem;
      width: 11rem;
    }

    #skins {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.25rem;
      padding: 0.5rem;
      background-color: #191919;
      height: 256px;
    }

    #nav {
      margin-top: 0.25rem;
      display: flex;
      justify-content: space-between;
    }

    #nav ncrs-button {
      font-size: large;
    }

    #nav ncrs-button::part(button) {
      padding: 0.125rem 0.75rem;
    }

    #nav ncrs-button:first-of-type::part(button) {
      border-bottom-left-radius: 0.5rem;
    }

    #nav ncrs-button:last-of-type::part(button) {
      border-bottom-right-radius: 0.5rem;
    }

    #nav span {
      color: white;
      font-weight: bold;
    }

    #filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    #filters > div {
      flex-basis: 0;
      flex-grow: 1;
    }

    #filters label {
      color: white;
      font-size: x-small;
      display: block;
      margin-bottom: 0.125rem;
    }

    #filters select {
      width: 100%;
      font-size: small;
      color: white;
      background-color: #131315;
      border-style: solid;
      border-width: 0px;
      border-radius: 4px;
      box-shadow: 0 0 0 2px #313436;
      padding-left: 0.25rem;
    }

    #search-area {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      height: 34px;
    }

    #ignore-variant {
      --text-color: white;

      color: var(--text-color);
      font-size: x-small;
    }

    #ignore-variant::part(button) {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    #ignore-variant[toggled] {
      --text-color: #55b2ff;
    }

    #ignore-variant ncrs-icon {
      width: 18px;
      height: 18px;
    }
  `;

  constructor(ui) {
    super();

    this.ui = ui;
    this.editor = this.ui.editor;
    this.seed = this._generateSeed();

    this.searchField = this._createSearchField();
    this.page = this.page || 1;
    this.seed = this._generateSeed();

    this._setupEvents();
  }
  query = "";
  page = 1;
  pageCount = 1;

  parts = [];
  part = "";

  categories = [];
  category = "";

  load() {
    this._syncGalleryData();
  }

  render() {
    const skins = this._renderSkins();

    if (this._galleryData) {
      this.page = this._galleryData.page.current;
      this.pageCount = this._galleryData.page.total;

      this.parts = this._galleryData.filters.parts;
      this.categories = this._galleryData.filters.categories;
    }

    return html`
      <div id="search-area">
        <div id="search">
          ${this.searchField}
          <ncrs-button id="search-button" part="search-button" title="Submit search" @click=${this._setQuery}>
            <ncrs-icon icon="search" color="var(--text-color)"></ncrs-icon>
          </ncrs-button>
        </div>
        <ncrs-toggle id="ignore-variant" @toggle=${this._toggleIgnoreModel} title="Ignore skin model when searching the gallery.">
          <div slot="before">Ignore Model</div>
          <ncrs-icon slot="off" icon="box-unchecked" color="var(--text-color)"></ncrs-icon>
          <ncrs-icon slot="on" icon="box-checked" color="var(--text-color)"></ncrs-icon>
        </ncrs-toggle>
      </div>
      <div id="filters">
        <div>
          <label for="parts">Part</label>
          ${this._createPartsFilter()}
        </div>
        <div>
          <label for="parts">Category</label>
          ${this._createCategoriesFilter()}
        </div>
      </div>
      ${skins}
      <div id="nav">
        <ncrs-button @click=${this._navBack}>Back</ncrs-button>
        <span>${this.page} / ${this.pageCount}</span>
        <ncrs-button @click=${this._navNext}>Next</ncrs-button>
      </div>
    `;
  }

  _navBack() {
    this.page = clamp(this.page - 1, 1, this.pageCount);
    this._syncGalleryData();
  }

  _navNext() {
    this.page = clamp(this.page + 1, 1, this.pageCount);
    this._syncGalleryData();
  }

  _setQuery() {
    if (this.query == "" && this.searchField.value == "") {
      return;
    }

    this.query = this.searchField.value;
    this.page = 1;
    this._syncGalleryData();
  }

  _getURL() {
    const params = new URLSearchParams();
    params.set("items", 9);

    if (this.query && this.query != "") {
      params.set("search", this.query);
    } else {
      params.set("order", `random~${this.seed}`)
    }

    if (this.part != "") {
      params.set("part", this.part);
    }

    if (this.category != "") {
      params.set("category", this.category);
    }

    if (!this.ignoreModel) {
      params.set("model", this.editor.getVariant());
    }

    return this.ui.galleryURL() + `/${this.page}?${params}`;
  }

  _getGalleryData() {
    const headers = {
      "Accept": "application/json",
    }

    return fetch(this._getURL(), {headers});
  }

  _syncGalleryData() {
    this._getGalleryData().then(data => {
      data.json().then(json => {
        this._galleryData = json;
      });
    })
  }

  _renderSkins() {
    const div = document.createElement("div");
    div.id = "skins";
    div.part = "skins";

    if (!this._galleryData) { return div; }

    this._galleryData.skins.forEach(skin => {
      const gallerySkin = new GallerySkin(skin);
      gallerySkin.addEventListener("add-skin", event => {
        this._addSkin(event.detail);
      })

      div.appendChild(gallerySkin);
    });

    return div;
  }

  _addSkin(metadata) {
    const layerMetadata = {
      attribution: `${metadata.url}\n${metadata.author.attribution_message}`
    };

    this.editor.addLayerFromImageURL(metadata.image, layerMetadata);
  }

  _createSearchField() {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Search for skins";

    input.addEventListener("change", () => {
      this._setQuery();
    })

    return input;
  }

  _createPartsFilter() {
    const select = document.createElement("select");
    select.id = "parts";

    const unset = document.createElement("option");
    unset.textContent = "All";
    unset.value = "";

    select.appendChild(unset);
    this.parts.forEach(part => {
      const option = document.createElement("option");
      option.textContent = part;
      option.value = part;

      if (this.part === part) {
        option.selected = true;
      }

      select.appendChild(option);
    })

    select.addEventListener("change", () => {
      this.part = select.value;
      this._syncGalleryData();
    });

    return select;
  }

  _createCategoriesFilter() {
    const select = document.createElement("select");
    select.id = "categories";

    const unset = document.createElement("option");
    unset.textContent = "All";
    unset.value = "";

    select.appendChild(unset);

    this.categories.forEach(category => {
      const option = document.createElement("option");
      option.textContent = category;
      option.value = category;

      if (this.category === category) {
        option.selected = true;
      }

      select.appendChild(option);
    })

    select.addEventListener("change", () => {
      this.category = select.value;
      this._syncGalleryData();
    });

    return select;
  }

  _generateSeed() {
    const floatArray = new Float32Array(1);
    floatArray[0] = Math.random();

    const dv = new DataView(floatArray.buffer);
    
    const bytes = [
      dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3),
    ];

    const str = String.fromCharCode(...bytes);

    return btoa(str);
  }

  _toggleIgnoreModel(event) {
    this.ignoreModel = event.detail;

    this._syncGalleryData();
  }

  _setupEvents() {
    this.editor.project.addEventListener("variant-change", () => {
      if (this.ignoreModel) return;

      this._syncGalleryData();
    })
  }
}

customElements.define("ncrs-quick-search", QuickSearch);

export default QuickSearch;