import React from "react";
import { render } from "react-dom";

import { createStore } from "common/redux_ext";
import { Provider } from "react-redux";

import { Workspace } from "layout";

import "bootstrap/dist/css/bootstrap.min.css";

let store = createStore(window.initialState || {});

render(
    <Provider store={store}>
      <Workspace />
    </Provider>,
  document.getElementById("main-div")
);
