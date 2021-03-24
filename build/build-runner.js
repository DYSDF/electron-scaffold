process.env.NODE_ENV = 'production'

const fs = require('fs-extra')
const chalk = require('chalk')
const webpack = require('webpack')
const Multispinner = require('multispinner')

const mainConfig = require('./webpack.main.conf')
const webConfig = require('./webpack.web.conf')

const ERROR_LOG = chalk.bgRed.white(' ERROR ') + ' '
const OKAY_LOG = chalk.bgBlue.white(' OKAY ') + ' '

const pack = config => new Promise((resolve, reject) => {
  config.mode = 'production'
  webpack(config, (err, stats) => {
    if (err) reject(err.stack || err)
    else if (stats.hasErrors()) {
      let err = ''
      stats.toString({
        chunks: false,
        colors: true
      }).split(/\r?\n/).forEach(line => {
        err += `    ${line}\n`
      })
      reject(err)
    } else {
      resolve(stats.toString({
        chunks: false,
        colors: true
      }))
    }
  })
})

function build() {
  fs.removeSync('dist/*')
  // fs.copySync('src/shared', 'dist/shared')

  const tasks = ['main', 'web']
  const m = new Multispinner(tasks, {
    preText: 'building',
    postText: 'process'
  })

  let results = ''

  m.on('success', () => {
    process.stdout.write('\x1B[2J\x1B[0f')
    console.log(`\n\n${results}`)
    console.log(`${OKAY_LOG}take it away ${chalk.yellow('`electron-builder`')}\n`)
    process.exit()
  })

  pack(mainConfig).then(result => {
    results += result + '\n\n'
    m.success('main')
  }).catch(err => {
    m.error('main')
    console.log(`\n  ${ERROR_LOG}failed to build main process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })

  pack(webConfig).then(result => {
    results += result + '\n\n'
    m.success('web')
  }).catch(err => {
    m.error('web')
    console.log(`\n  ${ERROR_LOG}failed to build web process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })
}

if (require.main === module) build()
