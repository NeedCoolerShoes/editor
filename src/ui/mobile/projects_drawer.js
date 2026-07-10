import { css } from "lit";
import MobileDrawer from "./components/drawer";
import QuickSearch from "../config/tabs/import/quick_search";
import ProjectTabBar from "../projects/project_tab_bar";

const PROJECTS_DRAWER_STYLES = css`
  #projects-drawer {
    --drawer-height: 31rem;
  }

  ncrs-ui-project-tab-bar {
    display: block;
    height: 100%;
  }
`;

class ProjectsDrawer {
  constructor(ui) {
    this.ui = ui;
    this.editor = this.ui.editor;

    this.drawer = this._setupMobileDrawer();
  }
  _firstLoad = false;

  firstUpdated() {}

  render() {
    return this.drawer;
  }

  show() {
    this.drawer.show();
  }

  _setupMobileDrawer() {
    const drawer = new MobileDrawer();
    drawer.id = "projects-drawer";

    const tabs = new ProjectTabBar(this.editor, true);
    drawer.appendChild(tabs);

    return drawer;
  }
}

export {ProjectsDrawer, PROJECTS_DRAWER_STYLES};