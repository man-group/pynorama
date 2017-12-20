import React from "react";
import PDFObject from "pdfobject";

export default class PdfViewer extends React.Component {
  componentWillUpdate(nextProps, nextState) {
    let oldBlob = this.props.data;
    let newBlob = nextProps.data;
    if (oldBlob != newBlob) {
      const stage = nextProps.stage;

      PDFObject.embed(newBlob, this.pdfElement);
    }
  }

  componentDidMount() {
    PDFObject.embed(this.props.data, this.pdfElement);
  }

  render() {
    const { width, height, containerId } = this.props;
    const stage = this.props.stage;

    return <div style={{ width: "100%", height: "100%" }} ref={el => this.pdfElement = el} />;
  }
}
