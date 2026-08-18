import React from 'react';
import { Milestone, ReputationScore } from '../types';
import { MilestoneCard } from '../components/MilestoneCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Award, DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';

interface FreelancerDashboardProps {
  milestones: Milestone[];
  loading: boolean;
  reputation: ReputationScore | null;
  currentUser: string | null;
  onSelect: (m: Milestone) => void;
}

export const FreelancerDashboardPage: React.FC<FreelancerDashboardProps> = ({
  milestones,
  loading,
  reputation,
  currentUser,
  onSelect,
}) => {
  const assigned = milestones.filter(
    (m) => currentUser && m.freelancer.toLowerCase() === currentUser.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* On-Chain Reputation Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                On-Chain Reputation Score (Soroban)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Freelancer Performance Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Reputation metric stored on <code className="text-indigo-300 font-mono">ReputationContract.soroban</code>. Updated directly via Escrow inter-contract calls upon milestone approval.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-[#161822]/90 border border-slate-700/80 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black text-white">
                  {reputation ? reputation.completedMilestones : 0}
                </span>
                <span className="block text-[11px] text-slate-400 uppercase tracking-wide">
                  Completed
                </span>
              </div>
            </div>

            <div className="bg-[#161822]/90 border border-slate-700/80 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black text-white">
                  ${reputation ? reputation.totalEarned : '0.00'}
                </span>
                <span className="block text-[11px] text-slate-400 uppercase tracking-wide">
                  Total Earned
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Milestones Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <span>Assigned Deliverables ({assigned.length})</span>
        </h2>

        {loading ? (
          <SkeletonLoader />
        ) : assigned.length === 0 ? (
          <div className="bg-[#161822] border border-[#272a3c] rounded-2xl p-12 text-center">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No active milestones assigned</h3>
            <p className="text-xs text-slate-500 mt-1">
              Milestones created with your wallet address will appear here for deliverable submission.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assigned.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                currentUser={currentUser}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
