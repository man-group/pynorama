class Table(object):
    """Abstract class that represents an immutable table on which transforms can act.

    Args:
        transform_mapping:  a dictionary mapping the name of the transform to
                            the transform function. See PandasTable for examples.
        side_results:       can be used by transforms to store results that are
                            final, but not part of the transform pipeline, e.g.
                            data to plot a histogram at a certain step in the pipeline.
    """
    def __init__(self, transform_mapping, side_result=None):
        self.transform_mapping = transform_mapping
        self.side_result = side_result

    def __len__(self):
        raise NotImplementedError('Please implement __len__ in your TableTransformer derived class.')

    def transform(self, transform):
        if transform['type'] not in self.transform_mapping:
            raise Exception('No transformer found for Transform type.')

        transformer = self.transform_mapping[transform['type']]
        return transformer(self, transform)

    def apply_bounds(self, offset, length):
        raise NotImplementedError('Please implement apply_bounds in your TableTransformer derived class.')

    def to_pandas(self):
        raise NotImplementedError('Please implement to_pandas in your TableTransformer derived class.')

    def process_transforms(self, transforms):
        """Apply multiple transforms sequentially.

        Side results (e.g. data to plot a histogram at a certain stage step in the pipeline)
        are stored for each step of the pipeline.
        If an exception occurs during a transform, the transform is skipped and the error
        for that step is stored.

        Returns:
            A tuple of shape (result, transforms_errors, side_results).
            * result is the Table object after all transforms were applied.
            * transforms_errors is a dictionary mapping transform index to error string,
              indicating why some transforms were skipped.
            * side_results is a dictionary mapping index to a JSON-serializable python object,
              that can be used by the corresponding UI component.
        """
        transforms_errors = dict()
        side_results = dict()

        result = self

        for i, transform in enumerate(transforms):
            try:
                result = result.transform(transform)
                if result.side_result is not None:
                    side_results[i] = result.side_result
            except Exception as e:
                transforms_errors[i] = str(e)
        return result, transforms_errors, side_results
