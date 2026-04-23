import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: string | Date, lang: 'es' | 'en' = 'es'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const locale = lang === 'es' ? es : enUS
  return formatDistanceToNow(d, { addSuffix: true, locale })
}

export function formatDate(date: string | Date, lang: 'es' | 'en' = 'es'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const locale = lang === 'es' ? es : enUS
  return format(d, 'd MMM yyyy', { locale })
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function scoreToGrade(score: number): string {
  if (score <= 20) return 'A'
  if (score <= 40) return 'B'
  if (score <= 60) return 'C'
  if (score <= 80) return 'D'
  return 'F'
}

export function generateStars(score: number): string {
  const stars = Math.round((1 - score / 100) * 5)
  return '★'.repeat(stars) + '☆'.repeat(5 - stars)
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}
