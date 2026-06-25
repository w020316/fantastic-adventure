export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        color: '#e0e0e0',
        fontFamily: 'ui-monospace, monospace',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '6rem',
          fontWeight: 700,
          color: '#ccff00',
          textShadow: '0 0 20px rgba(204,255,0,0.3)',
          marginBottom: '1rem',
          lineHeight: 1,
        }}
      >
        404
      </div>
      <p style={{ fontSize: '14px', color: '#888', marginBottom: '2rem', letterSpacing: '0.1em' }}>
        {'// 页面未找到或已被移除'}
      </p>
      <a
        href="/"
        style={{
          border: '1px solid #ccff00',
          color: '#ccff00',
          padding: '12px 32px',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '14px',
          textDecoration: 'none',
          borderRadius: '8px',
          transition: 'background 0.2s',
        }}
      >
        返回首页
      </a>
    </div>
  )
}
