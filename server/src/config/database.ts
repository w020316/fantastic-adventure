import pg from 'pg'
import { config } from './index'

export const pool = new pg.Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err)
})

export async function testConnection(): Promise<void> {
  const client = await pool.connect()
  await client.query('SELECT NOW()')
  client.release()
}

export async function gracefulShutdown(): Promise<void> {
  try {
    await pool.end()
    console.log('Database pool has been closed')
  } catch (err) {
    console.error('Error closing database pool', err)
  }
}
