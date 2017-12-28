import re
import numpy as np
import pandas as pd
import fnmatch

from .base_table import Table


def query_transform(pandas_table, transform):
    """Perform a pandas query on the table.

    Do basic pre-processing to support aggregation functions:
    mean, median, std, quantile. These get evaluated before
    passing to query. For example, if the distance column
    contains [10, 20, 30, 40], then:

    'distance > quantile[distance,0.5]'

    First gets evaluated to:

    'distance > 0.25'

    which then gets passed to pandas.DataFrame.query().

    Required fields of transform:
        query: query to pass to pandas.DataFrame.query()
    """
    dataframe = pandas_table.dataframe
    text = transform['query']

    def replace_function(match):
        fn = match.group(1).strip()
        column = match.group(2).strip()

        return str(getattr(dataframe[column], fn)())

    def replace_function_with_param(match):
        fn = match.group(1).strip()
        column = match.group(2).strip()
        q = float(match.group(3).strip())

        return str(getattr(dataframe[column], fn)(q))

    text = re.sub(r"(mean|median|std)\[(.+)\]", replace_function, text)
    text = re.sub(r"(quantile)\[(.+),(.+)\]", replace_function_with_param, text)
    return PandasTable(dataframe.query(text))


def sample_transform(pandas_table, transform):
    """Sample from the pandas table, no replacement, keeping the original order.

    Required fields of transform:
        fraction: [0, 1] - fraction of dataframe to keep
    """
    dataframe = pandas_table.dataframe
    # Don't use dataframe.sample, because rather keep order
    n = int(round(len(dataframe) * transform['fraction']))
    chosen_idx = np.random.choice(len(dataframe), size=n, replace=False)
    chosen_idx.sort()

    return PandasTable(dataframe.take(chosen_idx))


def sort_transform(pandas_table, transform):
    """Sort the pandas table.

    Required fields of transform:
        column: the column to sort on
        ascending: True/False
    """
    dataframe = pandas_table.dataframe
    if transform['column'] == 'index':
        return PandasTable(
            dataframe.sort_index(ascending=transform['ascending']))
    elif hasattr(dataframe, 'sort_values'):
        return PandasTable(
            dataframe.sort_values(transform['column'],
                                  ascending=transform['ascending']))
    else:
        return PandasTable(
            dataframe.sort(transform['column'],
                           ascending=transform['ascending']))



def quantile_range_transform(pandas_table, transform):
    """Filter a table to only keep values within a given quantile range.

    Required fields of transform:
        column: the column to filter on
        lower: [0, 1] - lower quantile (inclusive)
        upper: [0, 1] - upper quantile (inclusive)
    """
    dataframe = pandas_table.dataframe
    column = transform['column']
    lower_quantile = dataframe[column].quantile(transform['lower'])
    upper_quantile = dataframe[column].quantile(transform['upper'])
    return PandasTable(dataframe[(dataframe[column] >= lower_quantile) &
                                 (dataframe[column] <= upper_quantile)])


def histogram_transform(pandas_table, transform):
    """Create a histogram from the values in a given column of the Pandas table.

    Both numerical and string columns are suppported.

    Required fields of transform:
        column: the column whose values are used for the histogram
        bins: (optional) number of bins to use in the transform. Default is 30.
    """

    dataframe = pandas_table.dataframe
    column = transform['column']
    bins = int(transform.get('bins', 30))
    series = dataframe[column]
    if np.issubdtype(series.dtype, np.number):
        hist, bin_edges = np.histogram(series[(~np.isnan(series))], bins=bins)
        width = [bin_edges[i + 1] - bin_edges[i] for i in range(len(bin_edges) - 1)]
        x = [(bin_edges[i + 1] + bin_edges[i]) / 2 for i in range(len(bin_edges) - 1)]
        y = hist.tolist()
    else:
        counts = series.value_counts()
        cut = counts.iloc[0:bins]
        cut['Other'] = counts[bins:].sum()
        # FIXME: Workaround for https://github.com/pandas-dev/pandas/issues/18678
        if np.isnan(cut['Other']):
            cut['Other'] = 0
        x = cut.index.tolist()
        y = cut.values.tolist()
        # FIXME: Is this the right width for categorical variables? Perhaps a list of 1-s?
        width = None

    return PandasTable(dataframe, {'x': x, 'y': y, 'width': width})


def nans_transform(pandas_table, transform):
    """Filter/keep rows with at least one nan value.

    Doesn't care for np.inf and -np.inf.

    Required fields of transform:
        filter: "show"/"hide" - whether to show or hide rows with nans
    """
    dataframe = pandas_table.dataframe
    matches = pd.isnull(dataframe).any(axis=1)
    if transform['filter'] == 'show':
        return PandasTable(dataframe[matches])
    if transform['filter'] == 'hide':
        return PandasTable(dataframe[~matches])
    raise ValueError('invalid filter parameter')


def _found(element, searchterm):
    """Return True if a given cell matches the search term, False otherwise"""
    if element is None:
        return False
    if isinstance(element, basestring):
        return fnmatch.fnmatch(element.strip().lower(), searchterm.strip().lower())
    if isinstance(element, (float, int)):
        # FIXME: This doesn't play nicely with Pandas datetypes
        if np.isnan(element):
            return False
        return float(searchterm) == element
    raise ValueError("Can't match the type %s" % type(element))


def search_transform(pandas_table, transform):
    """Find all rows that match a given search term.

    Do some best-effort type-casting to maximise the chances of a match.

    Required fields of transform:
        column: the column to search on
        searchterm: the element to match
    """
    dataframe = pandas_table.dataframe
    column = transform['column']
    return PandasTable(dataframe[dataframe[column].map(
        lambda element: _found(element, transform['searchterm']))])


class PandasTable(Table):
    """Pynorama table backed by a fully-materialised Pandas dataframe"""
    TRANSFORMS_MAPPING = {
        'query': query_transform,
        'sample': sample_transform,
        'sort': sort_transform,
        'quantile_range': quantile_range_transform,
        'search': search_transform,
        'nans': nans_transform,
        'histogram': histogram_transform
    }

    def __init__(self, dataframe, side_result=None):
        super(PandasTable, self).__init__(PandasTable.TRANSFORMS_MAPPING,
                                          side_result)
        self.dataframe = dataframe

    def __len__(self):
        return len(self.dataframe)

    def apply_bounds(self, offset, length):
        return PandasTable(self.dataframe.iloc[offset:(offset + length)])

    def to_pandas(self):
        return self.dataframe
