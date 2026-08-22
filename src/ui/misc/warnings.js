import { css, html, LitElement } from "lit";
import "../misc/icon.js";

class WarningManager extends LitElement {
  static properties = {
    _warnings: {state: true},
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      pointer-events: none;
      --icon-size: 1.25rem;
      --font-size: small;
    }

    .warning {
      display: flex;
      gap: 0.5rem;
      font-size: var(--font-size);
      color: var(--text-color, #aaaaaa);
    }

    ncrs-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: var(--icon-size);
      height: var(--icon-size);
      --icon-color: var(--text-color, #aaaaaa);
    }
  `;

  constructor() {
    super();

    this._warnings = this._warnings || {};
  }

  render() {
    const values = Object.values(this._warnings);

    if (values.length < 1) return html`<div></div>`;

    return Object.values(this._warnings).map(warning => this._renderWarning(warning));
  }

  add(id, icon, message) {
    this._warnings[id] = {icon, message};
    this.requestUpdate();
  }

  remove(id) {
    if (!this._warnings[id]) return;

    delete this._warnings[id];
    this.requestUpdate();
  }

  _renderWarning(warning) {
    return html`
      <div class="warning">
        <ncrs-icon icon="${warning.icon}" color="var(--icon-color)"></ncrs-icon>
        ${warning.message}
      </div>
    `;
  }
}

customElements.define("ncrs-warning-manager", WarningManager);
export default WarningManager;