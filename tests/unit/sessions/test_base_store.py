import pytest
from mock import sentinel
from pynorama.sessions.base_store import SessionStore


class MockSessionStore(SessionStore):
    def save_sessions(self, view_name, sessions):
        pass

    def load_sessions(self, view_name):
        pass


def test_base_session_store_save_sessions():
    store = SessionStore()
    with pytest.raises(NotImplementedError) as e:
        store.save_sessions(sentinel.view_name, sentinel.sessions)
    assert 'Please implement save_sessions' in str(e)


def test_base_session_store_load_sessions():
    store = SessionStore()
    with pytest.raises(NotImplementedError) as e:
        store.load_sessions(sentinel.view_name)
    assert 'Please implement load_sessions' in str(e)


def test_base_session_store_get_and_set_sessions():
    store = MockSessionStore()
    store.set_sessions(sentinel.view_name, sentinel.sessions)
    assert sentinel.sessions == store.get_sessions(sentinel.view_name)
