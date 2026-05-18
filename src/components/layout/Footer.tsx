export default function Footer() {
  return (
    <footer className="border-t border-cyber-border py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-sm neon-text mb-3">CYBERBLOG</h3>
            <p className="text-cyber-text-dim text-sm">
              赛博朋克风格个人博客
              <br />
              技术探索 · 生活记录 · 创意作品
            </p>
          </div>
          <div>
            <h3 className="font-display text-sm text-cyber-text mb-3">{'> LINKS_'}</h3>
            <div className="flex flex-col gap-2">
              <a href="https://github.com/w020316/fantastic-adventure" target="_blank" rel="noopener noreferrer" className="text-cyber-text-dim text-sm hover:text-cyber-neon transition-colors font-mono">
                GitHub
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-display text-sm text-cyber-text mb-3">{'> TECH_STACK_'}</h3>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'React', 'Prisma', 'PostgreSQL', 'Tailwind'].map((tech) => (
                <span key={tech} className="px-2 py-0.5 text-xs font-mono border border-cyber-border text-cyber-text-dim rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-cyber-border text-center">
          <p className="font-mono text-xs text-cyber-text-dim">
            &copy; {new Date().getFullYear()} CyberBlog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
