import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url') || 'Veritas AI'
    const domain = new URL(url).hostname

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050505',
            backgroundImage: 'radial-gradient(circle at center, #111 0%, #050505 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 40px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: 60, fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>
                Veritas
              </span>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#D4A843', letterSpacing: '0.2em' }}>
                AI
              </span>
            </div>
          </div>
          <div style={{ marginTop: 40, fontSize: 20, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.1em', fontWeight: 600 }}>
            {domain.toUpperCase()}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505' }}>
           <span style={{ fontSize: 60, fontWeight: 900, color: 'white' }}>Veritas AI</span>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}
