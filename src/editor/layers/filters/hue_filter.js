import CssFilter from "./css_filter";

// Hue Filter
// Value - number from 0 to 359

class HueFilter extends CssFilter {
  static filterId = "ncrs:hue";

  static deserialize(data) {
    if (data.id != this.filterId) { throw "Cannot deserialize filter!"; }

    return new HueFilter(data.value, data.properties);
  }

  constructor(value, properties = {}) {
    super(`hue-rotate(${(value+360)%360}deg)`, properties);
    this.value = value;
  }

  serialize() {
    return {
      id: HueFilter.filterId,
      value: this.value,
      properties: this.properties,
    };
  }
}

export default HueFilter;