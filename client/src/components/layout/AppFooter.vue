<template>
  <footer class="border-t border-dark-300/50 py-16 mt-20">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-3 gap-10 mb-10">
        <div>
          <h3 class="text-lg font-display font-bold gradient-text mb-3">MyBlog</h3>
          <p class="text-[var(--color-text-muted)] text-sm leading-relaxed">分享技术思考，记录成长轨迹。<br/>以文字照亮前行的路。</p>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 tracking-wider uppercase">导航</h4>
          <div class="space-y-3">
            <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="block text-[var(--color-text-muted)] hover:text-amber text-sm transition-colors duration-300">{{ item.label }}</router-link>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 tracking-wider uppercase">链接</h4>
          <div class="space-y-3">
            <a href="https://github.com/w020316" target="_blank" class="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-amber text-sm transition-colors duration-300">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-dark-300/50 pt-6 text-center text-[var(--color-text-muted)] text-xs tracking-wider">
        <p>&copy; {{ new Date().getFullYear() }} MyBlog &middot; Crafted with warmth</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const navItems = [
  { path: '/', label: '首页' },
  { path: '/articles', label: '文章' },
  { path: '/projects', label: '作品集' },
  { path: '/about', label: '关于' },
]
</script>
