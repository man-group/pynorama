import pandas as pd
from nltk.corpus import reuters
from nltk import sent_tokenize, word_tokenize
try:
    import spacy
    from spacy import displacy
    SPACY = True
except ImportError:
    SPACY = False

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
            'doc_id': doc_id,
            'abspath': str(reuters.abspath(doc_id)),
            'categories': [c + ' ' for c in reuters.categories(doc_id)],
            'headline': reuters.raw(doc_id).split('\n', 1)[0],
            'length': len(reuters.raw(doc_id))
        } for doc_id in reuters.fileids()])
        logger.info('Finishing processing reuters dataset.')
        if SPACY:
            self.nlp = spacy.load('en_core_web_sm')

    def get_table(self):
        return PandasTable(self.df)

    def get_pipeline(self):
        pipeline = {
            'raw': {'viewer': 'raw'},
            'doctree': {'parents': ['raw'],
                        'viewer': 'doctree'}
        }
        if SPACY:
            pipeline['displacy']= {'parents': ['raw'],
                                   'viewer': 'html'}
        return pipeline

    def get_record(self, key, stage):
        rawdoc = reuters.raw(key)
        if stage == 'raw':
            return rawdoc
        if stage == 'doctree':
            return [word_tokenize(sent) for sent in sent_tokenize(rawdoc)]
        if stage == 'displacy' and SPACY:
            doc = self.nlp(rawdoc)
            html = displacy.render(doc, style='ent', minify=True)
            return html
        raise RecordNotFound(key, stage)

    def get_config(self):
        return make_config('doc_id',
                           available_transforms=['nans', 'search', 'quantile_range'],
                           initial_visible_columns=['doc_id'])
