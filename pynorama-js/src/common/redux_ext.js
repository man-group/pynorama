/*
  redux_ext is a layer of abstraction on top of the redux library,
  that allows for a nicer definition of reducers, actions and getters
  and thus providers better separation of state logic and presentational components.

  All classes defined in redux_ext are immutable and return new instances,
  if properties are altered with methods.
*/
import {
  createStore as reduxCreateStore,
  applyMiddleware,
  compose
} from "redux";
import { connect as reduxConnect } from "react-redux";

/*
  global objects that maps action types to reducer functions
*/
const reducers = {};

/*
  not re-instantiating objects and arrays for immutable objects
  saves some performance
*/
export const EMPTY_ARR = [];
export const EMPTY_OBJ = {};

/*
  This function replaces react-redux's connect.
  Instead of taking two functions mapState2Props and mapDispatch2Props,
  it accepts a single mapping, which should be a mapping of getter and setter objects.
  It will then create the mapState2Props and mapDispatch2Props and will return the
  configured redux connect function.

  The mapping can be a
  - mapping of
    - getters or setters or
    - functions returning a getter or a setter
  - or a function returning such a mapping
*/
export const connect = function(mapping) {
  const state2props = (state, ownProps) => {
    let localMapping = mapping;
    if (typeof localMapping == "function") {
      localMapping = localMapping(ownProps);
    }
    let res = {};
    for (let key in localMapping) {
      let localRes = localMapping[key];
      if (typeof localRes == "function") {
        localRes = localRes(ownProps);
      }
      if (localRes instanceof Getter) {
        res[key] = localRes.get(state);
      }
    }
    return res;
  };
  const dispatch2props = (dispatch, ownProps) => {
    let localMapping = mapping;
    if (typeof localMapping == "function") {
      localMapping = localMapping(ownProps);
    }
    let res = {};
    for (let key in localMapping) {
      let localRes = localMapping[key];
      if (typeof localRes == "function") {
        localRes = localRes(ownProps);
      }
      if (localRes instanceof Action) {
        let action = localRes;
        res[key] = (...args) => dispatch(action.get(action.mapping(...args)));
      }
    }
    return res;
  };
  return reduxConnect(state2props, dispatch2props);
};

/*
  Will create getters out of an object, which can be either
  - an object of named functions
  - a list of named functions
  - a ReduxExt Mapping or Getter or Setter
  - a named function
  - a anonymous function when the second parameter that names the type of the getter

  The returned object has the same structure as the given object,
  i.e. will return an object for an object,
  an array for an array,
  a single getter for a single getter.
*/
export function makeGetters(mapping, type) {
  if (_.isFunction(mapping)) {
    return new Getter(mapping, type);
  } else if (
    mapping instanceof ReduxExtImmutable ||
    mapping instanceof Mapping
  ) {
    return mapping;
  } else if (_.isArray(mapping)) {
    return new _.map(mapping, value => makeGetters(value));
  } else if (_.isPlainObject(mapping)) {
    return new Mapping(
      _.mapValues(mapping, (value, key) => makeGetters(value, key))
    );
  }
  throw new Error("Unexpected type. Can't create getters.");
}

/*
  Similar to makeGetters,
  only that it creates actions out of a mapping of reducer functions,
  rather than getters out of getter functions.
*/
export function makeActions(mapping, type) {
  if (_.isFunction(mapping)) {
    return new Action(mapping, type);
  } else if (
    mapping instanceof ReduxExtImmutable ||
    mapping instanceof Mapping
  ) {
    return mapping;
  } else if (_.isArray(mapping)) {
    return new _.map(mapping, value => makeActions(value));
  } else if (_.isPlainObject(mapping)) {
    return new Mapping(
      _.mapValues(mapping, (value, key) => makeActions(value, key))
    );
  }
  throw new Error("Unexpected type. Can't create getters.");
}

/*
  Base class of getters and setters
  that established the immutable nature of the Getter and Setter classes.
  Both share that they can be specialised with options and a scope.
*/
class ReduxExtImmutable {
  constructor() {
    this.options = EMPTY_OBJ;
    this.scope = EMPTY_ARR;
  }

  clone() {
    return _.clone(this);
  }

  withOptions(options) {
    const clone = this.clone();
    clone.options = { ...this.options, ...options };
    return clone;
  }

  withScope(scope, how = "replace") {
    const clone = this.clone();
    clone.scope = extendScope(this.scope, scope, how);
    return clone;
  }
}

/*
  very useful function for altering scope or options of shallow object
  of getters&setters2props mapping (the first parameter of ReduxExt's connect),
  as subsequently withScope or withOptions can be called on the whole mapping.

*/
export function all(mapping) {
  return new Mapping(mapping);
}

/*
  provide functionality that withScope and withOptions can be applied to
  each element of an object (i.e. mapping)
*/
class Mapping {
  constructor(mapping) {
    _.forEach(mapping, (val, key) => {
      if (!(val instanceof ReduxExtImmutable || val instanceof Mapping)) {
        throw new Error(`ReduxExt property ${key} is invalid`);
      }
    });
    Object.assign(this, mapping);
  }

  clone() {
    return _.clone(this);
  }

  withMappedProperties(func) {
    const clone = this.clone();
    return Object.assign(clone, _.mapValues(this, func));
  }

