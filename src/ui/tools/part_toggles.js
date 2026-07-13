import { css, html, LitElement, unsafeCSS } from "lit";
import { msg, str } from "@lit/localize";

import imgHeadEnabled from "../../../assets/images/skin_parts/head_enabled.png";
import imgHeadDisabled from "../../../assets/images/skin_parts/head_disabled.png";
import imgTorsoEnabled from "../../../assets/images/skin_parts/torso_enabled.png";
import imgTorsoDisabled from "../../../assets/images/skin_parts/torso_disabled.png";
import imgRightArmEnabled from "../../../assets/images/skin_parts/right_arm_enabled.png";
import imgRightArmDisabled from "../../../assets/images/skin_parts/right_arm_disabled.png";
import imgLeftArmEnabled from "../../../assets/images/skin_parts/left_arm_enabled.png";
import imgLeftArmDisabled from "../../../assets/images/skin_parts/left_arm_disabled.png";
import imgRightLegEnabled from "../../../assets/images/skin_parts/right_leg_enabled.png";
import imgRightLegDisabled from "../../../assets/images/skin_parts/right_leg_disabled.png";
import imgLeftLegEnabled from "../../../assets/images/skin_parts/left_leg_enabled.png";
import imgLeftLegDisabled from "../../../assets/images/skin_parts/left_leg_disabled.png";

class PartToggles extends LitElement {
  static styles = css`
    :host {
      display: block;
      --scale: 0.6;
      --gap: 0.25rem;
    }

    #parts {
      display: flex;
      flex-direction: column;
      align-items: center;
      image-rendering: pixelated;
      gap: var(--gap);
    }

    #parts > div {
      display: flex;
      justify-content: center;
      gap: var(--gap);
    }

    #parts ncrs-toggle {
      display: block;
      background-size: contain;
      background-repeat: no-repeat;
      outline: 1px solid white;
      background-image: var(--background-image-disabled);
    }

    #parts ncrs-toggle:focus {
      outline: 2px solid white;
    }

    #parts ncrs-toggle[toggled] {
      background-image: var(--background-image-enabled);
    }

    #parts ncrs-toggle::part(button) {
      width: 100%;
      height: 100%;
    }

    #toggle-head {
      width: calc(32px * var(--scale));
      height: calc(32px * var(--scale));
      --background-image-enabled: url(${unsafeCSS(imgHeadEnabled)});
      --background-image-disabled: url(${unsafeCSS(imgHeadDisabled)});
    }

    #toggle-rarm {
      width: calc(16px * var(--scale));
      height: calc(48px * var(--scale));
      --background-image-enabled: url(${unsafeCSS(imgRightArmEnabled)});
      --background-image-disabled: url(${unsafeCSS(imgRightArmDisabled)});
    }

    #toggle-torso {
      width: calc(32px * var(--scale));
      height: calc(48px * var(--scale));
      --background-image-enabled: url(${unsafeCSS(imgTorsoEnabled)});
      --background-image-disabled: url(${unsafeCSS(imgTorsoDisabled)});
    }

    #toggle-larm {
      width: calc(16px * var(--scale));
      height: calc(48px * var(--scale));
      --background-image-enabled: url(${unsafeCSS(imgLeftArmEnabled)});
      --background-image-disabled: url(${unsafeCSS(imgLeftArmDisabled)});
    }

    #toggle-rleg {
      width: calc(16px * var(--scale));
      height: calc(48px * var(--scale));
      --background-image-enabled: url(${unsafeCSS(imgRightLegEnabled)});
      --background-image-disabled: url(${unsafeCSS(imgRightLegDisabled)});
    }

    #toggle-lleg {
      width: calc(16px * var(--scale));
      height: calc(48px * var(--scale));
      --background-image-enabled: url(${unsafeCSS(imgLeftLegEnabled)});
      --background-image-disabled: url(${unsafeCSS(imgLeftLegDisabled)});
    }
  `

  constructor(editor) {
    super();
    
    this.editor = editor;
    this.isShift = false;

    this._setupEvents();
  }

  render() {
    const toggled = this.editor.config.get("partVisibility");
    const key = "Shift";

    return html`
      <div id="parts">
        <ncrs-toggle id="toggle-head" title="${msg(`Toggle head`, {id: `toolbar.part_toggle.head`})}\n${msg(str`${key} + click to toggle only head`, {id: `toolbar.part_toggle.head.description`})}" ?toggled=${toggled.head} @toggle=${this._toggleHeadPart}></ncrs-toggle>
        <div>
          <ncrs-toggle id="toggle-rarm" title="${msg(`Toggle right arm`, {id: `toolbar.part_toggle.right_arm`})}\n${msg(str`${key} + click to toggle only right arm`, {id: `toolbar.part_toggle.right_arm.description`})}" ?toggled=${toggled.arm_right} @toggle=${this._toggleRArmPart}></ncrs-toggle>
          <ncrs-toggle id="toggle-torso" title="${msg(`Toggle torso`, {id: `toolbar.part_toggle.torso`})}\n${msg(str`${key} + click to toggle only torso`, {id: `toolbar.part_toggle.torso.description`})}" ?toggled=${toggled.torso} @toggle=${this._toggleTorsoPart}></ncrs-toggle>
          <ncrs-toggle id="toggle-larm" title="${msg(`Toggle left arm`, {id: `toolbar.part_toggle.left_arm`})}\n${msg(str`${key} + click to toggle only left arm`, {id: `toolbar.part_toggle.left_arm.description`})}" ?toggled=${toggled.arm_left} @toggle=${this._toggleLArmPart}></ncrs-toggle>
        </div>
        <div>
          <ncrs-toggle id="toggle-rleg" title="${msg(`Toggle right leg`, {id: `toolbar.part_toggle.right_leg`})}\n${msg(str`${key} + click to toggle only right leg`, {id: `toolbar.part_toggle.right_leg.description`})}" ?toggled=${toggled.leg_right} @toggle=${this._toggleRLegPart}></ncrs-toggle>
          <ncrs-toggle id="toggle-lleg" title="${msg(`Toggle left leg`, {id: `toolbar.part_toggle.left_leg`})}\n${msg(str`${key} + click to toggle only left leg`, {id: `toolbar.part_toggle.left_leg.description`})}" ?toggled=${toggled.leg_left} @toggle=${this._toggleLLegPart}></ncrs-toggle>
        </div>
      </div>
    `
  }

