import React from "react";
import { Label, Glyphicon } from "react-bootstrap";

import "./css/treeview.css";

function AttributePresenter({ showTags, node }) {
  let tagPresenters = [];
  let count = 0;
  if (showTags) {
    for (let tag of node.getTags()) {
      tagPresenters.push(
        <Label key={++count} className={"tree-label"}>
          {tag}
        </Label>
      );
    }
  }
  return <span>{tagPresenters}</span>;
};

export function createTextPresenter(textVisible) {
  class TextPresenter extends React.Component {
    constructor(props) {
      super(props);
      this.state = { wrap: false };
    }

    toggleWrap() {
      this.setState({ wrap: !this.state.wrap });
    }

    render() {
      const text = textVisible && this.props.renderText(this.props.node) || "";
      return (
        <div className={["tree-line"].join(" ")}>
            <AttributePresenter {...this.props} />
            {textVisible ? (
              <Glyphicon
                className={"tree-button"}
                onClick={() => this.toggleWrap()}
                glyph={`glyphicon glyphicon-eye-${this.state.wrap
                  ? "open" : "close"}`}
              />
            ) : null}
            <span className={this.state.wrap ? "tree-text-wrap" : "tree-text-ellipsis"}>
              {text}
            </span>
        </div>
      );
    }
  }
  return TextPresenter;
}
