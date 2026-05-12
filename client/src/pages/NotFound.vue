<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-8xl font-bold gradient-text mb-4">404</h1>
      <p class="text-xl text-slate-400 mb-8">页面未找到</p>
      <p class="text-slate-500 mb-8">你访问的页面不存在或已被移除</p>
      <router-link to="/" class="px-8 py-3 rounded-lg bg-gradient-accent text-white font-medium hover:opacity-90 transition-opacity">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeo } from '../composables/useSeo'
useSeo({ title: '404 - 页面未找到' })
</script>
