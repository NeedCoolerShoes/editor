import * as THREE from "three";
import { OrbitControls } from "./orbit.js";
import { getFocusedElement, isKeybindIgnored } from "../helpers.js";

import imgEyedropper from "../../assets/images/cursors/eyedropper.png"
const CURSOR_EYEDROPPER = `url("${imgEyedropper}") 0 32, crosshair`;
const POINTER_MOVEMENT_THRESHOLD = 16;

class Controls {
  constructor(parent) {
    this.parent = parent;
    this.raycaster = new THREE.Raycaster();
    this.camera = this.parent.camera;
    this.orbit = this._setupOrbit(this.camera, parent);
    this._setupEvents(parent);
    this.resetVariables();
  }

  ctrlKey = false;
  shiftKey = false;
  
  resetVariables() {
    this.pointer = new THREE.Vector2(100000, 100000);
    this.pointerDown = false;
    this.pointerDownAt = new THREE.Vector2(0, 0);
    this.pointerEvent = undefined;
    this.panning = false;
    this.firstClickOutside = false;
    this.drawing = false;
    this.failedCheck = false;
    this.drawOnPointerUp = false;
    this.keybindEyedropper = false;

    this.orbit.enabled = true;
    this.orbit.enableRotate = true;
  }

  handleIntersects(draw = true) {
    if (!this.shouldRaycast()) {
      this.targetingModel = false;
      return;
    }

    const intersects = this.raycast();

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

  raycast() {
    const raycaster = this.raycaster;
    raycaster.layers.mask = this.parent.camera.layers.mask;

    raycaster.setFromCamera(this.pointer, this.parent.camera);

    return raycaster.intersectObjects(this.parent.scene.children);
  }

  toolAction(parts, event) {
    const parent = this.parent;

    if (this.failedCheck) return;

    if (!this.drawing) {
      if (!parent.toolCheck(parts, event)) {
        this.failedCheck = true;
        return;
      }
      
      parent.toolDown(parts, event);
      this.drawing = true;
    } else {
      parent.toolMove(parts, event);
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
    this.handleIntersects(false);
    
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
    this.handleIntersects();
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
    this.handleIntersects();
  }

  onTouchMove(event) {
    this.setPointer(event.offsetX, event.offsetY);
    this.pointerEvent = event;

    if (this.firstClickOutside) return;
    if (this.drawing) return this.handleIntersects();
    
    const threshold = POINTER_MOVEMENT_THRESHOLD / this.camera.position.z;
    const distance = this.pointerDownAt.distanceTo(new THREE.Vector2(event.offsetX, event.offsetY));

    if (distance < threshold) { return; }

    this.orbit.enabled = false;
    this.drawOnPointerUp = false;

    this.handleIntersects();
  }

  onPointerUp() {
    if (this.drawOnPointerUp) {
      this.handleIntersects();
    }
    
    if (this.drawing || this.drawOnPointerUp) {
      this.parent.toolUp();
    }

    this.resetVariables();
  }

  onKeyDown(event) {
    const element = event.originalTarget || getFocusedElement();
    if (isKeybindIgnored(element)) { return; }

    this.ctrlKey = event.ctrlKey;
    this.shiftKey = event.shiftKey;

    if (event.key === "Control" || event.key === "Alt" && !event.repeat) {
      this.parent.config.set("pick-color", true);
      this.keybindEyedropper = true;
    }
  }

  onKeyUp(event) {
    if (event.key === "Control" || event.key === "Alt") {
      event.preventDefault();
      this.parent.config.set("pick-color", false);
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
    const domElement = this.parent.renderer.canvas();
    (this.pointer.x = (x / domElement.clientWidth) * 2 - 1), (this.pointer.y = -(y / domElement.clientHeight) * 2 + 1);
  }


  getCursorStyle() {
    if (this.panning) {
      return "all-scroll";
    }

    if ((this.targetingModel || this.pointerDown) && !this.firstClickOutside) {
      if (this.parent.config.get("pick-color", false)) {
        return CURSOR_EYEDROPPER;
      }

      return this.parent.toolCursor();
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
    if (this.parent.config.get("pick-color", false)) return true;

    return this.parent.currentTool.properties.id !== "move";
  }

  _checkEyedropper(event) {
    if (!this.keybindEyedropper) { return; };
    if (event.ctrlKey || event.altKey) { return; }

    this.parent.config.set("pick-color", false);
    this.keybindEyedropper = false;
  }

  _setupOrbit(camera, parent) {
    const orbit = new OrbitControls(camera, parent);
    orbit.minDistance = 1;
    orbit.maxDistance = 15;
    orbit.panSpeed = 0.75;
    orbit.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: undefined };

    return orbit;
  }

  _setupEvents(parent) {
    parent.addEventListener("pointerdown", this.onPointerDown.bind(this));
    parent.addEventListener("pointermove", this.onPointerMove.bind(this));
    parent.addEventListener("pointerup", this.onPointerUp.bind(this));

    parent.addEventListener("contextmenu", event => {
      if (!this.targetingModel) { return; }

      event.preventDefault();
    })

    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));

    document.addEventListener("mousemove", event => {
      this._checkEyedropper(event);
    })
  }
}

export { Controls, CURSOR_EYEDROPPER };
