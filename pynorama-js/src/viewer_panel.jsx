import React from "react";
import { connect } from "common/redux_ext";
import { Label } from "react-bootstrap";
import {
  CloseableHeader,
  HorizontalPanel,
  HorizontalResizer
} from "common/components";

import { getters, actions } from "view_state";

const DEFAULT_VIEWER = "json"
const DEFAULT_INITIAL_WIDTH = "500px"

const getViewerModule = viewer => {
  try {
    return require(`viewers/${viewer.toLowerCase()}.jsx`);
  } catch (e) {
    console.log(`Error in finding the custom viewer for ${viewer}:`);
    console.log(e);
    return require(`viewers/${DEFAULT_VIEWER}.jsx`);
  }
};

const ViewerPresenter = connect(props => ({
  closeVersion: actions.closeVersion.withOptions({ version: props.version }),
  moveVersionLeft: actions.moveVersionLeft.withOptions({
    version: props.version
  }),
  moveVersionRight: actions.moveVersionRight.withOptions({
    version: props.version
  })
}))(
  function UnconnectedViewerPresenter({
    version,
    error,
    data,
    viewer,
    documentKey,
    isLoading,
    closeVersion,
    moveVersionLeft,
    moveVersionRight
  }){
    let message = null;
    if (!documentKey) {
      message = "Select a document!";
    } else if (isLoading || !data) {
      message = "Loading...";
    }
    if (error) {
      message = "Error: " + error;
    }

    const header = (
      <div className="panelheader">
        <CloseableHeader
          moveButtons="horizontal"
          onClose={() => closeVersion()}
          onMovePositive={() => moveVersionRight()}
          onMoveNegative={() => moveVersionLeft()}
        >
          <span className="header-nowrap">
            Document:{" "}
            <Label
              bsStyle={message ? (error ? "danger" : "primary") : "default"}
            >
              {message || documentKey}
            </Label>
          </span>
          <br />
          <span className="header-nowrap">
            Version: <Label>{version}</Label>
          </span>
        </CloseableHeader>
      </div>
    );

    const module = getViewerModule(viewer);
    const Viewer = module.Viewer || module.default;
    return (
      <HorizontalResizer
        minWidth={module.minWidth}
        maxWidth={module.maxWidth}
        initialWidth={module.initialWidth || DEFAULT_INITIAL_WIDTH}
      >
        <HorizontalPanel header={header}>
          {data && <Viewer data={data} stage={version} />}
        </HorizontalPanel>
      </HorizontalResizer>
    );
  }
);

class ViewerDataProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loadingCounter: 0 };
  }

  componentDidMount() {
    this.updateData(this.props);
  }

  updateData({ documentKey, version, viewer }) {
    if (documentKey) {
      this.setState({ loadingCounter: this.state.loadingCounter + 1 });

      fetch(`record?key=${escape(documentKey)}&stage=${escape(version)}`)
        .then(response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          if (response.headers.get("content-type") == "application/json") {
            return response
              .json()
              .then(data => {
                if (data && data.error) {
                  throw Error(data.error);
                }
                this.setState({
                  error: null,
                  data,
                  loadingCounter: this.state.loadingCounter - 1
                });
              })
              .catch(e => {
                throw e;
              });
          } else {
            return response
              .blob()
              .then(data => {
                this.setState({
                  error: null,
                  data: data,
                  loadingCounter: this.state.loadingCounter - 1
                });
              })
              .catch(e => {
                throw e;
              });
          }
        })
        .catch(e => {
          this.setState({
            error: e.message,
            data: null,
            blob: null,
            loadingCounter: this.state.loadingCounter - 1
          });
          throw e;
        });
    }
  }

  componentWillReceiveProps(nextProps) {
    let { documentKey, version, isReloading } = nextProps;
    if (
      !(
        documentKey == this.props.documentKey && version == this.props.version
      ) &&
      !isReloading
    ) {
      this.updateData(nextProps);
    }
  }

  render() {
    return (
      <ViewerPresenter
        isLoading={this.state.loadingCounter != 0}
        version={this.props.version}
        documentKey={this.props.documentKey}
        viewer={this.props.viewer}
        data={this.state.data}
        error={this.state.error}
      />
    );
  }
}

export const ViewerPanel = connect({
  documentKey: getters.documentKey,
  isReloading: getters.isReloading
})(ViewerDataProvider);
