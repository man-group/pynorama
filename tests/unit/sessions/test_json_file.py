pytest_plugins = ['pytest_shutil']

import os

from pynorama.sessions import JsonFileSessionStore
from json import load


def test_load_sessions(workspace):
    raw_session = """
    {"foo": "bar", "xyz": 1, "someday": "2017-12-19T13:18:44.745Z"}
    """

    with open(os.path.join(workspace.workspace, 'test.json'), 'w') as f:
        f.write(raw_session)

    store = JsonFileSessionStore(workspace.workspace)
    session_data = store.load_sessions('test')
    assert {"foo": "bar", "xyz": 1, "someday": "2017-12-19T13:18:44.745Z"} == session_data


def test_save_sessions(workspace):
    store = JsonFileSessionStore(workspace.workspace)
    expected = {"foo": "bar", "xyz": 1, "someday": "2017-12-19T13:18:44.745Z"}
    store.save_sessions('test', expected)

    with open(os.path.join(workspace.workspace, 'test.json'), 'r') as f:
        actual = load(f)

    assert actual == expected
