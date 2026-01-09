import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useNotificationCenter } from '../useNotificationCenter'

// Mock auth context so the effect early-returns (no Supabase wiring)
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    userId: null,
  }),
}))

// Mock Supabase client to avoid any realtime setup
vi.mock('@/services/supabaseClient', () => ({
  supabase: null,
}))

// Mock transactions / withdrawal services so calls are safe if they ever happen
vi.mock('@/services/rbacAdminService', () => ({
  fetchMyTransactions: vi.fn().mockResolvedValue({ transactions: [], error: null }),
}))

vi.mock('@/services/withdrawalService', () => ({
  fetchPendingWithdrawalRequests: vi.fn().mockResolvedValue({ requests: [] }),
  fetchSentWithdrawalRequests: vi.fn().mockResolvedValue({ requests: [] }),
  approveWithdrawalRequest: vi.fn().mockResolvedValue({ error: null }),
  rejectWithdrawalRequest: vi.fn().mockResolvedValue({ error: null }),
}))

// Minimal shape test
describe('useNotificationCenter', () => {
  it('should expose default notification state and handlers without throwing', () => {
    const { result } = renderHook(() => useNotificationCenter())

    expect(result.current).toHaveProperty('notifications')
    expect(result.current).toHaveProperty('withdrawalRequests')
    expect(result.current).toHaveProperty('sentRequests')
    expect(result.current).toHaveProperty('senderNames')
    expect(result.current).toHaveProperty('processingId')
    expect(result.current).toHaveProperty('handleApprove')
    expect(result.current).toHaveProperty('handleReject')

    expect(Array.isArray(result.current.notifications)).toBe(true)
    expect(Array.isArray(result.current.withdrawalRequests)).toBe(true)
    expect(Array.isArray(result.current.sentRequests)).toBe(true)
    expect(typeof result.current.senderNames).toBe('object')
    expect(result.current.processingId).toBeNull()

    expect(typeof result.current.handleApprove).toBe('function')
    expect(typeof result.current.handleReject).toBe('function')
  })
})
