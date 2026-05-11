<template>
  <header class="fixed top-0 left-0 right-0 z-50 glass">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <router-link to="/" class="text-xl font-bold gradient-text">MyBlog</router-link>
      <nav class="hidden md:flex items-center gap-8">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="text-slate-300 hover:text-white transition-colors" active-class="!text-accent">{{ item.label }}</router-link>
      </nav>
      <button class="md:hidden text-slate-300" @click="mobileMenuOpen = !mobileMenuOpen">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </div>
    <div v-if="mobileMenuOpen" class="md:hidden px-6 pb-4">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="block py-2 text-slate-300 hover:text-white" @click="mobileMenuOpen = false">{{ item.label }}</router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileMenuOpen = ref(false)
const navItems = [
  { path: '/', label: '首页' },
  { path: '/articles', label: '文章' },
  { path: '/projects', label: '作品集' },
  { path: '/about', label: '关于' },
]
</script>
