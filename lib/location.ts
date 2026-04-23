export async function getUserLocation() {
  try {
    const res = await fetch('http://ip-api.com/json/', {
      next: { revalidate: 3600 } // Cache location for 1 hour
    })
    
    if (!res.ok) throw new Error('Location fetch failed')
    
    const data = await res.json()
    
    if (data.status === 'success') {
      return {
        lat: data.lat,
        lon: data.lon,
        city: data.city,
        country: data.country
      }
    }
  } catch (error) {
    console.warn('Failed to get user location, falling back to default', error)
  }
  
  // Default fallback (e.g. Bogotá, Colombia)
  return {
    lat: 4.711,
    lon: -74.0721,
    city: 'Bogotá',
    country: 'Colombia'
  }
}
