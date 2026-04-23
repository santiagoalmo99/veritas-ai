'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Sparkles, ArrowRight, Check, Globe2, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { TOPICS, COUNTRIES } from '@/lib/constants'
import { useGeoDetection } from '@/lib/hooks/useGeoDetection'
import { useI18n } from '@/lib/i18n'
import type { TopicSlug } from '@/lib/types'
import { cn } from '@/lib/utils'

const STEPS = ['detect', 'country', 'topics', 'complete'] as const
type Step = (typeof STEPS)[number]

const MIN_TOPICS = 3

export function OnboardingModal() {
  const { onboardingOpen, closeOnboarding, completeOnboarding, preferences } = useAppStore()
  const { t, language } = useI18n()
  const { geo, geoLoading } = useGeoDetection()

  const [step, setStep] = useState<Step>('detect')
  const [selectedCountry, setSelectedCountry] = useState(preferences.countryCode)
  const [selectedTopics, setSelectedTopics] = useState<TopicSlug[]>(preferences.selectedTopics)
  const [completing, setCompleting] = useState(false)

  // Auto-advance from detect step when geo loads
  useEffect(() => {
    if (step === 'detect' && !geoLoading && geo) {
      const timer = setTimeout(() => {
        setSelectedCountry(geo.countryCode)
        setStep('country')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [step, geoLoading, geo])

  // Skip detect if preference already set
  useEffect(() => {
    if (step === 'detect' && !geoLoading && !geo) {
      const timer = setTimeout(() => setStep('country'), 1500)
      return () => clearTimeout(timer)
    }
  }, [step, geoLoading, geo])

  const toggleTopic = (slug: TopicSlug) => {
    setSelectedTopics((prev) => {
      if (prev.includes(slug)) {
        if (prev.length <= 1) return prev // Min 1
        return prev.filter((t) => t !== slug)
      }
      return [...prev, slug]
    })
  }

  const handleComplete = async () => {
    if (selectedTopics.length < 1) return
    setCompleting(true)
    await new Promise((r) => setTimeout(r, 600)) // UX polish
    completeOnboarding(selectedTopics, selectedCountry)
    setCompleting(false)
  }

  if (!onboardingOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="onboarding-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={t.onboardingTitle}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="onboarding-modal"
        >
          {/* Progress bar */}
          <div className="h-[3px] bg-[var(--border-subtle)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--accent-primary)' }}
              initial={{ width: '0%' }}
              animate={{
                width:
                  step === 'detect' ? '15%'
                  : step === 'country' ? '40%'
                  : step === 'topics' ? '75%'
                  : '100%',
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Auto-detecting location */}
              {step === 'detect' && (
                <StepDetect key="detect" geoLoading={geoLoading} geo={geo} />
              )}

              {/* Step 2: Select country */}
              {step === 'country' && (
                <StepCountry
                  key="country"
                  detectedCountry={geo?.countryCode}
                  selectedCountry={selectedCountry}
                  onSelect={setSelectedCountry}
                  onNext={() => setStep('topics')}
                />
              )}

              {/* Step 3: Select topics */}
              {step === 'topics' && (
                <StepTopics
                  key="topics"
                  selectedTopics={selectedTopics}
                  onToggle={toggleTopic}
                  onBack={() => setStep('country')}
                  onComplete={handleComplete}
                  completing={completing}
                  minTopics={MIN_TOPICS}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Step Components ──────────────────────────────────────── */

function StepDetect({ geoLoading, geo }: { geoLoading: boolean; geo: ReturnType<typeof useGeoDetection>['geo'] }) {
  const { t } = useI18n()
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col items-center text-center gap-6 py-8"
    >
      {/* Logo mark */}
      <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center
        bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
        <Sparkles size={36} className="text-[var(--accent-primary)]" />
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-primary)] 
          animate-pulse-glow" />
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
          {t.welcome}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm max-w-sm">
          {t.welcomeDesc}
        </p>
      </div>

      {/* Detection state */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl surface text-sm">
        {geoLoading ? (
          <>
            <Loader2 size={16} className="animate-spin text-[var(--accent-primary)]" />
            <span className="text-[var(--text-secondary)]">{t.detectingLocation}</span>
          </>
        ) : geo ? (
          <>
            <span className="text-xl">{geo.flag}</span>
            <span className="text-[var(--text-secondary)]">
              {t.detectedLocation} <strong className="text-[var(--text-primary)]">{geo.countryName}</strong>
            </span>
            <Check size={16} className="text-[var(--score-safe)] ml-auto" />
          </>
        ) : (
          <>
            <Globe2 size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-[var(--text-secondary)]">{t.manualSelect}</span>
          </>
        )}
      </div>
    </motion.div>
  )
}

function StepCountry({
  detectedCountry,
  selectedCountry,
  onSelect,
  onNext,
}: {
  detectedCountry?: string
  selectedCountry: string
  onSelect: (code: string) => void
  onNext: () => void
}) {
  const { t, language } = useI18n()
  const isEn = language === 'en'
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={18} className="text-[var(--accent-primary)]" />
          <span className="text-xs font-medium font-display text-[var(--accent-primary)] uppercase tracking-wider">
            {t.stepTitle(1, 2)}
          </span>
        </div>
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
          {t.newsLocation}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t.newsLocationDesc}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
        {COUNTRIES.map((country) => (
          <motion.button
            key={country.code}
            onClick={() => onSelect(country.code)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200',
              selectedCountry === country.code
                ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/40 text-[var(--text-primary)]'
                : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
            )}
          >
            <span className="text-2xl">{country.flag}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium font-display leading-tight truncate">
                {isEn ? country.name : country.nameEs}
              </p>
              <p className="text-[0.68rem] text-[var(--text-tertiary)]">
                {country.language.toUpperCase()}
              </p>
            </div>
            {selectedCountry === country.code && (
              <Check size={14} className="ml-auto text-[var(--accent-primary)] shrink-0" />
            )}
            {detectedCountry === country.code && selectedCountry !== country.code && (
              <span className="ml-auto text-[0.6rem] text-[var(--accent-secondary)] font-medium shrink-0">
                {t.detected}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedCountry}
        className="btn btn-primary w-full py-3 text-sm font-semibold"
      >
        {t.continue}
        <ArrowRight size={16} />
      </button>
    </motion.div>
  )
}

function StepTopics({
  selectedTopics,
  onToggle,
  onBack,
  onComplete,
  completing,
  minTopics,
}: {
  selectedTopics: TopicSlug[]
  onToggle: (t: TopicSlug) => void
  onBack: () => void
  onComplete: () => void
  completing: boolean
  minTopics: number
}) {
  const { t, language } = useI18n()
  const isEn = language === 'en'
  const canComplete = selectedTopics.length >= minTopics

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-[var(--accent-primary)]" />
          <span className="text-xs font-medium font-display text-[var(--accent-primary)] uppercase tracking-wider">
            {t.stepTitle(2, 2)}
          </span>
        </div>
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
          {t.topicsInterest}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t.topicsInterestDesc(minTopics)}
        </p>
      </div>

      {/* Topics grid */}
      <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
        {TOPICS.map((topic, i) => {
          const isSelected = selectedTopics.includes(topic.slug)
          return (
            <motion.button
              key={topic.slug}
              onClick={() => onToggle(topic.slug)}
              whileTap={{ scale: 0.93 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn('topic-pill', isSelected && 'selected')}
            >
              <span aria-hidden>{topic.emoji}</span>
              {isEn ? topic.label : topic.labelEs}
              {isSelected && <Check size={12} className="ml-0.5" />}
            </motion.button>
          )
        })}
      </div>

      {/* Selection count */}
      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <button onClick={onBack} className="btn btn-ghost text-xs py-1 px-2">
          {t.back}
        </button>
        <span>
          {selectedTopics.length} {selectedTopics.length !== 1 ? t.topics : t.topic} {selectedTopics.length !== 1 ? t.selectedPlural : t.selected}
          {!canComplete && (
            <span className="text-[var(--score-moderate)]"> (mín. {minTopics})</span>
          )}
        </span>
      </div>

      <button
        onClick={onComplete}
        disabled={!canComplete || completing}
        className="btn btn-primary w-full py-3 text-sm font-semibold"
      >
        {completing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t.customizingFeed}
          </>
        ) : (
          <>
            <Sparkles size={16} />
            {t.seeMyNews}
          </>
        )}
      </button>

      <p className="text-center text-[0.7rem] text-[var(--text-tertiary)]">
        {t.privacyDesign.replace(t.privacyDesignAccent, '')}
        <span className="text-[var(--accent-secondary)]">{t.privacyDesignAccent}</span>
      </p>
    </motion.div>
  )
}
