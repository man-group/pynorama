import numpy as np
import pandas as pd
from pynorama.table.pandas_table import (sample_transform, sort_transform, quantile_range_transform,
                                         nans_transform, search_transform, query_transform,
                                         histogram_transform, PandasTable)


def test_sample_transform():
    original = pd.DataFrame({'distance': [20, 10, 30]}, index=['a', 'b', 'c'])
    transformed = sample_transform(PandasTable(original), {'fraction': 1.0})
    expected = pd.DataFrame({'distance': [20, 10, 30]}, index=['a', 'b', 'c'])
    assert expected.equals(transformed.to_pandas())


def test_sort_transform():
    original = pd.DataFrame({'distance': [20, 10, 30]}, index=['a', 'b', 'c'])
    transformed = sort_transform(PandasTable(original), {'column': 'distance', 'ascending': False})
    expected = pd.DataFrame({'distance': [30, 20, 10]}, index=['c', 'a', 'b'])
    assert expected.equals(transformed.to_pandas())


def test_quantile_range_transform_lower():
    original = pd.DataFrame({'distance': [20, 10, 30, 40]},
                            index=['a', 'b', 'c', 'd'])
    transformed = quantile_range_transform(PandasTable(original),
                                           {'column': 'distance',
                                            'lower': 0,
                                            'upper': 0.5})
    expected = pd.DataFrame({'distance': [20, 10]},
                            index=['a', 'b'])
    assert expected.equals(transformed.to_pandas())


def test_quantile_range_transform_upper():
    original = pd.DataFrame({'distance': [20, 10, 30, 40]},
                            index=['a', 'b', 'c', 'd'])
    transformed = quantile_range_transform(PandasTable(original),
                                           {'column': 'distance',
                                            'lower': 0.5,
                                            'upper': 1})
    expected = pd.DataFrame({'distance': [30, 40]},
                            index=['c', 'd'])
    assert expected.equals(transformed.to_pandas())


def test_histogram_transform_numeric():
    original = pd.DataFrame({'distance': [20, 10, 30, 40]},
                            index=['a', 'b', 'c', 'd'])
    transformed = histogram_transform(PandasTable(original),
                                      {'column': 'distance',
                                       'bins': 2})
    expected_side_result = {'x': [17.5, 32.5],
                            'y': [2, 2],
                            'width': [15., 15.]}
    assert original.equals(transformed.to_pandas())
    assert np.allclose(expected_side_result['x'], transformed.side_result['x'])
    assert np.allclose(expected_side_result['y'], transformed.side_result['y'])
    assert np.allclose(expected_side_result['width'], transformed.side_result['width'])


def test_histogram_transform_categorical():
    original = pd.DataFrame({'token': ['t1', 't1', 't2', 't2']},
                            index=['a', 'b', 'c', 'd'])
    transformed = histogram_transform(PandasTable(original),
                                      {'column': 'token',
                                       'bins': 2})
    expected_side_result = {'x': ['t1', 't2', 'Other'],
                            'y': [2, 2, 0],
                            'width': None}
    assert original.equals(transformed.to_pandas())
    assert expected_side_result.keys() == transformed.side_result.keys()
    assert expected_side_result['width'] == transformed.side_result['width']
    assert set(expected_side_result['x']) == set(transformed.side_result['x'])  # 't1', 't2' may be flipped
    assert expected_side_result['y'] == transformed.side_result['y']


def test_nans_transform_hide():
    original = pd.DataFrame({'distance': [20, 10, None, 40],
                             'speed': [None, 300, 200, 100]},
                            index=['a', 'b', 'c', 'd'])
    transformed = nans_transform(PandasTable(original),
                                 {'filter': 'hide'})
    expected = pd.DataFrame({'distance': [10, 40],
                             'speed': [300, 100]},
                            index=['b', 'd'],
                            dtype=('float64', 'float64'))
    assert expected.equals(transformed.to_pandas())


