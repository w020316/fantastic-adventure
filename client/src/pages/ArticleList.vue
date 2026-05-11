<template>
  <div class="max-w-7xl mx-auto px-6 pt-24 pb-20">
    <h1 class="text-4xl font-bold gradient-text mb-10">文章</h1>
    <div class="flex flex-wrap gap-4 mb-8">
      <select v-model="selectedCategory" @change="loadArticles" class="px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none">
        <option :value="undefined">全部分类</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="selectedTag" @change="loadArticles" class="px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none">
        <option :value="undefined">全部标签</option>
        <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <input v-model="keyword" @keyup.enter="loadArticles" placeholder="搜索文章" class="px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none w-60" />
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link v-for="article in articles" :key="article.id" :to="`/article/${article.id}`" class="glass rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 glow-border">
        <div v-if="article.cover_image" class="h-48 bg-dark-200"><img :src="article.cover_image" class="w-full h-full object-cover" /></div>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ article.title }}</h3>
          <p class="text-slate-400 text-sm mb-4 line-clamp-2">{{ article.summary }}</p>
          <div class="flex flex-wrap gap-2 mb-3">
            <span v-for="tag in (article.tags || [])" :key="tag.id" class="px-2 py-0.5 text-xs rounded" :style="{ backgroundColor: tag.color + '30', color: tag.color }">{{ tag.name }}</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-500">
            <span>{{ article.created_at?.substring(0, 10) }}</span>
            <span>{{ article.view_count }} 阅读</span>
          </div>
        </div>
      </router-link>
    </div>
    <div class="flex justify-center mt-10 gap-2">
      <button v-for="p in totalPages" :key="p" @click="page = p; loadArticles()" class="px-3 py-1 rounded" :class="p === page ? 'bg-accent text-white' : 'bg-dark-100 text-slate-400 hover:text-white'">{{ p }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getArticles } from '../api/article'
import { getCategories } from '../api/category'
import { getTags } from '../api/tag'
import { recordVisit } from '../api/stats'

const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const keyword = ref('')
const selectedCategory = ref<number | undefined>()
const selectedTag = ref<number | undefined>()
const page = ref(1)
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / 9))

async function loadArticles() {
  try {
    const res: any = await getArticles({ page: page.value, limit: 9, category_id: selectedCategory.value, tag_id: selectedTag.value, keyword: keyword.value })
    articles.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch {}
}

onMounted(async () => {
  recordVisit({ path: '/articles' })
  try {
    const [catRes, tagRes]: any[] = await Promise.all([getCategories(), getTags()])
    categories.value = catRes.data || []
    tags.value = tagRes.data || []
  } catch {}
  loadArticles()
})
</script>
