import React from "react";
import { connect } from "common/redux_ext";

import {
  HorizontalPanel,
  CloseableHeader,
  HorizontalResizer,
  VisibilityToggle
} from "common/components";
import { getters, actions } from "view_state";
import { Pipeline } from "./pipeline";

const minWidth = "200px";
const maxWidth = null;
const initialWidth = "600px";

export const PipelinePanel = connect({
  isVisible: getters.isPipelineVisible,
  closePanel: actions.closePipeline
})(({ isVisible, closePanel }) => {
  const header = (
    <div className="panelheader">
      <CloseableHeader onClose={() => closePanel()}>
        <span className="header-nowrap">Pipeline - {window.viewName}</span>
      </CloseableHeader>
    </div>
  );
  return (
    <VisibilityToggle isVisible={isVisible}>
      <HorizontalResizer
        minWidth={minWidth}
        maxWidth={maxWidth}
        initialWidth={initialWidth}
      >
        <HorizontalPanel header={header}>
          <Pipeline />
        </HorizontalPanel>
      </HorizontalResizer>
    </VisibilityToggle>
  );
});
