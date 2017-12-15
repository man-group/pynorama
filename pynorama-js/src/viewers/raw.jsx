import React from "react";
import _ from 'lodash'

export default function RawViewer({ data, info }) {
  return (
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {_.isString(data) ? data : JSON.stringify(data)}
    </pre>
  );
};
