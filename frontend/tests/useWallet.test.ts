import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWallet } from '../src/hooks/useWallet';

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn().mockResolvedValue(false),
  getPublicKey: vi.fn().mockResolvedValue(null),
}));

describe('useWallet Custom Hook', () => {
  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useWallet());
    expect(result.current.wallet.isConnected).toBe(false);
    expect(result.current.wallet.address).toBeNull();
  });

  it('handles connect gracefully using fallback address when wallet extension absent', async () => {
    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.wallet.isConnected).toBe(true);
    expect(result.current.wallet.address).toContain('GAAZI');
  });

  it('disconnects user wallet cleanly', async () => {
    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.wallet.isConnected).toBe(false);
    expect(result.current.wallet.address).toBeNull();
  });
});
