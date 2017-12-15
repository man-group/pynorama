import React from "react";
import { connect } from "common/redux_ext";

import { Pagination, Label } from "react-bootstrap";
import ToggleButton from "react-bootstrap/lib/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/lib/ToggleButtonGroup";

import { getters, actions } from "../state";

export default connect({
  page: getters.page,
  pageLength: getters.pageLength,
  changePage: actions.changePage,
  setPageLength: actions.setPageLength,
  isLoading: getters.isLoading
})(function DefaultFooter({
  dataCount,
  page,
  changePage,
  isLoading,
  error,
  pageLength,
  setPageLength
}) {
  const pageCount = Math.ceil(dataCount / pageLength);
  const pageLengths = [15, 20, 50, 100, 150];
  const buttons = pageLengths.map(l => (
    <ToggleButton key={l} value={l}>
      {l}
    </ToggleButton>
  ));
  return (
    <div className="default-footer">
      <Label bsStyle={isLoading ? "primary" : "default"}>
        {isLoading
          ? "Loading..."
          : `${dataCount} ${dataCount === 1 ? "Row" : "Rows"}`}
      </Label>
      <br />
      <Pagination
        prev
        next
        first
        last
        ellipsis
        maxButtons={5}
        items={pageCount}
        activePage={page}
        onSelect={selected => changePage({ page: selected })}
      />
      <br />
      <ToggleButtonGroup
        name="pageLengths"
        type="radio"
        value={pageLength}
        onChange={value => setPageLength({ pageLength: value })}
      >
        {buttons}
      </ToggleButtonGroup>
    </div>
  );
});
