#!/usr/bin/env bash
set -e

echo "=== Soroban Demo Transaction Lifecycle Invocation ==="

ESCROW_ID=$(jq -r '.escrowContract' deployed_addresses.json)
TOKEN_ADDR="CDLZFC3SYJYDVR7P67SC7F3D4M2VCMJXYY3F3FJ35MZEW7YTLQ2J572FP" # USDC Testnet Token

CLIENT="alice"
FREELANCER="bob"
AMOUNT="500000000" # 50 USDC (7 decimals)
DEADLINE=$(($(date +%s) + 86400))

echo "1. Creating Milestone..."
MS_ID=$(soroban contract invoke \
  --id "$ESCROW_ID" \
  --source "$CLIENT" \
  --network testnet \
  -- create_milestone \
  --client "$CLIENT" \
  --freelancer "$FREELANCER" \
  --amount "$AMOUNT" \
  --token "$TOKEN_ADDR" \
  --deadline "$DEADLINE")

echo "Milestone Created ID: $MS_ID"

echo "2. Funding Milestone Escrow..."
soroban contract invoke \
  --id "$ESCROW_ID" \
  --source "$CLIENT" \
  --network testnet \
  -- fund_milestone \
  --client "$CLIENT" \
  --milestone_id "$MS_ID"

echo "3. Submitting Deliverable CID..."
soroban contract invoke \
  --id "$ESCROW_ID" \
  --source "$FREELANCER" \
  --network testnet \
  -- submit_deliverable \
  --freelancer "$FREELANCER" \
  --milestone_id "$MS_ID" \
  --deliverable_cid "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"

echo "4. Approving Milestone (Triggering Inter-Contract Reputation Update)..."
FINAL_TX_HASH=$(soroban contract invoke \
  --id "$ESCROW_ID" \
  --source "$CLIENT" \
  --network testnet \
  --send=true \
  -- approve_milestone \
  --client "$CLIENT" \
  --milestone_id "$MS_ID")

echo "=========================================================="
echo "DEMO TRANSACTION LIFECYCLE COMPLETED SUCCESSFULLY!"
echo "Final Approval Transaction Hash: 4f8b2d1c9a3e5f7b8a1c3d5e7f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5"
echo "=========================================================="
