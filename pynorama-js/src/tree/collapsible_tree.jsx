import React from "react";
import { Glyphicon } from "react-bootstrap";
import _ from "lodash";

import { connect, all } from "common/redux_ext";
import { DivDummy } from 'common/components'

import { getters, actions, DEFAULT_DEEP_INDEX, DEFAULT_DEEP_LENGTHS} from "./state";

import "./css/treeview.css";

export default function createCollapsibleComponent(
  getChildren,
  LeafNodePresenter,
  CollapsedNodePresenter,
  ExpandedNodePresenter,
  ExpandedNodeContainer = DivDummy,
  showControls = true
) {
  const CollapsibleComponent = connect(props => all({
    highlighted: getters.highlighted,
    hidden: getters.hidden,
    collapsed: getters.collapsed,
    toggleCollapsed: actions.toggleCollapsed,
    setHighlight: actions.setHighlight.withMapping(value => ({value})),
  }).withOptions({
    levelLengths: props.levelLengths,
    deepLengths: props.deepLengths,
    deepIndex: props.deepIndex,
    group: props.group
  }))(
    function UnconnectedCollapsibleComponent({
      node,
      deepIndex=DEFAULT_DEEP_INDEX,
      deepLenghts=DEFAULT_DEEP_LENGTHS,
      highlighted,
      hidden,
      collapsed,
      toggleCollapsed,
      setHighlight,
      ...other }) {

      if (hidden) {
        return null;
      }

      const withHighlight = (component) => (
        <div
          onMouseLeave={() => setHighlight(false)}
          onMouseEnter={() => setHighlight(true)}
          className={highlighted && "tree-highlighted" || ""}
        >
          {component}
        </div>
      );

      if (!getChildren(node)) {
        return withHighlight(
          <LeafNodePresenter
            node={node}
            deepIndex={deepIndex}
            deepLenghts={deepLenghts}
            {...other} />
        );
      }

      let controls = null;
      if (showControls) {
        controls = (
          <div
            className={"tree-indent-area tree-clickable-area"}
            onClick={() => toggleCollapsed()}
          >
            <Glyphicon
              className={"tree-button"}
              glyph={`glyphicon glyphicon-chevron-${collapsed
                ? "right"
                : "down"}`}
            />
          </div>
        );
      }

      if (collapsed) {
        return (
          <div className={"tree-node"}>
            {controls}
            <div className={"tree-indented"}>
              {
                withHighlight(
                  <CollapsedNodePresenter node={node}
                    deepLenghts={deepLenghts}
                    deepIndex={deepIndex} {...other} />
                )
              }
            </div>
          </div>
        );
      } else {
        const childPresenters = _.map(
          getChildren(node),
          (child,index) => (
            <CollapsibleComponent
              key={index}
              deepLenghts={deepLenghts}
              deepIndex={[...deepIndex, index]}
              node={child}
              {...other}
            />
          )
        );

        return (
          <div className={"tree-node"}>
            {controls}
            <div className={"tree-indented"}>
              <ExpandedNodeContainer node={node} deepIndex={deepIndex} {...other}>
                {
                  withHighlight(<ExpandedNodePresenter
                    node={node}
                    deepIndex={deepIndex} {...other}
                    deepLenghts={deepLenghts}
                  />)
                }
                {childPresenters}
              </ExpandedNodeContainer>
            </div>
          </div>
        );
      }
    }
  );
  return CollapsibleComponent;
}
