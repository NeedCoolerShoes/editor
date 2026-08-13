import { css, html, LitElement } from "lit";

class MobileTabGroup extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    #nav {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      gap: 0.25rem;
      width: max-content;
      margin: 0.25rem;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 0.5rem;
      background-color: #131315;
      padding: 0.25rem;
      padding-bottom: 0.375rem;
      border-radius: 0.25rem;
      box-shadow: rgb(10, 10, 13) 0px 4px 4px inset;
    }

    #nav button {
      all: unset;
      display: block;
      cursor: pointer;
      color: rgb(204, 204, 204);
      text-align: center;
      padding: 0.125rem 0.25rem;
      font-size: medium;
    }

    #nav button.selected {
      background: linear-gradient(to top, rgb(36, 39, 42), rgb(49, 52, 54));
      border-color: rgb(35, 36, 40) rgb(35, 36, 40) rgb(30, 35, 38);
      background-image: linear-gradient(to top, rgb(49, 52, 54), rgb(36, 39, 42));
      box-shadow: #3d4042 0px 0px 0px 1px inset, #191a1c 0px 1px 3px, #1f2226 0px 2px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
      border-radius: 0.25rem;
      color: #55b2ff;
    }

    #body {
      position: relative;
      display: flex;
      gap: 0.25rem;
      max-height: calc(100% - 34px);
      height: 100%;
      overflow-x: scroll;
      scrollbar-width: none;
      scroll-snap-type: x mandatory;
      scroll-snap-stop: always;
      overscroll-behavior: none;
    }

    #body::-webkit-scrollbar {
        display: none;
    }

    ::slotted(ncrs-mobile-tab) {
      scroll-snap-align: start;
      min-width: 100%;
      max-width: 100%;
      max-height: 100%;
      overflow-y: auto;
    }
  `;

  constructor() {
    super();

    this.tabs = this._getChildTabs();
    this._setupMutationObserver();
  }
  selectedTab;
  
  render() {
    return html`
      <div id="nav">
        ${this._renderTabButtons()}
      </div>
      <div id="body">
        <slot></slot>
      </div>
    `;
  }

  _renderTabButtons() {
    return this._getChildTabs().map(tab => {
      const button = document.createElement("button");
      button.textContent = tab.name;
      
      button.addEventListener("click", () => {
        const body = this.shadowRoot.getElementById("body");
        body.scrollTo({left: tab.offsetLeft, behavior: "smooth"});
      });
      this._setupIntersectionObserver(tab, entries => {
        const entry = entries[0];
        entry.isIntersecting ? button.classList.add("selected") : button.classList.remove("selected");
      });

      return button;
    })
  }

  _getChildTabs() {
    return Array.from(this.querySelectorAll(":scope > ncrs-mobile-tab"));
  }

  _setupMutationObserver() {
    const mutationObserver = new MutationObserver((_mutationList, _observer) => {
      this.requestUpdate();
    });

    mutationObserver.observe(this, {childList: true});
  }

  _setupIntersectionObserver(tab, callback) {
    const intersectionObserver = new IntersectionObserver((entries, _observer) => {
      callback(entries);
    }, {threshold: 0.5})

    intersectionObserver.observe(tab);
  }
}

customElements.define("ncrs-mobile-tab-group", MobileTabGroup);
export default MobileTabGroup;