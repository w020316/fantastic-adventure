<template>
  <div class="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark opacity-50"></div>
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-amber/5 blur-3xl animate-pulse-soft"></div>

    <div class="relative text-center px-6 anim-fade-in-up">
      <div class="mb-8 relative inline-block">
        <span class="text-[10rem] md:text-[14rem] font-display font-black leading-none gradient-text select-none opacity-90">4</span>
        <span class="absolute top-8 right-0 md:top-12 md:right-2 text-5xl md:text-7xl font-display font-bold text-amber/30 animate-float">0</span>
        <span class="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-3xl md:text-5xl font-display font-bold text-amber-deep/20 animate-float" style="animation-delay: 1s">4</span>
      </div>

      <h1 class="text-2xl md:text-3xl font-display font-bold text-warm mb-3">页面走丢了</h1>
      <p class="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto leading-relaxed">
        你访问的页面可能已迁移到新的维度，或者从未存在过
      </p>

      <div class="flex items-center justify-center gap-4">
        <router-link to="/" class="group relative inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-amber text-dark font-semibold text-sm hover:shadow-lg shadow-amber/25 transition-all duration-300 hover:-translate-y-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          返回首页
        </router-link>
        <router-link to="/articles" class="px-7 py-3 rounded-xl glass text-[var(--color-text-secondary)] font-medium text-sm hover:text-amber hover:border-amber/30 transition-all duration-300">
          浏览文章
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeo } from '../composables/useSeo'
useSeo({ title: '404 - 页面未找到' })
</script>
