import {msg} from '@lit/localize';
import { BaseTool } from "../base_tool";

class MoveTool extends BaseTool {
  constructor(config) {
    super(config, {
      id: "move",
      icon: "move",
      name: msg(`Move Tool`, {id:`tool.move.tooltip.name`}),
      description: msg(`Allows you to rotate and move your skin without accidentally drawing on it.`, {id:`tool.move.tooltip.description`}),
      providesColor: false, // Whether or not drawing with this tool adds to recent colors.
      desktopLayout: false,
      mobileLayout: true,
    });
  }

  check() {
    return false;
  }
}

export default MoveTool;