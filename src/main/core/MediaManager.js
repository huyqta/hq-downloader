import { spawn } from 'child_process'
import { EventEmitter } from 'events'
import logger from 'electron-log'

export default class MediaManager extends EventEmitter {
  constructor () {
    super()
    this.ytDlpPath = 'yt-dlp' // Assume it's in PATH for now
  }

  async extractMediaInfo (url, options = {}) {
    return new Promise((resolve, reject) => {
      logger.info('MediaManager: analyzing', url)

      const args = [
        '--dump-json',
        '--no-playlist', // Standard behavior: single video
        url
      ]

      if (options.proxy) {
        args.push('--proxy', options.proxy)
      }

      const process = spawn(this.ytDlpPath, args)

      let stdout = ''
      let stderr = ''

      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      process.on('close', (code) => {
        if (code !== 0) {
          logger.error('MediaManager: yt-dlp failed', stderr)
          reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`))
          return
        }

        try {
          const info = JSON.parse(stdout)
          // Simplify result for frontend
          const result = {
            title: info.title || 'Unknown Title',
            url: info.url, // Direct URL if available
            thumbnail: info.thumbnail,
            duration: info.duration,
            formats: info.formats
              ? info.formats.map(f => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.resolution || `${f.width}x${f.height}`,
                url: f.url,
                filesize: f.filesize
              }))
              : []
          }
          resolve(result)
        } catch (err) {
          logger.error('MediaManager: parse error', err)
          reject(new Error('Failed to parse yt-dlp output'))
        }
      })

      process.on('error', (err) => {
        logger.error('MediaManager: spawn error', err)
        if (err.code === 'ENOENT') {
          reject(new Error('yt-dlp not found. Please install it (e.g., brew install yt-dlp)'))
        } else {
          reject(err)
        }
      })
    })
  }
}
