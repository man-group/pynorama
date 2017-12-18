import pandas as pd
from .base_table import Table


def sort_transform(table, transform):
    column = transform['column']
    direction = 1 if transform['ascending'] else -1

    return table.mongo_transform({'$sort': {column: direction}})


def regex_transform(table, transform):
    column = transform['column']
    regex = transform['searchterm']

    return table.mongo_transform({'$match': {column: {'$regex': regex}}})


#TODO: error system will not really work with MongoTransforms
class MongoTable(Table):
    TRANSFORMS_MAPPING = {
        'sort': sort_transform,
        'search': regex_transform,
    }

    # TODO: index field
    def __init__(self, collection, transforms=()):
        super(MongoTable, self).__init__(MongoTable.TRANSFORMS_MAPPING)
        self.collection = collection
        self.transforms = transforms

    def mongo_transform(self, *transforms):
        return MongoTable(self.collection, self.transforms + transforms)

    def get_iterator(self):
        return self.collection.aggregate(list(self.transforms), allowDiskUse=True)

    def __len__(self):
        # filter out sorts / projections, which will just slow down count
        transforms = [transform for transform in self.transforms
                      if not ('$sort' in transform or '$project' in transform)]

        if transforms:
            transforms.append({'$group': {'_id': None, 'count': {'$sum': 1}}})
            iterator = self.collection.aggregate(transforms, allowDiskUse=True)
            try:
                return next(iterator)['count']
            except StopIteration:
                return 0
        else:
            return self.collection.count({})

    def to_pandas(self):
        iterator = self.get_iterator()
        df = pd.DataFrame(list(iterator)).drop('_id', axis=1)

        # if no data found, no dtypes are available, so query again for dtypes
        if len(df) == 0:
            df = pd.DataFrame([self.collection.find_one({})]).drop('_id', axis=1)
            df = df.drop(df.index)
        return df

    def apply_bounds(self, offset, length):
        return self.mongo_transform({'$skip': offset}, {'$limit': length})
