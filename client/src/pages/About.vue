<template>
  <div class="max-w-4xl mx-auto px-6 pt-24 pb-20">
    <h1 class="text-4xl font-bold gradient-text mb-10">关于我</h1>
    <div class="glass rounded-xl p-8 mb-8">
      <div class="flex items-center gap-6 mb-6">
        <div class="w-24 h-24 rounded-full bg-gradient-accent flex items-center justify-center text-3xl font-bold">W</div>
        <div>
          <h2 class="text-2xl font-bold">开发者</h2>
          <p class="text-slate-400">全栈工程师 / 技术博主</p>
        </div>
      </div>
      <p class="text-slate-300 leading-relaxed">热爱技术，专注于 Web 全栈开发。在这里分享技术思考、项目经验和学习笔记，希望对你有所帮助。</p>
    </div>

    <div class="glass rounded-xl p-8 mb-8">
      <h3 class="text-xl font-bold mb-6 gradient-text">技能</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="skill in skills" :key="skill.name" class="text-center p-4 rounded-lg bg-dark-200/50">
          <div class="text-2xl font-bold text-accent mb-1">{{ skill.level }}</div>
          <div class="text-slate-400 text-sm">{{ skill.name }}</div>
        </div>
      </div>
    </div>

    <div class="glass rounded-xl p-8">
      <h3 class="text-xl font-bold mb-6 gradient-text">联系方式</h3>
      <div class="flex gap-6">
        <a href="https://github.com/w020316" target="_blank" class="text-slate-400 hover:text-white transition-colors">GitHub</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { recordVisit } from '../api/stats'

const skills = [
  { name: 'Vue.js', level: '90%' },
  { name: 'React', level: '85%' },
  { name: 'Node.js', level: '80%' },
  { name: 'TypeScript', level: '85%' },
  { name: 'CSS/Tailwind', level: '90%' },
  { name: 'MySQL', level: '75%' },
]

onMounted(() => { recordVisit({ path: '/about' }) })
</script>
