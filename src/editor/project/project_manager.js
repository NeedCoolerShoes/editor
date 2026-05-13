import { del, get, set, update } from "idb-keyval";
import Project from "./project";

const PROJECT_FORMAT = 1;

function projectKey(id) {
  const restricted = ["current"];

  if (restricted.includes(id)) throw "Invalid ID";

  return `ncrs:project/${id}`;
}

class ProjectManager extends EventTarget {
  static async list() {
    const projects = await get("ncrs:projects");
  
    return projects || [];
  }

  static async count() {
    const list = await this.list();
    return list.length;
  }

  static async untitledName() {
    let highestProject = await this.count();

    const projects = await this.list();
    projects.forEach(project => {
      const name = project.name || "";

      const match = name.match(/Project (?<number>\d+)/);

      if (!match) return;

      const number = parseInt(match.groups?.number || "0");

      if (number > highestProject) {
        highestProject = number;
      }
    });

    return `Project ${highestProject + 1}`;
  }

  constructor(editor) {
    super();

    this.editor = editor;
  }
  #projectCache = [];

  async currentUUID() {
    return await get("ncrs:projects/current");
  }

  async current() {
    const uuid = await this.currentUUID();

    if (!uuid) return;

    return this.get(uuid);
  }

  async get(uuid) {
    const cached = this.#projectCache.find(project => project.id === uuid);
    if (cached) return cached;

    const newProject = await Project.loadFromStore(uuid);
    
    if (!newProject) return;

    this.#projectCache.push(newProject);

    return newProject;
  }

  async switch(uuid, load = true) {
    const currentUUID = await this.currentUUID();

    if (uuid === currentUUID) return;

    const project = await this.get(uuid);

    if (load) {
      project.loadToEditor(this.editor);
    }

    await set("ncrs:projects/current", uuid);

    this._syncProjectList();
  }

  async save(uuid) {
    const project = await this.get(uuid);

    await set(projectKey(uuid), project.serialize());
  }

  async saveCurrent() {
    const uuid = await this.currentUUID();

    await this.save(uuid);
  }

  async new() {
    const name = await ProjectManager.untitledName();
    const project = Project.createBlank(name);
    this.#projectCache.push(project);

    await this._syncProjectList();

    return project;
  }

  async delete(uuid) {
    const current = await this.currentUUID();

    update("ncrs:projects", projects => {
      const idx = projects.findIndex(p => p.id === uuid);
  
      if (idx > -1) {
        const newProjects = projects.toSpliced(idx, 1);
        return newProjects;
      }
        
      return projects;
    }).then(() => {
      ProjectManager.list().then(projects => {
        this._sendUpdateEvent(projects, current);
      });
    });

    const cacheIdx = this.#projectCache.findIndex(project => project.id === uuid);

    if (cacheIdx > -1) {
      this.#projectCache.splice(cacheIdx, 1);
    }
    
    await del(projectKey(uuid));
  }

  async syncFromEditor(editor) {
    const newProject = Project.createFromEditor(editor);
    const idx = this.#projectCache.findIndex(project => project.id === newProject.id);

    if (idx < 0) {
      this.#projectCache.push(newProject);
    } else {
      this.#projectCache.splice(idx, 1, newProject);
    }
    await set(projectKey(newProject.id), newProject.serialize());

    await this.switch(newProject.id, false);
    this._syncProjectList();
  }

  async _syncProjectList() {
    const current = await this.currentUUID();

    update("ncrs:projects", projects => {
      projects = projects || [];

      this.#projectCache.map(project => {
        if (!projects.find(p => p.id == project.id)) {
          projects.push(project.cacheEntry());
        } else {
          const idx = projects.findIndex(p => p.id == project.id);
  
          projects.splice(idx, 1, project.cacheEntry());
        }
      });

      this._sendUpdateEvent(projects, current);

      return projects;
    });
  }
  
  _sendUpdateEvent(projects, current) {
    this.dispatchEvent(new CustomEvent("update", {detail: {projects: projects, current: current}}));
  }
}

window.ProjectManager = ProjectManager;

export {ProjectManager, PROJECT_FORMAT, projectKey};