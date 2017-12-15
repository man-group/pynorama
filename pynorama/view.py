from exceptions import ViewNotFound
views = {}

def register_views(*args):
    views.update({view.get_name(): view for view in args})
    for view in args:
        view.load()

def register_view(view):
    views[view.get_name()] = view
    view.load()

def get_view(name):
    if name not in views:
        raise ViewNotFound(name)
    return views[name]


class View(object):
    """Inherit this class to define the data and config of a new pynorama view."""
    def __init__(self, name, description=''):
        self.description = description
        self.name = name

    def get_pipeline(self):
        return {}

    def get_record(self, key, stage):
        return None

    def get_table(self):
        raise NotImplementedError(
            'Please implement get_table in your View derived class.')

    def load(self):
        pass

    def get_config(self):
        return {}

    def get_description(self):
        return self.description

    def get_name(self):
        return self.name
