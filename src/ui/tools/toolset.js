import { css, LitElement } from "lit";
import Tool from "./tool";

class Toolset extends LitElement {
  static properties = {
    mobile: {type: Boolean},
    expanded: {type: Boolean, reflect: true}
  }

  static styles = css`
    :host {
      --tool-closed: block;
      --tool-open: none;
    }

    :host([expanded]) {
      --tool-closed: none;
      --tool-open: block;
    }
  `;

  constructor(editor) {
    super();

    this.editor = editor;
    this.expanded = false;
  }

  firstUpdated() {
    this._setupEvents();
  }

  render() {
    const editor = this.editor;
    const tools = [];

    editor.tools.forEach(tool => {
      if (this.mobile && !tool.properties.mobileLayout) return;
      if (!this.mobile && !tool.properties.desktopLayout) return;

      const newTool = new Tool(this.editor, tool, this.mobile, tool.properties.id !== "move");
      newTool.part = "tool";

      if (tool.properties.id === "sculpt") {
        newTool.disabled = !editor.config.get("overlayVisible", false);
        editor.config.addEventListener("overlayVisible-change", event => {
          newTool.disabled = !event.detail;
        });
      }

      tools.push(newTool);
    });

    return tools;
  }

  select(tool) {
    this.shadowRoot.querySelectorAll("ncrs-tool").forEach(element => {
      element.active = (tool == element.tool);
      this.active = true;
    });
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
  }

  _setupEvents() {
    this.editor.addEventListener("select-tool", event => {
      this.select(event.detail.tool);
    });
  }
}

customElements.define("ncrs-tools-toolset", Toolset);
export default Toolset;