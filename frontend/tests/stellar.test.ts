import { describe, it, expect } from 'vitest';
import {
  createMilestoneOnChain,
  fundMilestoneOnChain,
  approveMilestoneOnChain,
  fetchReputationOnChain,
} from '../src/lib/stellar';
import { MilestoneStatus } from '../src/types';

describe('Stellar Soroban Contract Invocation Wrappers', () => {
  const validClient = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKE2XMYLFF5GH2C2BH7';
  const validFreelancer = 'GBBD47IF6LWK7P7MDEVSCWR7DPMBD5MCT6TUWO5TSEFLWMACGZOYOI22';

  it('successfully creates a milestone with valid parameters', async () => {
    const milestone = await createMilestoneOnChain({
      client: validClient,
      freelancer: validFreelancer,
      amount: '350.00',
      token: 'CDLZFC3SYJYDVR7P67SC7F3D4M2VCMJXYY3F3FJ35MZEW7YTLQ2J572FP',
      deadlineDays: 14,
    });

    expect(milestone.id).toBeGreaterThan(0);
    expect(milestone.status).toBe(MilestoneStatus.Created);
    expect(milestone.amount).toBe('350.00');
  });

  it('rejects creation with invalid freelancer address format', async () => {
    await expect(
      createMilestoneOnChain({
        client: validClient,
        freelancer: 'INVALID_ADDRESS',
        amount: '100.00',
        token: 'CDLZFC3SYJYDVR7P67SC7F3D4M2VCMJXYY3F3FJ35MZEW7YTLQ2J572FP',
        deadlineDays: 7,
      })
    ).rejects.toThrow('Invalid Stellar freelancer public key format');
  });

  it('rejects creation with zero or negative amount', async () => {
    await expect(
      createMilestoneOnChain({
        client: validClient,
        freelancer: validFreelancer,
        amount: '0',
        token: 'CDLZFC3SYJYDVR7P67SC7F3D4M2VCMJXYY3F3FJ35MZEW7YTLQ2J572FP',
        deadlineDays: 7,
      })
    ).rejects.toThrow('Milestone amount must be strictly greater than 0');
  });

  it('successfully executes approval and updates reputation inter-contract', async () => {
    // Milestone #2 in mock is initially Submitted state
    const result = await approveMilestoneOnChain(2, validClient);
    expect(result.milestone.status).toBe(MilestoneStatus.Approved);
    expect(result.newReputation.completedMilestones).toBeGreaterThan(0);
  });
});
