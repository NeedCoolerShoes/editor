import Config from "../config";

const VALUE_MAP = {
  variant: {default: "classic", persistence: true},
  selectedTool: {persistence: true},
  partVisibility: {
    default: {
      head: true,
      arm_left: true,
      torso: true,
      arm_right: true,
      leg_left: true,
      leg_right: true,
      ear_left: true,
      ear_right: true
    },
    persistence: true
  },
  baseVisible: {default: true, persistence: true},
  overlayVisible: {default: false, persistence: true},
  baseGridVisible: {default: true, persistence: true},
  overlayGridVisible: {default: true, persistence: true},
  cullBackFace: {default: true, persistence: true},
  cullGrid: {default: true, persistence: true},
}

class EditorConfig extends Config {
  constructor() {
    super("ncrs-editor-config", VALUE_MAP);
  }
}

export default EditorConfig;