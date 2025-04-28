<script setup>
import { useTestStore } from '../store/testStore'
import { ref, computed, onMounted, watch } from 'vue'
import ScriptDisplay from './ScriptDisplay.vue'

const store = useTestStore()

const editingId = ref(null)
const editData = ref({})
const selectedCases = ref([])
const selectAll = ref(false)
const pageSize = ref(10)
const currentPage = ref(1)
function saveState() {
    const state = {
        selectedCases: selectedCases.value,
        pageSize: pageSize.value,
        currentPage: currentPage.value,
        showScripts: store.showScripts
    }
    localStorage.setItem('testCaseTableState', JSON.stringify(state))
}

// 从localStorage恢复状态
function restoreState() {
    const savedState = localStorage.getItem('testCaseTableState')
    if (savedState) {
        const state = JSON.parse(savedState)
        selectedCases.value = state.selectedCases || []
        pageSize.value = state.pageSize || 10
        currentPage.value = state.currentPage || 1
        store.showScripts = state.showScripts || false
    }
}

// 组件挂载时恢复状态
onMounted(() => {
    restoreState()
})

// 监听状态变化自动保存
watch([selectedCases, pageSize, currentPage, () => store.showScripts], () => {
    saveState()
}, { deep: true })

const hasSelection = computed(() => selectedCases.value.length > 0)

const paginatedTestCases = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return store.processedTestCases.slice(start, end)
})

function handlePageChange(page) {
    currentPage.value = page
}

function startEdit(testCase) {
    editingId.value = testCase.id
    editData.value = { ...testCase }
}

async function saveEdit(id) {
    // 数据验证
    if (!editData.value.feature || !editData.value.description) {
        alert('功能点和用例说明不能为空')
        return
    }

    try {
        const result = await store.updateTestCase(id, editData.value)
        if (result.success) {
            editingId.value = null
            // 自动刷新表格数据
            // 仅更新当前编辑的测试用例
            const index = store.processedTestCases.findIndex(tc => tc.id === id)
            if (index !== -1) {
                store.processedTestCases[index] = {
                    ...store.processedTestCases[index],
                    ...editData.value
                }
            }
            // 重置分页到第一页
            currentPage.value = 1
            // 清空选中状态
            selectedCases.value = []
            selectAll.value = false
            // 强制组件重新渲染
            editingId.value = null
        } else {
            throw new Error(result.error || '更新失败')
        }
    } catch (error) {
        console.error('保存测试用例失败:', error)
        alert(`保存失败: ${error.message}`)
    }
}

function cancelEdit() {
    editingId.value = null
}

function toggleSelectAll() {
    if (selectAll.value) {
        selectedCases.value = store.processedTestCases.map(tc => tc.id)
    } else {
        selectedCases.value = []
    }
    store.setSelectedCases(selectedCases.value)
}

function toggleSelectCase(id) {
    const index = selectedCases.value.indexOf(id)
    if (index === -1) {
        selectedCases.value.push(id)
    } else {
        selectedCases.value.splice(index, 1)
    }
    store.setSelectedCases(selectedCases.value)
}
</script>

