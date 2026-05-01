import { del, get } from "idb-keyval";
import Project from "./project";

const PROJECT_FORMAT = 1;

function projectKey(id) {
  const restricted = ["current"];

  if (restricted.includes(id)) throw "Invalid ID";

  return `ncrs:project/${id}`;
}

class ProjectManager extends EventTarget {
  constructor(editor) {
    super();

    this.editor = editor;
  }
  #projectCache = [];

  async list() {
    const projects = await get("ncrs:projects");

    return projects || [];
  }

  async currentUUID() {
    return await get("ncrs:projects/current");
  }

  async current() {
    const uuid = await this.currentUUID();

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

  async switch(uuid) {
    const currentUUID = await this.currentUUID();

    if (uuid === currentUUID) return;

    const project = await this.get(uuid);

    project.loadToEditor(this.editor);
    await set("ncrs:projects/current", uuid);
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
    const project = Project.createBlank();
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

  async _syncProjectList() {
    const projects = await this.list();

    this.#projectCache.map(project => {
      if (!projects.includes(project.id)) {
        projects.push(project.id);
      }
    });

    await set("ncrs:projects", projects);

    this.dispatchEvent(new CustomEvent("update", {detail: projects}));
  }
}

export {ProjectManager, PROJECT_FORMAT, projectKey};