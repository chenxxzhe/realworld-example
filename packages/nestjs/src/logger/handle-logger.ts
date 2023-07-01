import { LoggerService } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'

export function handleLogger(
  http: HttpArgumentsHost,
  logger: LoggerService,
  exceptionMessage?: string,
) {
  const req = http.getRequest()
  const res = http.getResponse()

  const { headers, url, method, body } = req

  // 获取 IP
  const xRealIp = headers['X-Real-IP']
  const xForwardedFor = headers['X-Forwarded-For']
  const ip = xRealIp || xForwardedFor || req.ip || req.socket.remoteAddress
  let rawBody = ''
  try {
    rawBody = JSON.stringify(body)
    if (rawBody === '{}') rawBody = ''
  } catch {}

  const error = exceptionMessage ? 'Exception:' + exceptionMessage : ''
  logger.log(
    `[${ip}]${headers.host}; [${method}]${url} ${rawBody} - ${res.statusCode} ${error}`,
  )
}
