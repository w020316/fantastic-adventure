<template>
  <div class="max-w-7xl mx-auto px-6 pt-24 pb-20">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-400 text-lg mb-4">{{ error }}</p>
      <router-link to="/articles" class="text-accent hover:underline">返回文章列表</router-link>
    </div>

    <template v-else-if="article">
      <div class="flex gap-10">
        <article class="flex-1 min-w-0">
          <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>
          <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8">
            <span>{{ article.created_at?.substring(0, 10) }}</span>
            <span>{{ article.view_count }} 阅读</span>
            <span>{{ article.like_count }} 点赞</span>
            <span v-if="article.category_name" class="px-2 py-0.5 rounded bg-accent/20 text-accent-light text-xs">{{ article.category_name }}</span>
            <button @click="handleLike" class="flex items-center gap-1 text-accent hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              点赞
            </button>
            <button @click="handleShare" class="flex items-center gap-1 text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              分享
            </button>
          </div>
          <div class="flex flex-wrap gap-2 mb-8" v-if="article.tags?.length">
            <span v-for="tag in article.tags" :key="tag.id" class="px-2 py-0.5 text-xs rounded" :style="{ backgroundColor: tag.color + '30', color: tag.color }">{{ tag.name }}</span>
          </div>
          <div class="prose prose-invert max-w-none" v-html="renderedContent"></div>
        </article>

        <aside v-if="headings.length" class="hidden lg:block w-64 shrink-0">
          <div class="sticky top-24">
            <h4 class="text-sm font-semibold text-slate-400 mb-3">目录</h4>
            <nav class="space-y-1">
              <a v-for="h in headings" :key="h.id" :href="'#' + h.id" class="block text-sm text-slate-500 hover:text-accent transition-colors truncate" :style="{ paddingLeft: (h.level - 2) * 12 + 'px' }">{{ h.text }}</a>
            </nav>
          </div>
        </aside>
      </div>

      <section v-if="relatedArticles.length" class="mt-20">
        <h2 class="text-2xl font-bold gradient-text mb-8">相关文章</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <router-link v-for="ra in relatedArticles" :key="ra.id" :to="`/article/${ra.id}`" class="glass rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 glow-border">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ ra.title }}</h3>
            <p class="text-slate-400 text-sm mb-3 line-clamp-2">{{ ra.summary }}</p>
            <span class="text-xs text-slate-500">{{ ra.created_at?.substring(0, 10) }}</span>
          </router-link>
        </div>
      </section>

      <section class="mt-16">
        <h2 class="text-2xl font-bold mb-6">评论 <span class="text-slate-500 text-lg">({{ comments.length }})</span></h2>

        <div class="glass rounded-xl p-6 mb-6">
          <div class="space-y-4">
            <div class="flex gap-4">
              <input v-model="commentForm.nickname" placeholder="昵称 *" class="flex-1 px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none" />
              <input v-model="commentForm.email" placeholder="邮箱（选填）" class="flex-1 px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none" />
            </div>
            <textarea v-model="commentForm.content" :rows="3" :placeholder="replyTo ? `回复 @${replyTo.nickname}...` : '评论内容 *'" class="w-full px-3 py-2 rounded-lg bg-dark-100 text-slate-300 border border-dark-200 focus:border-accent outline-none resize-none"></textarea>
            <div class="flex items-center gap-4">
              <button @click="handleComment" class="px-6 py-2 rounded-lg bg-gradient-accent text-white hover:opacity-90 transition-opacity">发表评论</button>
              <button v-if="replyTo" @click="replyTo = null" class="text-slate-500 hover:text-white text-sm">取消回复</button>
            </div>
          </div>
        </div>

        <div v-if="!comments.length" class="text-center py-10 text-slate-500">暂无评论，来发表第一条吧~</div>

        <div v-for="comment in comments" :key="comment.id" class="glass rounded-xl p-6 mb-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-sm font-bold">{{ comment.nickname?.[0] }}</div>
            <span class="font-medium text-accent">{{ comment.nickname }}</span>
            <span class="text-xs text-slate-500">{{ comment.created_at?.substring(0, 16)?.replace('T', ' ') }}</span>
          </div>
          <p class="text-slate-300 ml-11">{{ comment.content }}</p>
          <button @click="handleReply(comment)" class="ml-11 mt-2 text-xs text-slate-500 hover:text-accent transition-colors">回复</button>

          <div v-for="reply in comment.replies" :key="reply.id" class="ml-11 mt-3 pl-4 border-l border-dark-200">
            <div class="flex items-center gap-3 mb-1">
              <div class="w-6 h-6 rounded-full bg-cyan/30 flex items-center justify-center text-xs font-bold text-cyan">{{ reply.nickname?.[0] }}</div>
              <span class="font-medium text-cyan text-sm">{{ reply.nickname }}</span>
              <span class="text-xs text-slate-500">{{ reply.created_at?.substring(0, 16)?.replace('T', ' ') }}</span>
            </div>
            <p class="text-slate-400 text-sm ml-9">{{ reply.content }}</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticle, likeArticle, getRelatedArticles } from '../api/article'
import { getComments, createComment } from '../api/comment'
import { recordVisit } from '../api/stats'
import { useMarkdown } from '../composables/useMarkdown'
import { useSeo } from '../composables/useSeo'

const route = useRoute()
const { render, extractHeadings } = useMarkdown()

const article = ref<any>(null)
const comments = ref<any[]>([])
const relatedArticles = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const headings = ref<Array<{ level: number; text: string; id: string }>>([])
const replyTo = ref<{ id: number; nickname: string } | null>(null)

const commentForm = reactive({ nickname: '', email: '', content: '' })

const renderedContent = computed(() => {
  if (!article.value) return ''
  return render(article.value.content)
})

watch(renderedContent, () => {
  if (article.value?.content) {
    headings.value = extractHeadings(article.value.content)
  }
})

async function loadArticle() {
  const id = Number(route.params.id)
  loading.value = true
  error.value = ''
  try {
    const [articleRes, relatedRes]: any[] = await Promise.all([
      getArticle(id),
      getRelatedArticles(id, 3),
    ])
    article.value = articleRes.data
    relatedArticles.value = relatedRes.data || []
    useSeo({
      title: `${articleRes.data.title} - MyBlog`,
      description: articleRes.data.summary || articleRes.data.title,
      keywords: articleRes.data.tags?.map((t: any) => t.name).join(','),
    })
  } catch (err: any) {
    error.value = err.response?.data?.message || '文章加载失败'
  } finally {
    loading.value = false
  }
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

function handleReply(comment: any) {
  replyTo.value = { id: comment.id, nickname: comment.nickname }
  commentForm.content = ''
}

async function handleComment() {
  if (!commentForm.nickname || !commentForm.content) return
  try {
    await createComment(Number(route.params.id), {
      ...commentForm,
      parent_id: replyTo.value?.id,
    })
    commentForm.content = ''
    replyTo.value = null
    await loadComments()
  } catch {}
}

function handleShare() {
  if (navigator.share) {
    navigator.share({ title: article.value?.title, url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }
}

onMounted(() => {
  recordVisit({ path: `/article/${route.params.id}` })
  loadArticle()
  loadComments()
})

watch(() => route.params.id, () => {
  if (route.params.id) {
    loadArticle()
    loadComments()
  }
})
</script>