  withScope(scope, how = "replace") {
    return this.withMappedProperties(element => element.withScope(scope, how));
  }

  withOptions(options) {
    return this.withMappedProperties(element => element.withOptions(options));
  }
}

/*
  getters have to provide a get function,
  a pure function which maps (state, options, get) => property.

  The parameter 'state' can be scoped by the action using 'withScope'
  (i.e. the get function is not given the global state but only a part of the state).
  and 'options' can be configured by the action using 'withOptions'.
*/
export class Getter extends ReduxExtImmutable {
  constructor(getterFunction, type = null) {
    super();

    this.type = type || getterFunction.name;

    if (!this.type) {
      throw Error("Please provide a named function for the getter.");
    }

    this.getterFunction = getterFunction;
  }

  get(state) {
    return this.getterFunction(
      applyScope(state, this.scope),
      this.options,
      getter => getter.get(state),
      this.scope
    );
  }
}

const DEFAULT_MAPPING_FUNCTION = obj => obj;

/*
  actions have to provide a reducer,
  a pure function which maps (state, options, get) => nextState or another action,
  whose reducer is then executed.

  The parameter 'state' can be scoped by the action using 'withScope'
  (i.e. the reducer is not given the global state but only a part of the state).
  and 'options' can be configured by the action using 'withOptions'.
*/
export class Action extends ReduxExtImmutable {
  constructor(reducer = null, type = null) {
    super();

    if (reducer) {
      this.type = type || reducer.name;
      if (!this.type) {
        throw Error("Please provide a named function for the reducer.");
      }
      this.reducer(reducer);
    } else {
      this.type = type;
      if (!this.type) {
        throw Error("Please provide a type name for your action.");
      }
    }

    this.mapping = DEFAULT_MAPPING_FUNCTION;
  }

  get(options) {
    return { ...this.options, ...options, type: this.type, scope: this.scope };
  }

  withMapping(mapping) {
    const clone = this.clone();
    clone.mapping = mapping;
    return clone;
  }

  reducer(reducer) {
    reducers[this.type] = (state, action) => {
      let { type, scope, ...actionOptions } = action;

      let result = reducer(
        applyScope(state, scope),
        actionOptions,
        getter => getter.get(state),
        scope
      );

      if (result instanceof Action) {
        return topLevelReducer(state, result.get());
      } else {
        return reduceScope(state, result, scope);
      }
    };
  }
}

/*
  scopes can be given as simple strings as parameters,
  but they should always be internally converted to arrays,
  so their format is consistent and they can be concatenated.
*/
function _toScopeArray(scope) {
  if (scope instanceof Array) {
    return scope;
  }
  if (!scope) {
    return EMPTY_ARR;
  }
  return [scope];
}

/*
  merges scopes that can either be arrays of strings or a single string.

  examples:
  base  | extension | how          | result
  ["a"] | ["b","c"] | "push_front" | ["b", "c", "a"]
   "a"  | ["b","c"] | "push_back"  | ["a", "b", "c"]
  ["a"] |    "b"    | "replace"    | ["b"]
*/
function extendScope(base, extension, how) {
  if (how !== "push_front" && how !== "push_back" && how !== "replace") {
    throw Error(`Parameter 'how' has to be either 'push_front', 'push_back' or 'replace'
                 when extending scopes`);
  }

  if (how === "replace") {
    return _toScopeArray(extension);
  }
  const baseArr = _toScopeArray(how === "push_front" ? base : extension);
  const extensionArr = _toScopeArray(how === "push_back" ? base : extension);
  return [...baseArr, ...extensionArr];
}

/*
  example:
    const a={
      b: {d: 3},
      c: {d: 4}
    }
    const x = applyScope(a, "b")
  -> x would be {d: 3}
*/
export function applyScope(state = {}, scope) {
  for (let i = 0; i < scope.length; ++i) {
    state = state[scope[i]] || EMPTY_OBJ;
  }
  return state;
}

/*
  example:
    const a={
      b: {d: 3},
      c: {d: 4}
    }
    const x = applyScope(a, {d: 5}, "b")
  -> x would be {
    b: {d: 5}.
    c: {d: 4}
  }
*/
export function reduceScope(state, result, scope) {
  if (scope.length > 0) {
    return {
      ...state,
      [scope[0]]: reduceScope(
        state[scope[0]] || EMPTY_OBJ,
        result,
        scope.slice(1)
      )
    };
  } else {
    return result;
  }
}

/*
 if user dispatches actions directly, e.g.
 store.dispatch(myAction), they will be properly executed
*/
function actionMiddleware({ dispatch, getState }) {
  return next => action => {
    if (action instanceof Action) {
      return dispatch(action.get());
    }
    return next(action);
  };
}

/*
  the overall reducer that looks for the appropriate reducer for that
  action type.
*/
function topLevelReducer(state, action) {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }
  // TODO: log this
  return state;
}

/*
  creates a store that with an initial state,
  that can work with ReduxExt's Actions.
  The store is by default visible in the Redux debug tools.
*/
export function createStore(initialState = {}) {
  // TODO: parameterize this
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  let store = reduxCreateStore(
    topLevelReducer,
    initialState,
    composeEnhancers(applyMiddleware(actionMiddleware))
  );

  store.get = function(getter) {
    return getter.get(store.getState());
  };
  return store;
}
