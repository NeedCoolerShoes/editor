import { css, html, LitElement } from "lit";

class ProjectTab extends LitElement {
  static styles = css`
    :host {
      height: 100%;
      display: flex;
      --text-color: white;
      --icon-color: white;
    }

    :host(:hover) {
      --text-color: #BBBBBB;
    }

    :host([selected]) {
      --text-color: #55b2ff;
    }

    span {
      display:inline-block;
      padding: 2px;
      min-width: 40px;
    }

    span:focus {
      border: 0;
      border-radius:4px;
      outline: #55b2ff solid 2px;
    }

    #main {
      display: flex;
      position: relative;
      border-top-right-radius: 0.25rem;
      border-top-left-radius: 0.25rem;
      border-width: 0px;
      border-top-width: 2px;
      border-color: #232428;
      background-color: #232428;
      border-style: solid;
      background-color: #232428;
      margin-top: 0.25rem;
    }

    :host([selected]) #main {
      background-color: #1A1A1A;
      margin-top: 0px;
      font-weight: bold;
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
      padding: 0rem 0.75rem;
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
    this._nameTemp = name;
  }

  render() {
    return html`
      <div id="main">
        <button @click=${this.select} id="tab-button">
          <span
            id="name"
            spellcheck="false"
            aria-label="Editable project name"
            @keydown=${this._onKeyDown}
            @input=${this._onInput}
            @focusout=${this.rename}
            contenteditable=${this.selected ? "plaintext-only" : "none"}
          >${this.name}</span>
        </button>
        <div id="cross">
          <button @click=${this.delete}><ncrs-icon icon="cross" color="var(--icon-color)"></ncrs-icon></button>
        </div>
      </div>
    `;
  }

  rename() {
    if (this._nameTemp.length > 0) {
      this.dispatchEvent(new CustomEvent("rename", {detail: {name: this._nameTemp}}));
    } else {
      this.renderRoot.getElementById("name").innerText = this.name;
      this._nameTemp = this.name;
    }
  }

  select() {
    if (this.selected) return;

    this.dispatchEvent(new CustomEvent("select", {detail: {id: this.id}}));
  }

  delete() {
    this.dispatchEvent(new CustomEvent("delete", {detail: {id: this.id}}));
  }

  _onInput(event) {
    if (event.inputType === "insertLineBreak") {
      event.target.innerText = this._nameTemp;
      return this.rename();
    }
    
    this._nameTemp = event.target.innerText.trim();
  }

  _onClick(event) {
    window.getSelection().selectAllChildren(event.target);
  }

  _onKeyDown(event) {
    if (event.key === "Escape") {
      const nameField = this.renderRoot.getElementById("name");
      nameField.innerText = this.name;
      this._nameTemp = this.name;

      nameField.blur();
    }
  }
}

customElements.define("ncrs-ui-project-tab", ProjectTab);
export default ProjectTab;