import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')

  if (!symbols) {
    return NextResponse.json({ error: 'Missing symbols' }, { status: 400 })
  }

  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VeritasAI'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      return NextResponse.json({ quoteResponse: { result: [] } })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Market Proxy Error:', error)
    // Return empty results instead of 500 to keep console clean
    return NextResponse.json({ quoteResponse: { result: [] } })
  }
}
