const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const createEntry = require('./create-entry')
const rootDir = (...dirs) => path.resolve(__dirname, '..', ...dirs)

const config = {
  entry: {
    index: path.join(__dirname, '../src/web/index.js')
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist/web'),
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', {
        loader: 'sass-loader',
        options: {
          // data: '@import "./src/web/globals";'
        }
      }]
    }, {
      test: /\.sass$/,
      use: ['style-loader', 'css-loader', 'sass-loader?indentedSyntax']
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.js$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.vue$/,
      use: {
        loader: 'vue-loader'
      }
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[folder]/[name].[ext]'
        }
      }
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: '[folder]/[name].[ext]'
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[folder]/[name].[ext]'
        }
      }
    }]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/web/html/index.html'),
    })
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, '..'),
      'src': path.join(__dirname, '../src/web')
    },
    extensions: ['.js', '.vue', '.css']
  },
  target: 'electron-renderer'
}

if (process.env.NODE_ENV === 'production') {
  config.devtool = undefined
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
} else {
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )
}

module.exports = config
