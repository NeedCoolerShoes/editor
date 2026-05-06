import { genUUID } from "../../helpers";
import Config from "../config";
import { ProjectManager } from "../project/project_manager";
import ProjectLoader from "./project_loader";

const FORMAT = ProjectLoader.version.format;

class ProjectData extends Config {
  static getDefaults() {
    const time = Math.floor(Date.now() / 1000);

    return {
      format: {default: FORMAT, persistence: true},
      project: {default: {id: genUUID(), name: "Project 1", createdAt: time, modifiedAt: time}, persistence: true},
      variant: {default: "classic", persistence: true},
      layers: {default: [], persistence: true},
    }
  }

  static blank() {
    const output = {};

    Object.entries(this.getDefaults()).forEach(([key, value]) => {
      output[key] = value.default;
    });

    return output;
  } 

  constructor() {
    super("ncrs-editor", ProjectData.getDefaults());
  }

  set(key, value, force = false) {
    super.set(key, value, force);
    this._setModifiedTime();
  }

  _setModifiedTime() {
    const project = this.get("project", {});

    if (!Object.keys(project).includes("id")) return;

    project["modifiedAt"] = Math.floor(Date.now() / 1000);

    super.set("project", project);
  }
}

export default ProjectData;