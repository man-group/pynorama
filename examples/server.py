from pynorama import register_view, make_server
from reuters import ReutersView


if __name__ == '__main__':
    app = make_server()
    register_view(ReutersView())
    app.run(host='0.0.0.0', port=5051, threaded=True)
