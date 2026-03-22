import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../../constants";
import { genUUID } from "../../helpers";
import { HistoryManager } from "../history/history_manager";
import { Layers } from "../layers/layers";

class Project {
  constructor() {
    const time = Math.floor(Date.now() / 1000);

    this.id = genUUID();
    this.createdAt = time;
    this.modifiedAt = time;

    this.history = new HistoryManager();
    this.layers = new Layers(IMAGE_WIDTH, IMAGE_HEIGHT);
  }

  serialize() {
    return {
      project: {id: this.id, createdAt: this.createdAt, modifiedAt: this.modifiedAt},
      layers: this.layers.serializeLayers(),
    }
  }
}

export default Project;