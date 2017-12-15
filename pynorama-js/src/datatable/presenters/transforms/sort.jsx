import { ColumnSelectFormGroup } from "../util";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Form, Glyphicon } from "react-bootstrap";

import ToggleButton from "react-bootstrap/lib/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/lib/ToggleButtonGroup";

import React from "react";

const Presenter = class Presenter extends React.Component {
  change() {
    this.props.updateTransform({
      column: this.column,
      ascending: this.ascending
    });
  }

  render() {
    const { transform, dtypes } = this.props;

    this.ascending = transform.ascending;
    this.column = transform.column;
    return (
      <Form
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <ColumnSelectFormGroup
          selected={transform.column}
          dtypes={dtypes}
          name="column"
          index={true}
          onChange={val => {
            this.column = val;
            this.change();
          }}
        />
        <ToggleButtonGroup
          onChange={val => {
            this.ascending = val;
            this.change();
          }}
          vertical
          block
          type="radio"
          name="direction"
          value={transform.ascending}
        >
          <ToggleButton value={true}>ascending</ToggleButton>
          <ToggleButton value={false}>descending</ToggleButton>
        </ToggleButtonGroup>
      </Form>
    );
  }
};
const getDefaultTransform = dtype => ({ sort: "index", ascending: true });

const heading = (
  <span>
    Sort <Glyphicon glyph="glyphicon glyphicon-sort" />
  </span>
);

export default { heading, getDefaultTransform, Presenter };

/*
  TODO: ideas:
  regex search
  scatter diagram
  heatmap
  PCA diagram
  pandas query logic
*/
