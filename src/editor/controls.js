import * as THREE from "three";
import { OrbitControls } from "./orbit";

class Controls {
  constructor(parent) {
    this.parent = parent;
    this.raycaster = new THREE.Raycaster();
    this.orbit = this._setupOrbit(parent.camera, parent);
    this._setupEvents(parent);
  }

  pointer = new THREE.Vector2(100000, 100000);
  pointerDown = false;
  pointerButton = 0;
  panning = false;
  firstClickOutside = false;
  targetingModel = false;
  drawing = false;

  handleIntersects() {
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

        if (this.pointerDown && !this.firstClickOutside) {
          this.drawing
            ? this.parent.toolMove(parts, this.pointerButton)
            : this.parent.toolDown(parts, this.pointerButton);
          this.drawing = true;
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

  onMouseDown(event) {
    this.setPointer(event.offsetX, event.offsetY);
    switch (event.buttons) {
      case 1:
      case 2: {
        this.pointerDown = true;
        this.pointerButton = event.buttons;
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

  onMouseMove(event) {
    this.setPointer(event.offsetX, event.offsetY);
    this.handleIntersects();
  }

  onMouseUp() {
    if (this.drawing) {
      this.parent.toolUp();
    }

    this.drawing = false;
    this.pointerDown = false;
    this.panning = false;
    this.firstClickOutside = false;
    this.orbit.enabled = true;
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
      return "crosshair";
    }
    if (this.pointerDown) {
      return "grabbing";
    }
    return "grab";
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
    parent.addEventListener("mousedown", this.onMouseDown.bind(this));
    parent.addEventListener("mousemove", this.onMouseMove.bind(this));
    parent.addEventListener("mouseup", this.onMouseUp.bind(this));
  }
}

export { Controls };
