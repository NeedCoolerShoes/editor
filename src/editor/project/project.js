import { genUUID } from "../../helpers";

class Project {
  static createFromEditor(editor) {
    const project = new Project();
    const projectData = editor.project.get("project");

    project.id = projectData.id;
    project.createdAt = projectData.createdAt;
    project.modifiedAt = projectData.modifiedAt;

    project.saveFromEditor(editor);

    return project;
  }

  constructor() {
    const time = Math.floor(Date.now() / 1000);

    this.id = genUUID();
    this.createdAt = time;
    this.modifiedAt = time;

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

  loadToEditor(editor) {
    editor.layers.deserializeLayers(this.layers);
    editor.config.deserialize(this.config);
    editor.toolConfig.deserialize(this.toolConfig);
    editor.project.deserialize(this.projectData);
  }
}

export default Project;