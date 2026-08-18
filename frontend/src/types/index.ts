export enum MilestoneStatus {
  Created = 'Created',
  Funded = 'Funded',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Disputed = 'Disputed',
  Refunded = 'Refunded',
}

export interface Milestone {
  id: number;
  client: string;
  freelancer: string;
  amount: string; // Token amount formatted
  token: string;
  status: MilestoneStatus;
  deadline: number; // Unix timestamp
  reputationContract: string;
  deliverableCid?: string;
  createdAt: number;
}

export interface ReputationScore {
  completedMilestones: number;
  totalEarned: string;
}

export interface SorobanEvent {
  id: string;
  type: 'created' | 'funded' | 'submitted' | 'approved' | 'disputed' | 'refunded';
  milestoneId: number;
  timestamp: number;
  details: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: string;
  error: string | null;
}
