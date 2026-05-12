<template>
  <footer class="border-t border-dark-200 py-12 mt-20">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 class="text-lg font-bold gradient-text mb-3">MyBlog</h3>
          <p class="text-slate-500 text-sm">分享技术思考，记录成长轨迹</p>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-slate-400 mb-3">导航</h4>
          <div class="space-y-2">
            <router-link to="/" class="block text-slate-500 hover:text-white text-sm transition-colors">首页</router-link>
            <router-link to="/articles" class="block text-slate-500 hover:text-white text-sm transition-colors">文章</router-link>
            <router-link to="/projects" class="block text-slate-500 hover:text-white text-sm transition-colors">作品集</router-link>
            <router-link to="/about" class="block text-slate-500 hover:text-white text-sm transition-colors">关于</router-link>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-slate-400 mb-3">链接</h4>
          <div class="space-y-2">
            <a href="https://github.com/w020316" target="_blank" class="block text-slate-500 hover:text-white text-sm transition-colors">GitHub</a>
          </div>
        </div>
      </div>
      <div class="border-t border-dark-200 pt-6 text-center text-slate-600 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} MyBlog. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
