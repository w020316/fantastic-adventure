import fs from 'fs'
import path from 'path'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
  } catch {
    return false
  }
  return true
}

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString()
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
}

function writeToFile(content: string) {
  if (!ensureLogDir()) return
  const date = new Date().toISOString().split('T')[0]
  const filePath = path.join(LOG_DIR, `app-${date}.log`)
  fs.appendFile(filePath, content + '\n', (err) => {
    if (err) console.error('Failed to write log:', err)
  })
}

function log(level: LogLevel, message: string, meta?: unknown) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return
  const formatted = formatMessage(level, message, meta)
  const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  consoleFn(formatted)
  if (level !== 'debug') writeToFile(formatted)
}

export const logger = {
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  log: (level: LogLevel, msg: string, meta?: unknown) => log(level, msg, meta),
}
