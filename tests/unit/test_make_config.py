from pynorama.make_config import make_config


def test_make_config():
    config = make_config('a',
                         show_index=False,
                         available_transforms=['sort', 'search'],
                         initial_visible_columns=['a', 'c'])
    expected = {
        'datatable': {
            'state': {
                'initialVisibleColumns': ['a', 'c']
            },
            'transforms': {
                'toolbox': {
                    'available': ['sort', 'search']
                }
            },
            'table': {
                'show_index': False,
                'rows': {
                    'keyField': 'a'
                }
            }
        }
    }
    assert expected == config
