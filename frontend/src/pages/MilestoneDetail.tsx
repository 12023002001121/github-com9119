import React, { useState } from 'react';
import { Milestone, MilestoneStatus } from '../types';
import { ExternalLink, ShieldAlert, CheckCircle2, Send, AlertTriangle, ArrowLeft } from 'lucide-react';

interface MilestoneDetailPageProps {
  milestone: Milestone;
  currentUser: string | null;
  onBack: () => void;
  onFund: (id: number) => Promise<any>;
  onSubmitDeliverable: (id: number, cid: string) => Promise<any>;
  onApprove: (id: number) => Promise<any>;
  onDispute: (id: number) => Promise<any>;
  isLoading: boolean;
}

export const MilestoneDetailPage: React.FC<MilestoneDetailPageProps> = ({
  milestone,
  currentUser,
  onBack,
  onFund,
  onSubmitDeliverable,
  onApprove,
  onDispute,
  isLoading,
}) => {
  const [deliverableCid, setDeliverableCid] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isClient = currentUser && currentUser.toLowerCase() === milestone.client.toLowerCase();
  const isFreelancer = currentUser && currentUser.toLowerCase() === milestone.freelancer.toLowerCase();

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!deliverableCid.trim()) {
      setErrorMsg('Please specify deliverable IPFS CID / URL');
      return;
    }
    try {
      await onSubmitDeliverable(milestone.id, deliverableCid);
      setDeliverableCid('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Submission failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to List</span>
      </button>

      <div className="bg-[#161822] border border-[#272a3c] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300">
              Milestone #{milestone.id}
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">{milestone.amount} USDC</h1>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {milestone.status}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 space-y-3 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Client Address:</span>
            <span className="text-slate-200">{milestone.client}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Freelancer Address:</span>
            <span className="text-slate-200">{milestone.freelancer}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Expiration Timestamp:</span>
            <span className="text-slate-300">{new Date(milestone.deadline * 1000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Soroban Inter-Contract Target:</span>
            <span className="text-cyan-400 font-bold">ReputationContract.record_completion()</span>
          </div>
        </div>

        {milestone.deliverableCid && (
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-300 block mb-1">Deliverable Link</span>
            <a
              href={milestone.deliverableCid}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 underline font-mono flex items-center space-x-1 break-all"
            >
              <span>{milestone.deliverableCid}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        )}

        {isFreelancer && milestone.status === MilestoneStatus.Funded && !milestone.deliverableCid && (
          <form onSubmit={handleDeliverableSubmit} className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-200">
              Submit Deliverable (IPFS CID / Github Link)
            </label>
            <input
              type="text"
              value={deliverableCid}
              onChange={(e) => setDeliverableCid(e.target.value)}
              placeholder="ipfs://bafybeig..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Deliverable</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800 space-y-3">
          {milestone.status === MilestoneStatus.Created && isClient && (
            <button
              onClick={() => onFund(milestone.id)}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition"
            >
              Fund Escrow
            </button>
          )}

          {(milestone.status === MilestoneStatus.Submitted || milestone.status === MilestoneStatus.Funded) &&
            isClient && (
              <button
                onClick={() => onApprove(milestone.id)}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Release Funds</span>
              </button>
            )}

          {milestone.status !== MilestoneStatus.Approved &&
            milestone.status !== MilestoneStatus.Disputed &&
            milestone.status !== MilestoneStatus.Refunded && (
              <button
                onClick={() => onDispute(milestone.id)}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition flex items-center justify-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Raise Dispute</span>
              </button>
            )}
        </div>
      </div>
    </div>
  );
};
