import { css, html, LitElement } from "lit";
import ProjectTab from "./project_tab";
import { ProjectManager } from "../../editor/project/project_manager";

class ProjectTabBar extends LitElement {
  static properties = {
    projects: {},
    current: {},
    mobile: {type: Boolean, reflect: true}
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

    :host([mobile]) #main {
      height: 100%;
      background-color: transparent;
      overflow: auto;
    }

    #tabs {
      display: flex;
      gap: 0.25rem;
      overflow: auto;
      scrollbar-width: thin;
    }

    :host([mobile]) #tabs {
      height: fit-content;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 1fr;
    }

    @media screen and (min-width: 400px) {
      :host([mobile]) #tabs {
        grid-template-columns: repeat(3, 1fr);
      }
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

    :host([mobile]) {
    #add-button {
        cursor: pointer;
        padding: 0.5rem;
        border: 2px solid #232428;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        --icon-color: white;
      }

      #add-button:hover {
        --icon-color: #BBBBBB;
      }

      ncrs-icon {
        width: 64px;
        height: 64px;
      }
    }
  `;

  firstUpdated(){
    this.tabs = this.renderRoot.getElementById("tabs");

    this.tabs.addEventListener("wheel", event => {
      if (this.mobile) return;
      
      event.preventDefault();
      this.tabs.scrollLeft += event.deltaY + event.deltaX;
    });

    this.editor.addEventListener("render", () => {
      const id = this.editor.project.get("project").id;
      const tab = this.tabs.querySelector(`ncrs-ui-project-tab[id="${id}"]`)

      if (!tab) return;

      tab.thumbnail = this.editor.project.get("thumbnail");
    });
  }

  constructor(editor, mobile = false) {
    super();
    this.editor = editor;
    this.mobile = mobile;
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

      const tab = new ProjectTab(project.id, name, project.thumbnail, project.variant, this.mobile);
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

    if (this.mobile) {
      return html`
        <div id="main">
          <div id="tabs">
            ${tabs}
            <div id="add-button" @click=${this.addTab} tabindex="0">
              <ncrs-icon icon="add" color="var(--icon-color)"></ncrs-icon>
            </div>
          </div>
        </div>
      `;
    } else {
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
    
  }

  async addTab() {
    const project = await this.editor.projectManager.new();
    this.editor.switchProject(project.id);
  }
}

customElements.define("ncrs-ui-project-tab-bar", ProjectTabBar);
export default ProjectTabBar;