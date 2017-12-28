from .base_store import SessionStore


class InMemorySessionStore(SessionStore):
    """Primitive session store that only uses transient application memory."""
    def __init__(self):
        super(InMemorySessionStore, self).__init__()

    def load_sessions(self, view_name):
        return {}

    def save_sessions(self, view_name, sessions):
        pass
