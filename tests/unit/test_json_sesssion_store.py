pytest_plugins = ['pytest_shutil']

from pynorama.sessions import JsonFileSessionStore
from datetime import datetime
from json import load


def test_load_sessions(workspace):
    raw_session = """
    {"foo": "bar", "xyz": 1, "someday": "2017-12-19T13:18:44.745Z"}
    """

    with open(workspace.workspace + '/test.json', 'w') as f:
        f.write(raw_session)

    store = JsonFileSessionStore(workspace.workspace)
    session_data = store.load_sessions('test')
    assert cmp({"foo": "bar", "xyz": 1, "someday": "2017-12-19T13:18:44.745Z"},
               session_data) == 0

def test_save_sessions(workspace):
    store = JsonFileSessionStore(workspace.workspace)
    expected = {"foo": "bar", "xyz": 1, "someday": "2017-12-19T13:18:44.745Z"}
    store.save_sessions('test',
                        expected)

    with open(workspace.workspace + '/test.json', 'r')  as f:
        actual = load(f)

    assert cmp(actual, expected) == 0

