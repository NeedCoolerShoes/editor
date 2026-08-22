import { nonPolyfilledCtx } from "../../helpers";

function passesColorAccuracyTest() {
  const canvas = new OffscreenCanvas(16, 16);

  const ctx = nonPolyfilledCtx(canvas.getContext("2d"));

  ctx.fillStyle = "#ff0000";
  ctx.fillRect(4, 4, 8, 8);

  const data = ctx.getImageData(0, 0, 16, 16).data

  const valid = [0, 255];

  for (let idx = 0; idx < data.length; idx++) {
    const byte = data[idx];

    if (!valid.includes(byte)) {
      return false;
    }
  }

  return true;
}

export default passesColorAccuracyTest;