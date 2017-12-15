import React from "react";
import { connect, all } from "common/redux_ext";
import { getters, actions } from "../state";
import { Panel, Glyphicon, Button, ButtonGroup } from "react-bootstrap";
import { CloseableHeader } from "common/components";

import ToggleButton from "react-bootstrap/lib/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/lib/ToggleButtonGroup";
import _ from "lodash";

import Select from "react-select";
import "react-select/dist/react-select.css";

function getPresentation(transformType) {
  try {
    return require(`./transforms/${transformType}.jsx`).default || {};
  } catch (e) {
    return {};
  }
}

const TransformContainer = connect(props =>
  all({
    removeTransform: actions.removeTransform,
    updateTransform: actions.updateTransform,
    moveTransformUp: actions.moveTransformUp,
    moveTransformDown: actions.moveTransformDown
  }).withOptions({ index: props.index })
)(function TransformContainer({
  index,
  transform,
  error,
  dtypes,
  removeTransform,
  updateTransform,
  moveTransformUp,
  moveTransformDown,
  sideResult
}) {
  const presentation = getPresentation(transform.type);

  const header = transform.fixed ? (
    presentation.heading
  ) : (
    <CloseableHeader
      moveButtons="vertical"
      onMovePositive={() => moveTransformDown()}
      onMoveNegative={() => moveTransformUp()}
      onClose={removeTransform}
    >
      {presentation.heading}
    </CloseableHeader>
  );

  const footer = error && <span>{error}</span>;

  return (
    <Panel
      header={header}
      footer={footer}
      bsStyle={error ? "danger" : "default"}
    >
      {presentation.Presenter && (
        <presentation.Presenter
          index={index}
          sideResult={sideResult}
          updateTransform={options =>
            updateTransform({ transform: { ...options } })}
          transform={transform}
          dtypes={dtypes}
        />
      )}
    </Panel>
  );
});

const Toolbox = connect({
  removeAllTransforms: actions.removeAllTransforms,
  addTransform: actions.addTransform
})(function Toolbox({ addTransform, removeAllTransforms, dtypes, options }) {
  // TODO: React Dev Tool catch exceptions. Bad for debugging.
  const buttons = options.available.map(type => {
    const presentation = getPresentation(type);

    const transform = presentation.getDefaultTransform(dtypes);

    if (!presentation.heading)
      return null;

    return (
      <Button
        onClick={() => addTransform({ transform: { ...transform, type } })}
        key={type}
      >
        {presentation.heading}
      </Button>
    );
  });
  return (
    <div className="transforms-space-below">
      <ButtonGroup vertical block>
        {buttons}
      </ButtonGroup>
      {options.clearButton && (
        <Button block onClick={removeAllTransforms}>
          Clear <Glyphicon glyph="glyphicon glyphicon-remove" />
        </Button>
      )}
    </div>
  );
});

const ColumnsSelect = connect({
  visibleColumns: getters.visibleColumns,
  setVisibleColumns: actions.setVisibleColumns
})(function ColumnsSelect({ dtypes, visibleColumns, setVisibleColumns }) {
  const columns = _.keys(dtypes);
  const options = columns.map(e => ({
    value: e,
    label: e
  }));
  return (
    <div className="transforms-space-below">
      <Select
        name="columns_select"
        multi={true}
        clearable={false}
        onChange={value =>
          setVisibleColumns({ columns: value.map(e => e.value) })}
        value={visibleColumns}
        options={options}
      />
    </div>
  );
});

export default connect({
  transforms: getters.transforms
})(function TransformStack({ transforms, errors, dtypes, sideResults, options }) {
  let counters = {};
  let index = 0;
  let children = transforms.map(transform => {
    counters[transform.type] = ++counters[transform.type] || 0;
    return (
      <TransformContainer
        key={transform.type + " " + counters[transform.type]}
        error={errors[index]}
        sideResult={sideResults[index]}
        dtypes={dtypes}
        index={index++}
        transform={transform}
      />
    );
  });
  return (
    <div
      className="datatable-transform-stack"
      style={{ padding: "10px", overflow: "auto" }}
    >
      <ColumnsSelect dtypes={dtypes} />
      <Toolbox options={options.toolbox} dtypes={dtypes} />
      {children}
    </div>
  );
});
