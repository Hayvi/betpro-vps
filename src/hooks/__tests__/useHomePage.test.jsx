import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHomePage } from '../useHomePage'
import { I18nProvider } from '@/contexts/I18nContext'

// Mock toast context to avoid needing the real provider
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showError: vi.fn(),
  }),
}))

// Mock useFetch to avoid real network / Supabase calls
vi.mock('@/hooks', () => ({
  useFetch: (_fn, _options) => ({
    data: [],
    loading: false,
    error: null,
  }),
}))

// Minimal test to ensure the hook can be rendered and returns the expected shape
describe('useHomePage', () => {
  it('should provide default home page data shape without throwing', () => {
    const { result } = renderHook(() => useHomePage(), {
      wrapper: I18nProvider,
    })

    expect(result.current).toHaveProperty('popularGames')
    expect(result.current).toHaveProperty('topWins')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('hasError')

    expect(Array.isArray(result.current.popularGames)).toBe(true)
    expect(Array.isArray(result.current.topWins)).toBe(true)
  })
})
