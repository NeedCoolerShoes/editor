import { css, html, LitElement } from "lit";

class TabGroup extends LitElement {
  constructor() {
    super();
  }
  tabs = [];

  static styles = css``;

  static properties = {
    visible: {reflect: true}
  }

  render() {
    const tabsDiv = document.createElement("div");
    tabsDiv.id = "tabs";
    tabsDiv.part = "tabs";

    const buttonsDiv = document.createElement("div");
    buttonsDiv.id = "buttons";
    buttonsDiv.part = "buttons";

    this.tabs.forEach(tab => {
      tabsDiv.appendChild(tab);
      buttonsDiv.appendChild(this._createTabButton(tab));
    })

    return html`
      ${tabsDiv}
      ${buttonsDiv}
    `
  }

  select(selectedTab) {
    this.tabs.forEach(tab => {
      tab.visible = (tab == selectedTab);
    })

    this.requestUpdate();
  }

  registerTab(tab) {
    if (this.tabs.includes(tab)) { return; }
    if (this.tabs.length < 1) {
      tab.visible = true;
    }

    tab.part = "tab";
    
    this.tabs.push(tab);
    this.requestUpdate();
  }

  unregisterTab(tab) {
    if (!this.tabs.includes(tab)) { return; }

    this.tabs.splice(this.tabs.indexOf(tab) - 1, 1);
    this.requestUpdate();
  }

  _createTabButton(tab) {
    const button = document.createElement("button");
    button.textContent = tab.properties.name;

    if (tab.visible) {
      button.part = "button selected";
    } else {
      button.part = "button"
    }

    button.addEventListener("click", () => {
      this.select(tab);
    });

    return button;
  }
}

customElements.define("ncrs-tab-group", TabGroup);

export default TabGroup;