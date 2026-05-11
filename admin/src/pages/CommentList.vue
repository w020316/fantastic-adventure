<template>
  <div>
    <h3 style="margin-top: 0">评论管理</h3>
    <el-table :data="comments" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="article_id" label="文章ID" width="80" />
      <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'approved' ? 'success' : row.status === 'hidden' ? 'danger' : 'warning'">{{ row.status === 'approved' ? '已通过' : row.status === 'hidden' ? '已隐藏' : '待审核' }}</el-tag></template></el-table-column>
      <el-table-column prop="created_at" label="时间" width="180" />
      <el-table-column label="操作" width="220" fixed="right"><template #default="{ row }"><el-button v-if="row.status !== 'approved'" size="small" type="success" @click="handleStatus(row.id, 'approved')">通过</el-button><el-button v-if="row.status !== 'hidden'" size="small" type="warning" @click="handleStatus(row.id, 'hidden')">隐藏</el-button><el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
    </el-table>
    <el-pagination style="margin-top: 16px; justify-content: flex-end" v-model:current-page="page" :page-size="20" :total="total" layout="prev, pager, next" @current-change="loadComments" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getComments, updateCommentStatus, deleteComment } from '../api/comment'

const comments = ref<any[]>([])
const page = ref(1)
const total = ref(0)

async function loadComments() {
  const res: any = await getComments({ page: page.value, limit: 20 })
  comments.value = res.data.list
  total.value = res.data.total
}

async function handleStatus(id: number, status: string) {
  await updateCommentStatus(id, status)
  ElMessage.success('状态更新成功')
  loadComments()
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  await deleteComment(id)
  ElMessage.success('删除成功')
  loadComments()
}

onMounted(loadComments)
</script>
