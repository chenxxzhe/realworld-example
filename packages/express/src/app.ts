import * as express from 'express'
import { join } from 'path'
import * as cookieParser from 'cookie-parser'
import morgan = require('morgan')

import indexRouter from './routes/index'
import usersRouter from './routes/users'

debugger

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(join(__dirname, '../public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

export default app
