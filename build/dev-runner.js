const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')
const getHtmlWebpackPluginHooks = require('html-webpack-plugin/lib/hooks.js').getHtmlWebpackPluginHooks;

const mainConfig = require('./webpack.main.conf')
const webConfig = require('./webpack.web.conf')
const buildConfig = require('../config')

let electronProcess = null
let manualRestart = false
let hotMiddleware

const webpackLog = (proc, data) => {
  let log = ''

  log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
  log += '\n\n'

  if (typeof data === 'object') {
    data.toString({
      colors: true,
      chunks: false
    }).split(/\r?\n/).forEach(line => {
      log += '  ' + line + '\n'
    })
  } else {
    log += `  ${data}\n`
  }

  log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

  console.log(log)
}

const electronLog = (data, color) => {
  let log = ''
  data = data.toString().split(/\r?\n/)
  data.forEach(line => {
    log += `  ${line}\n`
  })
  if (/[0-9A-z]+/.test(log)) {
    console.log(
      chalk[color].bold('┏ Electron -------------------') +
      '\n\n' +
      log +
      chalk[color].bold('┗ ----------------------------') +
      '\n'
    )
  }
}

const compileWeb = () => new Promise(resolve => {
  webConfig.mode = 'development'
  const compiler = webpack(webConfig)
  hotMiddleware = webpackHotMiddleware(compiler, {
    log: false,
    heartbeat: 2500
  })

  compiler.hooks.compilation.tap('compilation', compilation => {
    getHtmlWebpackPluginHooks(compilation).afterEmit.tapAsync('html-webpack-plugin-after-emit', (data, cb) => {
      hotMiddleware.publish({ action: 'reload' })
      cb()
    })
  })

  compiler.hooks.done.tap('done', stats => {
    webpackLog('web', stats)
  })

  const server = new WebpackDevServer(compiler, {
    // contentBase: path.join(__dirname, '../'),
    quiet: true,
    before(app, ctx) {
      app.use(hotMiddleware)
      ctx.middleware.waitUntilValid(resolve)
    }
  })

  server.listen(buildConfig.dev_port)
})

const compileMain = () => new Promise(resolve => {
  mainConfig.mode = 'development'
  const compiler = webpack(mainConfig)

  compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
    webpackLog('main', chalk.white.bold('compiling...'))
    hotMiddleware.publish({ action: 'compiling' })
    done()
  })

  compiler.watch({}, (err, stats) => {
    if (err) {
      console.log(err)
      return
    }
    webpackLog('main', stats)
    if (electronProcess && electronProcess.kill) {
      manualRestart = true
      process.kill(electronProcess.pid)
      electronProcess = null
      startElectron()
      setTimeout(() => {
        manualRestart = false
      }, 5000)
    }
    resolve()
  })
})

const startElectron = () => {
  var args = [
    '--inspect=5858',
    path.join(__dirname, '../dist/main/index.js')
  ]

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  }

  electronProcess = spawn(electron, args)

  electronProcess.stdout.on('data', data => {
    electronLog(data, 'blue')
  })
  electronProcess.stderr.on('data', data => {
    electronLog(data, 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

Promise.all([compileWeb(), compileMain()]).then(() => {
  startElectron()
}).catch(err => {
  console.error(err)
})
