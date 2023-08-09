import axios from 'axios'

const instance = axios.create({ baseURL: '/', timeout: 30000 })

export const get = <T>(url: string, query?: Record<string, string | number>) =>
  instance.get<T>(url, { params: query })

export const post = <T>(url: string, data?: Record<string, any>) =>
  instance.post<T>(url, data)

export const put = <T>(url: string, data?: Record<string, any>) =>
  instance.put<T>(url, data)

export const del = <T>(url: string) => instance.delete<T>(url)
