<template>
  <div class="max-w-7xl mx-auto px-6 pt-24 pb-20">
    <h1 class="text-4xl font-display font-bold gradient-text mb-10 anim-fade-in-up">文章</h1>

    <div class="flex flex-wrap gap-4 mb-8 anim-fade-in-up anim-delay-1">
      <select v-model="selectedCategory" @change="page = 1; loadArticles()" class="px-3 py-2 rounded-lg bg-dark-100 text-[var(--color-text-secondary)] border border-dark-200 focus:border-amber focus:ring-1 focus:ring-amber/30 outline-none transition-colors">
        <option :value="undefined">全部分类</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="selectedTag" @change="page = 1; loadArticles()" class="px-3 py-2 rounded-lg bg-dark-100 text-[var(--color-text-secondary)] border border-dark-200 focus:border-amber focus:ring-1 focus:ring-amber/30 outline-none transition-colors">
        <option :value="undefined">全部标签</option>
        <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <div class="relative">
        <input v-model="keyword" @keyup.enter="debouncedSearch" @input="debouncedSearch" placeholder="搜索文章..." class="px-3 py-2 pl-9 rounded-lg bg-dark-100 text-[var(--color-text-secondary)] border border-dark-200 focus:border-amber focus:ring-1 focus:ring-amber/30 outline-none w-60 transition-colors" />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!articles.length" class="text-center py-20 anim-fade-in-up">
      <p class="text-[var(--color-text-muted)] text-lg">暂无文章</p>
      <p class="text-[var(--color-text-muted)] text-sm mt-2 opacity-70">试试调整筛选条件</p>
    </div>

    <template v-else>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link v-for="(article, idx) in articles" :key="article.id" :to="`/article/${article.id}`" class="glass rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-amber/5 hover:-translate-y-1" :class="`anim-fade-in-up anim-delay-${Math.min(idx % 6 + 1, 6)}`">
          <div v-if="article.cover_image" class="h-48 bg-dark-200 overflow-hidden"><img :src="article.cover_image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /></div>
          <div v-else class="h-48 bg-gradient-to-br from-amber/15 to-amber-deep/10 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,rgba(255,183,77,0.18),transparent_70%)]"></div>
            <span class="text-4xl gradient-text font-bold font-display">{{ article.title?.[0] }}</span>
          </div>
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-amber-light transition-colors">{{ article.title }}</h3>
            <p class="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">{{ article.summary }}</p>
            <div class="flex flex-wrap gap-2 mb-3">
              <span v-for="tag in (article.tags || [])" :key="tag.id" class="px-2 py-0.5 text-xs rounded-full border" :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '30' }">{{ tag.name }}</span>
            </div>
            <div class="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span>{{ article.created_at?.substring(0, 10) }}</span>
              <span>{{ article.view_count }} 阅读</span>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center mt-10 gap-2 flex-wrap">
        <button @click="page = 1; loadArticles()" :disabled="page === 1" class="px-3 py-1.5 rounded-lg bg-dark-100 text-[var(--color-text-muted)] hover:text-white hover:bg-dark-200 disabled:opacity-30 transition-all text-sm">首页</button>
        <button @click="page--; loadArticles()" :disabled="page === 1" class="px-3 py-1.5 rounded-lg bg-dark-100 text-[var(--color-text-muted)] hover:text-white hover:bg-dark-200 disabled:opacity-30 transition-all text-sm">上一页</button>
        <button v-for="p in visiblePages" :key="p" @click="page = p; loadArticles()" class="px-3 py-1.5 rounded-lg text-sm transition-all" :class="p === page ? 'bg-gradient-amber text-dark font-medium shadow-md shadow-amber/20' : 'bg-dark-100 text-[var(--color-text-muted)] hover:text-white hover:bg-dark-200'">{{ p }}</button>
        <button @click="page++; loadArticles()" :disabled="page === totalPages" class="px-3 py-1.5 rounded-lg bg-dark-100 text-[var(--color-text-muted)] hover:text-white hover:bg-dark-200 disabled:opacity-30 transition-all text-sm">下一页</button>
        <button @click="page = totalPages; loadArticles()" :disabled="page === totalPages" class="px-3 py-1.5 rounded-lg bg-dark-100 text-[var(--color-text-muted)] hover:text-white hover:bg-dark-200 disabled:opacity-30 transition-all text-sm">末页</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { getArticles } from '../api/article'
import { getCategories } from '../api/category'
import { getTags } from '../api/tag'
import { recordVisit } from '../api/stats'
import { useSeo } from '../composables/useSeo'

useSeo({ title: '文章 - MyBlog', description: '浏览所有技术文章', keywords: '技术文章,编程,开发' })

const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const keyword = ref('')
const selectedCategory = ref<number | undefined>()
const selectedTag = ref<number | undefined>()
const page = ref(1)
const total = ref(0)
const loading = ref(true)
const totalPages = computed(() => Math.ceil(total.value / 9))

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, page.value - 2)
  const end = Math.min(totalPages.value, page.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const debouncedSearch = useDebounceFn(() => {
  page.value = 1
  loadArticles()
}, 300)

async function loadArticles() {
  loading.value = true
  try {
    const res: any = await getArticles({ page: page.value, limit: 9, category_id: selectedCategory.value, tag_id: selectedTag.value, keyword: keyword.value })
    articles.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (err) {
    console.error('[ArticleList] Failed to load categories/tags', err)
  } finally {
    loading.value = false
  }
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
