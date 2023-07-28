import express from 'express'
import { join } from 'path'
import cookieParser from 'cookie-parser'
import morgan = require('morgan')

import { initRouter } from './routes'

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(join(__dirname, '../public')))

initRouter('/api', app)

app.use((err: any, req: any, res: any, next: any) => {
  if (err && err.error) {
    res.status(400).json({
      message: err.error.message,
      detail: err.error.detail,
    })
  } else {
    // pass on to another error handler
    next(err.message || 'internal server error')
    if (err.sql) {
      console.log('\nSQL: ', err.sql, '\n')
    }
  }
})

export default app
