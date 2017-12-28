from mock import sentinel
from pynorama.sessions.memory import InMemorySessionStore


def test_memory_session_store_get_and_set_sessions():
    store = InMemorySessionStore()
    store.set_sessions(sentinel.view_name, sentinel.sessions)
    assert sentinel.sessions == store.get_sessions(sentinel.view_name)


def test_memory_session_store_get_sessions_nonexistent():
    store = InMemorySessionStore()
    assert {} == store.get_sessions(sentinel.view_name)
