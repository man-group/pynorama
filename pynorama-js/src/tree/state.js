import _ from 'lodash'

import { makeActions, makeGetters, applyScope, reduceScope } from "common/redux_ext";

const TREE_SCOPE = "tree"
const EMPTY_OBJ = {};
const EMPTY_ARR = [];

export const DEFAULT_DEEP_INDEX = [];
export const DEFAULT_DEEP_LENGTHS = []

const DEFAULT_GROUP = "default_group"

export const getters = makeGetters({
  highlighted(state, {deepIndex=DEFAULT_DEEP_INDEX, group=DEFAULT_GROUP}) {
    const value = ((state[group] || EMPTY_OBJ).highlighted || EMPTY_OBJ)[deepIndex];
    if (value==null)
      return false;
    return value;
  },
  hidden(state, {deepIndex=DEFAULT_DEEP_INDEX, group=DEFAULT_GROUP}) {
    const value = ((state[group] || EMPTY_OBJ).hidden || EMPTY_OBJ)[deepIndex];
    if (value==null)
      return false;
    return value;
  },
  collapsed(state, {deepIndex=DEFAULT_DEEP_INDEX, group=DEFAULT_GROUP}) {
    const groupState = state[group] || EMPTY_OBJ;
    const expanded = groupState.expanded || EMPTY_OBJ;
    const expandedLevels = groupState.expandedLevels || EMPTY_ARR;

    const level = deepIndex.length;
    return ((expanded[level] || EMPTY_OBJ)[deepIndex] || false) ^ (expandedLevels[level] || false) == 0;
  }
}).withScope(TREE_SCOPE);

export const actions = makeActions({
  setHighlight(state, {deepIndex=DEFAULT_DEEP_INDEX, group=DEFAULT_GROUP, value}) {
    return reduceScope(state, value, [group, "highlighted", deepIndex])
  },
  toggleCollapsed(state, {deepIndex=DEFAULT_DEEP_INDEX, group=DEFAULT_GROUP, levelLengths}) {
    let groupState = state[group] || EMPTY_OBJ;
    const expanded = groupState.expanded || EMPTY_OBJ;

    const level = deepIndex.length;

    const expandedLevel = {
      ...expanded[level],
      [deepIndex]: expanded[level] ? !(expanded[level][deepIndex] || false) : true
    };

    if (_(expandedLevel).values().sum() == levelLengths[level]) {
      const expandedLevels = (groupState.expandedLevels || EMPTY_ARR).slice();
      expandedLevels[level] = !(expandedLevels[level] || false);

      const expandedNew = {...expanded, [level]: EMPTY_OBJ};
      return reduceScope(state, {...groupState, expanded: expandedNew, expandedLevels}, [group]);
    } else {
      const expandedNew = {...expanded, [level]: expandedLevel};
      return reduceScope(state, {...groupState, expanded: expandedNew}, [group]);
    }
  },
  expandLevel(state, {group=DEFAULT_GROUP, levelLengths}) {
    const groupState = state[group] || EMPTY_OBJ;
    const expanded = groupState.expanded || EMPTY_OBJ;
    const expandedLevels = (groupState.expandedLevels || EMPTY_ARR).slice();

    for (let i = 0;  i < Math.max(expandedLevels.length, levelLengths.length); ++i) {
      if (!expandedLevels[i]) {
        expandedLevels[i] = true;
        const expandedNew = {...expanded, [i]: EMPTY_OBJ};
        return reduceScope(state, {...groupState, expanded: expandedNew, expandedLevels}, [group]);
      }
    }
    return state;
  },
  collapseLevel(state, {group=DEFAULT_GROUP, levelLengths}) {
    const groupState = state[group] || EMPTY_OBJ;
    const expanded = groupState.expanded || EMPTY_OBJ;
    const expandedLevels = (groupState.expandedLevels || EMPTY_ARR).slice();

    for (let i = 0;  i < Math.max(expandedLevels.length, levelLengths.length); ++i) {
      if (_(expanded[i+1] || EMPTY_OBJ).values().sum() == 0 && !expandedLevels[i+1]) {
        expandedLevels[i] = false;
        const expandedNew = {...expanded, [i]: EMPTY_OBJ};
        return reduceScope(state, {...groupState, expanded: expandedNew, expandedLevels}, [group]);
      }
    }
    return state;
  }
}).withScope(TREE_SCOPE);
