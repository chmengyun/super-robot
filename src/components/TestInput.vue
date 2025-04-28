<script setup>
import { useTestStore } from '../store/testStore'
const store = useTestStore()
</script>

<template>
    <div class="test-input">
        <h2>测试用例生成</h2>
        <form @submit.prevent="store.appendTestCases">
            <div class="form-group">
                <label for="website">测试网站</label>
                <input id="website" v-model="store.testWebsite" type="text" required>
            </div>

            <div class="form-group">
                <label for="module">测试模块</label>
                <input id="module" v-model="store.testModule" type="text" required>
            </div>

            <div class="form-group">
                <label for="description">测试描述</label>
                <textarea id="description" v-model="store.testDescription" required></textarea>
            </div>

            <button type="submit" :disabled="store.isLoading">
                {{ store.isLoading ? '处理中...' : '生成测试用例' }}
            </button>
        </form>
    </div>
</template>

<style scoped>
.test-input {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input,
textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #91d5ff;
    border-radius: 4px;
}

textarea {
    min-height: 100px;
}

button {
    background-color: #1890ff;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    background-color: #91d5ff;
    cursor: not-allowed;
}

.error {
    color: #ff5252;
    margin-top: 10px;
}
</style>
