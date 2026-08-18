import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MilestoneCard } from '../src/components/MilestoneCard';
import { MilestoneStatus } from '../src/types';

describe('MilestoneCard Component', () => {
  const sampleMilestone = {
    id: 1,
    client: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKE2XMYLFF5GH2C2BH7',
    freelancer: 'GBBD47IF6LWK7P7MDEVSCWR7DPMBD5MCT6TUWO5TSEFLWMACGZOYOI22',
    amount: '500.00',
    token: 'CDLZFC3SYJYDVR7P67SC7F3D4M2VCMJXYY3F3FJ35MZEW7YTLQ2J572FP',
    status: MilestoneStatus.Created,
    deadline: 1750000000,
    reputationContract: 'CC7365M3GJS62F764267XCDXFAVZE2M74J35MZEW7YTLQ2J572FPA2Q4',
    createdAt: 1740000000,
  };

  it('renders milestone details correctly', () => {
    const onSelectMock = vi.fn();
    render(
      <MilestoneCard
        milestone={sampleMilestone}
        currentUser={null}
        onSelect={onSelectMock}
      />
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('500.00')).toBeInTheDocument();
    expect(screen.getByText('Created (Unfunded)')).toBeInTheDocument();
  });

  it('triggers onFund when Fund Escrow button is clicked by client', () => {
    const onFundMock = vi.fn();
    const onSelectMock = vi.fn();

    render(
      <MilestoneCard
        milestone={sampleMilestone}
        currentUser="GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKE2XMYLFF5GH2C2BH7"
        onSelect={onSelectMock}
        onFund={onFundMock}
      />
    );

    const fundBtn = screen.getByText('Fund Escrow');
    expect(fundBtn).toBeInTheDocument();
    fireEvent.click(fundBtn);
    expect(onFundMock).toHaveBeenCalledWith(1);
  });
});
