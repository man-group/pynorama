class SessionStore(object):
    """Basic functions for storing the sessions of all views.

    Sessions are defined per view and store the state of the front-end user interface.

    To define a new storage format, inherit SessionStore and implement
    save_sessions and load_sessions.

    Sessions are stored as a dictionary mapping the session name to a string
    of the JSON-serialized state.

    Sessions are only loaded after initialization and then kept in a local cache.
    Every time the sessions are changed, i.e. a session was removed or added,
    the cache is updated and the storage is called to be updated.
    """

    def __init__(self):
        self.sessions = {}

    def save_sessions(self, view_name, sessions):
        """Save the sessions somewhere. To be overriden by derived class.

        Args:
            sessions:   a dictionary mapping the session name to a string of the
                        JSON-serialized state.
        """
        raise NotImplementedError(
            'Please implement save_sessions in your SessionStore derived class')

    def load_sessions(self, view_name):
        """Load the sessions from somewhere. To be overriden by derived class.

        Returns:
            a dictionary mapping the session name to a string of the
            JSON-serialized state.
        """
        raise NotImplementedError(
            'Please implement load_sessions in your SessionStore derived class')

    def get_sessions(self, view_name):
        """Returns cache or calls load_sessions if cache uninitialised."""
        if view_name not in self.sessions:
            self.sessions[view_name] = self.load_sessions(view_name)
        return self.sessions[view_name]

    def set_sessions(self, view_name, sessions):
        """Updates both the cache and the storage by calling save_sessions."""
        self.sessions[view_name] = sessions
        self.save_sessions(view_name, sessions)
