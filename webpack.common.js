const path = require('path')
const pkg = require('./package.json')
const manifest = require('./src/manifest.json')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const ManifestPlugin = require('webpack-extension-manifest-plugin')

module.exports = {
  entry: {
    popup: path.resolve('src/ui/entries/popup.tsx'),
    options: path.resolve('src/ui/entries/options.tsx'),
    background: path.resolve('src/background.ts'),
    content: path.resolve('src/content.ts'),
  },
  module: {
    rules: [
      {
        use: 'ts-loader',
        test: /\.tsx?$/,
        exclude: /node_modules/,
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/i
      },
      {
        type: 'asset/resource',
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('public/assets'),
          to: path.resolve('dist/assets'),
        },
        {
          from: path.resolve('public/locales'),
          to: path.resolve('dist/_locales'),
        },
      ]
    }),
    ...getHtmlPlugins([
      'popup', 'options'
    ]),
    new ManifestPlugin({
      config: {
        base: manifest,
        extend: {
          version: pkg.version
        },
      }
    }),
  ],
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve('dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  },
}

function getHtmlPlugins(chunks) {
  return chunks.map(chunk => new HtmlPlugin({
    title: 'React Extension',
    filename: `${chunk}.html`,
    chunks: [chunk]
  }))
}
