<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px">
      <h3 style="margin: 0">标签管理</h3>
      <el-button type="primary" @click="showDialog()">新增标签</el-button>
    </div>
    <el-table :data="tags" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" />
      <el-table-column label="颜色" width="120"><template #default="{ row }"><el-color-picker v-model="row.color" disabled /></template></el-table-column>
      <el-table-column prop="article_count" label="文章数" width="100" />
      <el-table-column label="操作" width="180"><template #default="{ row }"><el-button size="small" @click="showDialog(row)">编辑</el-button><el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑标签' : '新增标签'" width="400px">
      <el-form :model="form" label-width="60px"><el-form-item label="名称"><el-input v-model="form.name" /></el-form-item><el-form-item label="颜色"><el-color-picker v-model="form.color" /></el-form-item></el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSave">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTags, createTag, updateTag, deleteTag } from '../api/tag'

const tags = ref<any[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ name: '', color: '#6366f1' })

async function load() { const res: any = await getTags(); tags.value = res.data }

function showDialog(row?: any) {
  if (row) { editingId.value = row.id; form.name = row.name; form.color = row.color }
  else { editingId.value = null; form.name = ''; form.color = '#6366f1' }
  dialogVisible.value = true
}

async function handleSave() {
  if (editingId.value) { await updateTag(editingId.value, form) }
  else { await createTag(form) }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  load()
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  await deleteTag(id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>
