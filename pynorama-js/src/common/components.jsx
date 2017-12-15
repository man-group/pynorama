import React from "react";
import { Glyphicon } from "react-bootstrap";
import { findDOMNode } from "react-dom";

import "./css/components.css";

export const CloseableHeader = ({
  children,
  onClose,
  moveButtons = null,
  onMoveNegative,
  onMovePositive
}) => {
  return (
    <div className="closeableheader-container">
      <div className="closeableheader-content">{children}</div>
      <div className="closeableheader-buttons">
        {moveButtons && (
          <Glyphicon
            onClick={onMoveNegative}
            className="closeableheader-button"
            glyph={
              "glyphicon glyphicon-chevron-" +
              (moveButtons == "horizontal" ? "left" : "up")
            }
          />
        )}
        <Glyphicon
          onClick={onClose}
          className="closeableheader-button"
          glyph="glyphicon glyphicon-remove"
        />
        {moveButtons && (
          <Glyphicon
            onClick={onMovePositive}
            className="closeableheader-button"
            glyph={
              "glyphicon glyphicon-chevron-" +
              (moveButtons == "horizontal" ? "right" : "down")
            }
          />
        )}
      </div>
    </div>
  );
};

export class HorizontalResizer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { initialWidth, minWidth, maxWidth } = this.props;
    return (
      <div className="hresizer-container">
        <div
          className="hresizer-content"
          style={{
            width: initialWidth,
            minWidth: minWidth,
            maxWidth: maxWidth
          }}
          ref={ref => (this.contentRef = ref)}
        >
          {this.props.children}
        </div>
        <div
          className="hresizer-splitter"
          ref={ref => (this.splitterRef = ref)}
          onMouseDown={e => this.mousedown(e)}
        />
      </div>
    );
  }

  componentDidMount() {
    // Set fixed of width after content has taken up required size; allow some time for that.
    /*
    this.initialWidth || window.setTimeout(()=>{
      if (this.contentRef) {
        let startWidth =
          parseInt(window.getComputedStyle(this.contentRef).width);
        this.contentRef.style.width = startWidth + 'px';
      }
    }, 1000)
    */
  }

  mousedown(e) {
    let startX = e.clientX;
    let sizeRef = this.contentRef;
    let startWidth = parseInt(window.getComputedStyle(sizeRef).width);
    let mouseup = function(e) {
      document.body.removeEventListener("mouseup", mouseup);
      document.body.removeEventListener("mousemove", mousemove);
    };
    let mousemove = function(e) {
      sizeRef.style.width = startWidth + e.clientX - startX + "px";
    };

    document.body.addEventListener("mousemove", mousemove);
    document.body.addEventListener("mouseup", mouseup);
  }
}

export const VerticalScrollArea = function VerticalScrollArea({ children }) {
  return <div className="vertical-scroll-area">{children}</div>;
};

export const HorizontalStack = function HorizontalStack({ children }) {
  const wrappedChildren = React.Children.map(
    children,
    child =>
      child.type == HorizontalStack.Item ? (
        child
      ) : (
        <HorizontalStack.Item>{child}</HorizontalStack.Item>
      )
  );
  return <div className="hstack">{wrappedChildren}</div>;
};

HorizontalStack.Item = ({ children, grow = false, shrink = false }) => {
  const style = { flexGrow: grow ? 1 : 0, flexShrink: shrink ? 1 : 0 };
  return (
    <div className="hstack-item" style={style}>
      {children}
    </div>
  );
};

export const HorizontalPanel = function HorizontalPanel({ children, header }) {
  return (
    <div className="hpanel-container">
      {header && <div className="hpanel-header">{header}</div>}
      <div className="hpanel-content">{children}</div>
    </div>
  );
};

export const VisibilityToggle = class VisibilityToggle extends React.Component {
  constructor(props) {
    super(props);
    this.prevDisplay = "";
  }

  render() {
    return this.props.children;
  }

  componentDidMount() {
    if (this.props.isVisible === false) {
      let e = findDOMNode(this);
      this.prevDisplay = e.style.display;
      e.style.display = "none";
    }
  }

  componentDidUpdate() {
    let e = findDOMNode(this);
    if (this.props.isVisible === false) {
      this.prevDisplay = e.style.display;
      e.style.display = "none";
    } else {
      e.style.display = this.prevDisplay;
    }
  }
};


export const DivDummy = function DivDummy({children}) {
  return <div>{children}</div>;
}
