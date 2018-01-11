import json
import os
import re
from datetime import datetime, date
from pynorama.exceptions import (JSONRequestBodyRequired, ViewNotFound,
                                 RecordNotFound)

from bson import ObjectId
from flask import Flask, request, render_template, Response, redirect, url_for, flash

from .sessions import InMemorySessionStore
from .view import get_view, list_views
from .logging import logger


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, date):
            return obj.isoformat()
        if ObjectId and isinstance(obj, ObjectId):
            return str(obj)
        return super(JSONEncoder, self).default(obj)


def dumps(data, **kwargs):
    return JSONEncoder(**kwargs).encode(data)


def show_views():
    """Simple views index"""
    webpack_dev_port = request.args.get('webpack_dev_port')
    return render_template(
        'index.html',
        webpack_dev_port=webpack_dev_port,
        domain=request.host.split(':')[0],
        views=list_views()
    )


def find_views():
    """JSON endpoint returning view name to view metadata mapping

    Allows filtering of view name by regular expression supplied as a 'query'
    parameter.
    """
    query = request.args.get('query', '.*')
    pattern = re.compile(query)
    return dumps(
        [{'name': view.get_name(),
          'description': view.get_description(),
          'metadata': view.get_metadata()
          }
         for view in list_views()
         if pattern.match(view.get_name())]
    )


def show_pynorama_view(view_name):
    """Return the desired pynorama view by rendering an HTML template.

    In addition to the parameter in the url (view_name), there are two
    optional GET parameter 'session' and 'debug'.
    'session' can refer to a previously saved session of that view,
    and the view is initialized with the state of that session.
    'webpack_dev_port' tells pynorama that a webpack server continuously supplies the
    javascript and defines the port of the webpack debug server.

    Args:
        view_name:  parameter in the url that distinguishes between views
                    (see url rules).
    """
    view = get_view(view_name)

    session = request.args.get('session')
    webpack_dev_port = request.args.get('webpack_dev_port')

    template = 'pynorama_view.html'

    view_config = view.get_config()
    view_config_string = dumps(view_config)

    state_string = _session_store.get_sessions(view.get_name()).get(session, '{}')

    return render_template(template,
                           webpack_dev_port=webpack_dev_port,
                           domain=request.host.split(':')[0],
                           view_name=view_name,
                           view_config=view_config_string,
                           initial_state=state_string)


def get_pipeline(view_name):
    """Transforms the stages defined in the given view and sends it as json.

    This will be used to render the stage graph.
    """
    view = get_view(view_name)

    pipeline = view.get_pipeline().copy()

    edges = []
    for name in pipeline:
        stage = pipeline[name]
        stage['id'] = name
        if 'parents' in stage:
            parents = stage['parents']
            edges += [{'from': parent, 'to': name} for parent in parents]

    return dumps({'nodeMapping': pipeline, 'edges': edges})


def get_record(view_name):
    """For a stage and key returns the record defined by the view."""
    view = get_view(view_name)

    stage = request.args.get('stage')
    key = request.args.get('key')

    record = view.get_record(key, stage)
    return Response(dumps(record), content_type='application/json')


def get_table(view_name):
    """Returns the contents of the data table given transforms that were applied.

    The transforms are sent as json in the body of the POST request.
    """
    if not request.is_json:
        raise JSONRequestBodyRequired()

    data = get_view(view_name)

    json_data = request.get_json(cache=False)

    transforms = json_data.get('transforms')
    offset = json_data.get('offset')
    length = json_data.get('length')

    table = data.get_table()

    results_table, transforms_errors, side_results = \
        table.process_transforms(transforms)

    results_count = len(results_table)
    try:
        page_table = results_table.apply_bounds(offset, length)

        df = page_table.to_pandas()
    except Exception as e:
        return '''{ "error": "%s" }''' % str(e)
    dtypes = df.dtypes

    return '''{ "data": %s,
                "dataCount": %s,
                "errors": %s,
                "dtypes": %s,
                "sideResults": %s }''' % \
           (df.to_json(orient='split'),
            results_count,
            dumps(transforms_errors),
            dtypes.to_json(),
            dumps(side_results))


