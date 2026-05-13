import { css, html, LitElement } from "lit";
import imgArrowLeft from "../../../assets/images/icons/misc/arrow-left.svg";
import imgArrowRight from "../../../assets/images/icons/misc/arrow-right.svg";
import imgIconAdd from "../../../assets/images/icons/misc/add.svg";
import imgIconBackfaceCulling from "../../../assets/images/icons/toggles/backface-culling.svg";
import imgIconBase from "../../../assets/images/icons/toggles/base.svg";
import imgIconBaseGrid from "../../../assets/images/icons/toggles/base-grid.svg";
import imgIconBlend from "../../../assets/images/icons/modifiers/blend.svg";
import imgIconBlowUpModel from "../../../assets/images/icons/toggles/blow-up-model.svg";
import imgIconBoxChecked from "../../../assets/images/icons/box-checked.svg";
import imgIconBoxHalfChecked from "../../../assets/images/icons/box-half-checked.svg";
import imgIconBoxInnerChecked from "../../../assets/images/icons/box-inner-checked.svg";
import imgIconBoxOuterChecked from "../../../assets/images/icons/box-outer-checked.svg";
import imgIconBoxUnchecked from "../../../assets/images/icons/box-unchecked.svg";
import imgIconBrush from "../../../assets/images/icons/tools/brush.svg";
import imgIconBucket from "../../../assets/images/icons/tools/bucket.svg";
import imgIconCamo from "../../../assets/images/icons/modifiers/camo.svg";
import imgIconCgol from "../../../assets/images/icons/cgol.svg";
import imgIconCircle from "../../../assets/images/icons/modifiers/circle.svg";
import imgIconClone from "../../../assets/images/icons/misc/clone.svg";
import imgIconCog from "../../../assets/images/icons/misc/cog.svg";
import imgIconCopy from "../../../assets/images/icons/misc/copy.svg";
import imgIconDarkMode from "../../../assets/images/icons/misc/dark-mode.svg";
import imgIconDownload from "../../../assets/images/icons/download.svg";
import imgIconDuskMode from "../../../assets/images/icons/misc/dusk-mode.svg";
import imgIconEraseBase from "../../../assets/images/icons/layer/erase-base.svg";
import imgIconEraseOverlay from "../../../assets/images/icons/layer/erase-overlay.svg";
import imgIconEraser from "../../../assets/images/icons/tools/eraser.svg";
import imgIconEyeClosed from "../../../assets/images/icons/toggles/eye-closed.svg";
import imgIconEyedropper from "../../../assets/images/icons/tools/eyedropper.svg";
import imgIconEyeOpen from "../../../assets/images/icons/toggles/eye-open.svg";
import imgIconFillCubeConnected from "../../../assets/images/icons/modifiers/fill-cube-connected.svg";
import imgIconFillCubeReplace from "../../../assets/images/icons/modifiers/fill-cube-replace.svg";
import imgIconFillFaceConnected from "../../../assets/images/icons/modifiers/fill-face-connected.svg";
import imgIconFillFaceReplace from "../../../assets/images/icons/modifiers/fill-face-replace.svg";
import imgIconFlattenOverlayBase from "../../../assets/images/icons/layer/flatten.svg";
import imgIconFlipFrontBack from "../../../assets/images/icons/layer/flip-front-back.svg";
import imgIconFlipLeftRight from "../../../assets/images/icons/layer/flip-left-right.svg";
import imgIconForce1 from "../../../assets/images/icons/modifiers/force-1.svg";
import imgIconForce2 from "../../../assets/images/icons/modifiers/force-2.svg";
import imgIconForce3 from "../../../assets/images/icons/modifiers/force-3.svg";
import imgIconForce4 from "../../../assets/images/icons/modifiers/force-4.svg";
import imgIconForce5 from "../../../assets/images/icons/modifiers/force-5.svg";
import imgIconFullscreen from "../../../assets/images/icons/misc/fullscreen.svg";
import imgIconGridCull from "../../../assets/images/icons/toggles/grid-cull.svg";
import imgIconJitter from "../../../assets/images/icons/jitter.svg";
import imgIconLighten from "../../../assets/images/icons/modifiers/lighten.svg";
import imgIconLightMode from "../../../assets/images/icons/misc/light-mode.svg";
import imgIconMenu from "../../../assets/images/icons/misc/menu.svg";
import imgIconMerge from "../../../assets/images/icons/misc/merge.svg";
import imgIconMinimize from "../../../assets/images/icons/misc/minimize.svg";
import imgIconMirror from "../../../assets/images/icons/modifiers/mirror.svg";
import imgIconMove from "../../../assets/images/icons/tools/move.svg";
import imgIconMoveLayer from "../../../assets/images/icons/misc/move-layer.svg";
import imgIconOverlay from "../../../assets/images/icons/toggles/overlay.svg";
import imgIconOverlayGrid from "../../../assets/images/icons/toggles/overlay-grid.svg";
import imgIconPaste from "../../../assets/images/icons/misc/paste.svg";
import imgIconRedo from "../../../assets/images/icons/misc/redo.svg";
import imgIconRemove from "../../../assets/images/icons/misc/remove.svg";
import imgIconReplaceColor from "../../../assets/images/icons/modifiers/replace-color.svg";
import imgIconSaturate from "../../../assets/images/icons/modifiers/saturate.svg";
import imgIconSculpt from "../../../assets/images/icons/tools/sculpt.svg";
import imgIconSearch from "../../../assets/images/icons/misc/search.svg";
import imgIconShade from "../../../assets/images/icons/toggles/shade.svg";
import imgIconShadeOnce from "../../../assets/images/icons/modifiers/shade-once.svg";
import imgIconShading from "../../../assets/images/icons/tools/shading.svg";
import imgIconSize1 from "../../../assets/images/icons/modifiers/size-1.svg";
import imgIconSize2 from "../../../assets/images/icons/modifiers/size-2.svg";
import imgIconSize3 from "../../../assets/images/icons/modifiers/size-3.svg";
import imgIconSquare from "../../../assets/images/icons/modifiers/square.svg";
import imgIconSwapBodyOverlay from "../../../assets/images/icons/layer/swap-body-overlay.svg";
import imgIconUndo from "../../../assets/images/icons/misc/undo.svg";
import imgIconShadeLighten from "../../../assets/images/icons/modifiers/shade-lighten.svg";
import imgIconMinus from "../../../assets/images/icons/misc/minus.svg";
import imgIconCross from "../../../assets/images/icons/misc/cross.svg";
import imgToolConfig from "../../../assets/images/icons/misc/tool-config.svg";
import imgIconArrowUp from "../../../assets/images/icons/misc/arrow-up.svg";
import imgIconArrowDown from "../../../assets/images/icons/misc/arrow-down.svg";
import imgIconInvisible from "../../../assets/images/icons/misc/invisible.svg";
import imgIconGlobe from "../../../assets/images/icons/modifiers/globe.svg";

