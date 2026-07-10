import {default as VERSION} from "./versions/ncrs_format_5.js";

class ProjectLoader {
  static version = VERSION;

  static export(editor) {
    return this.version.exportEditor(editor);
  }

  constructor(data) {
    this.version = new VERSION(data);
  }

  load(editor) {
    VERSION.loadEditor(editor, this.getData());
  }

  getData() {
    return this.version.data;
  }

  serialize() {
    return this.version.serialize();
  }
}

export default ProjectLoader;