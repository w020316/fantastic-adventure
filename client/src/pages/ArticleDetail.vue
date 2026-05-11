<template>
  <div class="max-w-4xl mx-auto px-6 pt-24 pb-20">
    <article v-if="article">
      <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>
      <div class="flex items-center gap-4 text-sm text-slate-500 mb-8">
        <span>{{ article.created_at?.substring(0, 10) }}</span>
        <span>{{ article.view_count }} 阅读</span>
        <span>{{ article.like_count }} 点赞</span>
        <button @click="handleLike" class="text-accent hover:underline">点赞</button>
      </div>
      <div class="prose prose-invert max-w-none" v-html="renderedContent"></div>
    </article>

    <section class="mt-16">
      <h2 class="text-2xl font-bold mb-6">评论</h2>
      <div class="glass rounded-xl p-6 mb-6">
        <div class="space-y-4">
          <input v-model="commentForm.nickname" placeholder="昵称" class="w-full px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none" />
          <input v-model="commentForm.email" placeholder="邮箱（选填）" class="w-full px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none" />
          <textarea v-model="commentForm.content" :rows="3" placeholder="评论内容" class="w-full px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none resize-none"></textarea>
          <button @click="handleComment" class="px-6 py-2 rounded-lg bg-gradient-accent text-white hover:opacity-90 transition-opacity">发表评论</button>
        </div>
      </div>
      <div v-for="comment in comments" :key="comment.id" class="glass rounded-xl p-6 mb-4">
        <div class="flex items-center gap-3 mb-2">
          <span class="font-medium text-accent">{{ comment.nickname }}</span>
          <span class="text-xs text-slate-500">{{ comment.created_at?.substring(0, 10) }}</span>
        </div>
        <p class="text-slate-300">{{ comment.content }}</p>
        <div v-for="reply in comment.replies" :key="reply.id" class="ml-8 mt-3 pl-4 border-l border-dark-200">
          <div class="flex items-center gap-3 mb-1">
            <span class="font-medium text-cyan text-sm">{{ reply.nickname }}</span>
            <span class="text-xs text-slate-500">{{ reply.created_at?.substring(0, 10) }}</span>
          </div>
          <p class="text-slate-400 text-sm">{{ reply.content }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getArticle, likeArticle } from '../api/article'
import { getComments, createComment } from '../api/comment'
import { recordVisit } from '../api/stats'
import { useMarkdown } from '../composables/useMarkdown'

const route = useRoute()
const { render } = useMarkdown()
const article = ref<any>(null)
const comments = ref<any[]>([])
const commentForm = reactive({ nickname: '', email: '', content: '' })

const renderedContent = computed(() => {
  if (!article.value) return ''
  return render(article.value.content)
})

async function loadArticle() {
  const id = Number(route.params.id)
  try {
    const res: any = await getArticle(id)
    article.value = res.data
  } catch {}
}

async function loadComments() {
  const id = Number(route.params.id)
  try {
    const res: any = await getComments(id)
    comments.value = res.data || []
  } catch {}
}

async function handleLike() {
  try {
    await likeArticle(Number(route.params.id))
    if (article.value) article.value.like_count++
  } catch {}
}

async function handleComment() {
  if (!commentForm.nickname || !commentForm.content) return
  try {
    await createComment(Number(route.params.id), commentForm)
    commentForm.content = ''
  } catch {}
}

onMounted(() => {
  recordVisit({ path: `/article/${route.params.id}` })
  loadArticle()
  loadComments()
})
</script>