  _toggleHeadPart(event) {
    if (this.isShift){
    this.toggleOnly("head");
    } else {
      this.editor.setPartVisible("head", event.detail);
    }
  }

  _toggleRArmPart(event) {
    if (this.isShift){
    this.toggleOnly("arm_right");
    } else {
      this.editor.setPartVisible("arm_right", event.detail);
    }
  }

  _toggleTorsoPart(event) {
    if (this.isShift){
    this.toggleOnly("torso");
    } else {
      this.editor.setPartVisible("torso", event.detail);
    }
  }

  _toggleLArmPart(event) {
    if (this.isShift){
    this.toggleOnly("arm_left");
    } else {
      this.editor.setPartVisible("arm_left", event.detail);
    }
  }

  _toggleRLegPart(event) {
    if (this.isShift){
    this.toggleOnly("leg_right");
    } else {
      this.editor.setPartVisible("leg_right", event.detail);
    }
  }

  _toggleLLegPart(event) {
    if (this.isShift){
      this.toggleOnly("leg_left");
    } else {
      this.editor.setPartVisible("leg_left", event.detail);
    }
  }

  toggleOnly(part) {
    const toggleHead = this.shadowRoot.getElementById("toggle-head");
    const toggleRArm = this.shadowRoot.getElementById("toggle-rarm");
    const toggleTorso = this.shadowRoot.getElementById("toggle-torso");
    const toggleLArm = this.shadowRoot.getElementById("toggle-larm");
    const toggleRLeg = this.shadowRoot.getElementById("toggle-rleg");
    const toggleLLeg = this.shadowRoot.getElementById("toggle-lleg");

    const partVisibility = this.editor.config.get("partVisibility", {});

    let isOnlyPart = this.defaultToTrue(partVisibility[part]);
    isOnlyPart = part != "head" ? isOnlyPart && !this.defaultToTrue(partVisibility["head"]) : isOnlyPart;
    isOnlyPart = part != "arm_right" ? isOnlyPart && !this.defaultToTrue(partVisibility["arm_right"]) : isOnlyPart;
    isOnlyPart = part != "torso" ? isOnlyPart && !this.defaultToTrue(partVisibility["torso"]) : isOnlyPart;
    isOnlyPart = part != "arm_left" ? isOnlyPart && !this.defaultToTrue(partVisibility["arm_left"]) : isOnlyPart;
    isOnlyPart = part != "leg_right" ? isOnlyPart && !this.defaultToTrue(partVisibility["leg_right"]) : isOnlyPart;
    isOnlyPart = part != "leg_left" ? isOnlyPart && !this.defaultToTrue(partVisibility["leg_left"]) : isOnlyPart;
    if (isOnlyPart) {
      this.editor.setPartVisible("head", true);
      this.editor.setPartVisible("arm_right", true);
      this.editor.setPartVisible("torso", true);
      this.editor.setPartVisible("arm_left", true);
      this.editor.setPartVisible("leg_right", true);
      this.editor.setPartVisible("leg_left", true);
      toggleHead.setAttribute("toggled", "");
      toggleRArm.setAttribute("toggled", "");
      toggleTorso.setAttribute("toggled", "");
      toggleLArm.setAttribute("toggled", "");
      toggleRLeg.setAttribute("toggled", "");
      toggleLLeg.setAttribute("toggled", "");

    } else {
      this.editor.setPartVisible("head", part == "head");
      this.editor.setPartVisible("arm_right", part == "arm_right");
      this.editor.setPartVisible("torso", part == "torso");
      this.editor.setPartVisible("arm_left", part == "arm_left");
      this.editor.setPartVisible("leg_right", part == "leg_right");
      this.editor.setPartVisible("leg_left", part == "leg_left");
      toggleHead.removeAttribute("toggled");
      toggleRArm.removeAttribute("toggled");
      toggleTorso.removeAttribute("toggled");
      toggleLArm.removeAttribute("toggled");
      toggleRLeg.removeAttribute("toggled");
      toggleLLeg.removeAttribute("toggled");
      if (part == "head") {toggleHead.setAttribute("toggled", "");}
      if (part == "arm_right") {toggleRArm.setAttribute("toggled", "");}
      if (part == "torso") {toggleTorso.setAttribute("toggled", "");}
      if (part == "arm_left") {toggleLArm.setAttribute("toggled", "");}
      if (part == "leg_right") {toggleRLeg.setAttribute("toggled", "");}
      if (part == "leg_left") {toggleLLeg.setAttribute("toggled", "");}
    }
  }

  defaultToTrue(value) {
    return value == null ? true : value;
  }

  _setupEvents() {
    document.addEventListener("keydown", event => {
      if (event.key == "Shift") {
        this.isShift = true;
      }
    });
    document.addEventListener("keyup", event => {
      if (event.key == "Shift") {
        this.isShift = false;
      }
    });
  }
}

customElements.define("ncrs-tools-part-toggles", PartToggles)

export default PartToggles;