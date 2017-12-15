import React from "react";

import { connect } from "common/redux_ext";
import { getters, actions } from "../state";

import _ from "lodash";

function render(renderers, props, options) {
  const localRenderers = [...renderers];
  const getNextRenderer = () => localRenderers.pop();
  return getNextRenderer()(props, options, getNextRenderer);
}

export default connect({
  visibleColumns: getters.visibleColumns
})(function Table({ data, dtypes, dataCount, visibleColumns, error, options }) {
  const columns = [];
  const allColumns = ["index", ...data.columns];
  if (options.showIndex) {
    columns.push("index");
  }
  columns.push(..._.intersection(visibleColumns, data.columns));

  let columnIndices = {};
  for (let column of allColumns) {
    columnIndices[column] = data.columns.indexOf(column);
  }

  let renderedHeaderCells = columns.map(column => {
    let renderedCell = render(
      options.headers.renderers,
      { column, dtype: dtypes[column] },
      _.merge({}, options.headers.all, options.headers[column])
    );
    return <th key={column}>{renderedCell}</th>;
  });

  let { component: Row, ...rowOptions } = options.rows;
  let renderedRows = [];
  for (let i in data.data) {
    const row = {};
    for (let column of allColumns) {
      row[column] =
        column === "index"
          ? data.index[i]
          : data.data[i][columnIndices[column]];
    }

    const renderedCells = [];
    for (let column of columns) {
      const renderedCell = render(
        options.cells.renderers,
        {
          column,
          dtype: dtypes[column],
          value: row[column]
        },
        _.merge({}, options.cells.all, options.cells[column])
      );

      renderedCells.push(<td key={column}>{renderedCell}</td>);
    }
    renderedRows.push(
      <Row options={rowOptions} row={row} key={i}>
        {renderedCells}
      </Row>
    );
  }

  const { component: Footer, ...footerOptions } = options.footer;
  return (
    <table className="datatable">
      <thead>
        <tr>{renderedHeaderCells}</tr>
      </thead>
      <tbody>{renderedRows}</tbody>
      {Footer && (
        <tfoot>
          <tr>
            <td colSpan={columns.length}>
              <Footer
                error={error}
                dataCount={dataCount}
                options={footerOptions}
              />
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
});
