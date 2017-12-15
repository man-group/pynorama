import re
import numpy as np
import pandas as pd
import fnmatch

from .base_table import Table


def query_transform(pandas_table, transform):
    dataframe = pandas_table.dataframe
    text = transform["query"]

    def replace_function(match):
        fn = match.group(1).strip()
        column = match.group(2).strip()

        return getattr(dataframe[column], fn)()

    def replace_function_with_param(match):
        function = match.group(1).strip()
        column = match.group(2).strip()
        q = float(match.group(3).strip())

        return getattr(dataframe[column], function)(q)

    text = re.sub(r"(mean|median|std)\[(.+),(.+)\]", replace_function_with_param, text)
    text = re.sub(r"(quantile)\[(.+)\]", replace_function, text)

    return PandasTable(dataframe.query(text))


def sample_transform(pandas_table, transform):
    dataframe = pandas_table.dataframe
    # Don't use dataframe.sample, because rather keep order
    n = int(round(len(dataframe) * transform["fraction"]))
    chosen_idx = np.random.choice(len(dataframe), size=n)
    chosen_idx.sort()

    return PandasTable(dataframe.take(chosen_idx))


def sort_transform(pandas_table, transform):
    dataframe = pandas_table.dataframe
    if transform["column"] == "index":
        return PandasTable(dataframe.sort_index(ascending=transform["ascending"]))
    return PandasTable(dataframe.sort(transform["column"],
                       ascending=transform["ascending"]))


def quantile_range_transform(pandas_table, transform):
    dataframe = pandas_table.dataframe
    column = transform["column"]
    lower_quantile = dataframe[column].quantile(transform["lower"])
    upper_quantile = dataframe[column].quantile(transform["upper"])
    return PandasTable(dataframe[(dataframe[column] >= lower_quantile) &
                                 (dataframe[column] <= upper_quantile)])


def histogram_transform(pandas_table, transform):
    dataframe = pandas_table.dataframe
    column = transform["column"]
    bins = transform.get("bins", 30)
    series = dataframe[column]
    if np.issubdtype(series.dtype, np.number):
        hist, bin_edges = np.histogram(series[(~np.isnan(series))], bins=bins)
        width = [bin_edges[i+1] - bin_edges[i] for i in range(len(bin_edges))-1]
        x = [(bin_edges[i+1]+bin_edges[i])/2 for i in range(len(bin_edges))-1]
        y = hist.tolist()
    else:
        counts = series.value_counts()
        cut = counts.iloc[0:bins]
        cut["Other"] = counts[bins:].sum()
        x = cut.index.tolist()
        y = cut.values.tolist()

    return PandasTable(dataframe, {"x": x, "y": y, "width": width})


# doesn't care for np.inf and -np.inf
def nans_transform(pandas_table, transform):
    dataframe = pandas_table.dataframe
    matches = pd.isnull(dataframe).any(axis=1)
    if transform["filter"] == "show":
        return dataframe[matches]
    if transform["filter"] == "hide":
        return dataframe[~matches]
    raise ValueError("invalid filter parameter")


def found(element, searchterm):
    if element is None:
        return False
    if isinstance(element, (str, unicode)):
        return fnmatch.fnmatch(element.strip().lower(), searchterm.strip().lower())
    if isinstance(element, (float, int)):
        if np.isnan(element):
            return False
        return float(searchterm) == element
    raise ValueError("Can't match the type %s" % type(element))


def search_transform(pandas_table, transform):
    dataframe = pandas_table.dataframe
    column = transform["column"]
    return PandasTable(dataframe[dataframe[column].map(
        lambda element: found(element, transform["searchterm"]))])


class PandasTable(Table):
    TRANSFORMS_MAPPING = {
        "query": query_transform,
        "sample": sample_transform,
        "sort": sort_transform,
        "quantile_range": quantile_range_transform,
        "search": search_transform,
        "nans": nans_transform,
        "histogram": histogram_transform
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
