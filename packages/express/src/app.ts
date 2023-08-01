import express, { Request, Response } from 'express'
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

// 最后的 error 拦截
app.use((err: any, req: Request, res: Response, next: any) => {
  // next 参数不用也不能删, use 内部使用参数数量来判断中间件是否错误捕获器
  if (err && err.error) {
    console.log(JSON.stringify({ query: req.query, body: req.body }))
    res.status(400).json({
      message: err.error.message,
      detail: err.error.detail,
    })
  } else {
    // pass on to another error handler
    res.status(err.statusCode || 500).json({
      message: err.message || 'internal server error',
    })
    if (err.sql) {
      console.log('\nSQL: ', err.sql, '\n')
    }
  }
})

export default app
