import os
import json

from .base_store import SessionStore


class JsonFileSessionStore(SessionStore):
    """Permanent sessions store using json files.

    For each view manages a json file storing the view's state in a given folder.

    Args:
        directory_path: the directory to store the file.
    """
    def __init__(self, directory_path):
        super(JsonFileSessionStore, self).__init__()
        self.directory_path = directory_path

    def load_sessions(self, view_name):
        filepath = os.path.join(self.directory_path, view_name + '.json')
        contents = '{}'
        if os.path.isfile(filepath):
            with open(filepath, 'r') as f:
                contents = f.read()
        return json.loads(contents)

    def save_sessions(self, view_name, sessions):
        filepath = os.path.join(self.directory_path, view_name + '.json')
        json_string = json.dumps(sessions)
        with open(filepath, 'w') as f:
            f.write(json_string)
