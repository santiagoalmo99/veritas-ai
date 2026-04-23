import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch('https://freeipapi.com/api/json/', {
      next: { revalidate: 3600 }
    })
    
    if (!res.ok) throw new Error('Location API failed')
    
    const data = await res.json()
    
    // Map freeipapi to ip-api format for compatibility
    return NextResponse.json({
      status: 'success',
      country: data.countryName,
      countryCode: data.countryCode,
      city: data.cityName,
      lat: data.latitude,
      lon: data.longitude,
      timezone: data.timeZone
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
