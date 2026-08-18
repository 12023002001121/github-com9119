import React from 'react';
import { WalletState } from '../types';
import { ShieldCheck, Wallet, PlusCircle, LayoutDashboard, Award, Activity } from 'lucide-react';

interface NavbarProps {
  wallet: WalletState;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  isConnecting,
  onConnect,
  onDisconnect,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#161822]/90 backdrop-blur border-b border-[#272a3c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('client')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">PayStream</span>
            <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Lite
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('client')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
              activeTab === 'client'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>My Milestones</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
              activeTab === 'create'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Milestone</span>
          </button>

          <button
            onClick={() => setActiveTab('freelancer')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
              activeTab === 'freelancer'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Freelancer Dashboard</span>
          </button>
        </nav>

        {/* Wallet Status & Network */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Soroban Testnet</span>
          </div>

          {wallet.isConnected ? (
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-slate-200">
                {wallet.address?.slice(0, 4)}...{wallet.address?.slice(-4)}
              </div>
              <button
                onClick={onDisconnect}
                className="text-xs text-slate-400 hover:text-rose-400 transition px-2 py-1"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition flex items-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
