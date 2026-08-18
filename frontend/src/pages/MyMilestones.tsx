import React, { useState } from 'react';
import { Milestone, MilestoneStatus } from '../types';
import { MilestoneCard } from '../components/MilestoneCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Filter, Layers } from 'lucide-react';

interface MyMilestonesProps {
  milestones: Milestone[];
  loading: boolean;
  currentUser: string | null;
  onSelect: (m: Milestone) => void;
  onFund: (id: number) => void;
  onApprove: (id: number) => void;
  actionLoading: boolean;
}

export const MyMilestonesPage: React.FC<MyMilestonesProps> = ({
  milestones,
  loading,
  currentUser,
  onSelect,
  onFund,
  onApprove,
  actionLoading,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = milestones.filter((m) => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Escrow Milestones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage escrow deposits, review deliverables, and trigger smart contract approvals.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-[#161822] p-1.5 rounded-xl border border-[#272a3c] overflow-x-auto max-w-full">
          <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          {['ALL', MilestoneStatus.Created, MilestoneStatus.Funded, MilestoneStatus.Submitted, MilestoneStatus.Approved].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter === statusKey
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {statusKey}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : filtered.length === 0 ? (
        <div className="bg-[#161822] border border-[#272a3c] rounded-2xl p-12 text-center">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No milestones found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {filter === 'ALL'
              ? 'Create your first milestone using the "Create Milestone" tab above.'
              : `No milestones matching filter "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              currentUser={currentUser}
              onSelect={onSelect}
              onFund={onFund}
              onApprove={onApprove}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};
