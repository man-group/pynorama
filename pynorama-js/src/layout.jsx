import React from "react";
import { connect } from "common/redux_ext";
import {
  getters,
  actions,
  PIPELINE_PANEL_ID,
  DATA_TABLE_PANEL_ID,
  SESSIONS_PANEL_ID
} from "view_state";
import ToggleButton from "react-bootstrap/lib/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/lib/ToggleButtonGroup";
import { Glyphicon } from "react-bootstrap";
import { HorizontalStack, VerticalScrollArea } from "common/components";
import "css/layout.css";

import { ViewerPanel } from "viewer_panel";
import { DocTablePanel } from "doctable_panel";
import { PipelinePanel } from "pipeline_panel";
import { SessionsPanel } from "sessions_panel";

export const Workspace = () => {
  return (
    <HorizontalStack>
      <TaskColumn />
      <SessionsPanel />
      <DocTablePanel />
      <PipelinePanel />
      <ViewersArea />
      <div className="whitespacecolumn" />
    </HorizontalStack>
  );
};

export const ViewersArea = connect({
  versions: getters.versions
})(({ versions }) => {
  const viewers = versions.map(version => (
    <ViewerPanel
      key={version.name}
      version={version.name}
      viewer={version.viewer}
    />
  ));
  return (
    <VerticalScrollArea>
      <HorizontalStack>{viewers}</HorizontalStack>
    </VerticalScrollArea>
  );
});

const panels = [
  {
    id: SESSIONS_PANEL_ID,
    label: "Sessions",
    glyph: "glyphicon glyphicon-floppy-disk"
  },
  {
    id: DATA_TABLE_PANEL_ID,
    label: "Table",
    glyph: "glyphicon glyphicon-th-list"
  },
  {
    id: PIPELINE_PANEL_ID,
    label: "Pipeline",
    glyph: "glyphicon glyphicon-globe"
  }
];

const RELOADING_ID = "RELOADING";

function reload(setIsReloading) {
  setIsReloading(true);
  fetch("reload", { method: "POST" }).then(e => setIsReloading(false));
}

const TaskColumn = connect({
  visiblePanels: getters.visiblePanels,
  setVisiblePanels: actions.setVisiblePanels,
  setIsReloading: actions.setIsReloading.withMapping(value => ({ value })),
  isReloading: getters.isReloading
})(({ visiblePanels, setVisiblePanels, setIsReloading, isReloading }) => {
  const reloadSize = 10;

  // pretty dirty implementation.
  // Unfortunately ToggleButtonGroup doesn't use a flexbox
  const buttonStyle = { width: (100 - reloadSize) / panels.length + "%" };
  const refreshButtonStyle = {
    width: reloadSize + "%"
  };

  const renderedButtons = panels.map(panel => (
    <ToggleButton
      key={panel.id}
      style={buttonStyle}
      bsStyle="primary"
      value={panel.id}
    >
      {panel.label} <Glyphicon glyph={panel.glyph} />
    </ToggleButton>
  ));

  if (isReloading) {
    visiblePanels = [...visiblePanels, RELOADING_ID];
  }

  const onValuesChanged = vals => {
    if (vals.includes(RELOADING_ID)) {
      reload(setIsReloading);
      vals = _.without(vals, RELOADING_ID);
    }
    setVisiblePanels({ visiblePanels: vals });
  };

  return (
    <div className="taskcolumn">
      <div className="fixedcolumn">
        <div className="turnaround">
          <ToggleButtonGroup
            style={{ width: "100%" }}
            value={visiblePanels}
            onChange={onValuesChanged}
            name="columnBar"
            justified
            type="checkbox"
          >
            {renderedButtons}
            <ToggleButton
              style={refreshButtonStyle}
              bsStyle="primary"
              value={RELOADING_ID}
            >
              <Glyphicon
                className={isReloading ? "reload-spinning" : null}
                glyph="glyphicon glyphicon-refresh"
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
    </div>
  );
});
