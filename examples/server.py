from pynorama import register_view, make_server
from reuters import ReutersView

app = make_server()

register_view(ReutersView())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5051, threaded=True)
