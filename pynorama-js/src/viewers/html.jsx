import React from "react";
import _ from 'lodash'

export default function HtmlViewer({ data, info }) {
  return (
    <iframe srcDoc={_.isString(data) ? data : JSON.stringify(data)} sandbox width={"100%"} height={"100%"}>
    </iframe>
  );
};