<template>
    <div class="test-case-container">
        <div class="test-case-table" :class="{ 'collapsed': store.showScripts }">
            <div class="table-content">
                <table>
                    <colgroup>
                        <col width="40">
                    </colgroup>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                            </th>
                            <th>测试用例编号</th>
                            <th>功能点</th>
                            <th>用例说明</th>
                            <th>前置条件</th>
                            <th>输入</th>
                            <th>执行步骤</th>
                            <th>预期结果</th>
                            <th>重要程度</th>
                            <th>测试方法</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="paginatedTestCases.length">
                            <tr v-for="testCase in paginatedTestCases" :key="testCase.id"
                                :class="{ 'selected-row': selectedCases.includes(testCase.id) }">
                                <td>
                                    <input type="checkbox" :checked="selectedCases.includes(testCase.id)"
                                        @change="toggleSelectCase(testCase.id)" @click.stop>
                                </td>
                                <td>{{ testCase.id }}</td>
                                <td v-if="editingId !== testCase.id">{{ testCase.feature }}</td>
                                <td v-else><input v-model="editData.feature"></td>

                                <td v-if="editingId !== testCase.id">{{ testCase.description }}</td>
                                <td v-else><input v-model="editData.description"></td>

                                <td v-if="editingId !== testCase.id">{{ testCase.precondition }}</td>
                                <td v-else><input v-model="editData.precondition"></td>

                                <td v-if="editingId !== testCase.id">{{ testCase.input }}</td>
                                <td v-else><input v-model="editData.input"></td>

                                <td v-if="editingId !== testCase.id">{{ testCase.steps }}</td>
                                <td v-else><textarea v-model="editData.steps"></textarea></td>

                                <td v-if="editingId !== testCase.id">{{ testCase.expected }}</td>
                                <td v-else><textarea v-model="editData.expected"></textarea></td>

                                <td v-if="editingId !== testCase.id">{{ testCase.priority }}</td>
                                <td v-else>
                                    <select v-model="editData.priority">
                                        <option value="高">高</option>
                                        <option value="中">中</option>
                                        <option value="低">低</option>
                                    </select>
                                </td>

                                <td v-if="editingId !== testCase.id">{{ testCase.method }}</td>
                                <td v-else><input v-model="editData.method"></td>

                                <td>
                                    <button v-if="editingId !== testCase.id" @click="startEdit(testCase)">
                                        编辑
                                    </button>
                                    <template v-else>
                                        <button @click="saveEdit(testCase.id)">保存</button>
                                        <button @click="cancelEdit">取消</button>
                                    </template>
                                </td>
                            </tr>
                        </template>
                        <tr v-else>
                            <td colspan="11" style="text-align: center;">暂无测试用例数据</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pagination-container">
                <div class="pagination-info">
                    <span>共 {{ store.processedTestCases.length }} 条数据 (当前显示 {{ paginatedTestCases.length }} 条)</span>
                </div>
                <div class="pagination-controls">
                    <button @click="handlePageChange(Math.max(1, currentPage - 1))" :disabled="currentPage === 1">
                        ← 上一页 </button>
                    <span class="page-input">
                        <input type="number" :min="1" v-model.number="currentPage"
                            @keyup.enter="handlePageChange(currentPage)">
                        <span>/ {{ Math.ceil(store.processedTestCases.length / pageSize) }} 页</span>
                    </span>
                    <button @click="handlePageChange(currentPage + 1)"
                        :disabled="currentPage >= Math.ceil(store.processedTestCases.length / pageSize)">
                        下一页 →
                    </button>
                    <span class="page-size">
                        每页显示：
                        <select v-model="pageSize" @change="handlePageChange(1)">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </span>
                </div>
            </div>
        </div>
        <ScriptDisplay v-if="store.showScripts" />
    </div>
</template>

<style scoped>
.test-case-container {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 20px;
    position: relative;
}

.test-case-table {
    flex: 2;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
    min-height: 0;
    overflow-y: auto;
    padding: 15px;
    position: relative;
    padding-top: 0px;
    /* 为固定表头留出空间 */
    padding-bottom: 0px;
    /* 为固定分页留出空间 */
}

/* 固定表头样式 */
table thead {
    position: sticky;
    top: 0;
    background: #f2f2f2;
    z-index: 10;
}

/* 固定分页样式 */
.pagination-container {
    position: sticky;
    bottom: 10px;
    background: #fff;
    z-index: 10;
    padding: 10px;
    border-top: 1px solid #e9ecef;
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination-info {
    font-size: 14px;
    color: #666;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.pagination-controls button {
    padding: 5px 12px;
    border: 1px solid #ddd;
    background: #f8f9fa;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-controls button:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
}

.pagination-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-input input {
    width: 50px;
    padding: 5px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin: 0 5px;
}

.page-input span {
    font-size: 14px;
    color: #666;
}

.page-size select {
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
}

.table-content {
    margin-top: 20px;
    margin-bottom: 20px;
    overflow-y: auto;
    height: calc(100% - 120px);
    /* 减去表头和分页的高度 */
}

.table-header button {
    padding: 8px 16px;
    background: #4a6cf7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

table {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    border-collapse: collapse;
    table-layout: fixed;
}

td,
th {
    white-space: normal;
    word-break: break-word;
    overflow: hidden;
}

button {
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #08b9ff8e;
}

input,
textarea {
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
}

textarea {
    min-height: 60px;
}

button {
    margin-right: 5px;
    padding: 5px 10px;
    cursor: pointer;
}

.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 15px;
}

.danger {
    background: #f44336 !important;
}

.selected-row {
    background-color: #f0f7ff;
}

.selected-row:hover {
    background-color: #e1f0ff;
}

input[type="checkbox"] {
    width: auto;
    margin: 0;
}
</style>
