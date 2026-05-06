import { del, get, set } from "idb-keyval";
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
    const count = await this.count();

    return `Project ${count + 1}`;
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
    const idx = this.#projectCache.findIndex(project => project.id === uuid);

    if (idx > -1) {
      this.#projectCache.splice(idx, 1);

      await this._syncProjectList();
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
    const projects = await ProjectManager.list();
    const current = await this.currentUUID();

    this.#projectCache.map(project => {
      if (!projects.find(p => p.id == project.id)) {
        projects.push({id: project.id, name: project.getName()});
      } else {
        const idx = projects.findIndex(p => p.id == project.id);

        projects.splice(idx, 1, {id: project.id, name: project.getName()});
      }
    });

    await set("ncrs:projects", projects);

    this.dispatchEvent(new CustomEvent("update", {detail: {projects: projects, current: current}}));
  }
}

window.ProjectManager = ProjectManager;

export {ProjectManager, PROJECT_FORMAT, projectKey};