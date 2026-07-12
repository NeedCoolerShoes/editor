import * as THREE from "three";

class Renderer {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this._setupRenderer();
  }

  renderer;

  canvas() {
    return this.renderer.domElement;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  updateSize(width, height) {
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  setAnimationLoop(fn) {
    this.renderer.setAnimationLoop(fn);
  }

  _setupRenderer() {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.domElement.style.position = "absolute";

    this.renderer = renderer;
  }
}

export { Renderer };
