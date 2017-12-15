/*
  Defines the state of the DataTable.

  Given that DataTables have no id or name property and share the same scope,
  only one DataTable per redux store is possible at the moment.
*/
import { makeActions, makeGetters } from "common/redux_ext";

import _ from "lodash";

const DATA_TABLE_SCOPE = "datatable";
const DEFAULT_PAGE_LENGTH = 15;
const DEFAULT_TRANSFORMS = [];

const DEFAULT_VISIBLE_COLUMNS = [];

export const getters = makeGetters({
  page(state) {
    return state.page || 1;
  },
  offset(state, {}, get) {
    return Math.floor((get(getters.page) - 1) * get(getters.pageLength));
  },
  visibleColumns(state) {
    return state.visibleColumns || DEFAULT_VISIBLE_COLUMNS;
  },
  pageLength(state) {
    return state.pageLength || DEFAULT_PAGE_LENGTH;
  },
  transforms(state) {
    return state.transforms || DEFAULT_TRANSFORMS;
  },
  isSorted(state, { column }, get) {
    let transforms = get(getters.transforms);
    let sort = _.findLast(transforms, t => t.type === "sort");
    if (sort && sort.column == column) {
      return sort.ascending ? "ascending" : "descending";
    }
    return null;
  },
  isLoading(state) {
    return state.isLoading || false;
  }
}).withScope(DATA_TABLE_SCOPE);

const moveTransform = makeActions(function moveTransform(
  state,
  { index, offset },
  get
) {
  const transforms = get(getters.transforms);
  const { pre = [], post = [], middle = [] } = _.groupBy(
    transforms,
    t => t.position || "middle"
  );

  const indexInNormal = index - pre.length;
  if (indexInNormal > -1 && indexInNormal < middle.length) {
    const transform = middle[indexInNormal];
    // positive modulus division
    const newIndex =
      ((index + offset) % middle.length + middle.length) % middle.length;

    middle.splice(index, 1);
    middle.splice(newIndex, 0, transform);
    return setTransforms.withOptions({
      transforms: middle,
      position: "middle"
    });
  }
  return state;
});

const setTransforms = makeActions(function setTransforms(
  state,
  { transforms, position },
  get
) {
  const prevTransforms = get(getters.transforms);
  const { pre = [], post = [], middle = [] } = _.groupBy(
    prevTransforms,
    t => t.position || "middle"
  );

  switch (position) {
    case "pre": {
      const fixedTransforms = transforms.map(transform => ({
        ...transform,
        position: "pre"
      }));
      return { ...state, transforms: [...fixedTransforms, ...middle, ...post] };
    }
    case "post": {
      const fixedTransforms = transforms.map(transform => ({
        ...transform,
        position: "post"
      }));
      return { ...state, transforms: [...pre, ...middle, ...fixedTransforms] };
    }
    case "middle": {
      return { ...state, transforms: [...pre, ...transforms, ...post] };
    }
    default: {
      return state;
    }
  }
}).withScope(DATA_TABLE_SCOPE);

export const actions = makeActions({
  changePage(state, { page }) {
    return { ...state, page };
  },
  toggleSort(state, { column }, get) {
    const transforms = get(getters.transforms);
    const index = _.findLastIndex(transforms, t => t.type === "sort");
    if (index < 0) {
      return actions.addTransform.withOptions({
        transform: {
          type: "sort",
          column,
          ascending: true
        }
      });
    } else {
      const sort = transforms[index];
      const updatedSort =
        sort.column === column
          ? { ascending: !sort.ascending }
          : { column, ascending: true };
      return actions.updateTransform.withOptions({
        transform: updatedSort,
        index
      });
    }
  },
  removeTransform(state, { index }, get) {
    const transforms = [...get(getters.transforms)];
    transforms.splice(index, 1);
    return { ...state, transforms };
  },
  removeAllTransforms(state) {
    return setTransforms.withOptions({
      position: "normal",
      transforms: DEFAULT_TRANSFORMS
    });
  },
  setPreTransforms: setTransforms.withOptions({ position: "pre" }),
  setPostTransforms: setTransforms.withOptions({ position: "post" }),
  addTransform(state, { transform }, get) {
    const transforms = get(getters.transforms);
    const { pre = [], post = [], middle = [] } = _.groupBy(
      transforms,
      t => t.position || "middle"
    );

    return {
      ...state,
      transforms: [...pre, ...middle, transform, ...post]
    };
  },
  updateTransform(state, { transform, index }, get) {
    const transforms = [...get(getters.transforms)];
    transforms[index] = { ...transforms[index], ...transform };
    return { ...state, transforms };
  },
  setPageLength(state, { pageLength }) {
    return { ...state, pageLength };
  },
  setVisibleColumns(state, { columns }) {
    return { ...state, visibleColumns: columns };
  },
  addVisibleColumns(state, { columns }, get) {
    return {
      ...state,
      visibleColumns: _.uniq([...get(getters.visibleColumns), ...columns])
    };
  },
  moveTransformUp: moveTransform.withOptions({ offset: -1 }),
  moveTransformDown: moveTransform.withOptions({ offset: 1 }),
  setIsLoading(state, { value }) {
    return { ...state, isLoading: value };
  }
}).withScope(DATA_TABLE_SCOPE);
