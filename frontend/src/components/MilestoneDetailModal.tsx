import React, { useState } from 'react';
import { Milestone, MilestoneStatus } from '../types';
import { X, ExternalLink, ShieldAlert, CheckCircle2, Send, AlertTriangle } from 'lucide-react';

interface MilestoneDetailModalProps {
  milestone: Milestone | null;
  currentUser: string | null;
  onClose: () => void;
  onFund: (id: number) => Promise<any>;
  onSubmitDeliverable: (id: number, cid: string) => Promise<any>;
  onApprove: (id: number) => Promise<any>;
  onDispute: (id: number) => Promise<any>;
  isLoading: boolean;
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  milestone,
  currentUser,
  onClose,
  onFund,
  onSubmitDeliverable,
  onApprove,
  onDispute,
  isLoading,
}) => {
  const [deliverableCid, setDeliverableCid] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!milestone) return null;

  const isClient = currentUser && currentUser.toLowerCase() === milestone.client.toLowerCase();
  const isFreelancer = currentUser && currentUser.toLowerCase() === milestone.freelancer.toLowerCase();

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!deliverableCid.trim()) {
      setErrorMsg('Deliverable IPFS CID / URL link cannot be empty');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161822] border border-[#272a3c] max-w-xl w-full rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Milestone #{milestone.id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Status: {milestone.status}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">{milestone.amount} USDC</h2>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Technical Timeline Info */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-2 text-xs font-mono mb-6">
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Client:</span>
            <span className="text-slate-200">{milestone.client}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Freelancer:</span>
            <span className="text-slate-200">{milestone.freelancer}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Escrow Contract:</span>
            <span className="text-indigo-400">EscrowContract.soroban</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Reputation Contract:</span>
            <span className="text-cyan-400">ReputationContract.soroban</span>
          </div>
        </div>

        {/* Deliverable Section */}
        {milestone.deliverableCid ? (
          <div className="mb-6 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-300 block mb-1">Submitted Deliverable</span>
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
        ) : (
          isFreelancer &&
          milestone.status === MilestoneStatus.Funded && (
            <form onSubmit={handleDeliverableSubmit} className="mb-6 space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <label className="block text-xs font-semibold text-slate-200">
                Submit Deliverable IPFS CID / Github Link
              </label>
              <input
                type="text"
                value={deliverableCid}
                onChange={(e) => setDeliverableCid(e.target.value)}
                placeholder="ipfs://bafybeig... or https://github.com/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Deliverable</span>
              </button>
            </form>
          )
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          {milestone.status === MilestoneStatus.Created && isClient && (
            <button
              onClick={() => onFund(milestone.id)}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
            >
              Fund {milestone.amount} USDC into Escrow
            </button>
          )}

          {(milestone.status === MilestoneStatus.Submitted || milestone.status === MilestoneStatus.Funded) &&
            isClient && (
              <button
                onClick={() => onApprove(milestone.id)}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Deliverable & Trigger Inter-Contract Release</span>
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
