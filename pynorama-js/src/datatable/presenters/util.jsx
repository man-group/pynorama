import React from "react";

import _ from "lodash";

import Select from "react-select";
import "react-select/dist/react-select.css";

export const ColumnSelectFormGroup = function ColumnSelectFormGroup({
  selected,
  dtypes,
  name = "column",
  index = false,
  onChange
}) {
  const options = _.keys(dtypes).map(column => ({
    value: column,
    label: column
  }));
  if (index) {
    options.push({ value: "index", label: "index" });
  }
  return (
    <div className="transforms-space-below">
      <Select
        clearable={false}
        backspaceRemoves={false}
        deleteRemoves={false}
        multi={false}
        options={options}
        onChange={val => onChange && onChange(val.value)}
        name={name}
        value={selected}
      />
    </div>
  );
};
