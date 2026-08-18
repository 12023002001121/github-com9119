import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#161822] border border-[#272a3c] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 bg-slate-800 rounded w-1/4"></div>
            <div className="h-6 bg-slate-800 rounded-full w-20"></div>
          </div>
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-9 bg-slate-800 rounded-xl w-28"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
