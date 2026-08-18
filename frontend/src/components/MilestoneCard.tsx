import React from 'react';
import { Milestone, MilestoneStatus } from '../types';
import { Clock, ExternalLink, Shield, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  currentUser: string | null;
  onSelect: (milestone: Milestone) => void;
  onFund?: (id: number) => void;
  onApprove?: (id: number) => void;
  actionLoading?: boolean;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  currentUser,
  onSelect,
  onFund,
  onApprove,
  actionLoading = false,
}) => {
  const isClient = currentUser && currentUser.toLowerCase() === milestone.client.toLowerCase();
  const isFreelancer = currentUser && currentUser.toLowerCase() === milestone.freelancer.toLowerCase();

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case MilestoneStatus.Created:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Created (Unfunded)</span>;
      case MilestoneStatus.Funded:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Escrow Funded</span>;
      case MilestoneStatus.Submitted:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Deliverable Submitted</span>;
      case MilestoneStatus.Approved:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved & Paid</span>;
      case MilestoneStatus.Disputed:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Under Dispute</span>;
      case MilestoneStatus.Refunded:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Refunded</span>;
    }
  };

  const formattedDeadline = new Date(milestone.deadline * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-[#161822] border border-[#272a3c] hover:border-indigo-500/40 transition-all rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              #{milestone.id}
            </span>
            {getStatusBadge(milestone.status)}
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-white tracking-tight">{milestone.amount}</span>
            <span className="text-xs text-slate-400 ml-1">USDC</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 mb-4 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Client:</span>
            <span className="text-slate-200">
              {milestone.client.slice(0, 6)}...{milestone.client.slice(-4)}
              {isClient && <span className="ml-1 text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">You</span>}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Freelancer:</span>
            <span className="text-slate-200">
              {milestone.freelancer.slice(0, 6)}...{milestone.freelancer.slice(-4)}
              {isFreelancer && <span className="ml-1 text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">You</span>}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Deadline:
            </span>
            <span className="text-slate-300">{formattedDeadline}</span>
          </div>
        </div>

        {milestone.deliverableCid && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1">Deliverable Link / CID:</span>
            <a
              href={milestone.deliverableCid}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center space-x-1 font-mono truncate"
            >
              <span className="truncate">{milestone.deliverableCid}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(milestone)}
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1 py-2 px-3 rounded-lg hover:bg-slate-800 transition"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {milestone.status === MilestoneStatus.Created && isClient && onFund && (
          <button
            onClick={() => onFund(milestone.id)}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            Fund Escrow
          </button>
        )}

        {milestone.status === MilestoneStatus.Submitted && isClient && onApprove && (
          <button
            onClick={() => onApprove(milestone.id)}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition flex items-center space-x-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approve & Release</span>
          </button>
        )}
      </div>
    </div>
  );
};
