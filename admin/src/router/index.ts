import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../pages/Login.vue') },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('../pages/Dashboard.vue') },
      { path: 'articles', name: 'ArticleList', component: () => import('../pages/ArticleList.vue') },
      { path: 'article/edit/:id?', name: 'ArticleEdit', component: () => import('../pages/ArticleEdit.vue') },
      { path: 'categories', name: 'CategoryList', component: () => import('../pages/CategoryList.vue') },
      { path: 'tags', name: 'TagList', component: () => import('../pages/TagList.vue') },
      { path: 'comments', name: 'CommentList', component: () => import('../pages/CommentList.vue') },
      { path: 'projects', name: 'ProjectList', component: () => import('../pages/ProjectList.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../pages/Settings.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
