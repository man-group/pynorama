import React from "react";
import ObjectInspector from "react-object-inspector";

export default function JSONViewer({ data }) {
  return <ObjectInspector data={data} />;
};
