<template>
  <div>
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-amber opacity-[0.07]"></div>
      <div class="absolute inset-0" style="background: radial-gradient(circle at 30% 50%, rgba(255,183,77,0.12), transparent 50%), radial-gradient(circle at 70% 50%, rgba(230,126,34,0.1), transparent 50%)"></div>
      <div v-if="contentReady" class="hero-particles absolute inset-0 pointer-events-none overflow-hidden">
        <span v-for="i in 12" :key="i" class="particle" :style="{ left: `${(i * 8) % 100}%`, top: `${(i * 13 + 20) % 80}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${4 + (i % 3)}s` }"></span>
      </div>
      <div class="relative z-10 text-center px-6">
        <h1 class="text-5xl md:text-7xl font-display font-bold mb-6 gradient-text anim-fade-in-up">技术创造价值</h1>
        <p class="text-xl md:text-2xl text-[var(--color-text-secondary)] mb-10 anim-fade-in-up anim-delay-2">分享技术思考，记录成长轨迹</p>
        <div class="flex gap-4 justify-center anim-fade-in-up anim-delay-4">
          <router-link to="/articles" class="px-8 py-3 rounded-lg bg-gradient-amber text-dark font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-amber/15 hover:shadow-amber/30">浏览文章</router-link>
          <router-link to="/projects" class="px-8 py-3 rounded-lg glass text-white font-medium hover:border-amber/40 transition-colors duration-300">查看作品</router-link>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-20">
      <h2 class="text-3xl font-display font-bold mb-10 gradient-text anim-fade-in-up">最新文章</h2>
      <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="'skel-a-' + n" class="glass rounded-xl overflow-hidden animate-pulse">
          <div class="h-48 bg-dark-200"></div>
          <div class="p-6 space-y-3">
            <div class="h-5 bg-dark-200 rounded w-3/4"></div>
            <div class="h-4 bg-dark-200/60 rounded w-full"></div>
            <div class="h-4 bg-dark-200/60 rounded w-2/3"></div>
            <div class="flex gap-4 pt-2">
              <div class="h-3 bg-dark-200/40 rounded w-16"></div>
              <div class="h-3 bg-dark-200/40 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="error" class="text-center py-16 anim-fade-in-up">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <p class="text-[var(--color-text-secondary)] text-lg mb-2">数据加载失败</p>
        <p class="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">{{ error }}</p>
        <button @click="retryLoad" class="px-6 py-2.5 rounded-lg bg-gradient-amber text-dark font-medium hover:opacity-90 transition-opacity shadow-md shadow-amber/15 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          重新加载
        </button>
      </div>
      <div v-else-if="!articles.length" class="text-center py-10 text-[var(--color-text-muted)]">暂无文章</div>
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link v-for="(article, idx) in articles" :key="article.id" :to="`/article/${article.id}`" class="glass rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-amber/5 hover:-translate-y-1" :class="`anim-fade-in-up anim-delay-${Math.min(idx % 6 + 1, 6)}`">
          <div v-if="article.cover_image" class="h-48 bg-dark-200 overflow-hidden"><img :src="article.cover_image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /></div>
          <div v-else class="h-48 bg-gradient-to-br from-amber/15 to-amber-deep/10 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(255,183,77,0.2),transparent_70%)]"></div>
            <span class="text-4xl gradient-text font-bold font-display">{{ article.title?.[0] }}</span>
          </div>
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-amber-light transition-colors">{{ article.title }}</h3>
            <p class="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">{{ article.summary }}</p>
            <div class="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span>{{ article.created_at?.substring(0, 10) }}</span>
              <span>{{ article.view_count }} 阅读</span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-20">
      <h2 class="text-3xl font-display font-bold mb-10 gradient-text anim-fade-in-up">精选项目</h2>
      <div v-if="!projects.length" class="text-center py-10 text-[var(--color-text-muted)]">暂无项目</div>
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(project, idx) in projects" :key="project.id" class="glass rounded-xl p-6 group transition-all duration-300 hover:shadow-lg hover:shadow-amber/5 hover:-translate-y-1" :class="`anim-fade-in-up anim-delay-${Math.min(idx % 6 + 1, 6)}`">
          <h3 class="text-lg font-semibold mb-2 group-hover:text-amber-light transition-colors">{{ project.title }}</h3>
          <p class="text-[var(--color-text-secondary)] text-sm mb-4">{{ project.description }}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="tech in (project.tech_stack || [])" :key="tech" class="px-2 py-1 text-xs rounded-full bg-amber/15 text-amber-light border border-amber/10">{{ tech }}</span>
          </div>
          <div class="flex gap-4">
            <a v-if="project.demo_url" :href="project.demo_url" target="_blank" class="text-sm text-amber hover:text-amber-light transition-colors">Demo</a>
            <a v-if="project.repo_url" :href="project.repo_url" target="_blank" class="text-sm text-[var(--color-text-secondary)] hover:text-amber transition-colors">Source</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticles } from '../api/article'
import { getProjects } from '../api/project'
import { recordVisit } from '../api/stats'
import { useSeo } from '../composables/useSeo'

useSeo({ title: 'MyBlog - 技术创造价值', description: '分享技术思考，记录成长轨迹' })

const articles = ref<any[]>([])
const projects = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const contentReady = ref(false)

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [articleRes, projectRes]: any[] = await Promise.all([
      getArticles({ page: 1, limit: 6 }),
      getProjects(),
    ])
    articles.value = articleRes.data?.list || []
    projects.value = (projectRes.data || []).slice(0, 3)
  } catch (err: any) {
    error.value = err.response?.data?.message || '网络异常，请稍后重试'
    console.error('[Home] Failed to load data', err)
  } finally {
    loading.value = false
    contentReady.value = true
  }
}

function retryLoad() { loadData() }

onMounted(async () => {
  recordVisit({ path: '/' })
  await loadData()
})
</script>

<style scoped>
.hero-particles .particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 183, 77, 0.35);
  border-radius: 50%;
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
}
</style>
