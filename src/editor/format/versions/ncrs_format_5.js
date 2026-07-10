import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../../../constants.js";
import { genUUID, nonPolyfilledCtx } from "../../../helpers.js";
import BaseVersion from "../base_version.js";
import NCRSFormat4 from "./ncrs_format_4.js";
import validate from "./schemas/schema_4.js";

class NCRSFormat5 extends BaseVersion {
  static format = 5;

  static exportEditor(editor) {
    return {
      type: "application/vnd.needcoolershoes.ncrs+json",
      format: this.format,
      project: editor.project.get("project"),
      variant: editor.project.get("variant"),
      layers: editor.layers.serializeLayers(),
      blendPalette: editor.toolConfig.get("blend-palette"),
    };
  }
  
  static loadEditor(editor, data) {
  }

  constructor(data) {
    super(NCRSFormat4, data, NCRSFormat5.format);
  }

  // Convert data to version 5
  convert(data) {
    data.project = data.project || {};
    // Replace the UUID for old projects, as there was no easy way to change them
    // prior to projects system.
    data.project.id = genUUID();

    const time = Math.floor(Date.now() / 1000);
    data.project.name = data.project.name || undefined;
    data.project.createdAt = data.project.createdAt || time;
    data.project.modifiedAt = data.project.createdAt || time;

    return data;
  }

  validateData(data) {
    return validate(data);
  }
}

export default NCRSFormat5;