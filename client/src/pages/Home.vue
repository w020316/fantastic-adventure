<template>
  <div>
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-amber opacity-[0.07]"></div>
      <div class="absolute inset-0" style="background: radial-gradient(circle at 30% 50%, rgba(255,183,77,0.12), transparent 50%), radial-gradient(circle at 70% 50%, rgba(230,126,34,0.1), transparent 50%)"></div>
      <div class="hero-particles absolute inset-0 pointer-events-none overflow-hidden">
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
      <div v-if="loading" class="flex justify-center py-10">
        <div class="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin"></div>
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

onMounted(async () => {
  recordVisit({ path: '/' })
  try {
    const [articleRes, projectRes]: any[] = await Promise.all([
      getArticles({ page: 1, limit: 6 }),
      getProjects(),
    ])
    articles.value = articleRes.data?.list || []
    projects.value = (projectRes.data || []).slice(0, 3)
  } catch (err) {
    console.error('[Home] Failed to load data', err)
  } finally {
    loading.value = false
  }
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
