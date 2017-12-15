import React from "react";

import DefaultHeader from "./presenters/default_header";
import DefaultRow from "./presenters/default_row";
import DefaultLayout from "./presenters/default_layout";
import DefaultFooter from "./presenters/default_footer";
import {default as resolve_renderer} from "./presenters/cells"

// These are a guide to how the final options should look.
// Note: not all of these are implemented at the moment,
// especially the options for cells and headers.


export default {
  layout: {
    component: DefaultLayout
  },
  queryUrl: null,
  state: {
    preTransforms: [
      // transforms that are fixed and can't be moved
    ],
    postTransforms: [
      // transforms that are fixed and can't be moved
    ],
    initialPageLength: 15,
    initialVisibleColumns: []
  },
  transforms: {
    toolbox: {
      clearButton: true,
      available: []
    }
  },
  table: {
    showIndex: true,
    rows: {
      component: DefaultRow,
      hoverHighlight: true,
      clickableCursor: true,
      onClick: null
    },
    headers: {
      renderers: [
        (props, options, getNextRenderer) => (
          <DefaultHeader {...props} options={options} />
        )
      ],
      all: {
        trim: 40 // TODO
      },
      index: {
        // override 'all'
        displayName: "index"
      }
    },
    cells: {
      renderers: [
        resolve_renderer
      ],
      all: {
        roundFloats: 2, // TODO
        dateFormat: null // TODO
      }
    },
    footer: {
      component: DefaultFooter,
      pageLengths: [15, 20, 50, 100, 150] // TODO
    }
  }
};
