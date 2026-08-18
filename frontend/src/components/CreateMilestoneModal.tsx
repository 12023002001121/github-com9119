import React, { useState } from 'react';
import { CONTRACT_ADDRESSES } from '../lib/stellar';
import { PlusCircle, X, ShieldAlert } from 'lucide-react';

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    freelancer: string;
    amount: string;
    token: string;
    deadlineDays: number;
  }) => Promise<any>;
  isLoading: boolean;
}

export const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [freelancer, setFreelancer] = useState('GBBD47IF6LWK7P7MDEVSCWR7DPMBD5MCT6TUWO5TSEFLWMACGZOYOI22');
  const [amount, setAmount] = useState('500');
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!freelancer.startsWith('G') || freelancer.length !== 56) {
      setValidationError('Stellar public key must start with "G" and contain 56 characters');
      return;
    }
    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setValidationError('Please enter a valid positive milestone amount');
      return;
    }

    try {
      await onSubmit({
        freelancer,
        amount,
        token: CONTRACT_ADDRESSES.usdcToken,
        deadlineDays,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to submit milestone creation request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161822] border border-[#272a3c] max-w-lg w-full rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create New Escrow Milestone</h3>
            <p className="text-xs text-slate-400">Funds are held securely until deliverable approval</p>
          </div>
        </div>

        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Freelancer Public Key (Address)
            </label>
            <input
              type="text"
              value={freelancer}
              onChange={(e) => setFreelancer(e.target.value)}
              placeholder="G..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount (USDC)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deadline (Days)</label>
              <input
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(parseInt(e.target.value) || 1)}
                min="1"
                max="90"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Token Contract Address (Testnet)
            </label>
            <input
              type="text"
              value={CONTRACT_ADDRESSES.usdcToken}
              disabled
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-400 font-mono cursor-not-allowed"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
