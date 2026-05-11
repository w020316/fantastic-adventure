<template>
  <div class="max-w-7xl mx-auto px-6 pt-24 pb-20">
    <h1 class="text-4xl font-bold gradient-text mb-10">作品集</h1>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="project in projects" :key="project.id" class="glass rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 glow-border">
        <div v-if="project.cover_image" class="h-48 rounded-lg mb-4 overflow-hidden"><img :src="project.cover_image" class="w-full h-full object-cover" /></div>
        <h3 class="text-xl font-semibold mb-2">{{ project.title }}</h3>
        <p class="text-slate-400 text-sm mb-4">{{ project.description }}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="tech in (project.tech_stack || [])" :key="tech" class="px-2 py-1 text-xs rounded bg-accent/20 text-accent-light">{{ tech }}</span>
        </div>
        <div class="flex gap-4">
          <a v-if="project.demo_url" :href="project.demo_url" target="_blank" class="px-4 py-2 rounded-lg bg-gradient-accent text-white text-sm hover:opacity-90 transition-opacity">在线演示</a>
          <a v-if="project.repo_url" :href="project.repo_url" target="_blank" class="px-4 py-2 rounded-lg glass text-white text-sm hover:border-accent/40 transition-colors">查看源码</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProjects } from '../api/project'
import { recordVisit } from '../api/stats'

const projects = ref<any[]>([])

onMounted(async () => {
  recordVisit({ path: '/projects' })
  try {
    const res: any = await getProjects()
    projects.value = res.data || []
  } catch {}
})
</script>
