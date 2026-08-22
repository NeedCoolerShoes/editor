import ContrastFilter from "../../../../editor/layers/filters/contrast_filter.js";
import BaseFilterSlider from "./base_filter_slider.js";

class ContrastFilterSlider extends BaseFilterSlider {
  constructor(layers) {
    super(layers, {
      name: "ncrs:contrast_slider",
      default: 0.5,
    });

    this.slider.unclamped = true;
  }

  getFilterValue() {
    return this.getProgress() * 200;
  }

  getSliderValue(filter) {
    return filter.value / 200;
  }

  toFilter() {
    return new ContrastFilter(this.getFilterValue(), {name: this.name});
  }
}

export default ContrastFilterSlider;
