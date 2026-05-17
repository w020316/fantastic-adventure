<template>
  <div class="max-w-4xl mx-auto px-6 pt-24 pb-20">
    <h1 class="text-4xl font-display font-bold gradient-text mb-10 anim-fade-in-up">关于我</h1>

    <div class="glass rounded-xl p-8 mb-8 anim-fade-in-up anim-delay-1">
      <div class="flex items-center gap-6 mb-6">
        <div class="w-24 h-24 rounded-full bg-gradient-amber flex items-center justify-center text-3xl font-bold text-dark shadow-lg shadow-amber/20">W</div>
        <div>
          <h2 class="text-2xl font-display font-bold">开发者</h2>
          <p class="text-[var(--color-text-secondary)]">全栈工程师 / 技术博主</p>
        </div>
      </div>
      <p class="text-[var(--color-text-secondary)] leading-relaxed">热爱技术，专注于 Web 全栈开发。在这里分享技术思考、项目经验和学习笔记，希望对你有所帮助。</p>
    </div>

    <div class="glass rounded-xl p-8 mb-8 anim-fade-in-up anim-delay-2">
      <h3 class="text-xl font-display font-bold mb-6 gradient-text">技术栈</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="(skill, idx) in skills" :key="skill.name" class="text-center p-4 rounded-lg bg-dark-200/50 border border-dark-300/30 transition-all duration-300 hover:border-amber/20 hover:bg-dark-200/70" :class="`anim-fade-in-up anim-delay-${Math.min(idx + 3, 6)}`">
          <div class="text-2xl font-bold text-amber mb-1">{{ skill.level }}</div>
          <div class="text-[var(--color-text-secondary)] text-sm">{{ skill.name }}</div>
          <div class="mt-2 h-1.5 bg-dark-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-amber rounded-full transition-all duration-1000 ease-out" :style="{ width: skill.level }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="glass rounded-xl p-8 mb-8 anim-fade-in-up anim-delay-4">
      <h3 class="text-xl font-display font-bold mb-6 gradient-text">联系方式</h3>
      <div class="flex flex-wrap gap-6">
        <a href="https://github.com/w020316" target="_blank" class="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-amber transition-colors duration-300 group">
          <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </div>

    <div class="glass rounded-xl p-8 anim-fade-in-up anim-delay-5">
      <h3 class="text-xl font-display font-bold mb-6 gradient-text">关于本站</h3>
      <div class="space-y-3 text-[var(--color-text-secondary)] text-sm leading-relaxed">
        <p>本站使用 Vue 3 + Express + PostgreSQL 构建，采用暗色主题设计。</p>
        <p>技术栈：Vue 3 / Vite / Tailwind CSS / Express / PostgreSQL / TypeScript</p>
        <p>部署于 Vercel + Render，源码托管于 GitHub。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { recordVisit } from '../api/stats'
import { useSeo } from '../composables/useSeo'

useSeo({ title: '关于我 - MyBlog', description: '全栈工程师，热爱技术，专注Web开发' })

const skills = [
  { name: 'Vue.js', level: '90%' },
  { name: 'React', level: '85%' },
  { name: 'Node.js', level: '80%' },
  { name: 'TypeScript', level: '85%' },
  { name: 'CSS/Tailwind', level: '90%' },
  { name: 'PostgreSQL', level: '75%' },
]

onMounted(() => { recordVisit({ path: '/about' }) })
</script>
