import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { useEvents } from './hooks/useEvents';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { CreateMilestoneModal } from './components/CreateMilestoneModal';
import { MilestoneDetailModal } from './components/MilestoneDetailModal';
import { MyMilestonesPage } from './pages/MyMilestones';
import { CreateMilestonePage } from './pages/CreateMilestone';
import { FreelancerDashboardPage } from './pages/FreelancerDashboard';
import { MilestoneDetailPage } from './pages/MilestoneDetail';
import { Milestone } from './types';

export function App() {
  const { wallet, isConnecting, connect, disconnect } = useWallet();
  const {
    milestones,
    loading,
    actionLoading,
    error,
    reputation,
    createMilestone,
    fundMilestone,
    submitDeliverable,
    approveMilestone,
    raiseDispute,
  } = useContract(wallet.address);

  const { latestEvent } = useEvents(3000);

  const [activeTab, setActiveTab] = useState<string>('client');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [toastEvent, setToastEvent] = useState(latestEvent);

  // Sync latestEvent into Toast
  React.useEffect(() => {
    if (latestEvent) {
      setToastEvent(latestEvent);
    }
  }, [latestEvent]);

  return (
    <div className="min-h-screen bg-[#0e0f14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        wallet={wallet}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedMilestone(null);
          setActiveTab(tab);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedMilestone ? (
          <MilestoneDetailPage
            milestone={selectedMilestone}
            currentUser={wallet.address}
            onBack={() => setSelectedMilestone(null)}
            onFund={fundMilestone}
            onSubmitDeliverable={submitDeliverable}
            onApprove={approveMilestone}
            onDispute={raiseDispute}
            isLoading={actionLoading}
          />
        ) : activeTab === 'client' ? (
          <MyMilestonesPage
            milestones={milestones}
            loading={loading}
            currentUser={wallet.address}
            onSelect={(m) => setSelectedMilestone(m)}
            onFund={fundMilestone}
            onApprove={approveMilestone}
            actionLoading={actionLoading}
          />
        ) : activeTab === 'create' ? (
          <CreateMilestonePage
            userAddress={wallet.address}
            onCreate={createMilestone}
            isLoading={actionLoading}
            onSuccess={() => setActiveTab('client')}
          />
        ) : (
          <FreelancerDashboardPage
            milestones={milestones}
            loading={loading}
            reputation={reputation}
            currentUser={wallet.address}
            onSelect={(m) => setSelectedMilestone(m)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#272a3c] bg-[#161822]/60 py-6 text-center text-xs text-slate-500 font-mono">
        PayStream Lite • Soroban Smart Contracts • Inter-Contract Architecture & Real-Time RPC Streaming
      </footer>

      {/* Event Notification Toast */}
      <Toast event={toastEvent} onClose={() => setToastEvent(null)} />

      {/* Modals */}
      <CreateMilestoneModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createMilestone}
        isLoading={actionLoading}
      />

      <MilestoneDetailModal
        milestone={selectedMilestone}
        currentUser={wallet.address}
        onClose={() => setSelectedMilestone(null)}
        onFund={fundMilestone}
        onSubmitDeliverable={submitDeliverable}
        onApprove={approveMilestone}
        onDispute={raiseDispute}
        isLoading={actionLoading}
      />
    </div>
  );
}

export default App;
