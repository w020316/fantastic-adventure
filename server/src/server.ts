function bootstrap() {
  console.log('[Bootstrap] === Server Bootstrap Starting ===')
  console.log('[Bootstrap] Node.js version:', process.version)
  console.log('[Bootstrap] Platform:', process.platform, process.arch)
  console.log('[Bootstrap] CWD:', process.cwd())
  console.log('[Bootstrap] NODE_ENV:', process.env.NODE_ENV || '(not set)')
  console.log('[Bootstrap] PORT:', process.env.PORT || '(not set)')
  console.log('[Bootstrap] JWT_SECRET set:', !!process.env.JWT_SECRET)
  console.log('[Bootstrap] JWT_REFRESH_SECRET set:', !!process.env.JWT_REFRESH_SECRET)

  process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.message)
    console.error('[FATAL] Stack:', err.stack)
    process.exit(1)
  })

  process.on('unhandledRejection', (reason) => {
    const msg = reason instanceof Error ? reason.message : String(reason)
    console.error('[FATAL] Unhandled Rejection:', msg)
    if (reason instanceof Error) {
      console.error('[FATAL] Stack:', reason.stack)
    }
  })

  try {
    console.log('[Bootstrap] Loading app module...')
    require('./app')
    console.log('[Bootstrap] App module loaded successfully')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : ''
    console.error('[FATAL BOOTSTRAP] Failed to load app:', message)
    if (stack) console.error('[FATAL BOOTSTRAP] Stack trace:', stack)
    process.exit(1)
  }
}

bootstrap()
