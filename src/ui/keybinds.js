import { del } from "idb-keyval";
import { getFocusedElement, isKeybindIgnored } from "../helpers";
import PersistenceManager from "../persistence";

// All keybind definitions, ^ = ctrl / cmd, + = shift, ! = alt
const KEYBINDS = {
  "b": "pen",
  "e": "eraser",
  "g": "bucket",
  "s": "shade",
  "i": "eyedropper",
  "+s": "sculpt",
  "^z": "undo",
  "#z": "undo",
  "^y": "redo",
  "^+z": "redo",
  "^r": "reset",
  "=": "zoomIn",
  "-": "zoomOut",
  "arrowleft": "panLeft",
  "arrowright": "panRight",
  "arrowup": "panUp",
  "arrowdown": "panDown",
  "0": "cameraReset",
  "1": "selectTools",
  "2": "selectLayer",
  "3": "selectImport",
  "4": "selectExport",
  "!t": "selectTools",
  "!l": "selectLayer",
  "!i": "selectImport",
  "!e": "selectExport",
  "+n": "addLayer",
  "delete": "removeLayer",
  "+d": "cloneLayer",
  "+m": "mergeLayer",
  "f": "toggleFullscreen",
  "+l": "toggleOverlay",
  "^+l": "toggleBase",
  "+o": "toggleOverlayGrid",
  "^+o": "toggleBaseGrid",
  "+f": "toggleBackfaceCulling",
  "^+f": "toggleGridCulling",
}

function checkKeybinds(event) {
    let key = '';
    if (event.ctrlKey || event.metaKey) {
      key+='^';
    }
    if (event.altKey) {
      key+='!';
    }
    if (event.shiftKey) {
      key+='+';
    }
    key+=event.key.toLowerCase();

    if (key in KEYBINDS) {
      return KEYBINDS[key];
    }
  }

function setupKeybinds(ui, editor) {
  document.addEventListener("keydown", event => {
    if (ui.disableKeybinds) {
      return;
    }

    const element = event.originalTarget || getFocusedElement();

    if (isKeybindIgnored(element)) { return; }

    if (checkKeybinds(event)) {
      event.preventDefault();
    }
    switch(checkKeybinds(event)) {
      case "pen":
        if (editor.currentTool.properties.id === "pen") {
          ui.selectConfigTab("tool");
        }
        editor.selectToolById("pen");
        break;
      case "eraser":
        if (editor.currentTool.properties.id === "eraser") {
          ui.selectConfigTab("tool");
        }
        editor.selectToolById("eraser");
        break;
      case "bucket":
        if (editor.currentTool.properties.id === "bucket") {
          ui.selectConfigTab("tool");
        }
        editor.selectToolById("bucket");
        break;
      case "shade":
        if (editor.currentTool.properties.id === "shade") {
          ui.selectConfigTab("tool");
        }
        editor.selectToolById("shade");
        break;
      case "sculpt":
        if (!editor.config.get("overlayVisible")) { break; }
        if (editor.currentTool.properties.id === "sculpt") {
          ui.selectConfigTab("tool");
        }
        editor.selectToolById("sculpt");
        break;
      case "eyedropper":
        editor.config.set("pick-color-toggle", true);
        editor.config.set("pick-color", !editor.config.get("pick-color", false));
        break;
      case "undo":
        editor.history.undo();
        break;
      case "redo":
        editor.history.redo();
        break;
      case "reset":
        const check = confirm("Do you want to reset all editor data? You will lose all progress on your current skin.");

        if (check) {
          PersistenceManager.resetAll();
          del("ncrs:reference-images");
          location.reload();
        }
        
        break;
      case "zoomIn":
        if (editor.camera.position.z > 1) {
          editor.camera.position.z-= editor.camera.position.z * 0.075;
        }
        break;
      case "zoomOut":
        if (editor.camera.position.z < 15) {
          editor.camera.position.z+= editor.camera.position.z * 0.075;
        }
        break;
      case "cameraReset":
        editor.resetCamera();
        break;
      case "selectTools":
        ui.selectConfigTab("tool");
        break;
      case "selectLayer":
        ui.selectConfigTab("layers");
        break;
      case "selectImport":
        ui.selectConfigTab("import");
        break;
      case "selectExport":
        ui.selectConfigTab("export");
        break;
      case "addLayer":
        editor.addLayer();
        break;
      case "removeLayer":
        editor.removeLayer();
        break;
      case "cloneLayer":
        editor.cloneLayer();
        break;
      case "mergeLayer":
        editor.mergeLayer();
        break;
      case "toggleFullscreen":
        ui.toggleFullscreen();
        break;
      case "toggleOverlay":
        editor.toggleOverlayVisible();
        break;
      case "toggleBase":
        editor.toggleBaseVisible();
        break;
      case "toggleOverlayGrid":
        editor.toggleOverlayGridVisible();
        break;
      case "toggleBaseGrid":
        editor.toggleBaseGridVisible();
        break;
      case "toggleBackfaceCulling":
        editor.toggleBackfaceCulling();
        break;
      case "toggleGridCulling":
        editor.toggleGridCulling();
        break;
      }
  });
}

export default setupKeybinds;