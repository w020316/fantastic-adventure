<template>
  <div class="max-w-7xl mx-auto px-6 pt-24 pb-20">
    <h1 class="text-4xl font-display font-bold gradient-text mb-10 anim-fade-in-up">作品集</h1>
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div v-else-if="!projects.length" class="text-center py-20 anim-fade-in-up">
      <p class="text-[var(--color-text-muted)] text-lg">暂无项目</p>
    </div>
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="(project, idx) in projects" :key="project.id" class="glass rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-amber/5 hover:-translate-y-1" :class="`anim-fade-in-up anim-delay-${Math.min(idx % 6 + 1, 6)}`">
        <div v-if="project.cover_image" class="h-48 overflow-hidden"><img :src="project.cover_image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /></div>
        <div v-else class="h-48 bg-gradient-to-br from-amber/15 to-amber-deep/10 flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,rgba(255,183,77,0.18),transparent_70%)]"></div>
          <span class="text-4xl gradient-text font-bold font-display">{{ project.title?.[0] }}</span>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2 group-hover:text-amber-light transition-colors">{{ project.title }}</h3>
          <p class="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">{{ project.description }}</p>
          <div class="flex flex-wrap gap-2 mb-5">
            <span v-for="tech in (project.tech_stack || [])" :key="tech" class="px-2 py-1 text-xs rounded-full bg-amber/15 text-amber-light border border-amber/10">{{ tech }}</span>
          </div>
          <div class="flex gap-3">
            <a v-if="project.demo_url" :href="project.demo_url" target="_blank" class="px-4 py-2 rounded-lg bg-gradient-amber text-dark text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-amber/15">在线演示</a>
            <a v-if="project.repo_url" :href="project.repo_url" target="_blank" class="px-4 py-2 rounded-lg glass text-white text-sm hover:border-amber/40 transition-colors duration-300">查看源码</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProjects } from '../api/project'
import { recordVisit } from '../api/stats'
import { useSeo } from '../composables/useSeo'

useSeo({ title: '作品集 - MyBlog', description: '我的技术项目与作品集' })

const projects = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  recordVisit({ path: '/projects' })
  try {
    const res: any = await getProjects()
    projects.value = res.data || []
  } catch (err) {
    console.error('[ProjectList] Failed to load projects', err)
  } finally {
    loading.value = false
  }
})
</script>
