class JSONRequestBodyRequired(Exception):
    pass


class ViewNotFound(Exception):
    def __init__(self, view_name):
        Exception.__init__(self)
        self.view_name = view_name


class RecordNotFound(Exception):
    def __init__(self, key, stage):
        Exception.__init__(self)
        self.key = key
        self.stage = stage
