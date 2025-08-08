import { LitElement } from "lit";
import Tool from "./tool";

class Toolset extends LitElement {
  constructor(editor) {
    super();

    this.editor = editor;

    this._setupEvents();
  }

  render() {
    const editor = this.editor;
    const tools = [];

    editor.tools.forEach(tool => {
      const newTool = new Tool(this.editor, tool);
      newTool.part = "tool";

      if (tool.properties.id === "sculpt") {
        newTool.disabled = !editor.config.get("overlayVisible", false);
        editor.config.addEventListener("overlayVisible-change", event => {
          newTool.disabled = !event.detail;
        })
      }

      tools.push(newTool);
    });

    return tools;
  }

  select(tool) {
    this.shadowRoot.querySelectorAll("ncrs-tool").forEach(element => {
      element.active = (tool == element.tool);
    })
  }

  _setupEvents() {
    this.editor.addEventListener("select-tool", event => {
      this.select(event.detail.tool);
    });
  }
}

customElements.define("ncrs-tools-toolset", Toolset);
export default Toolset;