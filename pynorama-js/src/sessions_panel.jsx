import React from "react";
import { connect } from "common/redux_ext";

import {
  HorizontalResizer,
  HorizontalPanel,
  HorizontalStack,
  CloseableHeader,
  VisibilityToggle
} from "common/components";
import { getters, actions } from "view_state";

import {
  ButtonGroup,
  Button,
  InputGroup,
  FormControl,
  ListGroup,
  ListGroupItem,
  Glyphicon
} from "react-bootstrap";

import _ from "lodash";

const minWidth = "200px";
const maxWidth = null;
const initialWidth = "300px";

const SESSION_PREFIX = "session_";

const SessionsPresenter = ({
  applySession,
  removeSession,
  addSession,
  sessions
}) => {
  if (!sessions) {
    sessions = [];
  }
  const list = sessions.map(item => {
    return (
      <Button onClick={() => applySession(item)} key={item}>
        <CloseableHeader
          onClose={e => {
            removeSession(item);
            e.stopPropagation();
          }}
        >
          {item}
        </CloseableHeader>
      </Button>
    );
  });
  const onFormSubmit = e => {
    e.preventDefault();
    addSession(e.target.session.value);
    e.target.session.value = "";
  };

  const marginStyle = { margin: "5px" };
  return (
    <div>
      <div style={marginStyle}>
        <ButtonGroup vertical block>
          {list}
        </ButtonGroup>
      </div>
      <div style={marginStyle}>
        <form onSubmit={onFormSubmit}>
          <InputGroup>
            <FormControl
              name="session"
              type="text"
              placeholder="session name"
            />
            <InputGroup.Button>
              <Button type="submit">Add</Button>
            </InputGroup.Button>
          </InputGroup>
        </form>
      </div>
    </div>
  );
};

const SessionsDataProvider = connect({
  isReloading: getters.isReloading,
  globalState: getters.globalState,
  setGlobalState: actions.setGlobalState
})(
  class SessionsDataProvider extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};

      this.applySession = this.applySession.bind(this);
      this.removeSession = this.removeSession.bind(this);
      this.addSession = this.addSession.bind(this);
    }

    componentDidMount() {
      this.updateData();
    }

    updateData() {
      // TODO: deal with errors
      fetch("get_sessions")
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
          this.setState({ sessions: data });
        });
    }

    addSession(session) {
      fetch("add_session", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session,
          state: JSON.stringify(this.props.globalState)
        })
      }).then(response => {
        this.updateData();
      });
    }

    removeSession(session) {
      fetch("remove_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ session })
      }).then(response => {
        this.updateData();
      });
    }

    applySession(session) {
      fetch(`get_state?session=${encodeURI(session)}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      })
        .then(response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        })
        .then(state => {
          this.props.setGlobalState({ state });
        });
    }

    componentWillReceiveProps(nextProps) {
      if (
        nextProps.isReloading != this.props.isReloading &&
        !nextProps.isReloading
      ) {
        this.updateData();
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return (
        nextProps.isReloading != this.props.isReloading ||
        nextState.sessions != this.state.sessions
      );
    }

    render() {
      return (
        <SessionsPresenter
          applySession={this.applySession}
          removeSession={this.removeSession}
          addSession={this.addSession}
          sessions={this.state.sessions}
        />
      );
    }
  }
);

export const SessionsPanel = connect({
  isVisible: getters.isSessionsPanelVisible,
  closePanel: actions.closeSessionsPanel
})(({ isVisible, closePanel }) => {
  const header = (
    <div className="panelheader">
      <CloseableHeader onClose={closePanel}>
        <span className="header-nowrap">Sessions - {window.viewName}</span>
      </CloseableHeader>
    </div>
  );
  return (
    <VisibilityToggle isVisible={isVisible}>
      <HorizontalResizer
        minWidth={minWidth}
        maxWidth={maxWidth}
        initialWidth={initialWidth}
      >
        <HorizontalPanel header={header}>
          <SessionsDataProvider />
        </HorizontalPanel>
      </HorizontalResizer>
    </VisibilityToggle>
  );
});
