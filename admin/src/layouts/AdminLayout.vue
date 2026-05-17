<template>
  <el-container style="height: 100vh">
    <el-aside :width="mobileMenuOpen ? '220px' : '0px'" :class="['sidebar-transition', { 'mobile-open': mobileMenuOpen }]" style="background: #1d1e2c; overflow: hidden">
      <div style="padding: 20px; text-align: center; color: #fff; font-size: 18px; font-weight: bold; white-space: nowrap">博客管理后台</div>
      <el-menu :default-active="route.path" router background-color="#1d1e2c" text-color="#a0aec0" active-text-color="#6366f1">
        <el-menu-item index="/dashboard"><el-icon><DataAnalysis /></el-icon><span>仪表盘</span></el-menu-item>
        <el-menu-item index="/articles"><el-icon><Document /></el-icon><span>文章管理</span></el-menu-item>
        <el-menu-item index="/categories"><el-icon><Folder /></el-icon><span>分类管理</span></el-menu-item>
        <el-menu-item index="/tags"><el-icon><PriceTag /></el-icon><span>标签管理</span></el-menu-item>
        <el-menu-item index="/comments"><el-icon><ChatDotSquare /></el-icon><span>评论管理</span></el-menu-item>
        <el-menu-item index="/projects"><el-icon><Monitor /></el-icon><span>作品管理</span></el-menu-item>
        <el-menu-item index="/settings"><el-icon><Setting /></el-icon><span>个人设置</span></el-menu-item>
      </el-menu>
    </el-aside>
    <div v-if="mobileMenuOpen" class="sidebar-overlay" @click="mobileMenuOpen = false"></div>
    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #e5e7eb">
        <button class="hamburger-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg xmlns="http://www.w3.org/2000/svg" class="hamburger-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div></div>
        <el-button type="danger" text @click="handleLogout">退出登录</el-button>
      </el-header>
      <el-main style="background: #f5f5f5">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { DataAnalysis, Document, Folder, PriceTag, ChatDotSquare, Monitor, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const mobileMenuOpen = ref(false)

function handleLogout() {
  userStore.clearToken()
  router.push('/login')
}
</script>

<style scoped>
.sidebar-transition {
  transition: width 0.3s ease;
}
.hamburger-btn {
  display: none;
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
}
.hamburger-btn:hover {
  background: #f3f4f6;
}
.hamburger-icon {
  width: 20px;
  height: 20px;
}
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
}
@media (max-width: 768px) {
  .hamburger-btn {
    display: block;
  }
  .sidebar-transition {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 50;
  }
  .sidebar-transition:not(.mobile-open) {
    width: 0 !important;
  }
}
</style>
