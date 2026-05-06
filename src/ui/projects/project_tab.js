import { css, html, LitElement } from "lit";

class ProjectTab extends LitElement {
  static styles = css`
    :host {
      display: block;
      --text-color: white;
      --icon-color: white;
    }

    :host(:hover) {
      --text-color: #BBBBBB;
    }

    :host([selected]) {
      --text-color: #55b2ff;
    }

    #main {
      display: flex;
      position: relative;
      border-top-right-radius: 0.25rem;
      border-top-left-radius: 0.25rem;
      background-color: #232428;
    }

    :host([selected]) #main {
      background-color: #1A1A1A;
    }

    #cross {
      position: absolute;
      display: flex;
      align-items: center;
      top: 0px;
      bottom: 0px;
      right: 0.25rem;
    }

    button {
      all: unset;
      display: block;
      cursor: pointer;
      user-select: none;
    }

    #tab-button {
      width: 100%;
      height: 100%;
      padding: 0.25rem 0.75rem;
      padding-right: 2rem;
      flex-grow: 1;
      color: var(--text-color);
    }

    #cross button {
      width: 12px;
      height: 12px;
    }

    ncrs-icon {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  static properties = {
    selected: {type: Boolean, reflect: true},
  }

  constructor(id, name) {
    super();

    this.id = id;
    this.name = name;
  }

  render() {
    return html`
      <div id="main">
        <button @click=${this.select} id="tab-button">${this.name}</button>
        <div id="cross">
          <button @click=${this.delete}><ncrs-icon icon="cross" color="var(--icon-color)"></ncrs-icon></button>
        </div>
      </div>
    `;
  }

  select() {
    this.dispatchEvent(new CustomEvent("select", {detail: {id: this.id}}));
  }

  delete() {
    this.dispatchEvent(new CustomEvent("delete", {detail: {id: this.id}}));
  }
}

customElements.define("ncrs-ui-project-tab", ProjectTab);
export default ProjectTab;