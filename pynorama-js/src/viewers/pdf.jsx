import React from "react";
import PDFObject from "pdfobject";

export class PdfViewer extends React.Component {
  componentWillUpdate(nextProps, nextState) {
    let oldBlob = this.props.data;
    let newBlob = nextProps.data;
    if (oldBlob != newBlob) {
      const stage = nextProps.stage;

      PDFObject.embed(newBlob, "#pdf-viewer-" + stage);
    }
  }

  componentDidMount() {
    PDFObject.embed(this.props.data, "pdf-viewer-" + this.props.stage);
  }

  render() {
    const { width, height, containerId } = this.props;
    const stage = this.props.stage;

    return <div style={{ width: "100%", height: "100%" }} id={"pdf-viewer-" + stage} />;
  }
}
