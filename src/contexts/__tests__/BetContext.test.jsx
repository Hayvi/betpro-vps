import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { BetProvider, useBet } from '../BetContext'
import { I18nProvider } from '@/contexts/I18nContext'

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

// Helper to render hook with providers
const renderHookWithProvider = (hook) => {
  const wrapper = ({ children }) => (
    <I18nProvider>
      <BetProvider>{children}</BetProvider>
    </I18nProvider>
  )
  return renderHook(hook, { wrapper })
}

// Ensure each test starts with a clean bet slip state in localStorage
beforeEach(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('betpro_betslip')
    window.localStorage.removeItem('betpro_stake')
  }
})

describe('BetContext', () => {
  describe('useBet hook', () => {
    it('should throw error when used outside BetProvider', () => {
      expect(() => {
        renderHook(() => useBet())
      }).toThrow('useBet must be used within BetProvider')
    })

    it('should return context values when used inside BetProvider', () => {
      const { result } = renderHookWithProvider(() => useBet())

      expect(result.current).toHaveProperty('bets')
      expect(result.current).toHaveProperty('stake')
      expect(result.current).toHaveProperty('promoCode')
      expect(result.current).toHaveProperty('userBalance')
      expect(result.current).toHaveProperty('addBet')
      expect(result.current).toHaveProperty('removeBet')
      expect(result.current).toHaveProperty('clearBets')
    })
  })

  describe('Initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHookWithProvider(() => useBet())

      expect(result.current.bets).toEqual([])
      expect(result.current.stake).toBe(1)
      expect(result.current.promoCode).toBe('')
      expect(result.current.userBalance).toBe(0)
      expect(result.current.accumulatorOdds).toBe(0)
      expect(result.current.potentialWin).toBe('0.00')
      expect(result.current.isValidStake).toBe(false)
    })
  })

  describe('addBet', () => {
    it('should add a new bet with valid odds', () => {
      const { result } = renderHookWithProvider(() => useBet())

      const newBet = {
        matchId: 'match1',
        matchType: 'upcoming',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        league: 'Premier League',
        betType: 'Home Win',
        odds: 2.5,
      }

      act(() => {
        result.current.addBet(newBet)
      })

      expect(result.current.bets).toHaveLength(1)
      expect(result.current.bets[0]).toMatchObject({
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        betType: 'Home Win',
        odds: '2.50',
      })
      expect(result.current.bets[0].id).toBeDefined()
    })

    it('should validate odds and format them to 2 decimal places', () => {
      const { result } = renderHookWithProvider(() => useBet())

      act(() => {
        result.current.addBet({
          matchId: 'match1',
          matchType: 'upcoming',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          league: 'League',
          betType: 'Win',
          odds: 3.456,
        })
      })

      expect(result.current.bets[0].odds).toBe('3.46')
    })

    it('should throw error for invalid odds (NaN)', () => {
      const { result } = renderHookWithProvider(() => useBet())

      expect(() => {
        act(() => {
          result.current.addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 'invalid',
          })
        })
      }).toThrow()
    })

    it('should throw error for odds less than 1.01', () => {
      const { result } = renderHookWithProvider(() => useBet())

      expect(() => {
        act(() => {
          result.current.addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 1.0,
          })
        })
      }).toThrow('لا يمكن أن تكون الاحتمالات أقل من 1.01')
    })

    it('should throw error for odds greater than 1000', () => {
      const { result } = renderHookWithProvider(() => useBet())

      expect(() => {
        act(() => {
          result.current.addBet({
            matchId: 'match1',
            matchType: 'upcoming',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            league: 'League',
            betType: 'Win',
            odds: 1001,
          })
        })
      }).toThrow('لا يمكن أن تزيد الاحتمالات عن 1000')
    })

    it('should replace existing bet on same match', () => {
      const { result } = renderHookWithProvider(() => useBet())

      const bet1 = {
        matchId: 'match1',
        matchType: 'upcoming',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        league: 'League',
        betType: 'Home Win',
        odds: 2.0,
      }

      const bet2 = {
        matchId: 'match1',
        matchType: 'upcoming',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        league: 'League',
        betType: 'Away Win',
        odds: 3.0,
      }

      act(() => {
        result.current.addBet(bet1)
      })

      const firstBetId = result.current.bets[0].id

      act(() => {
        result.current.addBet(bet2)
      })

      expect(result.current.bets).toHaveLength(1)
      expect(result.current.bets[0].id).toBe(firstBetId)
      expect(result.current.bets[0].betType).toBe('Away Win')
      expect(result.current.bets[0].odds).toBe('3.00')
    })
  })

  describe('removeBet', () => {
    it('should remove a bet by id', () => {
      const { result } = renderHookWithProvider(() => useBet())

      act(() => {
        result.current.addBet({
          matchId: 'match1',
          matchType: 'upcoming',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          league: 'League',
          betType: 'Win',
          odds: 2.0,
        })
        result.current.addBet({
          matchId: 'match2',
          matchType: 'upcoming',
          homeTeam: 'Team C',
          awayTeam: 'Team D',
          league: 'League',
          betType: 'Win',
          odds: 3.0,
        })
      })

      const betIdToRemove = result.current.bets[0].id

      act(() => {
        result.current.removeBet(betIdToRemove)
      })

      expect(result.current.bets).toHaveLength(1)
      expect(result.current.bets[0].matchId).toBe('match2')
    })
  })

  describe('clearBets', () => {
    it('should clear all bets', () => {
      const { result } = renderHookWithProvider(() => useBet())

      act(() => {
        result.current.addBet({
          matchId: 'match1',
          matchType: 'upcoming',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          league: 'League',
          betType: 'Win',
          odds: 2.0,
        })
        result.current.addBet({
          matchId: 'match2',
          matchType: 'upcoming',
          homeTeam: 'Team C',
          awayTeam: 'Team D',
          league: 'League',
          betType: 'Win',
          odds: 3.0,
        })
      })

      expect(result.current.bets).toHaveLength(2)

      act(() => {
        result.current.clearBets()
      })

      expect(result.current.bets).toHaveLength(0)
    })
  })

  describe('stake management', () => {
    it('should update stake', () => {
      const { result } = renderHookWithProvider(() => useBet())

      act(() => {
        result.current.setStake(50)
      })

      expect(result.current.stake).toBe(50)
    })

    it('should validate stake correctly', () => {
      const { result } = renderHookWithProvider(() => useBet())

      // Set a user balance to validate against
      act(() => {
        result.current.updateUserBalance(1000)
      })

      // Valid stake
      act(() => {
        result.current.setStake(100)
      })
      expect(result.current.isValidStake).toBe(true)

      // Stake too low
      act(() => {
        result.current.setStake(0.5)
      })
      expect(result.current.isValidStake).toBe(false)

      // Stake too high
      act(() => {
        result.current.setStake(2000)
      })
      expect(result.current.isValidStake).toBe(false)
    })
  })

  describe('accumulatorOdds calculation', () => {
    it('should calculate accumulator odds correctly', () => {
      const { result } = renderHookWithProvider(() => useBet())

      act(() => {
        result.current.addBet({
          matchId: 'match1',
          matchType: 'upcoming',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          league: 'League',
          betType: 'Win',
          odds: 2.0,
        })
        result.current.addBet({
          matchId: 'match2',
          matchType: 'upcoming',
          homeTeam: 'Team C',
          awayTeam: 'Team D',
          league: 'League',
          betType: 'Win',
          odds: 3.0,
        })
      })

      expect(result.current.accumulatorOdds).toBe(6.0) // 2.0 * 3.0
    })

    it('should return 0 when no bets', () => {
      const { result } = renderHookWithProvider(() => useBet())

      expect(result.current.accumulatorOdds).toBe(0)
    })
  })

  describe('potentialWin calculation', () => {
    it('should calculate potential win correctly', () => {
      const { result } = renderHookWithProvider(() => useBet())

      act(() => {
        result.current.setStake(100)
        result.current.addBet({
          matchId: 'match1',
          matchType: 'upcoming',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          league: 'League',
          betType: 'Win',
          odds: 2.5,
        })
      })

      expect(result.current.potentialWin).toBe('250.00') // 100 * 2.5
    })
  })

  describe('updateUserBalance', () => {
    it('should update user balance', () => {
      const { result } = renderHookWithProvider(() => useBet())

      act(() => {
        result.current.updateUserBalance(2000)
      })

      expect(result.current.userBalance).toBe(2000)
    })
  })
})

