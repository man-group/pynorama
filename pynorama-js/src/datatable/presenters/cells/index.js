import React from "react";
import DefaultCell from "./default_cell";
import BandCell from "./band_cell";
import YesNoCell from "./yes_no";
import BooleanCell from "./boolean_cell";
import TemplatedCell from "./templated_cell";

const cellRendererTypes = {
  yes_no: (props, options) => <YesNoCell {...props} options={options} />,
  boolean: (props, options) => <BooleanCell {...props} options={options} />,
  band: (props, options) => <BandCell {...props} options={options} />,
  template: (props, options) => <TemplatedCell {...props} options={options} />,
  default: (props, options) => <DefaultCell {...props} options={options} />
};

export default (props, options, getNextRenderer) => {
  const renderer_name = _.get(options, "renderer", "default");
  const renderer = _.get(cellRendererTypes, renderer_name, cellRendererTypes["default"]);
  return renderer(props, options);
};
