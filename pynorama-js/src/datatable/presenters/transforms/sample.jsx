import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Glyphicon } from "react-bootstrap";

import React from "react";

const SliderWithTooltip = Slider.createSliderWithTooltip(Slider);

const Presenter = ({ index, transform, updateTransform }) => {
  const style = [{ backgroundColor: "#337ab7", borderColor: "white" }];
  return (
    <div style={{ height: "30px" }}>
      <SliderWithTooltip
        min={0}
        max={1.0}
        step={0.001}
        defaultValue={transform.fraction}
        trackStyle={style}
        handleStyle={style}
        onAfterChange={value => updateTransform({ fraction: value })}
      />
    </div>
  );
};

const getDefaultTransform = dtypes => ({ fraction: 0.5 });
const heading = (
  <span>
    Sample <Glyphicon glyph="glyphicon glyphicon-grain" />
  </span>
);

export default { heading, getDefaultTransform, Presenter };
