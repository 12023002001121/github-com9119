import { Milestone, MilestoneStatus, ReputationScore, SorobanEvent } from '../types';

export const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export const CONTRACT_ADDRESSES = {
  escrow: 'CB6E45M3GJS62F764267XCDXFAVZE2M74J35MZEW7YTLQ2J572FPA2Q3',
  reputation: 'CC7365M3GJS62F764267XCDXFAVZE2M74J35MZEW7YTLQ2J572FPA2Q4',
  usdcToken: 'CDLZFC3SYJYDVR7P67SC7F3D4M2VCMJXYY3F3FJ35MZEW7YTLQ2J572FP',
};

// Initial mock state for realistic local fallback & live interaction test
let mockMilestones: Milestone[] = [
  {
    id: 1,
    client: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKE2XMYLFF5GH2C2BH7',
    freelancer: 'GBBD47IF6LWK7P7MDEVSCWR7DPMBD5MCT6TUWO5TSEFLWMACGZOYOI22',
    amount: '500.00',
    token: CONTRACT_ADDRESSES.usdcToken,
    status: MilestoneStatus.Funded,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 5,
    reputationContract: CONTRACT_ADDRESSES.reputation,
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 2,
    client: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKE2XMYLFF5GH2C2BH7',
    freelancer: 'GBBD47IF6LWK7P7MDEVSCWR7DPMBD5MCT6TUWO5TSEFLWMACGZOYOI22',
    amount: '1200.00',
    token: CONTRACT_ADDRESSES.usdcToken,
    status: MilestoneStatus.Submitted,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 3,
    reputationContract: CONTRACT_ADDRESSES.reputation,
    deliverableCid: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 3,
    client: 'GBBD47IF6LWK7P7MDEVSCWR7DPMBD5MCT6TUWO5TSEFLWMACGZOYOI22',
    freelancer: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKE2XMYLFF5GH2C2BH7',
    amount: '750.00',
    token: CONTRACT_ADDRESSES.usdcToken,
    status: MilestoneStatus.Approved,
    deadline: Math.floor(Date.now() / 1000) - 86400,
    reputationContract: CONTRACT_ADDRESSES.reputation,
    deliverableCid: 'ipfs://bafybeicg73k37a7qg2ff3d4m2vcmjxyy3f3fj35mzew7ytlq2j572fp',
    createdAt: Date.now() - 3600000 * 48,
  },
];

let mockEvents: SorobanEvent[] = [
  {
    id: 'evt-1',
    type: 'approved',
    milestoneId: 3,
    timestamp: Date.now() - 3600000 * 2,
    details: 'Milestone #3 approved! 750.00 USDC released to freelancer. On-chain reputation incremented.',
  },
  {
    id: 'evt-2',
    type: 'submitted',
    milestoneId: 2,
    timestamp: Date.now() - 3600000 * 12,
    details: 'Deliverable IPFS CID submitted for Milestone #2',
  },
];

export async function fetchMilestones(): Promise<Milestone[]> {
  // Simulates network latency
  await new Promise((res) => setTimeout(res, 300));
  return [...mockMilestones];
}

export async function createMilestoneOnChain(params: {
  client: string;
  freelancer: string;
  amount: string;
  token: string;
  deadlineDays: number;
}): Promise<Milestone> {
  await new Promise((res) => setTimeout(res, 600));

  if (!params.freelancer.startsWith('G') || params.freelancer.length !== 56) {
    throw new Error('Invalid Stellar freelancer public key format (Must start with G and be 56 chars)');
  }
  if (parseFloat(params.amount) <= 0) {
    throw new Error('Milestone amount must be strictly greater than 0');
  }

  const newMilestone: Milestone = {
    id: mockMilestones.length + 1,
    client: params.client,
    freelancer: params.freelancer,
    amount: params.amount,
    token: params.token || CONTRACT_ADDRESSES.usdcToken,
    status: MilestoneStatus.Created,
    deadline: Math.floor(Date.now() / 1000) + params.deadlineDays * 86400,
    reputationContract: CONTRACT_ADDRESSES.reputation,
    createdAt: Date.now(),
  };

  mockMilestones.push(newMilestone);

  mockEvents.unshift({
    id: `evt-${Date.now()}`,
    type: 'created',
    milestoneId: newMilestone.id,
    timestamp: Date.now(),
    details: `Milestone #${newMilestone.id} created by ${params.client.slice(0, 6)}...`,
  });

  return newMilestone;
}

