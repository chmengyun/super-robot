<script setup>
// 导航菜单的状态管理逻辑
</script>

<template>
    <nav class="navbar">
        <div class="logo">自动化测试平台</div>
        <ul class="nav-links">
            <li><a href="#">首页</a></li>
            <li><a href="#">测试用例</a></li>
            <li><a href="#">测试脚本</a></li>
            <li><a href="#">设置</a></li>
        </ul>
    </nav>
</template>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background-color: #1890ff;
    color: white;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 40px;
}

.nav-links {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.nav-links a {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    transition: opacity 0.3s;
}

.nav-links a:hover {
    opacity: 0.8;
}
</style>
