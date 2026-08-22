import { css, html, LitElement } from "lit";

class TabGroup extends LitElement {
  constructor() {
    super();
  }
  tabs = [];

  static styles = css``;

  static properties = {
    visible: {reflect: true},
    side: {reflect: true},
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
    });

    if (this.side === "top") {
      return html`
        ${buttonsDiv}
        ${tabsDiv}
      `;
    } else {
      return html`
        ${tabsDiv}
        ${buttonsDiv}
      `;
    }
  }

  select(selectedTab) {
    this.tabs.forEach(tab => {
      if (tab.visible && tab != selectedTab) {
        tab.tabExit();
      }

      tab.visible = (tab == selectedTab);
    });

    selectedTab.tabEnter();

    this.dispatchEvent(new CustomEvent("select", {detail: selectedTab}));
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

    if (tab.properties.buttonPart) {
      button.part += " " + tab.properties.buttonPart;
    }

    button.setAttribute("tab-name", tab.properties.name)

    if (tab.properties.title) {
      button.title = tab.properties.title;
    }

    button.addEventListener("click", () => {
      this.select(tab);
    });

    if (tab.darkened) {
      button.part.add("darkened");
    }

    tab.addEventListener("set-darkened", event => {
      if (event.detail) {
        button.part.add("darkened");
      } else {
        button.part.remove("darkened");
      }
    });

    return button;
  }
}

customElements.define("ncrs-tab-group", TabGroup);
export default TabGroup;