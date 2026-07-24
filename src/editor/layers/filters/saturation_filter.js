import CssFilter from "./css_filter";

// Saturation Filter
// Value - number from 0+, representing a percentage

class SaturationFilter extends CssFilter {
  static filterId = "ncrs:saturation";

  static deserialize(data) {
    if (data.id != this.filterId) { throw "Cannot deserialize filter!"; }

    return new SaturationFilter(data.value, data.properties);
  }

  constructor(value, properties = {}) {
    super(`saturate(${value}%)`, properties);
    this.value = value;
  }

  serialize() {
    return {
      id: SaturationFilter.filterId,
      value: this.value,
      properties: this.properties,
    };
  }
}

export default SaturationFilter;