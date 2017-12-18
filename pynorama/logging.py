from __future__ import absolute_import

import logging


hdlr = logging.StreamHandler()
hdlr.setFormatter(logging.Formatter(
    '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
))


logger = logging.getLogger('pynorama')
logger.setLevel(logging.INFO)
logger.addHandler(hdlr)
