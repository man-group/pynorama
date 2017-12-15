import React from "react";
import sanitizeHtml from "sanitize-html";

import { isNumber, isDateTime, npDateTime64ToISO } from "../../dtypes";

export default function DefaultCell({ column, dtype, value, options }) {
  const style = {
    textAlign:
      column === "index" || isNumber(dtype) || isDateTime(dtype)
        ? "right"
        : "left"
  };

  const renderedValue = isDateTime(dtype) ? npDateTime64ToISO(value) : value;
  if (
    renderedValue &&
    (typeof renderedValue === "string" || renderedValue instanceof String) &&
    renderedValue.startsWith("<")
  ) {
    let clean = sanitizeHtml(renderedValue, {
      allowedAttributes: Object.assign(
        {},
        sanitizeHtml.defaults.allowedAttributes,
        { a: ["href", "rel", "target", "name"] }
      )
    });
    return (
      <div
        className="cell-stretch"
        style={style}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  return (
    <div className="cell-stretch" style={style}>
      {renderedValue != null && renderedValue.toString()}
    </div>
  );
}
