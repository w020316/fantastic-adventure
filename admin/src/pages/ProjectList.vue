<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px">
      <h3 style="margin: 0">作品管理</h3>
      <el-button type="primary" @click="showDialog()">新增作品</el-button>
    </div>
    <el-table :data="projects" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="名称" min-width="150" />
      <el-table-column label="技术栈" min-width="200"><template #default="{ row }"><el-tag v-for="t in (row.tech_stack || [])" :key="t" size="small" style="margin-right: 4px">{{ t }}</el-tag></template></el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column label="操作" width="180"><template #default="{ row }"><el-button size="small" @click="showDialog(row)">编辑</el-button><el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑作品' : '新增作品'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="技术栈"><el-select v-model="form.tech_stack" multiple filterable allow-create placeholder="输入后回车添加" /></el-form-item>
        <el-form-item label="Demo"><el-input v-model="form.demo_url" placeholder="在线演示链接" /></el-form-item>
        <el-form-item label="仓库"><el-input v-model="form.repo_url" placeholder="仓库链接" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort_order" :min="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSave">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProjects, createProject, updateProject, deleteProject } from '../api/project'

const projects = ref<any[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ title: '', description: '', tech_stack: [] as string[], demo_url: '', repo_url: '', sort_order: 0 })

async function load() { const res: any = await getProjects(); projects.value = res.data }

function showDialog(row?: any) {
  if (row) { editingId.value = row.id; Object.assign(form, { title: row.title, description: row.description || '', tech_stack: row.tech_stack || [], demo_url: row.demo_url || '', repo_url: row.repo_url || '', sort_order: row.sort_order }) }
  else { editingId.value = null; Object.assign(form, { title: '', description: '', tech_stack: [], demo_url: '', repo_url: '', sort_order: 0 }) }
  dialogVisible.value = true
}

async function handleSave() {
  if (editingId.value) { await updateProject(editingId.value, form) }
  else { await createProject(form) }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  load()
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  await deleteProject(id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>
