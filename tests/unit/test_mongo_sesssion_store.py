from pynorama.sessions import MongoSessionStore
from datetime import datetime
from pytest_mongodb.plugin import mongodb
from mongomock.mongo_client import MongoClient

def test_load_sessions(mongodb):
    assert 'sessions' in mongodb.collection_names()
    sesstion_data = MongoSessionStore(mongodb.sessions).load_sessions('test')
    assert cmp({"foo": "bar", "xyz": 1, "someday": "2017-12-19T13:18:44.745Z"},
               sesstion_data) == 0

def test_save_sessions():
    collection = MongoClient().db.collection
    store = MongoSessionStore(collection)
    store.save_sessions('test', {
        "foo": "bar",
        "xyz": 1,
        "someday": "2017-12-19T13:18:44.745Z"
    })

    assert collection.count() == 1
    views_data = collection.find_one()
    assert 'view_name' in views_data
    assert views_data.get('view_name') == 'test'
    assert cmp({"foo": "bar", "xyz": 1, "someday": "2017-12-19T13:18:44.745Z"},
               views_data.get('sessions')) == 0



