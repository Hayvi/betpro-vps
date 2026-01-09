import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSportsPage } from '../useSportsPage'

// Mock bet context
vi.mock('@/contexts/BetContext', () => ({
  useBet: () => ({
    addBet: vi.fn(),
  }),
}))

// Mock toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}))

// Mock logger
vi.mock('@/services/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

// Mock useFetch to avoid real API calls
vi.mock('@/hooks', () => ({
  useFetch: (_fn, _options) => ({
    data: [],
    loading: false,
    error: null,
  }),
}))

// Mock apiService sports API surface (not actually called due to mocked useFetch)
vi.mock('@/services/supabaseClient', () => ({
  apiService: {
    sports: {
      getUpcoming: vi.fn(),
    },
  },
}))

// Minimal shape test
describe('useSportsPage', () => {
  it('should expose basic state, data, and handlers without throwing', () => {
    const { result } = renderHook(() => useSportsPage())

    expect(result.current).toHaveProperty('filteredMatches')
    expect(Array.isArray(result.current.filteredMatches)).toBe(true)

    expect(typeof result.current.handleBetClick).toBe('function')
    expect(typeof result.current.handleLeagueSelect).toBe('function')
    expect(typeof result.current.handleCountryToggle).toBe('function')

    expect(result.current).toHaveProperty('activeTab')
    expect(result.current).toHaveProperty('countries')
  })
})
