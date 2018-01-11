from pynorama.view import register_view, list_views, View


def test_view_order_matches():
    register_view(View(name='view_5', description='View 5 description'))
    register_view(View(name='view_3', description='View 3 description'))
    register_view(View(name='view_2', description='View 2 description'))
    register_view(View(name='view_4', description='View 4 description'))
    register_view(View(name='view_1', description='View 1 description'))
    assert ['view_5', 'view_3', 'view_2', 'view_4', 'view_1'] == [v.get_name() for v in list_views()]
