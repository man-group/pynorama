

def make_config(key, show_index=True, available_transforms=[], initial_visible_columns=[]):
    """Utility function for creating front-end configurations.

    For some frequently used parameters, it creates the nested tree structure
    expected by the JavaScript front-end, but thus can't exhaust all the configuration
    possibilities.

    Args:
        key (str): in the document table, which column contains the unique key for that row,
            that is used to request the corresponding record.
        show_index (bool, optional): indicates whether the index of the pandas dataframe is
            visible in the document table.
        availabe_transforms (optional): list of strings of transform types, for each of
            which a button is created in the UI to use that transform.
        initial_visible_columns (optional): a list of column names that are visible in the table
            upon first loading of the page.
    """
    return {
        'datatable': {
            'state': {
                'initialVisibleColumns': initial_visible_columns
            },
            'transforms': {
                'toolbox': {
                    'available': available_transforms
                }
            },
            'table': {
                'show_index': show_index,
                'rows': {
                    'keyField': key
                }
            }
        }
    }
