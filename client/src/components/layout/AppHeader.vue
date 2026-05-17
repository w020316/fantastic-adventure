<template>
  <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="scrolled ? 'glass' : 'bg-transparent'">
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent"></div>
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <router-link to="/" class="text-xl font-display font-bold gradient-text tracking-wide">MyBlog</router-link>
      <nav class="hidden md:flex items-center gap-8">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-link" active-class="nav-link-active">{{ item.label }}</router-link>
      </nav>
      <button class="md:hidden text-[var(--color-text-secondary)] hover:text-amber transition-colors" @click="mobileMenuOpen = !mobileMenuOpen">
        <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="md:hidden px-6 pb-4 space-y-1">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="block py-2.5 text-[var(--color-text-secondary)] hover:text-amber transition-colors border-b border-dark-300/50 last:border-0" @click="mobileMenuOpen = false">{{ item.label }}</router-link>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const mobileMenuOpen = ref(false)
const scrolled = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => { window.addEventListener('scroll', handleScroll, { passive: true }) })
onUnmounted(() => { window.removeEventListener('scroll', handleScroll) })

const navItems = [
  { path: '/', label: '首页' },
  { path: '/articles', label: '文章' },
  { path: '/projects', label: '作品集' },
  { path: '/about', label: '关于' },
]
</script>

<style scoped>
.nav-link {
  position: relative;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  letter-spacing: 0.03em;
  transition: color 0.3s ease;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #ffb74d, #e67e22);
  border-radius: 1px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-link:hover { color: #ffb74d; }
.nav-link:hover::after { width: 100%; }
.nav-link-active { color: #ffb74d !important; }
.nav-link-active::after { width: 100% !important; }

.slide-down-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-down-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
