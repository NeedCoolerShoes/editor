import * as THREE from "three";
import { OrbitControls } from "./orbit.js";
import { getFocusedElement, isKeybindIgnored } from "../helpers.js";

import imgEyedropper from "../../assets/images/cursors/eyedropper.png"
import { lerp } from "three/src/math/MathUtils.js";
import { getPartFromCoords } from "./layers/texture_utils.js";
const CURSOR_EYEDROPPER = `url("${imgEyedropper}") 0 31, crosshair`;
const POINTER_MOVEMENT_THRESHOLD = 16;

class Controls {
  constructor(editor) {
    this.editor = editor;
    this.raycaster = new THREE.Raycaster();
    this.camera = this.editor.camera;
    this.orbit = this._setupOrbit(this.camera, editor);
    this._setupEvents(editor);
    this.resetVariables();
  }

  ctrlKey = false;
  shiftKey = false;
  
  resetVariables() {
    this.pointer = new THREE.Vector2(100000, 100000);
    this.lastPointer = new THREE.Vector2(100000, 100000);
    this.pointerDown = false;
    this.pointerDownAt = new THREE.Vector2(0, 0);
    this.tempPointer = new THREE.Vector2(0, 0);
    this.pointerEvent = undefined;
    this.panning = false;
    this.firstClickOutside = false;
    this.drawing = false;
    this.failedCheck = false;
    this.drawOnPointerUp = false;
    this.keybindEyedropper = false;
    this.variant = this.editor.getVariant();
    this.part = "none";
    this.lastPart = "none";

    this.orbit.enabled = true;
    this.orbit.enableRotate = true;
  }

  handleIntersects(pointer, draw = true) {
    if (!this.shouldRaycast()) {
      this.targetingModel = false;
      return;
    }

    const intersects = this.raycast(pointer);

    function isValidIntersect(part) {
      if (part.object.type != "Mesh") { return false; }
      if (!part.object.visible) { return false; }
      if (!part.object.userData?.part?.isPart) { return false; }

      return true;
    }

    if (intersects.length > 0) {
      this.targetingModel = false;

      const parts = intersects.filter(part => isValidIntersect(part));

      if (parts.length > 0) {
        this.targetingModel = true;

        if (draw && this.pointerDown && !this.firstClickOutside) {
          this.toolAction(parts, this.pointerEvent);
        }
      }
    } else {
      this.targetingModel = false;
    }
  }

  raycast(pointer) {
    const raycaster = this.raycaster;
    raycaster.layers.mask = this.editor.camera.layers.mask;

    raycaster.setFromCamera(pointer, this.editor.camera);

    return raycaster.intersectObjects(this.editor.scene.children);
  }

  toolAction(parts, event) {
    const editor = this.editor;

    if (this.failedCheck) return;

    if (!this.drawing) {
      if (!editor.toolCheck(parts, event)) {
        this.failedCheck = true;
        return;
      }
      
      editor.toolDown(parts, event);
      this.drawing = true;
    } else {
      editor.toolMove(parts, event);
    }
  }

  onPointerDown(event) {
    if (event.pointerType === "touch") {
      this.onTouchDown(event);
    } else {
      this.onMouseDown(event);
    }
  }
  
  onTouchDown(event) {
    if (!this.pointerDown) {
      this.setInitialPointer(event.offsetX, event.offsetY);
    } else if (!this.drawing) {
      this.firstClickOutside = true;
      this.drawOnPointerUp = false;
    }
    
    this.pointerEvent = event;
    this.pointerDown = true;
    this.handleIntersects(this.pointer, false);
    
    if (this.targetingModel) {
      this.orbit.enableRotate = false;
      this.drawOnPointerUp = true;
    } else {
      this.firstClickOutside = true;
    }
  }

  onMouseDown(event) {
    this.setPointer(event.offsetX, event.offsetY);
    this.pointerEvent = event;

    switch (event.buttons) {
      case 1:
      case 2: {
        this.pointerDown = true;
        if (this.targetingModel) {
          this.orbit.enabled = false;
        } else {
          this.firstClickOutside = true;
        }
        break;
      }
      case 4: {
        this.panning = true;
        break;
      }
    }
    this.handleIntersects(this.pointer);
  }

  onPointerMove(event) {
    if (event.pointerType === "touch") {
      this.onTouchMove(event);
    } else {
      this.onMouseMove(event);
    }
  }

  onMouseMove(event) {
    this.setPointer(event.offsetX, event.offsetY);
    this.pointerEvent = event;
    requestAnimationFrame(() => {
      this.smootherHandleIntersects(24);
    });
  }