def reload_view(view_name):
    """Reloads a view.

    Triggered by a POST request sent when the user clicks on the Reload button.
    """
    # TODO, in debug reload the resource
    view = get_view(view_name)
    view.load()
    return '', 200


def reload_all_views():
    """Reload all views.

    Triggered by POST request sent when the user clicks on Reload views button
    """
    for view in list_views():
        try:
            view.load()
        except Exception as e:
            logger.error(e)
            flash('Error loading {}: {}'.format(view.get_name(), str(e)))
    return redirect(url_for('.index'))


def get_sessions(view_name):
    """Returns a JSON-serialized list of names of all stored sessions."""
    view = get_view(view_name)
    sessions = _session_store.get_sessions(view.get_name())
    return dumps(sessions.keys())


def add_session(view_name):
    """Adds another session to the session store.

    The session is given as JSON containing a name and
    a string containing the string representing the JSON-serialized state of
    the front-end.
    """
    if not request.is_json:
        raise JSONRequestBodyRequired()

    view = get_view(view_name)

    json_data = request.get_json(cache=False)

    session_name = json_data['session']
    state = json_data['state']

    sessions = _session_store.get_sessions(view.get_name())
    sessions[session_name] = state
    _session_store.set_sessions(view.get_name(), sessions)

    return '', 200


def remove_session(view_name):
    """Removes the session with the given name from the session store."""
    if not request.is_json:
        raise JSONRequestBodyRequired()

    view = get_view(view_name)

    json_data = request.get_json(cache=False)

    session_name = json_data['session']
    sessions = _session_store.get_sessions(view.get_name())
    del sessions[session_name]
    _session_store.set_sessions(view.get_name(), sessions)
    return '', 200


def get_state(view_name):
    """Returns the string representing the state of the front-end for
    a given session."""
    view = get_view(view_name)

    session_name = request.args['session']
    sessions = _session_store.get_sessions(view.get_name())
    return sessions[session_name]


def handle_record_not_found(error):
    """Response to when the view was not found."""
    return '''Record for key '%s' and stage '%s' not found''' % (
    error.key, error.stage), 400


def handle_view_not_found(error):
    """Response to when the view was not found."""
    return '''data set '%s' not found''' % error.view_name, 400


def handle_json_request_body_required(error):
    """Response to when request contains no JSON."""
    return 'JSON request body required', 400


_session_store = None


def make_server(session_store=InMemorySessionStore()):
    """ Creates the Flask app that powers the Pynorama backend.

        Args:
            session_store: subclass of pynorama.sessions.SessionStore,
                           defaults to InMemorySessionStore, for which sessions
                           are lost if the server is shut down. Provide
                           another store for permanent storage.
    """

    global _session_store
    _session_store = session_store

    pynorama_folder = os.path.dirname(__file__)
    app = Flask("pynorama", root_path=pynorama_folder)

    app.register_error_handler(RecordNotFound, handle_record_not_found)
    app.register_error_handler(ViewNotFound, handle_view_not_found)
    app.register_error_handler(JSONRequestBodyRequired,
                               handle_json_request_body_required)

    base_string = '/view/<string:view_name>/'
    GET_rules = {
        '': show_pynorama_view,
        'pipeline': get_pipeline,
        'record': get_record,
        'get_sessions': get_sessions,
        'get_state': get_state
    }
    POST_rules = {
        'table': get_table,
        'reload': reload_view,
        'add_session': add_session,
        'remove_session': remove_session,
    }

    for key, value in GET_rules.iteritems():
        app.add_url_rule(base_string + key,
                         key or 'main',
                         value,
                         methods=['GET'])
    for key, value in POST_rules.iteritems():
        app.add_url_rule(base_string + key,
                         key or 'main',
                         value,
                         methods=['POST'])

    app.add_url_rule('/', 'index', show_views, methods=['GET'])
    app.add_url_rule('/reload/', 'reload_all', reload_all_views, methods=['POST'])
    app.add_url_rule('/views/', 'list', find_views, methods=['GET'])

    return app