const ICON_MAP = {
  "add": imgIconAdd,
  "arrow-left": imgArrowLeft,
  "arrow-right": imgArrowRight,
  "backface-culling": imgIconBackfaceCulling,
  "base-grid": imgIconBaseGrid,
  "base": imgIconBase,
  "blend": imgIconBlend,
  "blow-up-model": imgIconBlowUpModel,
  "box-checked": imgIconBoxChecked,
  "box-half-checked": imgIconBoxHalfChecked,
  "box-inner-checked": imgIconBoxInnerChecked,
  "box-outer-checked": imgIconBoxOuterChecked,
  "box-unchecked": imgIconBoxUnchecked,
  "brush": imgIconBrush,
  "bucket": imgIconBucket,
  "camo": imgIconCamo,
  "cgol": imgIconCgol,
  "circle": imgIconCircle,
  "clone": imgIconClone,
  "cog": imgIconCog,
  "copy": imgIconCopy,
  "dark-mode": imgIconDarkMode,
  "download": imgIconDownload,
  "dusk-mode": imgIconDuskMode,
  "erase-base": imgIconEraseBase,
  "erase-overlay": imgIconEraseOverlay,
  "eraser": imgIconEraser,
  "eye-closed": imgIconEyeClosed,
  "eye-open": imgIconEyeOpen,
  "eyedropper": imgIconEyedropper,
  "fill-cube-connected": imgIconFillCubeConnected,
  "fill-cube-replace": imgIconFillCubeReplace,
  "fill-face-connected": imgIconFillFaceConnected,
  "fill-face-replace": imgIconFillFaceReplace,
  "flatten-overlay-base": imgIconFlattenOverlayBase,
  "flip-front-back": imgIconFlipFrontBack,
  "flip-left-right": imgIconFlipLeftRight,
  "force-1": imgIconForce1,
  "force-2": imgIconForce2,
  "force-3": imgIconForce3,
  "force-4": imgIconForce4,
  "force-5": imgIconForce5,
  "fullscreen": imgIconFullscreen,
  "grid-culling": imgIconGridCull,
  "jitter": imgIconJitter,
  "light-mode": imgIconLightMode,
  "lighten": imgIconLighten,
  "menu": imgIconMenu,
  "merge": imgIconMerge,
  "minimize": imgIconMinimize,
  "mirror": imgIconMirror,
  "move-layer": imgIconMoveLayer,
  "move": imgIconMove,
  "overlay-grid": imgIconOverlayGrid,
  "overlay": imgIconOverlay,
  "paste": imgIconPaste,
  "redo": imgIconRedo,
  "remove": imgIconRemove,
  "replace-color": imgIconReplaceColor,
  "saturate": imgIconSaturate,
  "sculpt": imgIconSculpt,
  "search": imgIconSearch,
  "shade-once": imgIconShadeOnce,
  "shade": imgIconShade,
  "shading": imgIconShading,
  "size-1": imgIconSize1,
  "size-2": imgIconSize2,
  "size-3": imgIconSize3,
  "square": imgIconSquare,
  "swap-body-overlay": imgIconSwapBodyOverlay,
  "undo": imgIconUndo,
  "shade-lighten": imgIconShadeLighten,
  "minus": imgIconMinus,
  "cross": imgIconCross,
  "tool-config": imgToolConfig,
  "arrow-up": imgIconArrowUp,
  "arrow-down": imgIconArrowDown,
  "invisible": imgIconInvisible,
  "globe": imgIconGlobe,
}

class Icon extends LitElement {
  constructor() {
    super();
  }

  static styles = css`
    :host {
      display: inline-block;
    }

    div {
      width: 100%;
      height: 100%;
      
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;

      /* Old webkit browsers */
      -webkit-mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position: center;
    }
  `;

  static properties = {
    icon: {},
    color: {},
  }

  render() {
    const div = document.createElement("div");
    div.style.maskImage = `url("${ICON_MAP[this.icon]}")`;
    div.style.backgroundColor = this.color;

    return div;
  }
}

customElements.define("ncrs-icon", Icon);

export {Icon, ICON_MAP};