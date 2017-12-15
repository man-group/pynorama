import React from "react";

export default function DefaultRow({ children, options, row }) {
  const classNames = [];
  if (options.className != null) {
    classNames.push(options.className);
  }
  if (options.hoverHighlight) {
    classNames.push("datatable-hover-highlight");
  }
  if (options.clickableCursor) {
    classNames.push("datatable-clickable-cursor");
  }
  return (
    <tr
      style={options.style}
      className={classNames.join(" ")}
      onClick={options.onClick}
    >
      {children}
    </tr>
  );
}
