<script setup>
import { useTestStore } from '../store/testStore'
import { ref } from 'vue'

const store = useTestStore()
const props = defineProps({
    selectedCases: {
        type: Array,
        default: () => []
    },
    scripts: {
        type: Array,
        default: () => []
    }
})

const showModal = ref(true)
const selectedTestCases = ref(props.selectedCases
    .map(id => store.processedTestCases?.find(tc => tc?.id === id))
    .filter(Boolean)
)
const testingTools = ref('')
const language = ref('Python')
const framework = ref('Pytest')
const generateReport = ref(true)

const emit = defineEmits(['close'])

function toggleSelect(testCase, event) {
    // 阻止事件冒泡，避免触发父元素的点击事件
    event?.stopPropagation()

    const index = selectedTestCases.value.findIndex(tc => tc.id === testCase.id)
    if (index === -1) {
        selectedTestCases.value.push(testCase)
    } else {
        selectedTestCases.value.splice(index, 1)
    }
    // 强制触发UI更新
    selectedTestCases.value = [...selectedTestCases.value]
}

async function handleGenerate() {
    try {
        if (selectedTestCases.value.length === 0) {
            store.error = '请至少选择一个测试用例'
            return
        }

        if (!testingTools.value.trim()) {
            store.error = '请输入测试工具'
            return
        }

        await store.generateScripts({
            testingTools: testingTools.value, // 保持兼容
            testing_tools: testingTools.value,
            language: language.value, // 保持兼容
            scripting_language: language.value,
            framework: framework.value,
            generateReport: generateReport.value,
            testCases: selectedTestCases.value
        })
        emit('close')
    } catch (error) {
        console.error('生成脚本失败:', error)
    }
}
</script>

<template>
    <div class="modal-overlay" v-if="showModal">
        <div class="modal">
            <div class="modal-header">
                <h3>生成测试脚本</h3>
                <button @click="emit('close')">×</button>
            </div>

            <div class="modal-body">
                <div class="test-case-selection">
                    <h4>选择测试用例</h4>
                    <div class="test-case-list">
                        <div v-for="testCase in store.testCases" :key="testCase.id" class="test-case-item"
                            :class="{ selected: selectedTestCases.some(tc => tc.id === testCase.id) }"
                            @click="toggleSelect(testCase)">
                            <input type="checkbox" :checked="selectedTestCases.some(tc => tc.id === testCase.id)"
                                @click="toggleSelect(testCase, $event)">
                            <span>{{ testCase.id }} - {{ testCase.feature }}</span>
                        </div>
                    </div>
                </div>

                <div class="config-section">
                    <h4>配置选项</h4>
                    <div class="form-group">
                        <label>测试工具:</label>
                        <select v-model="testingTools" class="testing-tools-select">
                            <option value="">请选择测试工具</option>
                            <option value="Selenium">Selenium</option>
                            <option value="Jest">Jest</option>
                            <option value="Cypress">Cypress</option>
                            <option value="Playwright">Playwright</option>
                            <option value="Puppeteer">Puppeteer</option>
                            <option value="Mocha">Mocha</option>
                            <option value="JUnit">JUnit</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>脚本语言:</label>
                        <select v-model="language">
                            <option value="Python">Python</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="Java">Java</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>测试框架:</label>
                        <select v-model="framework">
                            <option value="Pytest">Pytest</option>
                            <option value="Unittest">Unittest</option>
                            <option value="Jest">Jest</option>
                            <option value="JUnit">JUnit</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>生成报告:</label>
                        <input type="checkbox" v-model="generateReport">
                    </div>
                </div>

                <div class="preview-section" v-if="selectedTestCases.length > 0">
                    <h4>预览选中的测试用例 ({{ selectedTestCases.length }})</h4>
                    <div class="preview-content">
                        <div v-for="testCase in selectedTestCases" :key="testCase.id" class="preview-item">
                            <h5>{{ testCase.id }} - {{ testCase.feature }}</h5>
                            <p><strong>步骤:</strong> {{ testCase.steps }}</p>
                            <p><strong>预期结果:</strong> {{ testCase.expected }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button @click="emit('close')">取消</button>
                <button @click="handleGenerate" :disabled="store.isLoading">
                    {{ store.isLoading ? '生成中...' : '生成' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    background: transparent;
    pointer-events: none;
}

.modal {
    pointer-events: auto;
}

.modal {
    background: white;
    width: 800px;
    max-height: 80vh;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 16px;
    overflow-y: auto;
    flex: 1;
}

.test-case-selection {
    margin-bottom: 20px;
}

.test-case-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
}

.test-case-item {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.test-case-item:hover {
    background: #f5f5f5;
}

.test-case-item.selected {
    background: #e6f7ff;
}

.config-section {
    margin-top: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.modal-footer {
    padding: 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.modal-footer button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.modal-footer button:last-child {
    background: #1890ff;
    color: white;
    border: none;
}

.modal-footer button:last-child:disabled {
    background: #ccc;
    cursor: not-allowed;
}
</style>
