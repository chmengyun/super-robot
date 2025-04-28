<script setup>
import TestCaseTable from './TestCaseTable.vue'
import ScriptGenerator from './ScriptGenerator.vue'
import { useTestStore } from '../store/testStore'
import { ref } from 'vue'
import * as XLSX from 'xlsx'

const store = useTestStore()
const searchId = ref('')
const showScriptGenerator = ref(false)
const showExportDialog = ref(false)
const exportFormat = ref('json')

function toggleScriptPanel() {
    store.showScripts = !store.showScripts
}

function openScriptGenerator() {
    if (!store.selectedCases || store.selectedCases.length === 0) {
        alert('请先选择测试用例')
        return
    }
    showScriptGenerator.value = true
}

function closeScriptGenerator() {
    showScriptGenerator.value = false
}

function exportTestCases() {
    showExportDialog.value = false

    try {
        console.log('开始导出测试用例...')
        console.log('选中的用例ID:', store.selectedCases)
        console.log('所有测试用例:', store.testCases)

        if (!store.selectedCases || store.selectedCases.length === 0) {
            throw new Error('请先选择要导出的测试用例')
        }

        // 获取选中的测试用例数据 - 使用processedTestCases而不是testCases
        const casesToExport = store.processedTestCases.filter(
            tc => store.selectedCases.includes(tc.id)
        )

        console.log('要导出的用例数据:', casesToExport)

        if (casesToExport.length === 0) {
            throw new Error('未找到匹配的测试用例数据')
        }

        let blob, filename

        switch (exportFormat.value) {
            case 'json':
                const exportData = {
                    test_cases: casesToExport,
                    timestamp: new Date().toISOString()
                }
                console.log('JSON导出数据:', exportData)
                blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: 'application/json'
                })
                filename = `test_cases_${new Date().toISOString().slice(0, 10)}.json`
                break

            case 'csv':
                const csvHeader = 'ID,Description,Steps,Expected\n'
                const csvRows = casesToExport.map(tc =>
                    `"${tc.id}","${tc.description || ''}","${tc.steps || ''}","${tc.expected || ''}"`
                ).join('\n')
                console.log('CSV内容:', csvHeader + csvRows)
                blob = new Blob([csvHeader + csvRows], {
                    type: 'text/csv;charset=utf-8;'
                })
                filename = `test_cases_${new Date().toISOString().slice(0, 10)}.csv`
                break

            case 'excel':
                const ws = XLSX.utils.json_to_sheet(casesToExport)
                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, ws, 'TestCases')
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
                blob = new Blob([excelBuffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                })
                filename = `test_cases_${new Date().toISOString().slice(0, 10)}.xlsx`
                break
        }

        if (!blob) {
            throw new Error('创建导出文件失败')
        }

        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }, 100)

        console.log('导出成功:', filename)
        alert('导出成功')
    } catch (error) {
        console.error('导出测试用例失败:', error)
        alert(`导出失败: ${error.message}`)
    }
}

function deleteSelectedCases() {
    try {
        if (!store.selectedCases || store.selectedCases.length === 0) {
            throw new Error('请先选择要删除的测试用例')
        }

        if (confirm('确定删除选中的测试用例吗？')) {
            // 直接从Pinia store中删除选中的测试用例
            store.testCases = store.testCases.filter(
                tc => !store.selectedCases.includes(tc.id)
            )
            store.processedTestCases = store.processedTestCases.filter(
                tc => !store.selectedCases.includes(tc.id)
            )

            // 清空选中状态
            store.setSelectedCases([])

            alert('删除成功')
        }
    } catch (error) {
        console.error('删除测试用例失败:', error)
        alert(`删除失败: ${error.message}`)
    }
}
</script>

<template>
    <div class="right-content-panel">
        <div class="table-controls">
            <h2>测试用例列表</h2>
            <div class="search-box">
                <input type="text" placeholder="搜索用例编号..." v-model="searchId">
                <button @click="store.searchTestCases(searchId)">搜索</button>
            </div>
            <div class="action-buttons">
                <button @click="toggleScriptPanel">
                    {{ store.showScripts ? '隐藏脚本' : '显示脚本' }}
                </button>
                <button @click="openScriptGenerator">
                    生成脚本
                </button>
                <button @click="deleteSelectedCases" class="danger">
                    删除选中
                </button>
                <button @click="showExportDialog = true">
                    用例导出
                </button>
            </div>
        </div>

        <div class="table-container">
            <TestCaseTable />
        </div>

        <ScriptGenerator v-if="showScriptGenerator" @close="closeScriptGenerator" :selectedCases="store.selectedCases"
            :scripts="store.generatedScripts" @switch-script="store.setCurrentScript" />

        <div v-if="showExportDialog" class="export-dialog">
            <div class="dialog-content">
                <h3>选择导出格式</h3>
                <select v-model="exportFormat">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                </select>
                <div class="dialog-buttons">
                    <button @click="exportTestCases">导出</button>
                    <button @click="showExportDialog = false">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.right-content-panel {
    width: 80%;
    height: 90%;
    overflow-y: auto;
    position: relative;
    padding: 0 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: #f0f7ff;
    pointer-events: auto;
}

.table-controls {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #e6f7ff;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #bae7ff;
    position: sticky;
    top: 0;
    z-index: 10;
}

.table-container {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(24, 144, 255, 0.2);
    border: 1px solid #91d5ff;
    overflow-y: auto;
}

.search-box {
    display: flex;
    gap: 8px;
}

.search-box input {
    padding: 8px;
    width: 200px;
}

.search-box button {
    padding: 8px 12px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.search-box button:hover {
    background: #096dd9;
}

.action-buttons button {
    margin-left: 10px;
    padding: 8px 15px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.action-buttons button:hover {
    background: #096dd9;
}

.table-actions {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
}

.table-actions button.danger {
    background: #ff7d4f;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.table-actions button.danger:hover {
    background: #ff9c75;
}

.script-panel {
    width: 100%;
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    margin-top: 20px;
    overflow-y: auto;
    max-height: 300px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.script-panel h3 {
    margin-top: 0;
}

.script-panel pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
}

.export-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.dialog-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.dialog-content h3 {
    margin-top: 0;
    margin-bottom: 15px;
}

.dialog-content select {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.dialog-buttons button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.dialog-buttons button:first-child {
    background-color: #1890ff;
    color: white;
}

.dialog-buttons button:last-child {
    background-color: #f5f5f5;
}
</style>
