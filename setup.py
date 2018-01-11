from setuptools import setup, find_packages

# Convert Markdown to RST for PyPI
# http://stackoverflow.com/a/26737672
try:
    import pypandoc
    long_description = pypandoc.convert('README.md', 'rst')
    changelog = pypandoc.convert('CHANGES.md', 'rst')
except (IOError, ImportError, OSError):
    long_description = open('README.md').read()
    changelog = open('CHANGES.md').read()

setup(
    name='pynorama',
    version='0.4.2',
    author="Man AHL Technology",
    author_email="ManAHLTech@ahl.com",
    description='Natural Language Processing Visualization Tool',
    long_description='\n'.join((long_description, changelog)),
    keywords=['ahl', 'visualization', 'NLP', 'data discovery'],
    url='https://github.com/manahl/pynorama',
    install_requires=[
        'flask',
        'numpy',
        'pandas'
    ],
    extras_require={
        'docs': [
            'pypandoc',
            'sphinx',
            'nbsphinx',
            'sphinxcontrib-napoleon'
        ],
        'mongo': [
            'pymongo'
        ],
        'examples': [
            'nltk'
        ]
    },
    setup_requires=[
        'pytest-runner'
    ],
    tests_require=[
        'mock',
        'pytest',
        'pytest-cov',
        'pytest-shutil',
        'pytest-mongodb'
    ],
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Topic :: Utilities',
        'Framework :: Flask',
        'Topic :: Scientific/Engineering',
        'Topic :: Scientific/Engineering :: Visualization',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7'
    ],
    packages=find_packages(
        where='.',
        exclude=['*.tests', '*.tests.*', 'tests.*', 'tests', 'example']
    ),
    include_package_data=True,
    license='LGPL-2.1',
)
