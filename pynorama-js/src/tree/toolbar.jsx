import React from 'react'
import {
  ButtonToolbar,
  ButtonGroup,
  Button,
  Glyphicon,
  FormControl,
  InputGroup,
  Form
} from "react-bootstrap";
import ToggleButton from "react-bootstrap/lib/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/lib/ToggleButtonGroup";

import { connect, all } from 'common/redux_ext'
import { getters, actions } from './state'

export const ExpansionLevelButtonGroup = connect(props => all({
  expandLevel: actions.expandLevel,
  collapseLevel: actions.collapseLevel,
}).withOptions({levelLengths: props.levelLengths}))
(
  function _ExpansionLevelButtonGroup({
    expandLevel, collapseLevel
  }) {
    return (
      <ButtonGroup>
        <Button onClick={() => collapseLevel()}>
          <Glyphicon glyph="glyphicon glyphicon-menu-up" />
        </Button>
        <Button onClick={() => expandLevel()}>
          <Glyphicon glyph="glyphicon glyphicon-menu-down" />
        </Button>
      </ButtonGroup>
    );
  }
);

export const Toolbar = function Toolbar({children}) {
  return (
    <Form inline className="tree-toolbar">
      <ButtonToolbar>
        {children}
      </ButtonToolbar>
    </Form>
  );
}
