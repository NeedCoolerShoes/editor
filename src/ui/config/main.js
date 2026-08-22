import { css, html, LitElement } from "lit";
import "./controls"
import TabGroup from "../misc/tab_group.js";
import ToolTab from "./tabs/tool.js";
import LayersTab from "./tabs/layers.js";
import ImportTab from "./tabs/import.js";
import ExportTab from "./tabs/export.js";
import SettingsTab from "./tabs/settings.js";

class Config extends LitElement {
  static styles = css`
    :host {
      min-width: 290px;
      width: 290px;
    }

    ncrs-tab-group {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #232428;
    }

    ncrs-tab-group::part(tabs) {
      flex-grow: 1;
      overflow: auto;
      scrollbar-color: rgb(61, 64, 66) rgb(26, 26, 26);
      scrollbar-width: thin;
    }

    ncrs-tab-group::part(tab) {
      height: 100%;
    }

    ncrs-tab-group::part(buttons) {
      display: flex;
      gap: 0.25rem;
      background-color: #131315;
      padding-top: 0.25rem;
    }

    ncrs-tab-group::part(button) {
      all: unset;
      flex-grow: 1;
      display: block;
      cursor: pointer;
      text-align: center;
      color: white;
      user-select: none;
      padding: 0.25rem;
      padding-top: 0px;
      margin-top: 0.25rem;
      border-top-left-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
      border-width: 0px;
      border-top-width: 2px;
      border-color: #232428;
      border-style: solid;
      background-color: #232428;
    }

    ncrs-tab-group::part(button):not(:active):hover {
      color: #bbb;
    }

    ncrs-tab-group::part(button selected),
    ncrs-tab-group::part(button):active,
    ncrs-tab-group::part(button):focus,
    ncrs-tab-group::part(button selected):not(:active):hover {
      border-color: #313436;
      color: #55b2ff;
    }

    ncrs-tab-group::part(button selected) {
      margin-top: 0px;
      background-color: #1a1a1a;
      font-weight: bold;
    }
  `;

  constructor(ui) {
    super();

    this.ui = ui;
    this.editor = this.ui.editor;
    this.tabGroup = new TabGroup();

    this.tabs = {
      tool: new ToolTab(this.ui),
      layers: new LayersTab(this.editor),
      import: new ImportTab(this.ui),
      export: new ExportTab(this.ui),
      settings: new SettingsTab(this.ui),
    }
  }

  select(id) {
    this.tabGroup.select(this.tabs[id]);
  }

  render() {
    const tabs = this.tabGroup;
    tabs.side = "top";

    const t = this.tabs;

    tabs.registerTab(t.tool);
    tabs.registerTab(t.layers);
    tabs.registerTab(t.import);
    tabs.registerTab(t.export);
    // tabs.registerTab(t.settings); Disable settings tab for now, still needs work

    tabs.addEventListener("select", event => {
      const tabName = Object.keys(t).find(key => t[key] === event.detail);
      if (!tabName) { return; }
      this.ui.persistence.set("selectedTab", tabName);
    })

    const selectedTab = this.ui.persistence.get("selectedTab", "tool");
    tabs.select(t[selectedTab]);

    return tabs;
  }
}

customElements.define("ncrs-config", Config);
export default Config;