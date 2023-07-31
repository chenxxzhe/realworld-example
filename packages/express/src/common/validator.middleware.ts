import type { NextFunction, RequestHandler } from 'express'
import { validateOrReject, ValidatorOptions } from 'class-validator'
import { plainToInstance } from 'class-transformer'

// 检查上传的参数, query, body

const validateObject = (
  obj: any,
  classType: any,
  options?: ValidatorOptions,
) => {
  const instance = plainToInstance(classType, obj)
  return validateOrReject(instance, options)
}

const reject = (next: NextFunction) => (err: any[]) => {
  const error = { detail: err, message: 'ValidationError' }
  next({ error })
}

export const validateBody =
  (dtoType: any, options?: ValidatorOptions): RequestHandler =>
  (req, res, next) => {
    return validateObject(req.body, dtoType, options)
      .then(() => next())
      .catch(reject(next))
  }

export const validateQuery =
  (dtoType: any, options?: ValidatorOptions): RequestHandler =>
  (req, res, next) => {
    return validateObject(req.query, dtoType, options)
      .then(next)
      .catch(reject(next))
  }
