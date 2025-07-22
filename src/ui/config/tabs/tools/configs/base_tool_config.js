import { css, html, LitElement } from "lit";
import { camelize } from "../../../../../helpers";
import { OptionControl, OptionControlButton, ToggleControl } from "../../../controls";

class BaseToolConfig extends LitElement {
  static styles = css`
    #main {
      color: rgb(156 163 175);
      padding: 0.5rem;
    }

    h2 {
      text-align: center;
      font-size: small;
      font-weight: normal;
      margin-top: 0px;
    }

    .group {
      display: flex;
      gap: 0.5rem;
    }

    .group-sm {
      display: flex;
      gap: 0.25rem;
    }

    .title {
      padding: 0px;
      font-size: x-small;
      margin: 0px;
    }

    .description {
      font-size: small;
      margin: 0px;
      margin-top: 0.25rem;
    }
  `;

  constructor(config, properties) {
    super();
    this.config = config;
    this.properties = properties;

    this._setupMethods();
    this._setupCallbacks();
  }

  connectedCallback() {
    super.connectedCallback();

    Object.keys(this.properties).forEach(property => {
      this[property] = this.config.get(property);
    })
  }

  render() {
    return html`
      <div id="main">
        <h2>Base Tool</h2>
      </div>
    `;
  }

  _setupMethods() {
    Object.entries(this.properties).map(([property, options]) => {
      this._setupCallbackMethod(property, options);
      this._setupControlMethod(property, options);
    })
  }

  _setupCallbackMethod(property, options) {
    const name = camelize(`on ${property} ${options.type}`);
    this[`_${name}`] = function (event) {
      if (options.type === "toggle") {
        this.config.set(property, event.detail.toggle);
      } else if (options.number) {
        this.config.set(property, Number(event.detail.name));
      } else {
        this.config.set(property, event.detail.name);
      }
    }
  }

  _setupControlMethod(property, options) {
    const name = camelize(`${property} control`);
    this[`_${name}`] = function () {
      if (options.type === "toggle") {
        return this._setupToggleControl(property, options);
      } else if (options.type == "select") {
        return this._setupSelectControl(property, options);
      }
    }
  }

  _setupToggleControl(property, options) {
    const callbackName = camelize(`on ${property} ${options.type}`);
    const toggle = new ToggleControl();
    toggle.id = property;
    toggle.addEventListener("toggle", event => this[`_${callbackName}`](event));
    toggle.icon = options.icon;
    toggle.title = options.title;
    toggle.selected = this[property];

    return toggle;
  }

  _setupSelectControl(property, options) {
    const callbackName = camelize(`on ${property} ${options.type}`);
    const control = new OptionControl();
    control.id = property;
    control.addEventListener("select", event => this[`_${callbackName}`](event));
    control.selected = this[property];

    options.options.forEach(entry => {
      const button = new OptionControlButton();
      button.icon = entry.icon;
      button.name = entry.value;
      if (entry.title) {
        button.title = entry.title 
      } else {
        button.title = `Set ${property} to ${entry.value}`
      }

      control.appendChild(button);
    })

    return control;
  }

  _setupCallbacks() {
    Object.keys(this.properties).forEach(property => {
      this.config.addEventListener(`${property}-change`, event => {
        this[property] = event.detail;
      })
    });
  }
}

export default BaseToolConfig;
