import { css, html, LitElement } from "lit";
import ProjectTab from "./project_tab";

class ProjectTabBar extends LitElement {
  static properties = {
    projects: {},
    current: {},
  }

  static styles = css`
    #tabs {
      display: flex;
      gap: 0.25rem;
      background-color: #131315;
      padding-top: 0.25rem;
      border-color: #232428;
      border-style: solid;
      border-width: 0px;
      border-bottom-width: 1px;
    }

    ncrs-button::part(button) {
      padding: 0.125rem 0.5rem;
    }
  `;

  constructor(editor) {
    super();
    this.editor = editor;
    this.projects = [{id: "", name: "Loading..."}];

    this.editor.projectManager.addEventListener("update", event => {
      this.projects = event.detail.projects;
      this.current = event.detail.current;
    })
  }

  render() {
    const tabs = this.projects.map(project => {
      const tab = new ProjectTab(project.id, project.name);
      tab.selected = (project.id === this.current);
      tab.addEventListener("select", event => {
        this.editor.switchProject(event.detail.id);
      });

      return tab;
    });
    
    return html`
      <div id="tabs">
        ${tabs}
        <ncrs-button title="New Project" @click=${this.addTab}>+</ncrs-button>
      </div>
    `;
  }

  async addTab() {

    const project = await this.editor.projectManager.new();
    this.editor.switchProject(project.id);
  }
}

customElements.define("ncrs-ui-project-tab-bar", ProjectTabBar);
export default ProjectTabBar;