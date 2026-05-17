<template>
  <transition name="backtop-fade">
    <button v-if="visible" @click="scrollToTop" class="fixed bottom-8 right-8 z-40 w-11 h-11 rounded-full bg-amber/90 text-dark flex items-center justify-center hover:bg-amber transition-all duration-300 shadow-lg shadow-amber/20 hover:shadow-amber/40 hover:-translate-y-0.5" aria-label="回到顶部">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" /></svg>
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function handleScroll() {
  visible.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.backtop-fade-enter-active, .backtop-fade-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.backtop-fade-enter-from, .backtop-fade-leave-to { opacity: 0; transform: translateY(12px) scale(0.8); }
</style>
