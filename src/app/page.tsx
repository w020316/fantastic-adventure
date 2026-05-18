export default function LandingPage() {
  return (
    <>
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/home" />
      </noscript>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
          padding: '2rem',
          backgroundColor: '#0a0a0f',
          color: '#e0e0e0',
          fontFamily: 'monospace',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,255,159,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                fontFamily: 'monospace',
                fontSize: '11px',
                letterSpacing: '0.3em',
                color: 'rgba(0,255,159,0.6)',
                border: '1px solid rgba(0,255,159,0.2)',
                padding: '4px 12px',
              }}
            >
              SYSTEM.ONLINE
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(3rem, 12vw, 8rem)',
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: '1rem',
              color: '#e0e0e0',
              textShadow: '0 0 10px rgba(0,255,159,0.3), 0 0 40px rgba(0,255,159,0.1)',
              fontFamily: 'monospace',
            }}
          >
            CYBERBLOG
          </h1>

          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              letterSpacing: '0.2em',
              color: 'rgba(224,224,224,0.5)',
              marginBottom: '0.5rem',
            }}
          >
            {'// 赛博朋克个人博客系统'}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '3rem',
            }}
          >
            <span style={{ display: 'inline-block', width: '48px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,255,159,0.5))' }} />
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00ff9f' }} />
            <span style={{ display: 'inline-block', width: '48px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,255,159,0.5))' }} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/home"
              style={{
                display: 'inline-block',
                border: '1px solid #00ff9f',
                color: '#00ff9f',
                padding: '12px 32px',
                fontFamily: 'monospace',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
            >
              浏览文章
            </a>
            <a
              href="/about"
              style={{
                display: 'inline-block',
                border: '1px solid #ff0080',
                color: '#ff0080',
                padding: '12px 32px',
                fontFamily: 'monospace',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
            >
              了解更多
            </a>
          </div>

          <div style={{ marginTop: '4rem', fontFamily: 'monospace', fontSize: '12px', color: 'rgba(224,224,224,0.25)' }}>
            <p style={{ margin: '4px 0' }}>{'>'} NEXT.JS 16 · PRISMA 6</p>
            <p style={{ margin: '4px 0' }}>{'>'} V6.0.0_BUILD.2026</p>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(0,255,159,0.3), transparent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(255,0,128,0.2), transparent)',
          }}
        />
      </div>
    </>
  )
}
