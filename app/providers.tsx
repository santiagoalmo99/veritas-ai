'use client'
// Providers wrapper — client-only, so no SSR issues with stores
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
