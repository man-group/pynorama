import React from "react";

import { isNumber, isDateTime, npDateTime64ToISO } from "../../dtypes";
import _ from "lodash";

export default function BandCell({ column, dtype, value, options }) {
  let style = {
    textAlign:
      column === "index" || isNumber(dtype) || isDateTime(dtype)
        ? "right"
        : "left"
  };

  let { bands } = options;
  if (bands) {
    let styles = bands.map(({ left, right, style }) => {
      if (
        (_.isNil(left) || left < value) &&
        (_.isNil(right) || value < right)
      ) {
        return style;
      } else {
        return {};
      }
    });
    style = _.merge(style, ...styles);
  }

  const renderedValue = isDateTime(dtype) ? npDateTime64ToISO(value) : value;

  return (
    <div className="cell-stretch" style={style}>
      {renderedValue != null && renderedValue.toString()}
    </div>
  );
}
