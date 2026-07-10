import { css, html, LitElement } from "lit";
import ProjectTab from "./project_tab";
import { ProjectManager } from "../../editor/project/project_manager";

class ProjectTabBar extends LitElement {
  static properties = {
    projects: {},
    current: {},
  }

  static styles = css`
    #main {
      display: flex;
      gap: 0.5rem;
      background-color: #131315;
      padding-top: 0.25rem;
      border-color: #232428;
      border-style: solid;
      border-width: 0px;
      border-bottom-width: 1px;
    }

    #tabs {
      display: flex;
      gap: 0.25rem;
      overflow: auto;
      scrollbar-width: thin;
    }

    ncrs-ui-project-tab {
      flex-shrink: 0;
    }

    ncrs-button::part(button) {
      padding: 0.25rem 0.25rem;
      height:calc(100% - 4px);
      width:auto;
      aspect-ratio: 1/1;
    }

    ncrs-icon {
      width: 70%;
      height: 70%;
      padding: 15%;
    }
  `;

  firstUpdated(){
    this.tabs = this.renderRoot.getElementById("tabs");

    this.tabs.addEventListener("wheel", event => {
      event.preventDefault();
      this.tabs.scrollLeft += event.deltaY + event.deltaX;
    });

    this.editor.addEventListener("render", () => {
      const tab = this.tabs.querySelector(`ncrs-ui-project-tab[id="${this.current}"]`)

      if (!tab) return;

      tab.thumbnail = this.editor.project.get("thumbnail");
    });
  }

  constructor(editor) {
    super();
    this.editor = editor;
    this.projects = [{id: "", name: "Loading...", thumbnail: undefined}];

    this.editor.projectManager.addEventListener("update", event => {
      this.projects = event.detail.projects;
      this.current = event.detail.current;
    });

    this.editor.projectManager.currentUUID().then(id => this.current = id);
    ProjectManager.list().then(list => this.projects = list);
  }
  #untitledCache = {};
  #untitled = 0;

  render() {
    const tabs = this.projects.map(project => {
      let name = project.name;

      if (!name) {
        if (!this.#untitledCache[project.id]) {
          this.#untitled++;
          this.#untitledCache[project.id] = this.#untitled;
        }

        name = `Project ${this.#untitledCache[project.id]}`;
      }

      const tab = new ProjectTab(project.id, name, project.thumbnail);
      tab.selected = (project.id === this.current);

      tab.addEventListener("select", event => {
        this.editor.switchProject(event.detail.id);
      });

      tab.addEventListener("rename", event => {
        this.editor.renameProject(event.detail.name);
      });

      tab.addEventListener("delete", event => {
        this.editor.deleteProject(event.detail.id);
      });

      return tab;
    });
    
    return html`
      <div id="main">
        <div id="tabs">
          ${tabs}
        </div>
        <ncrs-button title="New Project" @click=${this.addTab}>
          <ncrs-icon icon="add" color="#fff"></ncrs-icon>
        </ncrs-button>
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