import mysql from 'mysql2'

const port = +(process.env.DB_PORT ?? 3306)

export const pool = mysql
  .createPool({
    host: process.env.DB_HOST || 'localhost',
    port,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'realworld',
    waitForConnections: true,
    connectionLimit: 4,
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  })
  .promise()
