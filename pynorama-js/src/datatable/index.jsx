/*
  index contians the DataTableProvider, the core component,
  which given the transforms, offset and pageLength queries the server to retrieve the new dataTable
  that is subsequently displayed in the table
*/

import React from "react";

import _ from "lodash";

import { connect } from "common/redux_ext";

import { getters, actions } from "./state";
import Table from "./presenters/table";
import Transforms from "./presenters/transforms";

import DEFAULT_OPTIONS from "./default_options";

import "./presenters/css/datatable.css";

export default connect({
  pageLength: getters.pageLength,
  offset: getters.offset,
  transforms: getters.transforms,

  setPageLength: actions.setPageLength,
  setPostTransforms: actions.setPostTransforms,
  setPreTransforms: actions.setPreTransforms,
  addVisibleColumns: actions.addVisibleColumns,
  setIsLoading: actions.setIsLoading.withMapping(value => ({ value }))
})
(
  class DataTableProvider extends React.Component {
    constructor(props) {
      super(props);
      // use loadingCounter to keep track of how many HTTP requests are open.
      // increment for every opened reqeust, decrement for every HTTP response.
      this.loadingCounter = 0;
      this.state = {};
      this.updateOptions();
    }

    componentDidMount() {
      // can only set state once component mounted
      this.updateData(this.props);
    }

    componentWillReceiveProps(nextProps) {
      if (!nextProps.isReloading) {
        this.updateData(nextProps);
      }
      if (nextProps.options !== this.props.options) {
        this.updateOptions();
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      // to prevent unneccesary re-renders only update the entire table
      // if new data from the server has arrived,
      // otherwise child component will update by connecting to the redux store
      return this.state !== nextState;
    }

    updateOptions() {
      this.options = _.merge({}, DEFAULT_OPTIONS, this.props.options);

      // set the default state options in redux store on every app reload
      const stateOptions = this.options.state;
      this.props.setPageLength({ pageLength: stateOptions.initialPageLength });
      this.props.setPreTransforms({ transforms: stateOptions.preTransforms });
      this.props.setPostTransforms({ transforms: stateOptions.postTransforms });
      this.props.addVisibleColumns({
        columns: stateOptions.initialVisibleColumns
      });
    }

    updateData({ transforms, offset, pageLength, setIsLoading }) {
      ++this.loadingCounter;
      setIsLoading(true);
      return fetch(this.options.queryUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          length: pageLength,
          offset,
          transforms
        })
      })
        .then(response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        })
        .then(data => {
          --this.loadingCounter;
          if (this.loadingCounter === 0) {
            setIsLoading(false);
            this.setState({
              ...data
            });
          }
        })
        .catch(e => {
          --this.loadingCounter;
          if (this.loadingCounter === 0) {
            setIsLoading(false);
            this.setState({
              error: e.toString()
            });
          }
          throw e;
        });
    }

    render() {
      if (_.isEmpty(this.state))
        return null;

      const { component: Layout, ...layoutOptions } = this.options.layout;

      const table = (
        <Table
          dtypes={this.state.dtypes}
          data={this.state.data}
          error={this.state.error}
          dataCount={this.state.dataCount}
          options={this.options.table}
        />
      );
      const transforms = (
        <Transforms
          options={this.options.transforms}
          dtypes={this.state.dtypes}
          errors={this.state.errors}
          sideResults={this.state.sideResults}
        />
      );

      return (
        <Layout table={table} transforms={transforms} options={layoutOptions} />
      );
    }
  }
)
