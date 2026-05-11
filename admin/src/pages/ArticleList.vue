<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px">
      <el-input v-model="keyword" placeholder="搜索文章" style="width: 300px" @keyup.enter="loadArticles" clearable />
      <el-button type="primary" @click="router.push('/article/edit')">新建文章</el-button>
    </div>
    <el-table :data="articles" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="category_name" label="分类" width="120" />
      <el-table-column prop="status" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'published' ? 'success' : 'info'">{{ row.status === 'published' ? '已发布' : '草稿' }}</el-tag></template></el-table-column>
      <el-table-column prop="view_count" label="浏览" width="80" />
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right"><template #default="{ row }"><el-button size="small" @click="router.push(`/article/edit/${row.id}`)">编辑</el-button><el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
    </el-table>
    <el-pagination style="margin-top: 16px; justify-content: flex-end" v-model:current-page="page" :page-size="10" :total="total" layout="prev, pager, next" @current-change="loadArticles" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticles, deleteArticle } from '../api/article'

const router = useRouter()
const articles = ref<any[]>([])
const keyword = ref('')
const page = ref(1)
const total = ref(0)

async function loadArticles() {
  const res: any = await getArticles({ page: page.value, limit: 10, keyword: keyword.value, status: undefined })
  articles.value = res.data.list
  total.value = res.data.total
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除该文章？', '提示', { type: 'warning' })
  await deleteArticle(id)
  ElMessage.success('删除成功')
  loadArticles()
}

onMounted(loadArticles)
</script>
