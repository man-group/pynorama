import ToggleButton from "react-bootstrap/lib/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/lib/ToggleButtonGroup";

import React from "react";

const Presenter = ({ index, transform, updateTransform }) => (
  <ToggleButtonGroup
    name="filter"
    onChange={value => updateTransform({ filter: value })}
    type="radio"
    value={transform.filter}
  >
    <ToggleButton value={"show"}>Show</ToggleButton>
    <ToggleButton value={"hide"}>Hide</ToggleButton>
  </ToggleButtonGroup>
);

const getDefaultTransform = dtypes => ({ filter: "hide" });
const heading = <span>NaNs</span>;

export default { heading, getDefaultTransform, Presenter };
