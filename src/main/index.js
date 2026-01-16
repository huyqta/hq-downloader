import { app } from 'electron'
import is from 'electron-is'
import { initialize } from '@electron/remote/main'

import Launcher from './Launcher'

/**
 * initialize the main-process side of the remote module
 */
initialize()

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// FIX: Prevent "write EPIPE" crashes when stdout/stderr pipes are closed
if (process.platform === 'win32') {
  process.on('message', (data) => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
} else {
  process.on('SIGTERM', () => {
    app.quit()
  })
}

// Ignore EPIPE errors which happen when the console receiving the output is closed
process.stdout.on('error', function (err) {
  if (err.code === 'EPIPE') return
  process.stderr.write(err.message + '\n')
})

process.stderr.on('error', function (err) {
  if (err.code === 'EPIPE') return
  console.log(err.message) // fallback
})

/**
 * Fix Windows notification func
 * appId defined in .electron-vue/webpack.main.config.js
 */
if (is.windows()) {
  app.setAppUserModelId(appId)
}

global.launcher = new Launcher()
