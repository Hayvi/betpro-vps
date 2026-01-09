import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import BetSlipContent from '../BetSlipContent'
import { BetProvider, useBet } from '@/contexts/BetContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { I18nProvider } from '@/contexts/I18nContext'

// Mock toast context
const mockShowError = vi.fn()
const mockShowSuccess = vi.fn()

vi.mock('@/contexts/ToastContext', async () => {
  const actual = await vi.importActual('@/contexts/ToastContext')
  return {
    ...actual,
    useToast: () => ({
      showError: mockShowError,
      showSuccess: mockShowSuccess,
    }),
  }
})

// Mock AuthContext so BetProvider can use useAuth without requiring a real AuthProvider or Supabase
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    userId: null,
    role: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

// Mock ThemeContext so components using useTheme (e.g., StyledInput) don’t require a real ThemeProvider
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: vi.fn(),
  }),
}))

const renderWithProviders = (component) => {
  return render(
    <I18nProvider>
      <BetProvider>
        <ToastProvider>
          {component}
        </ToastProvider>
      </BetProvider>
    </I18nProvider>
  )
}

describe('BetSlipContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Empty state', () => {
    it('should display empty state when no bets', () => {
      renderWithProviders(<BetSlipContent />)

      expect(screen.getByText('قائمة الرهانات')).toBeInTheDocument()
      expect(screen.getByText('لا توجد رهانات')).toBeInTheDocument()
      expect(screen.getByText('اختر رهاناً من المباريات')).toBeInTheDocument()
    })
  })

  describe('Bet display', () => {
    it('should display bets when added', async () => {
      const TestComponent = () => {
        const { addBet } = useBet()
        
        React.useEffect(() => {
          addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'Premier League',
            betType: 'Home Win',
            odds: 2.5,
          })
        }, [addBet])
        
        return <BetSlipContent />
      }

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        // When a bet is added, the bet count label in the header should update
        // to show 1 bet in Arabic ("1 رهان"). This confirms that the bet slip
        // is rendering the added bet without depending on the exact layout.
        expect(screen.getByText(/1\s+رهان/)).toBeInTheDocument()
      })
    })
  })

  describe('Stake input', () => {
    it('should display stake input when bets are present', async () => {
      const TestComponent = () => {
        const { addBet } = useBet()
        
        React.useEffect(() => {
          addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 2.0,
          })
        }, [addBet])
        
        return <BetSlipContent />
      }

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        const stakeInput = screen.getByRole('spinbutton')
        expect(stakeInput).toBeInTheDocument()
      })
    })

    it('should have increment button with aria-label', async () => {
      const TestComponent = () => {
        const { addBet } = useBet()
        
        React.useEffect(() => {
          addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 2.0,
          })
        }, [addBet])
        
        return <BetSlipContent />
      }

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        const incrementButton = screen.getByLabelText(/زيادة مبلغ الرهان/i)
        expect(incrementButton).toBeInTheDocument()
      })
    })

    it('should have decrement button with aria-label', async () => {
      const TestComponent = () => {
        const { addBet } = useBet()
        
        React.useEffect(() => {
          addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 2.0,
          })
        }, [addBet])
        
        return <BetSlipContent />
      }

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        const decrementButton = screen.getByLabelText(/تقليل مبلغ الرهان/i)
        expect(decrementButton).toBeInTheDocument()
      })
    })
  })

  describe('Place bet', () => {
    it('should display place bet button when bets are present', async () => {
      const TestComponent = () => {
        const { addBet } = useBet()
        
        React.useEffect(() => {
          addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 2.0,
          })
        }, [addBet])
        
        return <BetSlipContent />
      }

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByText('وضع الرهان')).toBeInTheDocument()
      })
    })

    it('should have clear bets button with proper aria-label', async () => {
      const TestComponent = () => {
        const { addBet } = useBet()
        
        React.useEffect(() => {
          addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 2.0,
          })
        }, [addBet])
        
        return <BetSlipContent />
      }

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        const clearButton = screen.getByLabelText('مسح جميع الرهانات')
        expect(clearButton).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have aria-labels on all icon buttons', async () => {
      const TestComponent = () => {
        const { addBet } = useBet()
        
        React.useEffect(() => {
          addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 2.0,
          })
        }, [addBet])
        
        return <BetSlipContent />
      }

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByLabelText('مسح جميع الرهانات')).toBeInTheDocument()
        expect(screen.getByLabelText('إزالة الرهان')).toBeInTheDocument()
        expect(screen.getByLabelText(/زيادة مبلغ الرهان/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/تقليل مبلغ الرهان/i)).toBeInTheDocument()
      })
    })
  })
})

