import Graph from "react-graph-vis";
import React from "react";

import { connect } from "common/redux_ext";
import { actions, getters } from "view_state";

import _ from "lodash";

import URLSearchParams from "url-search-params";

let params = new URLSearchParams(window.location.search);
let node = params.get("node");

const defaultOptions = {
  nodes: {
    shape: "box",
    widthConstraint: {
      maximum: 100
    },
    borderWidth: 1,
    borderWidthSelected: 5,
    margin: 10,
    color: {
      background: "#D2E5FF",
      border: "rgba(0,0,0,0)",
      highlight: {
        background: "#D2E5FF",
        border: "#333333"
      }
    }
  },
  layout: {
    hierarchical: {
      enabled: true,
      sortMethod: "directed",
      nodeSpacing: 200,
      direction: "LR"
    }
  },
  interaction: { selectable: true, multiselect: true },
  physics: {
    enabled: true,
    hierarchicalRepulsion: {
      nodeDistance: 60,
      springLength: 100,
      damping: 0.9
    }
  },
  edges: {
    smooth: true,
    arrows: { to: true },
    color: {
      color: "#000000"
    }
  },
  autoResize: true
};

let PipelinePresenter = class extends React.Component {
  selectionChanged(e) {
    this.props.setVersions({
      versions: e.nodes.map(node => ({
        name: node,
        viewer: this.props.data.nodeMapping[node].viewer
      }))
    });
  }

  render() {
    let { data, versions } = this.props;
    if (!data) {
      return null;
    }

    const nodes = _.values(data.nodeMapping).map(node => ({
      id: node.id,
      label: node.label || node.id,
      color: { background: node.color, highlight: { background: node.color } }
    }));
    const graph = { nodes, edges: data.edges };

    const events = {
      selectNode: e => this.selectionChanged(e),
      deselectNode: e => this.selectionChanged(e),
      dragStart: e => this.selectionChanged(e)
    };
    return (
      <Graph
        graph={graph}
        options={defaultOptions}
        style={{ width: "100%", height: "100%" }}
        events={events}
        getNetwork={network => {
          this.network = network;
          this.componentWillReceiveProps(this.props);
        }}
      />
    );
  }

  componentWillReceiveProps(nextProps) {
    this.network &&
      this.network.setSelection({
        nodes: nextProps.versions.map(node => node.name)
      });
  }

  shouldComponentUpdate(nextProps) {
    return this.props.data == null;
  }
};

PipelinePresenter = connect({
  versions: getters.versions,
  setVersions: actions.setVersions
})(PipelinePresenter);

class PipelineDataProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.updateData();
  }

  updateData() {
    // TODO: deal with errors
    fetch(`pipeline`)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          throw Error(data.error);
        }
        this.setState({ data });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isReloading) {
      this.updateData();
    }
  }

  render() {
    return <PipelinePresenter data={this.state.data} />;
  }
}

export const Pipeline = connect({
  isReloading: getters.isReloading
})(PipelineDataProvider);
