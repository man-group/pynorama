import { makeActions, makeGetters } from "common/redux_ext";
import _ from "lodash";

const VIEWERS_SCOPE = "viewers";
const PANELS_SCOPE = "panels";

const DEFAULT_VERSIONS = [];

export const DATA_TABLE_PANEL_ID = "_DATA_TABLE";
export const PIPELINE_PANEL_ID = "_PIPELINE";
export const SESSIONS_PANEL_ID = "_SESSIONS_PANEL";

const DEFAULT_VISIBLE_PANELS = [DATA_TABLE_PANEL_ID];

export const viewersGetters = makeGetters({
  documentKey(state) {
    return state.documentKey || null;
  },
  versions(state) {
    return state.versions || DEFAULT_VERSIONS;
  }
}).withScope(VIEWERS_SCOPE);

const isPanelVisible = makeGetters(function isPanelVisible(
  state,
  { panel },
  get
) {
  return get(getters.visiblePanels).includes(panel);
});

export const panelsGetters = makeGetters({
  visiblePanels(state) {
    return state.visiblePanels || DEFAULT_VISIBLE_PANELS;
  },
  isPanelVisible,
  isDataTableVisible: isPanelVisible.withOptions({
    panel: DATA_TABLE_PANEL_ID
  }),
  isPipelineVisible: isPanelVisible.withOptions({
    panel: PIPELINE_PANEL_ID
  }),
  isSessionsPanelVisible: isPanelVisible.withOptions({
    panel: SESSIONS_PANEL_ID
  })
}).withScope(PANELS_SCOPE);

export const getters = {
  ...viewersGetters,
  ...panelsGetters,
  ...makeGetters({
    globalState(state) {
      return state;
    },
    isReloading(state) {
      return state.isReloading || false;
    }
  })
};

const closePanel = makeActions(function closePanel(state, { panel }, get) {
  return {
    ...state,
    visiblePanels: _.without(get(getters.visiblePanels), panel)
  };
});

const moveVersion = makeActions(function moveVersion(
  state,
  { version: versionName, offset },
  get
) {
  let versions = get(getters.versions);
  let index = -1;
  let version = null;
  for (let i = 0; i < versions.length; ++i) {
    if (versions[i].name == versionName) {
      index = i;
      version = versions[i];
      break;
    }
  }
  if (index > -1) {
    let newIndex = (index + offset) % versions.length;
    if (newIndex < 0) {
      newIndex += versions.length;
    }
    versions = versions.slice();
    versions.splice(index, 1);
    versions.splice(newIndex, 0, version);
    return { ...state, versions };
  } else {
    return state;
  }
});

const viewersActions = makeActions({
  setDocument(state, { documentKey }) {
    return { ...state, documentKey };
  },
  setVersions(state, { versions }) {
    return { ...state, versions };
  },
  addVersion(state, { version }, get) {
    return { ...state, versions: [...get(getters.versions), version] };
  },
  closeVersion(state, { version }, get) {
    let versions = get(getters.versions);
    versions = versions.filter(v => v.name != version);
    return { ...state, versions: versions };
  },
  moveVersionLeft: moveVersion.withOptions({ offset: -1 }),
  moveVersionRight: moveVersion.withOptions({ offset: 1 })
}).withScope(VIEWERS_SCOPE);

const panelsActions = makeActions({
  setVisiblePanels(state, { visiblePanels }) {
    return { ...state, visiblePanels };
  },
  closeDataTable: closePanel.withOptions({
    panel: DATA_TABLE_PANEL_ID
  }),
  closePipeline: closePanel.withOptions({
    panel: PIPELINE_PANEL_ID
  }),
  closeSessionsPanel: closePanel.withOptions({
    panel: SESSIONS_PANEL_ID
  })
}).withScope(PANELS_SCOPE);

export const actions = {
  ...makeActions({
    setIsReloading(state, { value }) {
      return { ...state, isReloading: value };
    },
    setGlobalState(currState, { state }) {
      return { ...state, isReloading: false };
    }
  }),
  ...panelsActions,
  ...viewersActions
};
