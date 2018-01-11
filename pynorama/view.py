from collections import OrderedDict
from .exceptions import ViewNotFound
from .logging import logger


views = OrderedDict()


def register_views(*args):
    views.update({view.get_name(): view for view in args})
    for view in args:
        view.load()


def register_view(view):
    views[view.get_name()] = view
    try:
        view.load()
    except Exception as e:
        logger.error('Error loading {}: {}'.format(view.get_name(), e))


def get_view(name):
    if name not in views:
        raise ViewNotFound(name)
    return views[name]


def list_views():
    return [view for _, view in views.iteritems()]


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

    def get_metadata(self):
        return {}
