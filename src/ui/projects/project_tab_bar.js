import { css, html, LitElement } from "lit";
import ProjectTab from "./project_tab";

class ProjectTabBar extends LitElement {
  static styles = css`
    #tabs {
      display: flex;
      gap: 0.25rem;
    }
  `;

  constructor(editor) {
    super();
    this.editor = editor;
  }

  render() {
    const projects = ["Untitled 1", "Untitled 2", "Untitled 3"];

    const tabs = projects.map(id => new ProjectTab(id));
    tabs[0].selected = true;
    
    return html`
      <div id="tabs">
        ${tabs}
      </div>
    `;
  }
}

customElements.define("ncrs-ui-project-tab-bar", ProjectTabBar);
export default ProjectTabBar;