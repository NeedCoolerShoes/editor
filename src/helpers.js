import Color from "color";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// https://stackoverflow.com/questions/2970525/converting-a-string-with-spaces-into-camel-case
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function colorToObject(color) {
  return {
    r: color.red(),
    g: color.green(),
    b: color.blue(),
    a: color.alpha() * 255,
  }
}

function objectToColor(object) {
  return new Color({
    r: object.r,
    g: object.g,
    b: object.b,
  }).alpha(object.a / 255);
}

export {clamp, camelize, colorToObject, objectToColor};