<template>
  <div>
    <el-card>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" placeholder="文章标题" /></el-form-item>
        <el-form-item label="分类"><el-select v-model="form.category_id" placeholder="选择分类"><el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" /></el-select></el-form-item>
        <el-form-item label="标签"><el-select v-model="form.tag_ids" multiple placeholder="选择标签"><el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" /></el-select></el-form-item>
        <el-form-item label="摘要"><el-input v-model="form.summary" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="draft">草稿</el-radio><el-radio value="published">发布</el-radio></el-radio-group></el-form-item>
        <el-form-item label="内容"><MdEditor v-model="form.content" style="height: 500px" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSubmit" :loading="loading">{{ isEdit ? '更新' : '创建' }}</el-button><el-button @click="router.back()">取消</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { getArticle, createArticle, updateArticle } from '../api/article'
import { getCategories } from '../api/category'
import { getTags } from '../api/tag'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  content: '',
  summary: '',
  category_id: undefined as number | undefined,
  tag_ids: [] as number[],
  status: 'draft' as string,
})

onMounted(async () => {
  const [catRes, tagRes]: any[] = await Promise.all([getCategories(), getTags()])
  categories.value = catRes.data
  tags.value = tagRes.data

  if (isEdit.value) {
    const res: any = await getArticle(Number(route.params.id))
    const a = res.data
    form.title = a.title
    form.content = a.content
    form.summary = a.summary || ''
    form.category_id = a.category_id
    form.tag_ids = a.tags?.map((t: any) => t.id) || []
    form.status = a.status
  }
})

async function handleSubmit() {
  loading.value = true
  try {
    if (isEdit.value) { await updateArticle(Number(route.params.id), form) }
    else { await createArticle(form) }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    router.push('/articles')
  } finally { loading.value = false }
}
</script>
