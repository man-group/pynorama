import pandas as pd
from nltk.corpus import reuters
from nltk import sent_tokenize, word_tokenize

from pynorama import View, make_config
from pynorama.table import PandasTable
from pynorama.logging import logger
from pynorama.exceptions import RecordNotFound

class ReutersView(View):
    """
    Example demonstrating visualization of a set of news data.

    Note: you have to have nltk and the nltk reuters corpus installed.
    """
    def __init__(self):
        super(ReutersView, self).__init__(
            name='reuters',
            description='nltk\'s reuters corpus')

    def load(self):
        logger.info('Starting processing reuters dataset.')
        self.df = pd.DataFrame([{
            'id': id,
            'abspath': str(reuters.abspath(id)),
            'categories': [c+' ' for c in reuters.categories(id)],
            'headline': reuters.raw(id).split('\n', 1)[0],
            'length': len(reuters.raw(id))
        } for id in reuters.fileids()])
        logger.info('Finishing processing reuters dataset.')

    def get_table(self):
        return PandasTable(self.df)

    def get_pipeline(self):
        return {
            'raw': { 'viewer': 'raw'},
            'doctree': {'parents': ['raw'],
                        'viewer': 'doctree'}
        }

    def get_record(self, key, stage):
        rawdoc = reuters.raw(key)
        if stage == 'raw':
            return rawdoc
        if stage == 'doctree':
            return [word_tokenize(sent) for sent in sent_tokenize(rawdoc)]
        raise RecordNotFound(key, stage);


    def get_config(self):
        return make_config('id',
            available_transforms=["nans", "search", "quantile_range"],
            initial_visible_columns=["id"])
