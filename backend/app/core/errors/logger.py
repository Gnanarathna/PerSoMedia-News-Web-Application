import logging


def configure_logger(app):
    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)