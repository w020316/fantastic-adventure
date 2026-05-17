<template>
  <div class="max-w-7xl mx-auto px-6 pt-24 pb-20">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="text-center py-20 anim-fade-in-up">
      <p class="text-red-400 text-lg mb-4">{{ error }}</p>
      <router-link to="/articles" class="text-amber hover:text-amber-light transition-colors">返回文章列表</router-link>
    </div>

    <template v-else-if="article">
      <div class="flex gap-10 anim-fade-in-up">
        <article class="flex-1 min-w-0">
          <h1 class="text-4xl font-display font-bold mb-4">{{ article.title }}</h1>
          <div class="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)] mb-8 pb-6 border-b border-dark-300/50">
            <span>{{ article.created_at?.substring(0, 10) }}</span>
            <span>{{ article.view_count }} 阅读</span>
            <span>{{ article.like_count }} 点赞</span>
            <span v-if="article.category_name" class="px-2 py-0.5 rounded-full bg-amber/15 text-amber-light text-xs border border-amber/10">{{ article.category_name }}</span>
            <button @click="handleLike" class="flex items-center gap-1 text-amber hover:text-amber-light transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              点赞
            </button>
            <button @click="handleShare" class="flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-amber transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              分享
            </button>
          </div>
          <div class="flex flex-wrap gap-2 mb-8" v-if="article.tags?.length">
            <span v-for="tag in article.tags" :key="tag.id" class="px-2 py-0.5 text-xs rounded-full border" :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '30' }">{{ tag.name }}</span>
          </div>
          <div class="prose max-w-none" v-html="renderedContent"></div>
        </article>

        <aside v-if="headings.length" class="hidden lg:block w-64 shrink-0">
          <div class="sticky top-24 glass rounded-xl p-5">
            <h4 class="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 tracking-wider uppercase">目录</h4>
            <nav class="space-y-1">
              <a v-for="h in headings" :key="h.id" :href="'#' + h.id" class="toc-link block text-sm truncate py-1" :class="{ 'toc-active': activeHeading === h.id }" :style="{ paddingLeft: (h.level - 2) * 12 + 'px' }">{{ h.text }}</a>
            </nav>
          </div>
        </aside>
      </div>

      <section v-if="relatedArticles.length" class="mt-20">
        <h2 class="text-2xl font-display font-bold gradient-text mb-8">相关文章</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <router-link v-for="ra in relatedArticles" :key="ra.id" :to="`/article/${ra.id}`" class="glass rounded-xl p-6 group hover:shadow-lg hover:shadow-amber/5 hover:-translate-y-1 transition-all duration-300">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-amber-light transition-colors">{{ ra.title }}</h3>
            <p class="text-[var(--color-text-secondary)] text-sm mb-3 line-clamp-2">{{ ra.summary }}</p>
            <span class="text-xs text-[var(--color-text-muted)]">{{ ra.created_at?.substring(0, 10) }}</span>
          </router-link>
        </div>
      </section>

      <section class="mt-16">
        <h2 class="text-2xl font-display font-bold mb-6">评论 <span class="text-[var(--color-text-muted)] text-lg font-normal">({{ comments.length }})</span></h2>

        <div class="glass rounded-xl p-6 mb-6">
          <div class="space-y-4">
            <div class="flex gap-4">
              <input v-model="commentForm.nickname" placeholder="昵称 *" class="flex-1 px-3 py-2 rounded-lg bg-dark-100 text-[var(--color-text-secondary)] border border-dark-200 focus:border-amber focus:ring-1 focus:ring-amber/30 outline-none transition-colors" />
              <input v-model="commentForm.email" placeholder="邮箱（选填）" class="flex-1 px-3 py-2 rounded-lg bg-dark-100 text-[var(--color-text-secondary)] border border-dark-200 focus:border-amber focus:ring-1 focus:ring-amber/30 outline-none transition-colors" />
            </div>
            <textarea v-model="commentForm.content" :rows="3" :placeholder="replyTo ? `回复 @${replyTo.nickname}...` : '评论内容 *'" class="w-full px-3 py-2 rounded-lg bg-dark-100 text-[var(--color-text-secondary)] border border-dark-200 focus:border-amber focus:ring-1 focus:ring-amber/30 outline-none resize-none transition-colors"></textarea>
            <div class="flex items-center gap-4">
              <button @click="handleComment" class="px-6 py-2 rounded-lg bg-gradient-amber text-dark font-medium hover:opacity-90 transition-opacity shadow-md shadow-amber/15">发表评论</button>
              <button v-if="replyTo" @click="replyTo = null" class="text-[var(--color-text-muted)] hover:text-amber text-sm transition-colors">取消回复</button>
            </div>
          </div>
        </div>

        <div v-if="!comments.length" class="text-center py-10 text-[var(--color-text-muted)]">暂无评论，来发表第一条吧~</div>

        <div v-for="comment in comments" :key="comment.id" class="glass rounded-xl p-6 mb-4 transition-all duration-300 hover:border-amber/15">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-full bg-gradient-amber flex items-center justify-center text-sm font-bold text-dark">{{ comment.nickname?.[0] }}</div>
            <span class="font-medium text-amber">{{ comment.nickname }}</span>
            <span class="text-xs text-[var(--color-text-muted)]">{{ comment.created_at?.substring(0, 16)?.replace('T', ' ') }}</span>
          </div>
          <p class="text-[var(--color-text-secondary)] ml-11 leading-relaxed">{{ comment.content }}</p>
          <button @click="handleReply(comment)" class="ml-11 mt-2 text-xs text-[var(--color-text-muted)] hover:text-amber transition-colors">回复</button>

          <div v-for="reply in comment.replies" :key="reply.id" class="ml-11 mt-3 pl-4 border-l border-dark-300/60">
            <div class="flex items-center gap-3 mb-1">
              <div class="w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center text-xs font-bold text-amber-light">{{ reply.nickname?.[0] }}</div>
              <span class="font-medium text-amber-light text-sm">{{ reply.nickname }}</span>
              <span class="text-xs text-[var(--color-text-muted)]">{{ reply.created_at?.substring(0, 16)?.replace('T', ' ') }}</span>
            </div>
            <p class="text-[var(--color-text-secondary)] text-sm ml-9 leading-relaxed">{{ reply.content }}</p>
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
import { useToast } from '../composables/useToast'

