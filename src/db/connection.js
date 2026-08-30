import pg from 'pg'
import { env } from '../config/env.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: env.DATABASE_URL
})

export const query = (text, params) => pool.query(text, params)
export const getClient = () => pool.connect()
