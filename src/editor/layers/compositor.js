import BrightnessFilter from "./filters/brightness_filter.js";
import CssFilter from "./filters/css_filter.js";
import HueFilter from "./filters/hue_filter.js";
import OpacityFilter from "./filters/opacity_filter.js";
import SaturationFilter from "./filters/saturation_filter.js";
import ContrastFilter from "./filters/contrast_filter.js";

const FILTERS = [CssFilter, HueFilter, SaturationFilter, ContrastFilter, BrightnessFilter, OpacityFilter];

class Compositor extends EventTarget {
  constructor() {
    super();
    this._filterClasses = this._setupFilterClasses();
  }

  _filters = [];

  getFilters() {
    return this._filters;
  }

  applyFilters(filters) {
    this._filters = filters;
    this.dispatchEvent(new CustomEvent("update-filters", {detail: {filters: filters}}));
  }

  clearFilters() {
    this.applyFilters([]);
  }

  render(input) {
    let texture = input;
    this.getFilters().forEach(filter => {
      texture = filter.apply(texture);
    })

    return texture;
  }

  serializeFilters() {
    const output = [];
    this.getFilters().forEach(filter => {
      output.push(filter.serialize());
    })
    return output;
  }

  deserializeFilters(filters = []) {
    const newFilters = [];

    filters.forEach(filter => {
      const filterId = filter.id;
      const newFilter = this._filterClasses[filterId].deserialize(filter);

      newFilters.push(newFilter);
    });

    this.applyFilters(newFilters);
  }

  _setupFilterClasses() {
    const output = {};
    FILTERS.forEach(filter => {
      output[filter.filterId] = filter;
    })
    return output;
  }
}

export default Compositor;