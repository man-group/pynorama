import React from "react";
import MessageFormat from "messageformat";
import moment from "moment";
import sanitizeHtml from "sanitize-html";

const FORMATTERS = {
  upcase: (v) => v.toUpperCase(),
  locale: (v, lc) => lc,
  prop: (v, lc, p) => v[p],
  relative: (v, lc, now = []) => {
    let timeNow = moment(now);
    let time = moment(v);
    return time.from(timeNow);
  },
  timedelta: (v) => {
    let timeNow = moment(0);
    let time = moment(v);
    return time.from(timeNow, true);
  },
  decimal: (v, lc, precision) => v.toFixed(precision),
  replace: (v, lc, [pattern, replacement, flags = ""]) => {
    const strip = /^"(.*(?="$))"$/;
    if (v) {
      return v.replace(
          new RegExp(
              pattern.replace(strip, '$1'),
              flags.replace(strip, '$1')
          ),
          replacement.replace(strip, '$1'));
    }
    return v;
  }
};

import { isDateTime, isNumber } from "../../dtypes";

const format = (value, style, message, formatters = {}) => {
  let mf = new MessageFormat("en-GB").setIntlSupport(true);
  mf.addFormatters(formatters);
  return mf.compile(message)({value});
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
  let formattedValue = format(value, style, message, FORMATTERS);
  if (options.html) {
    formattedValue = sanitizeHtml(formattedValue, {
      allowedAttributes: Object.assign(
          {},
          sanitizeHtml.defaults.allowedAttributes,
          {a: ["href", "rel", "target", "name"]}
      )
    });

    return (
        <div className="cell-stretch"
             style={style}
             dangerouslySetInnerHTML={{ __html: formattedValue }}>
        </div>
    );
  }
  return (
      <div className="cell-stretch" style={style}>
        <span>{formattedValue}</span>
      </div>
  );
}
