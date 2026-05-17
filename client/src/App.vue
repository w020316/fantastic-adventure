<template>
  <div class="app-root">
    <LampIntro v-if="showIntro" @complete="onIntroComplete" />
    <div class="min-h-screen" :class="{ 'page-visible': pageVisible }">
      <AppHeader />
      <main class="pt-16">
        <router-view v-slot="{ Component, route }">
          <transition name="page-slide" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
      <AppFooter />
      <BackToTop />
      <transition name="toast-fade">
        <div v-if="toastVisible" class="toast-notification">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          {{ toastMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import BackToTop from './components/BackToTop.vue'
import LampIntro from './components/LampIntro.vue'
import { useToast } from './composables/useToast'

const { message: toastMessage, visible: toastVisible } = useToast()

const showIntro = ref(false)
const pageVisible = ref(true)

onMounted(() => {
  const seen = sessionStorage.getItem('lamp-intro-seen')
  if (!seen) {
    showIntro.value = true
    pageVisible.value = false
  }
})

function onIntroComplete() {
  showIntro.value = false
  pageVisible.value = true
  document.body.style.overflow = ''
  sessionStorage.setItem('lamp-intro-seen', '1')
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Noto+Sans+SC:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --color-bg: #08080d;
  --color-surface: #111118;
  --color-surface-2: #1a1a24;
  --color-border: #2a2a3a;
  --color-text: #e8e6e3;
  --color-text-secondary: #9a9a9a;
  --color-text-muted: #5a5a6a;
  --color-amber: #ffb74d;
  --color-amber-dark: #f59e0b;
  --color-amber-glow: rgba(255, 183, 77, 0.15);
  --color-amber-deep: #e67e22;
  --color-warm-white: #fef3c7;
  --font-display: 'Playfair Display', 'Georgia', serif;
  --font-body: 'Noto Sans SC', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-amber-dark);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-amber);
}

.glass {
  background: rgba(17, 17, 24, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease;
}

.glass:hover {
  border-color: rgba(255, 183, 77, 0.25);
  box-shadow: 0 8px 32px rgba(255, 183, 77, 0.06);
  transform: translateY(-2px);
}

.gradient-text {
  background: linear-gradient(135deg, var(--color-amber), var(--color-amber-deep));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-visible {
  animation: pageReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes pageReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-notification {
  position: fixed;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: var(--color-surface-2);
  color: var(--color-amber);
  font-size: 0.875rem;
  border: 1px solid rgba(255, 183, 77, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.prose {
  color: var(--color-text);
  line-height: 1.8;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  font-family: var(--font-display);
  color: var(--color-warm-white);
  margin-top: 2em;
  margin-bottom: 0.8em;
  letter-spacing: 0.02em;
}

.prose h2 {
  font-size: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.prose h3 {
  font-size: 1.25rem;
}

.prose p {
  margin-bottom: 1.2em;
}

.prose a {
  color: var(--color-amber);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}

.prose a:hover {
  color: var(--color-warm-white);
}

.prose code {
  font-family: var(--font-mono);
  background: var(--color-surface-2);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--color-amber);
}

.prose pre {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  overflow-x: auto;
  margin: 1.5em 0;
}

.prose pre code {
  background: none;
  padding: 0;
  color: var(--color-text);
}

.prose blockquote {
  border-left: 3px solid var(--color-amber);
  padding-left: 1rem;
  color: var(--color-text-secondary);
  margin: 1.5em 0;
  font-style: italic;
}

.prose img {
  border-radius: 0.75rem;
  margin: 1.5em 0;
}

.prose ul, .prose ol {
  padding-left: 1.5em;
  margin-bottom: 1.2em;
}

.prose li {
  margin-bottom: 0.4em;
}

.prose hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2em 0;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
}

.prose th, .prose td {
  border: 1px solid var(--color-border);
  padding: 0.75rem;
  text-align: left;
}

.prose th {
  background: var(--color-surface-2);
  color: var(--color-warm-white);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.anim-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}

.anim-delay-1 { animation-delay: 0.1s; }
.anim-delay-2 { animation-delay: 0.2s; }
.anim-delay-3 { animation-delay: 0.3s; }
.anim-delay-4 { animation-delay: 0.4s; }
.anim-delay-5 { animation-delay: 0.5s; }
.anim-delay-6 { animation-delay: 0.6s; }
</style>
