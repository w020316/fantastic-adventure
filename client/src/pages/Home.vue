<template>
  <div>
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-accent opacity-20"></div>
      <div class="absolute inset-0" style="background: radial-gradient(circle at 30% 50%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(circle at 70% 50%, rgba(6,182,212,0.15), transparent 50%)"></div>
      <div class="relative z-10 text-center px-6">
        <h1 class="text-5xl md:text-7xl font-bold mb-6 gradient-text animate__animated animate__fadeInUp">技术创造价值</h1>
        <p class="text-xl md:text-2xl text-slate-400 mb-10 animate__animated animate__fadeInUp animate__delay-1s">分享技术思考，记录成长轨迹</p>
        <div class="flex gap-4 justify-center animate__animated animate__fadeInUp animate__delay-2s">
          <router-link to="/articles" class="px-8 py-3 rounded-lg bg-gradient-accent text-white font-medium hover:opacity-90 transition-opacity">浏览文章</router-link>
          <router-link to="/projects" class="px-8 py-3 rounded-lg glass text-white font-medium hover:border-accent/40 transition-colors">查看作品</router-link>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-20">
      <h2 class="text-3xl font-bold mb-10 gradient-text">最新文章</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link v-for="article in articles" :key="article.id" :to="`/article/${article.id}`" class="glass rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 glow-border">
          <div v-if="article.cover_image" class="h-48 bg-dark-200"><img :src="article.cover_image" class="w-full h-full object-cover" /></div>
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ article.title }}</h3>
            <p class="text-slate-400 text-sm mb-4 line-clamp-2">{{ article.summary }}</p>
            <div class="flex items-center gap-4 text-xs text-slate-500">
              <span>{{ article.created_at?.substring(0, 10) }}</span>
              <span>{{ article.view_count }} 阅读</span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-20">
      <h2 class="text-3xl font-bold mb-10 gradient-text">精选项目</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="project in projects" :key="project.id" class="glass rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 glow-border">
          <h3 class="text-lg font-semibold mb-2">{{ project.title }}</h3>
          <p class="text-slate-400 text-sm mb-4">{{ project.description }}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="tech in (project.tech_stack || [])" :key="tech" class="px-2 py-1 text-xs rounded bg-accent/20 text-accent-light">{{ tech }}</span>
          </div>
          <div class="flex gap-4">
            <a v-if="project.demo_url" :href="project.demo_url" target="_blank" class="text-sm text-cyan hover:underline">Demo</a>
            <a v-if="project.repo_url" :href="project.repo_url" target="_blank" class="text-sm text-slate-400 hover:underline">Source</a>
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

const articles = ref<any[]>([])
const projects = ref<any[]>([])

onMounted(async () => {
  recordVisit({ path: '/' })
  try {
    const [articleRes, projectRes]: any[] = await Promise.all([
      getArticles({ page: 1, limit: 6 }),
      getProjects(),
    ])
    articles.value = articleRes.data?.list || []
    projects.value = (projectRes.data || []).slice(0, 3)
  } catch {}
})
</script>
