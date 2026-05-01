import { get, set } from "idb-keyval";
import { PROJECT_FORMAT, projectKey } from "./project_manager";
import { genUUID } from "../../helpers";

class Project {
  static createFromEditor(editor) {
    const projectData = editor.project.get("project");
    const project = new Project(projectData.id);

    project.saveFromEditor(editor);

    return project;
  }

  static deserialize(id, data) {
    const project = new Project(id);

    project.layers = data.layers;
    project.config = data.config;
    project.toolConfig = data.toolConfig;
    project.projectData = data.projectData;

    return project;
  }

  static async loadFromStore(id) {
    const data = await get(projectKey(id));

    if (!data) return;

    return this.deserialize(id, data);
  }

  static createBlank() {
    return new Project(genUUID());
  }

  constructor(id) {
    this.id = id;

    this.undoHistory = [];
    this.redoHistory = [];

    this.layers = [];
    this.config = {};
    this.toolConfig = {};
    this.projectData = {};
  }

  saveFromEditor(editor) {
    this.undoHistory = editor.history.undoStack;
    this.redoHistory = editor.history.redoStack;

    this.layers = editor.layers.serializeLayers();
    this.config = editor.config.serialize();
    this.toolConfig = editor.toolConfig.serialize();
    this.projectData = editor.project.serialize();
  }

  async loadToEditor(editor) {
    editor.layers.deserializeLayers(this.layers);
    editor.config.deserialize(this.config);
    editor.toolConfig.deserialize(this.toolConfig);
    editor.project.deserialize(this.projectData);
  }

  serialize() {
    return {
      format: PROJECT_FORMAT,
      layers: this.layers,
      config: this.config,
      toolConfig: this.toolConfig,
      projectData: this.projectData,
    }
  }
}

export default Project;