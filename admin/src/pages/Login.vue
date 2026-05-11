<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #0a0a0f">
    <el-card style="width: 400px; background: #1d1e2c; border: 1px solid #2d2e3c">
      <template #header><h2 style="color: #f1f5f9; text-align: center; margin: 0">博客管理后台</h2></template>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item><el-input v-model="form.username" placeholder="用户名" size="large" /></el-form-item>
        <el-form-item><el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password /></el-form-item>
        <el-form-item><el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loading">登录</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api/auth'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

async function handleLogin() {
  if (!form.username || !form.password) { ElMessage.warning('请输入用户名和密码'); return }
  loading.value = true
  try {
    const res: any = await login(form)
    userStore.setToken(res.data.access_token, res.data.refresh_token)
    userStore.userInfo = res.data.user
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch { ElMessage.error('登录失败') }
  finally { loading.value = false }
}
</script>
