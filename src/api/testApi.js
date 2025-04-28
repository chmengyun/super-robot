import ApiService from '../utils/apiService'


const isDev = process.env.NODE_ENV === 'development'

export default {

    async fetchTestCases(data, hasTestScript = false, testCaseId = null, pagination = { page: 1, pageSize: 10 }) {
        try {
            isDev && console.debug('[TestAPI] 测试输入数据:', data)

            let endpoint = '/api/process'
            if (hasTestScript && testCaseId) {
                endpoint = `/api/process/script/${testCaseId}`
            } else if (hasTestScript) {
                endpoint = '/api/process/script'
            }

            const requestData = {
                ...data,
                page: pagination.page,
                pageSize: pagination.pageSize
            }
            const response = await ApiService.post(endpoint, requestData)
            isDev && console.debug('[TestAPI] 测试用例响应:', response.data)
            return response.data.processed_data
        } catch (error) {
            console.error('[TestAPI] 获取测试用例错误:', error)
            throw error
        }
    },
    async fetchTestResults(data, hasTestScript = false, testCaseId = null) {
        try {
            let endpoint = '/api/testresult'
            if (hasTestScript && testCaseId) {
                endpoint = `/api/testresult/script/${testCaseId}`
            } else if (hasTestScript) {
                endpoint = '/api/testresult/script'
            }

            const response = await ApiService.post(endpoint, data)
            isDev && console.debug('[TestAPI] 测试结果:', response.data)
            return response.data.processed_data
        } catch (error) {
            console.error('[TestAPI] 获取测试结果错误:', error)
            throw error
        }
    },

    async generateScripts(data) {
        isDev && console.debug('[TestAPI] 生成脚本请求:', data)

        if (!data.test_cases || !Array.isArray(data.test_cases)) {
            throw new Error('无效的测试用例数据')
        }

        // 验证测试用例数据
        if (!data.test_cases || !Array.isArray(data.test_cases)) {
            throw new Error('测试用例数据无效或为空')
        }

        const formattedCases = data.test_cases.map(tc => {
            if (!tc.id) throw new Error('测试用例缺少ID')
            return {
                id: tc.id,
                description: tc.description || '',
                steps: tc.steps || '',
                expected: tc.expected || ''
            }
        })

        // 使用普通POST请求
        // 强制使用普通POST请求，禁用任何流式处理
        return new Promise((resolve, reject) => {
            let fullScript = ''
            let currentTestCaseId = ''
            let eventSource = null

            try {
                eventSource = new EventSourcePolyfill(`${ApiService.defaults.baseURL}/api/generate-scripts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        testing_tools: data.testing_tools,
                        scripting_language: data.scripting_language,
                        tableFields: formattedCases
                    })
                })

                eventSource.onmessage = (event) => {
                    try {
                        const parsed = JSON.parse(event.data)
                        switch (event.type) {
                            case 'progress':
                                console.log(`[TestAPI] 进度更新: ${parsed.progress}%`)
                                break
                            case 'script_chunk':
                                fullScript += parsed.chunk
                                currentTestCaseId = parsed.test_case_id
                                break
                            case 'complete':
                                if (parsed.message === '所有测试脚本生成完成') {
                                    eventSource.close()
                                    resolve({
                                        id: currentTestCaseId,
                                        script: fullScript,
                                        status: 'success',
                                        message: '脚本生成完成'
                                    })
                                }
                                break
                            case 'error':
                                eventSource.close()
                                reject(new Error(parsed.error))
                                break
                        }
                    } catch (error) {
                        eventSource.close()
                        reject(error)
                    }
                }

                eventSource.onerror = (error) => {
                    eventSource.close()
                    reject(new Error(`SSE连接错误: ${error.message}`))
                }
            } catch (error) {
                if (eventSource) eventSource.close()
                reject(error)
            }
        })
    }
}
