import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import(/* webpackChunkName: "home" */ '../pages/Home.vue'), meta: { title: '首页' } },
  { path: '/articles', name: 'ArticleList', component: () => import(/* webpackChunkName: "articles" */ '../pages/ArticleList.vue'), meta: { title: '文章列表' } },
  { path: '/article/:id', name: 'ArticleDetail', component: () => import(/* webpackChunkName: "article-detail" */ '../pages/ArticleDetail.vue'), meta: { title: '文章详情' } },
  { path: '/projects', name: 'ProjectList', component: () => import(/* webpackChunkName: "projects" */ '../pages/ProjectList.vue'), meta: { title: '项目' } },
  { path: '/about', name: 'About', component: () => import(/* webpackChunkName: "about" */ '../pages/About.vue'), meta: { title: '关于' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import(/* webpackChunkName: "not-found" */ '../pages/NotFound.vue'), meta: { title: '404' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
