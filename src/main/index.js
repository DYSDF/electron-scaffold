const path =  require('path')
const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron')
const is = require('electron-is')
const config = require('@/config')

function startHook(win) {
  console.log('start require iohook')
  try {
    ioHook = require('iohook')
    ioHook.on('keyup', event => {
      console.log(event)
      win.webContents.send('iohook', event)
    });
    ioHook.on('keydown', event => {
      win.webContents.send('iohook', event)
    });
    ioHook.start(is.dev());
    console.log('iohook', 'done')
  } catch (e) {
    win.webContents.send('iohook', `iohook err - ${e.message}`)
  }
}

function createPageURL(page, win) {
  return is.dev() ?
    win.loadURL(`http://localhost:${config.dev_port}/${page}.html`):
    win.loadURL(`file://${path.resolve(__dirname, `../web/${page}.html`)}`)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  createPageURL('index', win)

  is.dev () && win.webContents.openDevTools()

  ipcMain.on('load-iohook', () => {
    startHook(win)
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
