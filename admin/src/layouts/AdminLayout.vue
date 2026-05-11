<template>
  <el-container style="height: 100vh">
    <el-aside width="220px" style="background: #1d1e2c">
      <div style="padding: 20px; text-align: center; color: #fff; font-size: 18px; font-weight: bold">博客管理后台</div>
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
    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: flex-end; background: #fff; border-bottom: 1px solid #e5e7eb">
        <el-button type="danger" text @click="handleLogout">退出登录</el-button>
      </el-header>
      <el-main style="background: #f5f5f5">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { DataAnalysis, Document, Folder, PriceTag, ChatDotSquare, Monitor, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.clearToken()
  router.push('/login')
}
</script>
