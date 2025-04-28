import { defineStore } from 'pinia'
import { ref } from 'vue'
import TestApi from '../api/testApi'

// 辅助函数：追加新的测试用例数据
function appendNewTestCases(existingCases, newCases) {
    const uniqueNewCases = newCases.filter(newTc =>
        !existingCases.some(existingTc => existingTc.id === newTc.id)
    )
    return [...existingCases, ...uniqueNewCases]
}

export const useTestStore = defineStore('test', () => {
    const testWebsite = ref('') // 新增测试网站字段
    const testModule = ref('') // 新增测试模块字段
    const testDescription = ref('') // 新增测试描述字段
    const testCases = ref([]) //新增测试用例数组
    const processedTestCases = ref([]) // 新增用于表格渲染的数组
    const generatedScripts = ref([]) // 新增生成的脚本数组
    const isLoading = ref(false) // isLoading字段，测试用例是否正在加载
    const showScripts = ref(false) // showScripts字段,测试脚本是否显示
    const error = ref(null) // 错误信息字段
    const selectedCases = ref([]) // 选中的测试用例ID数组

    function setSelectedCases(ids) {
        selectedCases.value = ids
    }

    async function fetchTestCases() {
        isLoading.value = true

        try {
            const response = await TestApi.fetchTestCases({
                Test_website: testWebsite.value,
                module: testModule.value,
                description: testDescription.value
            }, false, null)

            const testCasesData = response.testCases.map(tc => ({
                id: tc.id,
                feature: tc.feature,
                description: tc.description,
                precondition: tc.precondition,
                input: tc.input,
                steps: tc.steps,
                expected: tc.expected,
                priority: tc.priority,
                method: tc.method
            }))

            // 追加新数据而不是覆盖
            processedTestCases.value = appendNewTestCases(processedTestCases.value, testCasesData)
            testCases.value = appendNewTestCases(testCases.value, testCasesData)

            console.log("测试用例数据已加载：", testCasesData)
        } catch (error) {
            console.error("获取测试用例失败:", error)
            error.value = error.message
        } finally {
            isLoading.value = false
        }
    }

    async function generateScripts({ testingTools, language, framework, generateReport, testCases }) {
        try {
            isLoading.value = true
            error.value = null

            // Validate test cases
            if (!testCases.length) {
                throw new Error('请先添加测试用例')
            }

            // 验证测试用例数据
            if (!testCases || !Array.isArray(testCases)) {
                throw new Error('测试用例数据无效或为空')
            }

            const scriptData = {
                test_case_id: '',
                script: '',
                testing_tools: testingTools,
                scripting_language: language,
                timestamp: new Date().toLocaleString(),
                status: 'processing'
            }

            // 添加初始记录
            generatedScripts.value.push(scriptData)
            const currentIndex = generatedScripts.value.length - 1
            showScripts.value = true

            try {
                await TestApi.generateScripts({
                    testing_tools: testingTools,
                    scripting_language: language,
                    test_cases: testCases.map(tc => ({
                        id: tc.id,
                        description: tc.description || '',
                        steps: tc.steps || '',
                        expected: tc.expected || ''
                    }))
                },
                    // 进度回调
                    (progress) => {
                        generatedScripts.value[currentIndex].progress = progress
                    },
                    // 脚本片段回调
                    (chunk) => {
                        generatedScripts.value[currentIndex].script += chunk.chunk
                        generatedScripts.value[currentIndex].test_case_id = chunk.test_case_id
                    },
                    // 完成回调
                    (complete) => {
                        generatedScripts.value[currentIndex].status = 'success'
                        generatedScripts.value[currentIndex].test_case_id = complete.test_case_id
                    })
            } catch (err) {
                generatedScripts.value[currentIndex].status = 'error'
                generatedScripts.value[currentIndex].error = err.message
                throw err
            }
        } catch (err) {
            error.value = err.response?.data?.message || err.message
            console.error('生成脚本错误:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function updateTestCase(id, updatedData) {
        try {
            // 验证数据
            if (!id || !updatedData) {
                throw new Error('缺少必要参数')
            }

            // 查找测试用例
            const index = testCases.value.findIndex(tc => tc.id === id)
            if (index === -1) {
                throw new Error('未找到测试用例')
            }

            // 直接更新本地数据
            testCases.value[index] = {
                ...testCases.value[index],
                ...updatedData
            }

            // 更新processedTestCases
            const processedIndex = processedTestCases.value.findIndex(tc => tc.id === id)
            if (processedIndex !== -1) {
                processedTestCases.value[processedIndex] = {
                    ...processedTestCases.value[processedIndex],
                    ...updatedData
                }
            }

            return { success: true }
        } catch (err) {
            console.error('更新测试用例错误:', err)
            error.value = err.message
            return { success: false, error: err.message }
        }
    }

    function deleteTestCase(id) {
        testCases.value = testCases.value.filter(tc => tc.id !== id)
    }

    async function appendTestCases() {
        isLoading.value = true
        try {
            const testCasesData = await TestApi.fetchTestCases({
                Test_website: testWebsite.value,
                module: testModule.value,
                description: testDescription.value
            })

            // 只追加到processedTestCases，避免重复
            processedTestCases.value = appendNewTestCases(
                processedTestCases.value,
                testCasesData.testCases.map(tc => ({
                    id: tc.id,
                    feature: tc.feature,
                    description: tc.description,
                    precondition: tc.precondition,
                    input: tc.input,
                    steps: tc.steps,
                    expected: tc.expected,
                    priority: tc.priority,
                    method: tc.method
                }))
            )

            console.log("追加测试用例数据：", testCasesData.testCases)
        } catch (error) {
            console.error("追加测试用例失败:", error)
            error.value = error.message
        } finally {
            isLoading.value = false
        }
    }

    return {
        testWebsite,
        testModule,
        testDescription,
        testCases,
        processedTestCases,
        generatedScripts,
        isLoading,
        error,
        showScripts,
        selectedCases,
        setSelectedCases,
        fetchTestCases,
        appendTestCases,
        generateScripts,
        updateTestCase,
        deleteTestCase
    }
})
