import React from "react";

export default function YesNoCell({ column, dtype, value, options }) {
  const style = {
    textAlign: "right"
  };

  let renderedValue = value ? value.toString().toLowerCase() : "no";

  if (renderedValue === "no" || renderedValue === "false") {
    renderedValue = "no";
  } else {
    renderedValue = "yes";
  }

  return (
    <div className="cell-stretch" style={style}>
      {renderedValue}
    </div>
  );
}