  onTouchMove(event) {
    this.setPointer(event.offsetX, event.offsetY);
    this.pointerEvent = event;

    if (this.firstClickOutside) return;
    if (this.drawing) return this.smootherHandleIntersects(48);
    
    const threshold = POINTER_MOVEMENT_THRESHOLD / this.camera.position.z;
    this.tempPointer.set(event.offsetX, event.offsetY);
    const distance = this.pointerDownAt.distanceTo(this.tempPointer);

    if (distance < threshold) { return; }

    this.orbit.enabled = false;
    this.drawOnPointerUp = false;

    this.smootherHandleIntersects(32);
  }

  smootherHandleIntersects(smoothness) {
    this.handleIntersects(this.pointer);
    this.variant = this.editor.getVariant();
    this.part = getPartFromCoords(this.variant, this.editor.currentTool.cursor);

    if (this.part!==this.lastPart) {
      const linePoints = Math.min(Math.ceil(2+(smoothness*this.vectorDelta(this.lastPointer,this.pointer))), smoothness);

      for(let i = 0; i<linePoints; i++){
        this.handleIntersects(this.lerpVector(this.lastPointer,this.pointer,(1/linePoints)*i));
      }
    }
    this.lastPart = this.part;
  }

  onPointerUp() {
    if (this.drawOnPointerUp) {
      this.handleIntersects(this.pointer);
    }
    
    if (!this.failedCheck && (this.drawing || this.drawOnPointerUp)) {
      this.editor.toolUp();
    }

    this.resetVariables();
  }

  onKeyDown(event) {
    const element = event.originalTarget || getFocusedElement();
    if (isKeybindIgnored(element)) { return; }

    this.ctrlKey = event.ctrlKey;
    this.shiftKey = event.shiftKey;

    if ((event.key === "Control" || event.key === "Alt") && !event.repeat) {
      this.editor.config.set("pick-color", true);
      this.keybindEyedropper = true;
    }
  }

  onKeyUp(event) {
    if (event.key === "Control" || event.key === "Alt") {
      event.preventDefault();
      this.editor.config.set("pick-color", false);
      this.keybindEyedropper = false;
    }

    if (event.key === "Control" && this.ctrlKey) {
      this.ctrlKey = false;
    }

    if (event.key === "Shift" && this.shiftKey) {
      this.shiftKey = false;
    }
  }

  setInitialPointer(x, y) {
    this.pointerDownAt = new THREE.Vector2(x, y);
    this.setPointer(x, y);
  }

  setPointer(x, y) {
    const domElement = this.editor.renderer.canvas();
    this.lastPointer.x = this.pointer.x;
    this.lastPointer.y = this.pointer.y;
    (this.pointer.x = (x / domElement.clientWidth) * 2 - 1), (this.pointer.y = -(y / domElement.clientHeight) * 2 + 1);
  }


  getCursorStyle() {
    if (this.panning) {
      return "all-scroll";
    }

    if ((this.targetingModel || this.pointerDown) && !this.firstClickOutside) {
      if (this.editor.config.get("pick-color", false)) {
        return CURSOR_EYEDROPPER;
      }

      return this.editor.toolCursor();
    }

    if (this.ctrlKey || this.shiftKey) {
      return "all-scroll";
    }

    if (this.pointerDown) {
      return "grabbing";
    }
    
    return "grab";
  }

  shouldRaycast() {
    if (this.editor.config.get("pick-color", false)) return true;

    return this.editor.currentTool.properties.id !== "move";
  }

  _checkEyedropper(event) {
    if (!this.keybindEyedropper) { return; };
    if (event.ctrlKey || event.altKey) { return; }

    this.editor.config.set("pick-color", false);
    this.keybindEyedropper = false;
  }

  _setupOrbit(camera, editor) {
    const orbit = new OrbitControls(camera, editor);
    orbit.minDistance = 1;
    orbit.maxDistance = 15;
    orbit.panSpeed = 0.75;
    orbit.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: undefined };

    return orbit;
  }

  _setupEvents(editor) {
    editor.addEventListener("pointerdown", this.onPointerDown.bind(this));
    editor.addEventListener("pointermove", this.onPointerMove.bind(this));
    editor.addEventListener("pointerup", this.onPointerUp.bind(this));

    editor.addEventListener("contextmenu", event => {
      if (!this.targetingModel) { return; }

      event.preventDefault();
    })

    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));

    document.addEventListener("blur", event => {
      this._checkEyedropper(event);
    })
  }

  lerpVector(a, b, t) {
    return {x:lerp(a.x,b.x,t), y:lerp(a.y,b.y,t)};
  }
  
  vectorDelta(a,b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
  }
}

export { Controls, CURSOR_EYEDROPPER };
