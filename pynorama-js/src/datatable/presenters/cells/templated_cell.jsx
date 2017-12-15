import React from "react";
import MessageFormat from "messageformat";
import moment from "moment";

const FORMATTERS = {
  upcase: v => v.toUpperCase(),
  locale: (v, lc) => lc,
  prop: (v, lc, p) => v[p],
  relative: (v, lc, now = []) => {
    let timeNow = moment(now);
    let time = moment(v);
    return time.from(timeNow);
  },
  timedelta: v => {
    let timeNow = moment(0);
    let time = moment(v);
    return time.from(timeNow, true);
  },
  decimal: (v, lc, precision) => v.toFixed(precision)
};

import { isDateTime, isNumber } from "../../dtypes";

const format = (value, style, message, formatters = {}) => {
  let mf = new MessageFormat("en-GB").setIntlSupport(true);
  mf.addFormatters(formatters);
  let format = mf.compile(message);
  return (
    <div className="cell-stretch" style={style}>
      <span>{format({ value })}</span>
    </div>
  );
};

export default function TemplatedCell({ column, dtype, value, options }) {
  const style = {
    textAlign:
      column === "index" || isNumber(dtype) || isDateTime(dtype)
        ? "right"
        : "left"
  };

  if ((isNumber(dtype) || isDateTime(dtype)) && value == null) {
    return <div className="cell-stretch" style={style} />;
  }

  let message = options.message ? options.message : "{value}";
  return format(value, style, message, FORMATTERS);
}
