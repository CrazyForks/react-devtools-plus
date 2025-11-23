/**
 * Client serving middleware
 * 客户端服务中间件
 */
import sirv from 'sirv'

export function serveClient(servePath: string) {
  return sirv(servePath, {
    single: true,
    dev: true,
  })
}
