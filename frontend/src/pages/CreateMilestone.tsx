import React, { useState } from 'react';
import { CONTRACT_ADDRESSES } from '../lib/stellar';
import { PlusCircle, ShieldAlert, CheckCircle } from 'lucide-react';

interface CreateMilestonePageProps {
  userAddress: string | null;
  onCreate: (params: {
    freelancer: string;
    amount: string;
    token: string;
    deadlineDays: number;
  }) => Promise<any>;
  isLoading: boolean;
  onSuccess: () => void;
}

export const CreateMilestonePage: React.FC<CreateMilestonePageProps> = ({
  userAddress,
  onCreate,
  isLoading,
  onSuccess,
}) => {
  const [freelancer, setFreelancer] = useState('GBBD47IF6LWK7P7MDEVSCWR7DPMBD5MCT6TUWO5TSEFLWMACGZOYOI22');
  const [amount, setAmount] = useState('500');
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!userAddress) {
      setErrorMsg('Please connect your wallet first');
      return;
    }
    if (!freelancer.startsWith('G') || freelancer.length !== 56) {
      setErrorMsg('Freelancer address must be a valid 56-character Stellar public key starting with G');
      return;
    }
    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setErrorMsg('Milestone amount must be a positive number');
      return;
    }

    try {
      await onCreate({
        freelancer,
        amount,
        token: CONTRACT_ADDRESSES.usdcToken,
        deadlineDays,
      });
      setSuccessMsg('Milestone created successfully on Soroban!');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Creation failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-[#161822] border border-[#272a3c] rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Create Milestone Escrow</h1>
            <p className="text-xs text-slate-400">
              Client locks USDC tokens into EscrowContract. Soroban handles release & reputation.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Freelancer Public Key (Address)
            </label>
            <input
              type="text"
              value={freelancer}
              onChange={(e) => setFreelancer(e.target.value)}
              placeholder="G..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (USDC)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days)</label>
              <input
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(parseInt(e.target.value) || 1)}
                min="1"
                max="90"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Inter-Contract Reputation Link
            </label>
            <input
              type="text"
              value={CONTRACT_ADDRESSES.reputation}
              disabled
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-mono cursor-not-allowed"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !userAddress}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating Milestone...' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
