<script setup>
import NavBar from './components/NavBar.vue'
import TestInput from './components/TestInput.vue'
import RightContentPanel from './components/RightContentPanel.vue'
import ScriptGenerator from './components/ScriptGenerator.vue'
</script>

<template>
  <div class="app-container">
    <NavBar />
    <main class="main-layout">
      <div class="left-section">
        <TestInput />
        <ScriptGenerator />
      </div>
      <RightContentPanel />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  box-sizing: border-box;
}

.main-layout {
  /* 仅作为容器，实际布局由fixed定位的子元素控制 */
  position: relative;
  height: 100%;
}

.left-section {
  position: fixed;
  width: 20%;
  min-width: 200px;
  top: 60px;
  bottom: 0;
  left: 0;
  border-right: 1px solid #eee;
  overflow: hidden;
  background: #fff;
}

.right-content-panel {
  position: fixed;
  top: 70px;
  left: 20%;
  /* right: 0; */
  /* bottom: 0; */
  /* overflow: hidden; */
  background: #fff;
}
</style>
