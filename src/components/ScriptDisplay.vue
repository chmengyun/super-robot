<script setup>
import { useTestStore } from '../store/testStore'
import { computed, ref } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const store = useTestStore()
const currentScriptIndex = ref(0)

const currentScript = computed(() => {
  if (!store.generatedScripts || store.generatedScripts.length === 0) {
    return null
  }
  const script = store.generatedScripts[currentScriptIndex.value]
  return {
    test_case_id: script?.test_case_id || '未知用例',
    script: script?.script || '暂无脚本内容',
    language: script?.scripting_language || 'javascript'
  }
})

function nextScript() {
  if (currentScriptIndex.value < store.generatedScripts.length - 1) {
    currentScriptIndex.value++
  }
}

function prevScript() {
  if (currentScriptIndex.value > 0) {
    currentScriptIndex.value--
  }
}

function exportScript() {
  if (!currentScript.value) return

  const blob = new Blob([currentScript.value.script], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test_script_${currentScript.value.test_case_id}.${currentScript.value.language}`
  a.click()
  URL.revokeObjectURL(url)
}

function highlightCode() {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block)
  })
}
</script>

<template>
  <div class="script-display" v-if="store.showScripts">
    <div class="script-header">
      <h3>测试脚本 - {{ currentScript?.test_case_id }}</h3>
      <div class="script-nav">
        <button @click="prevScript" :disabled="currentScriptIndex === 0">上一个</button>
        <button @click="nextScript" :disabled="currentScriptIndex === store.generatedScripts.length - 1">下一个</button>
        <button @click="exportScript" :disabled="!currentScript">导出</button>
      </div>
    </div>
    <div class="script-code">
      <pre class="script-content"><code :class="currentScript?.language">{{ currentScript?.script }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.script-display {
  flex: 1;
  width: 100%;
  /* margin-left: 20px; */
  padding: 10px;
  height: 95%;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  overflow-y: auto;
}

.script-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.script-code {
  height: 85%;
}

.script-nav button {
  margin-left: 10px;
  padding: 5px 10px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
}

.script-nav button:hover {
  background: #096dd9;
}

.script-nav button:disabled {
  background: #91d5ff;
  cursor: not-allowed;
}

.script-content {
  /* height: 100%; */
  background: #f8f9fa;
  border-radius: 6px;
}

.script-content code {
  display: block;
  padding: 15px;
  height: 540px;
  background: #282c34;
  color: #abb2bf;
  border-radius: 6px;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
}
</style>