def test_nans_transform_show():
    original = pd.DataFrame({'distance': [20, 10, None, 40],
                             'speed': [None, 300, 200, 100]},
                            index=['a', 'b', 'c', 'd'])
    transformed = nans_transform(PandasTable(original),
                                 {'filter': 'show'})
    expected = pd.DataFrame({'distance': [20, None],
                             'speed': [None, 200]},
                            index=['a', 'c'])
    assert expected.equals(transformed.to_pandas())


def test_search_transform_int():
    original = pd.DataFrame({'distance': [20, 10, 30, 40],
                             'speed': [100, 300, 200, 100]},
                            index=['a', 'b', 'c', 'd'])
    transformed = search_transform(PandasTable(original),
                                   {'column': 'distance',
                                    'searchterm': '10'})
    expected = pd.DataFrame({'distance': [10],
                             'speed': [300]},
                            index=['b'])
    assert expected.equals(transformed.to_pandas())


def test_search_transform_string():
    original = pd.DataFrame({'distance': [20, 10, 30, 40],
                             'token': ['t1', 't1', 't2', 't2']},
                            index=['a', 'b', 'c', 'd'])
    transformed = search_transform(PandasTable(original),
                                   {'column': 'token',
                                    'searchterm': 't2'})
    expected = pd.DataFrame({'distance': [30, 40],
                             'token': ['t2', 't2']},
                            index=['c', 'd'])
    assert expected.equals(transformed.to_pandas())


def test_query_transform():
    original = pd.DataFrame({'distance': [20, 10, 30, 40],
                             'token': ['t1', 't1', 't2', 't2']},
                            index=['a', 'b', 'c', 'd'])
    transformed = query_transform(PandasTable(original),
                                  {'query': 'distance > 30'})
    expected = pd.DataFrame({'distance': [40],
                             'token': ['t2']},
                            index=['d'])
    assert expected.equals(transformed.to_pandas())


def test_query_transform_mean():
    original = pd.DataFrame({'distance': [20, 10, 30, 40],
                             'token': ['t1', 't1', 't2', 't2']},
                            index=['a', 'b', 'c', 'd'])
    transformed = query_transform(PandasTable(original),
                                  {'query': 'distance < mean[distance]'})
    expected = pd.DataFrame({'distance': [20, 10],
                             'token': ['t1', 't1']},
                            index=['a', 'b'])
    assert expected.equals(transformed.to_pandas())


def test_query_transform_quantile():
    original = pd.DataFrame({'distance': [20, 10, 30, 40],
                             'token': ['t1', 't1', 't2', 't2']},
                            index=['a', 'b', 'c', 'd'])
    transformed = query_transform(PandasTable(original),
                                  {'query': 'distance < quantile[distance,0.3]'})
    expected = pd.DataFrame({'distance': [10],
                             'token': ['t1']},
                            index=['b'])
    assert expected.equals(transformed.to_pandas())


def test_pandas_table_len():
    original = pd.DataFrame({'distance': [20, 10, 30, 40]},
                            index=['a', 'b', 'c', 'd'])
    assert 4 == len(PandasTable(original))


def test_pandas_table_to_pandas():
    original = pd.DataFrame({'distance': [20, 10, 30, 40]},
                            index=['a', 'b', 'c', 'd'])
    assert original.equals(PandasTable(original).to_pandas())


def test_pandas_table_apply_bounds():
    original = pd.DataFrame({'distance': [20, 10, 30, 40]},
                            index=['a', 'b', 'c', 'd'])
    expected = pd.DataFrame({'distance': [10, 30]},
                            index=['b', 'c'])
    assert expected.equals(PandasTable(original).apply_bounds(1, 2).to_pandas())


def test_pandas_table_process_transforms():
    original = pd.DataFrame({'distance': [20, 10, 30, 40]},
                            index=['a', 'b', 'c', 'd'])
    transforms = [{'type': 'quantile_range',
                   'column': 'distance',
                   'lower': 0,
                   'upper': 0.5},
                  {'type': 'sort',
                   'column': 'distance',
                   'ascending': True}]
    transformed, errors, sides = PandasTable(original).process_transforms(transforms)
    expected = pd.DataFrame({'distance': [10, 20]},
                            index=['b', 'a'])
    assert expected.equals(transformed.to_pandas())
    assert errors == dict()
    assert sides == dict()
