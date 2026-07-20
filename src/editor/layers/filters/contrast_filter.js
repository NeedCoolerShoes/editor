import CssFilter from "./css_filter";

// Contrast Filter
// Value - number from 0+, representing a percentage

class ContrastFilter extends CssFilter {
  static filterId = "ncrs:contrast";

  static deserialize(data) {
    if (data.id != this.filterId) { throw "Cannot deserialize filter!"; }

    return new ContrastFilter(data.value, data.properties);
  }

  constructor(value, properties = {}) {
    super(`contrast(${value}%)`, properties);
    this.value = value;
  }

  serialize() {
    return {
      id: ContrastFilter.filterId,
      value: this.value,
      properties: this.properties,
    };
  }
}

export default ContrastFilter;
