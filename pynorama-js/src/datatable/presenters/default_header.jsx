import React from "react";
import { connect } from "common/redux_ext";

import { Glyphicon } from "react-bootstrap";

import { getters, actions } from "../state";

export default connect(props => ({
  isSorted: getters.isSorted.withOptions({ column: props.column }),
  toggleSort: actions.toggleSort.withOptions({ column: props.column })
}))(function DefaultHeader({ column, type, isSorted, toggleSort, options }) {
  const direction = isSorted === "ascending" ? "bottom" : "top";
  const icon =
    isSorted != null ? (
      <Glyphicon glyph={`glyphicon glyphicon-triangle-${direction}`} />
    ) : (
      <Glyphicon glyph="glyphicon glyphicon-minus" />
    );
  const renderedName =
    column === "index" ? options.displayName || column : column;
  return (
    <button className="default-header-cell" onClick={toggleSort}>
      <div className="default-header-cell-text">{renderedName}</div>
      {icon}
    </button>
  );
});
