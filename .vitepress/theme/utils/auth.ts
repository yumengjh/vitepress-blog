/// <reference types="vite/client" />
import CryptoJS from 'crypto-js'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'

interface AuthHeaders {
  'x-timestamp': string
  'x-signature': string
  'Content-Type': string
}

// 生成认证头部
export const generateAuthHeaders = (): AuthHeaders => {
  const secretKey = import.meta.env.VITE_AUTH_SECRET_KEY as string
  const timestamp = Math.floor(Date.now() / 1000)
  
  // 使用 HMAC-SHA256 生成签名
  const signature = CryptoJS.HmacSHA256(timestamp.toString(), secretKey).toString()
  
  return {
    'x-timestamp': timestamp.toString(),
    'x-signature': signature,
    'Content-Type': 'application/json'
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://inter.yumeng.icu'

// 创建带认证的 axios 实例
export const authAxios = axios.create({
  baseURL: API_BASE_URL
})

// 请求拦截器添加认证头
authAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = generateAuthHeaders()
  config.headers.set('x-timestamp', headers['x-timestamp'])
  config.headers.set('x-signature', headers['x-signature'])
  config.headers.set('Content-Type', headers['Content-Type'])
  return config
}) 