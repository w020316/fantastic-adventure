<template>
  <div class="max-w-7xl mx-auto px-6 pt-24 pb-20">
    <h1 class="text-4xl font-bold gradient-text mb-10">作品集</h1>
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div v-else-if="!projects.length" class="text-center py-20">
      <p class="text-slate-500 text-lg">暂无项目</p>
    </div>
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="project in projects" :key="project.id" class="glass rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 glow-border">
        <div v-if="project.cover_image" class="h-48 overflow-hidden"><img :src="project.cover_image" class="w-full h-full object-cover" loading="lazy" /></div>
        <div v-else class="h-48 bg-gradient-to-br from-accent/20 to-cyan/20 flex items-center justify-center">
          <span class="text-4xl gradient-text font-bold">{{ project.title?.[0] }}</span>
        </div>
        <div class="p-6">
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
  } catch {} finally {
    loading.value = false
  }
})
</script>