export async function fundMilestoneOnChain(id: number, client: string): Promise<Milestone> {
  await new Promise((res) => setTimeout(res, 500));

  const target = mockMilestones.find((m) => m.id === id);
  if (!target) throw new Error(`Milestone #${id} not found`);
  if (target.client !== client) throw new Error('Only the milestone client can fund this escrow');
  if (target.status !== MilestoneStatus.Created) throw new Error(`Cannot fund milestone in status ${target.status}`);

  target.status = MilestoneStatus.Funded;

  mockEvents.unshift({
    id: `evt-${Date.now()}`,
    type: 'funded',
    milestoneId: target.id,
    timestamp: Date.now(),
    details: `Milestone #${target.id} funded with ${target.amount} USDC into Escrow contract`,
  });

  return { ...target };
}

export async function submitDeliverableOnChain(
  id: number,
  freelancer: string,
  deliverableCid: string
): Promise<Milestone> {
  await new Promise((res) => setTimeout(res, 500));

  const target = mockMilestones.find((m) => m.id === id);
  if (!target) throw new Error(`Milestone #${id} not found`);
  if (target.freelancer !== freelancer) throw new Error('Only assigned freelancer can submit deliverable');
  if (target.status !== MilestoneStatus.Funded) throw new Error('Milestone must be in Funded status to submit deliverable');

  target.status = MilestoneStatus.Submitted;
  target.deliverableCid = deliverableCid;

  mockEvents.unshift({
    id: `evt-${Date.now()}`,
    type: 'submitted',
    milestoneId: target.id,
    timestamp: Date.now(),
    details: `Freelancer submitted deliverable CID: ${deliverableCid}`,
  });

  return { ...target };
}

export async function approveMilestoneOnChain(id: number, client: string): Promise<{ milestone: Milestone; newReputation: ReputationScore }> {
  await new Promise((res) => setTimeout(res, 700));

  const target = mockMilestones.find((m) => m.id === id);
  if (!target) throw new Error(`Milestone #${id} not found`);
  if (target.client !== client) throw new Error('Only the client can approve milestone release');
  if (target.status !== MilestoneStatus.Submitted && target.status !== MilestoneStatus.Funded) {
    throw new Error(`Cannot approve milestone in state ${target.status}`);
  }

  target.status = MilestoneStatus.Approved;

  // Inter-contract call simulation: EscrowContract calls ReputationContract.record_completion(freelancer, amount)
  const rep = await fetchReputationOnChain(target.freelancer);
  const updatedEarned = (parseFloat(rep.totalEarned) + parseFloat(target.amount)).toFixed(2);
  const updatedRep: ReputationScore = {
    completedMilestones: rep.completedMilestones + 1,
    totalEarned: updatedEarned,
  };

  mockEvents.unshift({
    id: `evt-${Date.now()}`,
    type: 'approved',
    milestoneId: target.id,
    timestamp: Date.now(),
    details: `Milestone #${target.id} approved! ${target.amount} USDC released & Reputation updated inter-contract.`,
  });

  return { milestone: { ...target }, newReputation: updatedRep };
}

export async function raiseDisputeOnChain(id: number, caller: string): Promise<Milestone> {
  await new Promise((res) => setTimeout(res, 500));

  const target = mockMilestones.find((m) => m.id === id);
  if (!target) throw new Error(`Milestone #${id} not found`);
  if (target.client !== caller && target.freelancer !== caller) {
    throw new Error('Only client or freelancer involved in this milestone can raise a dispute');
  }

  target.status = MilestoneStatus.Disputed;

  mockEvents.unshift({
    id: `evt-${Date.now()}`,
    type: 'disputed',
    milestoneId: target.id,
    timestamp: Date.now(),
    details: `Dispute raised on Milestone #${target.id} by ${caller.slice(0, 6)}...`,
  });

  return { ...target };
}

export async function fetchReputationOnChain(freelancer: string): Promise<ReputationScore> {
  await new Promise((res) => setTimeout(res, 300));
  const approvedList = mockMilestones.filter((m) => m.freelancer === freelancer && m.status === MilestoneStatus.Approved);
  const total = approvedList.reduce((acc, m) => acc + parseFloat(m.amount), 0);
  return {
    completedMilestones: approvedList.length,
    totalEarned: total.toFixed(2),
  };
}

export async function pollSorobanEvents(): Promise<SorobanEvent[]> {
  await new Promise((res) => setTimeout(res, 200));
  return [...mockEvents];
}
