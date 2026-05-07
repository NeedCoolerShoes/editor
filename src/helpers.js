import Color from "color";
import { v4 as uuidv4 } from "uuid";

const isIOS = navigator.platform.match(/iPad|iPhone|iPod/i) != null ? true : false;

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

// https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array
function pickFromArray(array) {
  return array[~~(Math.random() * array.length)];
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function genUUID() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  } else {
    return uuidv4();
  }
}

function getFocusedElement() {
  let element = document.activeElement;

  while (true) {
    if (!element.shadowRoot) { break; }
    if (!element.shadowRoot.activeElement) { break; }
    element = element.shadowRoot.activeElement;
  }

  return element;
}

function isKeybindIgnored(element) {
  const ignoredElements = ["TEXTAREA", "INPUT", "SELECT"];
  
  return ignoredElements.includes(element.nodeName) || element.isContentEditable;
}

function download(filename, url) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  link.remove();
}

function nonPolyfilledCtx(ctx) {
  if (!ctx.__withoutSideEffects) { return ctx; }

  return ctx.__withoutSideEffects;
}

export {clamp, camelize, colorToObject, objectToColor, getRandomInt, pickFromArray, getFocusedElement, download, isKeybindIgnored, genUUID, nonPolyfilledCtx, isIOS};