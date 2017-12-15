import React from "react";

export default function BooleanCell({ column, dtype, value, options }) {
  const style = {
    textAlign: "right"
  };

  let renderedValue = value ? value.toString().toLowerCase() : "no";

  if (renderedValue === "no" || renderedValue === "false") {
    renderedValue = "False";
  } else {
    renderedValue = "True";
  }

  return (
    <div className="cell-stretch" style={style}>
      {renderedValue}
    </div>
  );
}
