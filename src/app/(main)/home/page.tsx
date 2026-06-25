import { redirect } from 'next/navigation'

// 旧博客 /home 已弃用，统一重定向到新作品集首页
export default function HomePage() {
  redirect('/')
}
