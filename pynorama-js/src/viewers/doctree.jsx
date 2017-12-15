import React from "react";
import _ from 'lodash'

import { calculateLevelLengths } from 'tree/tree_operations'
import createCollapsibleComponent from "tree/collapsible_tree";
import { createTextPresenter } from "tree/tagged_tree";
import { Toolbar, ExpansionLevelButtonGroup } from 'tree/toolbar'

function getChildren(node) {
  return _.isString(node) ? null : node;
}

function renderText(node) {
  const children = getChildren(node);
  if (children) {
    let text = "";
    for (let child of children) {
      text +=  renderText(child) + " ";
    }
    return text;
  }
  return node.toString();
}

const TaggedTreeComponent = createCollapsibleComponent(
  getChildren,
  createTextPresenter(true),
  createTextPresenter(true),
  createTextPresenter(false)
);

export default function DocTreeViewer({data}) {
  const levelLengths = calculateLevelLengths(data, getChildren);

  return (
    <div>
      <Toolbar>
        <ExpansionLevelButtonGroup
          levelLengths={levelLengths} />
      </Toolbar>
      <TaggedTreeComponent
        node={data}
        renderText={renderText}
        levelLengths={levelLengths}
      />
    </div>
  );
}
