import pg from 'pg'
import { config } from './index'

export const pool = new pg.Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
})

export async function testConnection(): Promise<void> {
  const client = await pool.connect()
  await client.query('SELECT NOW()')
  client.release()
}
