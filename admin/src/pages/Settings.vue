<template>
  <div>
    <h3 style="margin-top: 0">个人设置</h3>
    <el-card style="max-width: 500px">
      <el-form :model="pwdForm" label-width="80px" @submit.prevent="handleChangePassword">
        <el-form-item label="原密码"><el-input v-model="pwdForm.old_password" type="password" show-password /></el-form-item>
        <el-form-item label="新密码"><el-input v-model="pwdForm.new_password" type="password" show-password /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleChangePassword" :loading="loading">修改密码</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { updatePassword } from '../api/auth'

const loading = ref(false)
const pwdForm = reactive({ old_password: '', new_password: '' })

async function handleChangePassword() {
  if (!pwdForm.old_password || !pwdForm.new_password) { ElMessage.warning('请填写完整'); return }
  if (pwdForm.new_password.length < 6) { ElMessage.warning('新密码至少6位'); return }
  loading.value = true
  try {
    await updatePassword(pwdForm)
    ElMessage.success('密码修改成功')
    pwdForm.old_password = ''
    pwdForm.new_password = ''
  } finally { loading.value = false }
}
</script>
