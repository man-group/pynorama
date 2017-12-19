from .base_store import SessionStore


class MongoSessionStore(SessionStore):
    """Permanent sessions store using a MongoDB collection.

    Manages a record for each view in the mongo collection
    that is accessed using the name of the view.

    Args:
        collection: a pymongo collection.
    """

    def __init__(self, collection):
        super(MongoSessionStore, self).__init__()
        self.collection = collection

    def load_sessions(self, view_name):
        record = self.collection.find_one({'view_name': view_name})
        return record.get('sessions', {})

    def save_sessions(self, view_name, sessions):
        self.collection.update_one(
            {'view_name': view_name},
            {'$set': {'view_name': view_name, 'sessions': sessions}},
            upsert=True)
