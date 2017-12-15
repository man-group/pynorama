import { ColumnSelectFormGroup } from "../util";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Form, FormControl, Glyphicon } from "react-bootstrap";

import React from "react";

const Presenter = class Presenter extends React.Component {
  change() {
    this.props.updateTransform({
      column: this.column,
      searchterm: this.searchterm
    });
  }

  render() {
    const { transform, dtypes } = this.props;
    this.column = transform.column;
    this.searchterm = transform.searchterm;

    return (
      <Form
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <ColumnSelectFormGroup
          selected={transform.column}
          dtypes={dtypes}
          onChange={val => {
            this.column = val;
            this.change();
          }}
          name="column"
        />
        <FormControl
          name="searchterm"
          type="text"
          defaultValue={transform.searchterm}
          onChange={e => {
            this.searchterm = e.target.value;
            this.change();
          }}
        />
      </Form>
    );
  }
};

const getDefaultTransform = dtypes => ({
  column: Object.keys(dtypes)[0],
  searchterm: "*"
});

const heading = (
  <span>
    Search <Glyphicon glyph="glyphicon glyphicon-search" />
  </span>
);

export default { heading, getDefaultTransform, Presenter };
