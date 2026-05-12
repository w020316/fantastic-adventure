export function useSeo(meta: {
  title: string
  description?: string
  keywords?: string
}) {
  document.title = meta.title
  setMeta('description', meta.description || '分享技术思考，记录成长轨迹')
  setMeta('keywords', meta.keywords || '技术博客,全栈开发,Vue,Node.js,TypeScript')
  setOgMeta('og:title', meta.title)
  setOgMeta('og:description', meta.description || '分享技术思考，记录成长轨迹')
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOgMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
