import React from "react";
import { connect } from "common/redux_ext";

import {
  HorizontalResizer,
  HorizontalPanel,
  HorizontalStack,
  CloseableHeader,
  VisibilityToggle,
  VerticalScrollArea
} from "common/components";
import { getters, actions } from "view_state";

import DataTable from "datatable";

import DefaultRow from "datatable/presenters/default_row";
import { isNumber, isDateTime, npDateTime64ToISO } from "datatable/dtypes";

const minWidth = "250px";
const maxWidth = null;
const initialWidth = "80vw";

import _ from "lodash";

const CustomRow = connect({
  documentKey: getters.documentKey,
  setDocument: actions.setDocument
})(function CustomRow({
  documentKey,
  setDocument,
  options,
  children,
  row,
  ...other
}) {
  const keyField = options.keyField;
  const selected = row[keyField] === documentKey;
  const className = selected ? options.selectedClassName : undefined;
  const style = selected ? options.selectedStyle : undefined;
  const modifiedOptions = _.merge({}, options, {
    style,
    className,
    onClick: () => setDocument({ documentKey: row[keyField] })
  });
  return (
    <DefaultRow {...other} row={row} options={modifiedOptions}>
      {children}
    </DefaultRow>
  );
});

const DocTableLayout = function DocTableLayout({ transforms, table, options }) {
  return (
    <HorizontalStack>
      <HorizontalResizer minWidth="100px" initialWidth="200px">
        {transforms}
      </HorizontalResizer>
      <HorizontalStack.Item grow={true} shrink={true}>
        <VerticalScrollArea>{table}</VerticalScrollArea>
      </HorizontalStack.Item>
    </HorizontalStack>
  );
};

const options = _.merge(
  {},
  {
    queryUrl: "table",
    layout: {
      component: DocTableLayout
    },
    table: {
      rows: {
        component: CustomRow,
        keyField: "index",
        selectedStyle: { color: "#90a0cc", backgroundColor: "#dddde3" }
      }
    }
  },
  window.options.datatable
);

export const DocTablePanel = connect({
  isVisible: getters.isDataTableVisible,
  closePanel: actions.closeDataTable,
  isReloading: getters.isReloading
})(function DocTablePanel({ isVisible, closePanel, isReloading }) {
  const header = (
    <div className="panelheader">
      <CloseableHeader onClose={() => closePanel()}>
        <span className="header-nowrap">Document Table - {window.viewName}</span>
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
          <DataTable isReloading={isReloading} options={options} />
        </HorizontalPanel>
      </HorizontalResizer>
    </VisibilityToggle>
  );
});
