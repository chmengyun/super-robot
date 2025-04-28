import axios from 'axios'
import { EventSourcePolyfill } from 'event-source-polyfill'

// 创建axios实例
const service = axios.create({
    baseURL: 'http://172.16.32.62:8000',
    // timeout: 10000,
    // withCredentials: false,
    headers: {
        'Content-Type': 'application/json'
    }
})

service.interceptors.request.use(
    config => {

        return config
    },
    error => {

        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    response => {
        return response
    },
    error => {
        return Promise.reject(error)
    }
)


class ApiService {
    static get(url, params) {
        return service.get(url, { params })
    }
    static post(url, data) {
        return service.post(url, data)
    }
    static put(url, data) {
        return service.put(url, data)
    }
    static delete(url, params) {
        return service.delete(url, { params })
    }

    static async streamPost(url, data, onMessage) {
        try {
            // 先尝试普通POST请求
            const response = await service.post(url, data)
            
            // 如果响应是流式数据，则处理分块
            if (response.data && typeof onMessage === 'function') {
                if (Array.isArray(response.data)) {
                    response.data.forEach(item => onMessage(item))
                } else {
                    onMessage(response.data)
                }
            }
            
            return response.data
        } catch (error) {
            console.error('SSE请求错误:', error)
            throw error
        }
    }
}

export default ApiService
