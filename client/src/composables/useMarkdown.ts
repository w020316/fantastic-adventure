import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import hljs from 'highlight.js'

const md: MarkdownIt = new MarkdownIt({
  // Defense-in-depth: Disable raw HTML to prevent XSS attacks
  html: false,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {
        return ''
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

export function useMarkdown() {
  // Second layer of defense: Render content through configured MarkdownIt instance
  // which has HTML disabled and uses hljs for safe code highlighting
  function render(content: string): string {
    return md.render(content)
  }

  function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
    const tokens: Token[] = md.parse(content, {})
    const headings: Array<{ level: number; text: string; id: string }> = []
    tokens.forEach((token: Token, index: number) => {
      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.substring(1))
        const text = tokens[index + 1]?.content || ''
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
        headings.push({ level, text, id })
      }
    })
    return headings
  }

  return { render, extractHeadings }
}
