import axios from 'axios'
import { Notification, MessageBox, Message, Loading } from 'element-ui'
import { getToken } from "@/utils/auth"
import { tansParams } from '@/utils/intoal'
import errorCode from "@/utils/errorCode";

// 创建axios实例
const service = axios.create({
  baseURL:  'http://127.0.0.1:81/newsBg',
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Language': 'zh-CN'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {

    if (getToken()) {
        config.headers['Authorization'] = 'Bearer ' + getToken()
    }
      // get请求映射params参数
      if (config.method === 'get' && config.params) {
          let url = config.url + '?' + tansParams(config.params);
          url = url.slice(0, -1);
          config.params = {};
          config.url = url;
      }
      if (config.method === 'post' || config.method === 'put') {
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
service.interceptors.response.use(res => {
        // 未设置状态码则默认成功状态
        const code = res.data.code || 200;
        // 获取错误信息
        const msg = errorCode[code] || res.data.msg || errorCode['default']
        // 二进制数据则直接返回
        if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
            return res.data
        }
        if (code === 500) {
            Message({ message: msg, type: 'error' })
            return Promise.reject(new Error(msg))
        } else if (code === 601) {
            Message({ message: msg, type: 'warning' })
            return Promise.reject('error')
        } else if (code !== 200) {
            Notification.error({ title: msg })
            return Promise.reject('error')
        } else {
            return res.data
        }
    },
    error => {
        console.log('err' + error)
        let { message } = error;
        if (message == "Network Error") {
            message = "后端接口连接异常";
        } else if (message.includes("timeout")) {
            message = "系统接口请求超时";
        } else if (message.includes("Request failed with status code")) {
            message = "系统接口" + message.substr(message.length - 3) + "异常";
        }
        Message({ message: message, type: 'error', duration: 5 * 1000 })
        return Promise.reject(error)
    }
)

export default service
