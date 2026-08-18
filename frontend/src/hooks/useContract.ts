import { useState, useCallback, useEffect } from 'react';
import { Milestone, ReputationScore } from '../types';
import {
  fetchMilestones,
  createMilestoneOnChain,
  fundMilestoneOnChain,
  submitDeliverableOnChain,
  approveMilestoneOnChain,
  raiseDisputeOnChain,
  fetchReputationOnChain,
} from '../lib/stellar';

export function useContract(userAddress: string | null) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reputation, setReputation] = useState<ReputationScore | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMilestones();
      setMilestones(data);
      if (userAddress) {
        const rep = await fetchReputationOnChain(userAddress);
        setReputation(rep);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch contract state from Soroban RPC');
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createMilestone = async (params: {
    freelancer: string;
    amount: string;
    token: string;
    deadlineDays: number;
  }) => {
    if (!userAddress) throw new Error('Please connect your wallet first');
    setActionLoading(true);
    setError(null);
    try {
      const newM = await createMilestoneOnChain({
        client: userAddress,
        ...params,
      });
      setMilestones((prev) => [...prev, newM]);
      return newM;
    } catch (err: any) {
      const msg = err?.message || 'Failed to create milestone';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const fundMilestone = async (id: number) => {
    if (!userAddress) throw new Error('Please connect your wallet first');
    setActionLoading(true);
    setError(null);
    try {
      const updated = await fundMilestoneOnChain(id, userAddress);
      setMilestones((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err: any) {
      const msg = err?.message || 'Failed to fund milestone';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const submitDeliverable = async (id: number, deliverableCid: string) => {
    if (!userAddress) throw new Error('Please connect your wallet first');
    setActionLoading(true);
    setError(null);
    try {
      const updated = await submitDeliverableOnChain(id, userAddress, deliverableCid);
      setMilestones((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit deliverable';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const approveMilestone = async (id: number) => {
    if (!userAddress) throw new Error('Please connect your wallet first');
    setActionLoading(true);
    setError(null);
    try {
      const { milestone: updated, newReputation } = await approveMilestoneOnChain(id, userAddress);
      setMilestones((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setReputation(newReputation);
      return updated;
    } catch (err: any) {
      const msg = err?.message || 'Failed to approve milestone';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const raiseDispute = async (id: number) => {
    if (!userAddress) throw new Error('Please connect your wallet first');
    setActionLoading(true);
    setError(null);
    try {
      const updated = await raiseDisputeOnChain(id, userAddress);
      setMilestones((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err: any) {
      const msg = err?.message || 'Failed to raise dispute';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    milestones,
    loading,
    actionLoading,
    error,
    reputation,
    refresh: loadData,
    createMilestone,
    fundMilestone,
    submitDeliverable,
    approveMilestone,
    raiseDispute,
  };
}
