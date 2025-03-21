import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from "@/utils/auth"
import { tansParams } from '@/utils/intoal'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/http://127.0.0.1:81/newsBg', // api的基础url
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Language': 'zh-CN'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
      const isToken = (config.headers || {}).isToken === false
    if (getToken() && !isToken) {
        config.headers['Authorization'] = 'Bearer ' + getToken()
    }
      // get请求映射params参数
      if (config.method === 'get' && config.params) {
          let url = config.url + '?' + tansParams(config.params);
          url = url.slice(0, -1);
          config.params = {};
          config.url = url;
      }
      if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
          const requestObj = {
              url: config.url,
              data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
              time: new Date().getTime()
          }
      }
    return config
  },
  error => {
    // 处理请求错误
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 这里可以根据后端返回的状态码做不同的处理
    if (res.code !== 200) {
      Message({
        message: res.message || '错误',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || '错误'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
