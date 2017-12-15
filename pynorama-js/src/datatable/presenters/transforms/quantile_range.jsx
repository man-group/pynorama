import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Form, Glyphicon } from "react-bootstrap";
import { ColumnSelectFormGroup } from "../util";
import { isNumber, isDateTime } from "datatable/dtypes";
import React from "react";

import _ from "lodash";

const RangeWithTooltip = Slider.createSliderWithTooltip(Slider.Range);

// TODO: only for numbers datatype
class Presenter extends React.Component {
  constructor(props) {
    super(props);
    this.sliderValues = [
      this.props.transform.lower,
      this.props.transform.upper
    ];
  }

  change() {
    this.props.updateTransform({
      column: this.columnValue,
      lower: Math.min(...this.sliderValues),
      upper: Math.max(...this.sliderValues)
    });
  }

  render() {
    const style = [{ backgroundColor: "#337ab7", borderColor: "white" }];
    const { transform, updateTransform } = this.props;

    const dtypes = _.pickBy(
      this.props.dtypes,
      value => isNumber(value) || isDateTime(value)
    );

    this.columnValue = transform.column;

    return (
      <Form>
        <ColumnSelectFormGroup
          onChange={val => {
            this.columnValue = val;
            this.change();
          }}
          selected={transform.column}
          dtypes={dtypes}
          name="column"
        />
        <RangeWithTooltip
          min={0}
          max={1.0}
          step={0.001}
          defaultValue={this.sliderValues}
          onAfterChange={() => this.change()}
          allowCross={true}
          trackStyle={style}
          handleStyle={style}
          onChange={values => (this.sliderValues = values)}
        />
      </Form>
    );
  }
}

const getDefaultTransform = dtypes => ({
  column: _.findKey(dtypes, e => isNumber(e) || isDateTime(e)),
  lower: 0.25,
  upper: 0.75
});

const heading = (
  <span>
    Range <Glyphicon glyph="glyphicon glyphicon-resize-horizontal" />
  </span>
);

export default { heading, getDefaultTransform, Presenter };
