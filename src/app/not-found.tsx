export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0f',
      color: '#e0e0e0',
      fontFamily: 'monospace',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '6rem',
        fontWeight: 700,
        color: '#ff0080',
        textShadow: '0 0 20px rgba(255,0,128,0.3)',
        marginBottom: '1rem',
        lineHeight: 1,
      }}>
        404
      </div>
      <p style={{ fontSize: '14px', color: '#8b8fa3', marginBottom: '2rem', letterSpacing: '0.1em' }}>
        {'// 页面未找到或已被移除'}
      </p>
      <a
        href="/"
        style={{
          border: '1px solid #00ff9f',
          color: '#00ff9f',
          padding: '12px 32px',
          fontFamily: 'monospace',
          fontSize: '14px',
          textDecoration: 'none',
        }}
      >
        返回首页
      </a>
    </div>
  )
}
