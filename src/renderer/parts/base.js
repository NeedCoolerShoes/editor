import * as THREE from "three"
import { IMAGE_WIDTH, IMAGE_HEIGHT } from "../main"

const FACES = {
  front: 4,
  back: 5,
  left: 1,
  right: 0,
  bottom: 3,
  top: 2,
}

function coordsToUVs(p0, p1, p2, p3, width, height) {
  //p0 p1
  //p2 p3
  var result = [];
  var p;
  p = {x: p0.x/width,y: 1-p0.y/height};
  result.push(p);

  p = {x: p1.x/width,y: 1-p1.y/height};
  result.push(p);

  p = {x: p2.x/width,y: 1-p2.y/height};
  result.push(p);

  p = {x: p3.x/width,y: 1-p3.y/height};
  result.push(p);

  return result;
}

function squareToUVs(x0, y0, sw, sh, my = false){
  let x1 = x0 + sw;
  let y1 = y0 + sh;
  if(my){
      let aux = y1;
      y1 = y0;
      y0 = aux;
  }
  // apperantely this is how three js stores uvs for each cube face
  // 0, 1
  // 1, 1
  // 0, 0
  // 1, 0
  return coordsToUVs({x:x0, y:y0}, {x:x1, y:y0}, {x:x0, y:y1}, {x:x1, y:y1}, IMAGE_WIDTH, IMAGE_HEIGHT);
}

function setFaceUVs(face, uvs, uvAttribute) {
  const faceNumber = FACES[face]
  const uv = squareToUVs(...uvs)

  uvAttribute.setXY(faceNumber * 4 + 0, uv[0].x, uv[0].y);
  uvAttribute.setXY(faceNumber * 4 + 1, uv[1].x, uv[1].y);
  uvAttribute.setXY(faceNumber * 4 + 2, uv[2].x, uv[2].y);
  uvAttribute.setXY(faceNumber * 4 + 3, uv[3].x, uv[3].y);
}

class BasePart {
  constructor(texture) {
    this.texture = texture
    this.baseMesh = this._setupMesh(this.uvmap().base)
    this.overlayMesh = this._setupMesh(this.uvmap().overlay, true)
  }

  uvmap() { return {} }
  size() { return {} }
  position() { return {} }

  _setupGeometry(uvmap, overlay = false) {
    const size = overlay ? this.size().overlay : this.size().base

    const geometry = new THREE.BoxGeometry(...size)
    const uv = geometry.attributes.uv

    // Base UVMAP
    for (let [face, map] of Object.entries(uvmap)) {
      setFaceUVs(face, map, uv)
    }
    
    return geometry
  }

  _setupMaterial() {
    return new THREE.MeshBasicMaterial( { map: this.texture, transparent: true } )
  }

  _setupMesh(uvmap, overlay = false) {
    const mesh = new THREE.Mesh( this._setupGeometry(uvmap, overlay), this._setupMaterial() )
    mesh.userData.part = this
    mesh.position.copy(this.position())

    return mesh;
  }
}

export {BasePart}