const { show: showToast } = useToast()

const route = useRoute()
const { render, extractHeadings } = useMarkdown()

const article = ref<any>(null)
const comments = ref<any[]>([])
const relatedArticles = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const headings = ref<Array<{ level: number; text: string; id: string }>>([])
const activeHeading = ref('')
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
  } catch (err) {
    console.error('[ArticleDetail] Failed to load comments', err)
  }
}

function setupScrollSpy() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeHeading.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -70% 0px' }
  )
  watch(headings, () => {
    setTimeout(() => {
      headings.value.forEach((h) => {
        const el = document.getElementById(h.id)
        if (el) observer.observe(el)
      })
    }, 100)
  }, { immediate: true })
}

async function handleLike() {
  try {
    await likeArticle(Number(route.params.id))
    if (article.value) article.value.like_count++
  } catch (err) {
    console.error('[ArticleDetail] Failed to submit comment', err)
    showToast('评论提交失败，请重试')
  }
}

function handleReply(comment: any) {
  replyTo.value = { id: comment.id, nickname: comment.nickname }
  commentForm.content = ''
}

async function handleComment() {
  if (!commentForm.nickname || !commentForm.content) {
    showToast('请填写昵称和评论内容')
    return
  }
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
    showToast('链接已复制到剪贴板')
  }
}

onMounted(() => {
  recordVisit({ path: `/article/${route.params.id}` })
  loadArticle()
  loadComments()
  setupScrollSpy()
})

watch(() => route.params.id, () => {
  if (route.params.id) {
    loadArticle()
    loadComments()
  }
})
</script>

<style scoped>
.toc-link {
  color: var(--color-text-muted);
  border-left: 2px solid transparent;
  padding-left: 12px;
  transition: all 0.25s ease;
}
.toc-link:hover { color: var(--color-amber); }
.toc-active {
  color: var(--color-amber);
  border-left-color: var(--color-amber);
  background: rgba(255, 183, 77, 0.05);
  border-radius: 0 4px 4px 0;
}
</style>
