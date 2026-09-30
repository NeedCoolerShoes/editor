import createPanZoom from "panzoom";
import { get, update } from "idb-keyval";
import Color from "color";
import Window from "../../../misc/window.js";
import { CURSOR_EYEDROPPER } from "../../../../editor/controls.js";
import { genUUID, nonPolyfilledCtx } from "../../../../helpers.js";

import imgGrid from "../../../../../assets/images/grid-reference-image-dark.png";

class ReferenceImage extends EventTarget {
  static deserialize(editor, data) {
    return new Promise((resolve, _) => {
      const img = new Image()
  
      img.onload = () => {
        const refImg = new ReferenceImage(editor, img, data.x, data.y, data.width, data.height, data.id);

        resolve(refImg);
      }

      img.src = data.image;
    });
  }

  constructor(editor, image, x, y, width, height, uuid = genUUID()) {
    super();

    this.editor = editor;
    this.uuid = uuid;
    
    this.window = this._createWindow(x, y, width, height);
    this.canvas = this._createCanvas(image);

    const div = document.createElement("div");
    div.id = "panzoom";
    div.appendChild(this.canvas);

    this.window.appendChild(div);
    
    this.panZoom = createPanZoom(this.canvas, {
      smoothScroll: false
    });
    
    this._setupEvents();
  }

  serialize() {
    return {
      id: this.uuid,
      x: this.xPos,
      y: this.yPos,
      width: this.width,
      height: this.height,
      image: this.canvas.toDataURL(),
    }
  }

  _createWindow(x, y, width, height) {
    const win = new Window();

    win.style.width = `${width}px`;
    win.style.height = `${height}px`;
    win.style.minWidth = "150px";
    win.style.minHeight = "150px";
    win.style.background = `url(${imgGrid}) #191919`;
  
    win.name = "Reference Image";
    win.setPosition(x, y);

    this.xPos = x;
    this.yPos = y;
    this.width = width;
    this.height = height;

    return win;
  }

  _createCanvas(image) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
  
    canvas.style.imageRendering = "pixelated";
  
    const ctx = nonPolyfilledCtx(canvas.getContext('2d'));
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0);
  
    return canvas;
  }

  _sendUpdateEvent() {
    this.dispatchEvent(new CustomEvent("update"));
  }

  _setupEvents() {
    const editor = this.editor;
    const canvas = this.canvas;
    const window = this.window;
    const panZoom = this.panZoom;

    canvas.addEventListener("click", event => {
      if (!editor.config.get("pick-color")) { return; }
  
      const ctx = nonPolyfilledCtx(canvas.getContext('2d'));
      const imgData = ctx.getImageData(event.offsetX, event.offsetY, 1, 1).data
      const color = new Color({r: imgData[0], g: imgData[1], b: imgData[2]}).alpha(imgData[3] / 255);
  
      if (editor.config.get("pick-color-toggle")) {
        editor.config.set("pick-color-toggle", false);
        editor.config.set("pick-color", false);
      }
  
      editor.toolConfig.set("color", color);
    });
  
    editor.config.addEventListener("pick-color-change", event => {
      canvas.style.cursor = event.detail ? CURSOR_EYEDROPPER : "default";
    });

    window.addEventListener("ready", () => {
      const windowRect = window.getInnerBounds();
  
      const offsetX = (windowRect.width / 2);
      const offsetY = (windowRect.height / 2);
      const offsetZoom = windowRect.height / canvas.height;
    
      panZoom.moveTo(
        -(canvas.width / 2) + offsetX,
        -(canvas.height / 2) + offsetY
      );
      panZoom.zoomAbs(offsetX, offsetY, offsetZoom);
    });

    window.addEventListener("size-change", event => {
      this.width = event.detail.width;
      this.height = event.detail.height;

      panZoom.pause();
      setTimeout(() => panZoom.resume(), 250);
    });

    window.addEventListener("resize", () => {
      this._sendUpdateEvent();
    })

    window.addEventListener("position-change", event => {
      this.xPos = event.detail.x;
      this.yPos = event.detail.y;
    });

    window.addEventListener("drag-end", () => {
      this._sendUpdateEvent();
    })
  }
}

class ReferenceImageManager {
  constructor(editor) {
    this.editor = editor;

    this._loadReferenceImages();
  }

  addImage(image) {
    const referenceImage = new ReferenceImage(this.editor, image, 20, 20, 320, 220);

    return this.add(referenceImage);
  }

  add(referenceImage) {
    if (document.getElementById(referenceImage.uuid)) {
      return;
    }

    referenceImage.addEventListener("update", () => {
      this._update(referenceImage);
    });

    referenceImage.window.addEventListener("close", () => {
      this._delete(referenceImage);
    });

    referenceImage.window.id = referenceImage.uuid;

    document.body.appendChild(referenceImage.window);

    return referenceImage;
  }

  _update(refImg) {
    const uuid = refImg.uuid;

    update("ncrs:reference-images", val => {
      const data = (val || {});
      data[uuid] = refImg.serialize();

      return data;
    });
  }

  _delete(refImg) {
    const uuid = refImg.uuid;

    update("ncrs:reference-images", val => {
      const data = (val || {});
      delete data[uuid];

      return data;
    });
  }

  _loadReferenceImages() {
    get("ncrs:reference-images").then(refImgs => {
      Object.values(refImgs || {}).forEach(data => {
        ReferenceImage.deserialize(this.editor, data).then(refImg => {
          this.add(refImg);
        });
      });
    });
  }
}

export default ReferenceImageManager;