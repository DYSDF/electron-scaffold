const path = require('path')
const webpack = require('webpack')
const { dependencies } = require('../package.json')

const config = {
  entry: {
    index: path.join(__dirname, '../src/main/index.js')
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/main')
  },
  externals: Object.keys(dependencies || {}),
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.node$/,
      use: 'node-loader',
    }]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, '..'),
      'src': path.join(__dirname, '../src/main')
    },
    extensions: ['.js', '.json', '.node']
  },
  target: 'electron-main'
}

if (process.env.NODE_ENV !== 'production') {
  config.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = config
