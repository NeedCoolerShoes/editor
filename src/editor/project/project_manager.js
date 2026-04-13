import Project from "./project";

const PROJECT_FORMAT = 1;

class ProjectManager {
  constructor(editor) {
    this.editor = editor;
  }
  projects = [];

  find(uuid) {
    return this.projects.find(project => project.id === uuid);
  }

  new() {
    const project = new Project()
    this.projects.push(project);

    return project;
  }

  save() {
    const project = Project.createFromEditor(this.editor);

    const idx = this.projects.findIndex(e => e.id === project.id);
    if (idx > -1) {
      this.projects.splice(idx, 1, project);
    } else {
      this.projects.push(project);
    }

    return project;
  }

  switch(uuid) {
    this.find(uuid).loadToEditor(this.editor);
  }
}

export {ProjectManager, PROJECT_FORMAT};