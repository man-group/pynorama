/* eslint-disable */
import webpack from 'webpack';
import path from 'path';

const BUILD_DIR = path.resolve(__dirname, 'bin');
const SRC_DIR = path.resolve(__dirname, 'src');
const NODE_DIR = path.resolve(__dirname, 'node_modules');

const generateBabelEnvLoader = (browserlist) => {
  return {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      presets: [
        [
          'env',
          {
            debug: true,
            modules: false,
            useBuiltIns: true,
            targets: {
              browsers: browserlist,
            },
          },
        ],
        'react',
      ],
      plugins: [
        'syntax-dynamic-import',
        'transform-object-rest-spread',
        'transform-es2015-destructuring'],
    },
  };
};

const config = {
  entry: {
    view: path.resolve(SRC_DIR, 'view.jsx'),
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].legacy.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: generateBabelEnvLoader([
          // Browsers that don't support <script type="module">.
          'Chrome < 60',
          'Safari < 10.1',
          'iOS < 10.3',
          'Firefox < 54',
          'Edge < 15',
        ]),
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|eot|ttf|woff|woff2|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              useRelativePath: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
    modules: [SRC_DIR, NODE_DIR],
  },
  plugins: [],
};

export default config;
