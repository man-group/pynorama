import React from "react";

import { calculateLevelLengths } from 'tree/tree_operations'
import createCollapsibleComponent from "tree/collapsible_tree";
import { Toolbar, ExpansionLevelButtonGroup } from 'tree/toolbar'

import "css/xml.css";

class ExpandedNodePresenter extends React.Component {
  render() {
    return (
      <TagFrontPresenter node={this.props.node} selfClosing={false} />
    );
  }
}

class ExpandedNodeContainer extends React.Component {
  render() {
    return (
      <div className={"element"}>
        {this.props.children}
        <TagEndPresenter node={this.props.node} />
      </div>
    );
  }
}

class CollapsedNodePresenter extends React.Component {
  render() {
    return (
      <div className={"element"}>
        <TagFrontPresenter node={this.props.node} selfClosing={false} />
        ...
        <TagEndPresenter node={this.props.node} />
      </div>
    );
  }
}

class LeafNodePresenter extends React.Component {
  render() {
    if (this.props.node.nodeType == Node.ELEMENT_NODE) {
      return (
        <div className={"element"}>
          <TagFrontPresenter node={this.props.node} selfClosing={true} />
        </div>
      );
    } else {
      return <span>{this.props.node.nodeValue}</span>;
    }
  }
}
class TagFrontPresenter extends React.Component {
  render() {
    let attributes = [];
    for (let attr of this.props.node.attributes) {
      attributes.push(<AttributePresenter key={attr.nodeName} node={attr} />);
    }
    return (
      <span className={"tag"}>
        <span className={"tagName"}>{"<" + this.props.node.nodeName}</span>
        {attributes}
        <span className={"tagName"}>{this.props.selfClosing ? "/>" : ">"}</span>
      </span>
    );
  }
}

class AttributePresenter extends React.Component {
  render() {
    return (
      <span className={"attribute"}>
        <span className={"attributeName"}>{this.props.node.nodeName}</span>
        <span className={"attributeEquals"}>=</span>
        <span className={"attributeValue"}>
          {'"' + this.props.node.nodeValue + '"'}
        </span>
      </span>
    );
  }
}

class TagEndPresenter extends React.Component {
  render() {
    return (
      <span className={["tagName", "tag"].join(" ")}>
        {"</" + this.props.node.nodeName + ">"}
      </span>
    );
  }
}

function getChildren(node) {
  if (node.nodeType == Node.ELEMENT_NODE) {
    let children = [];
    for (let child of node.childNodes) {
      if (child.nodeType == Node.ELEMENT_NODE) {
        children.push(child);
      }
      if (
        child.nodeType == Node.TEXT_NODE &&
        child.nodeValue.trim() != ""
      ) {
        children.push(child);
      }
    }
    return children;
  } else {
    return null;
  }
}

const Presenter = createCollapsibleComponent(
  getChildren,
  LeafNodePresenter,
  CollapsedNodePresenter,
  ExpandedNodePresenter,
  ExpandedNodeContainer
);

export default function XmlViewer({data}) {
  const xmlString = data;
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const root = xmlDoc.children[0];

  const levelLengths = calculateLevelLengths(root, getChildren);
  
  return (
    <div>
      <Toolbar>
        <ExpansionLevelButtonGroup
          levelLengths={levelLengths} />
      </Toolbar>
      <Presenter
        node={root}
        levelLengths={levelLengths}
      />
    </div>
  );
}
