#!/usr/bin/env bash
set -e

echo "=== 1. Building Soroban Contracts to WASM ==="
cargo build --target wasm32-unknown-unknown --release

REPUTATION_WASM="target/wasm32-unknown-unknown/release/paystream_reputation.wasm"
ESCROW_WASM="target/wasm32-unknown-unknown/release/paystream_escrow.wasm"

echo "=== 2. Deploying ReputationContract to Stellar Testnet ==="
REPUTATION_ADDR=$(soroban contract deploy \
  --wasm "$REPUTATION_WASM" \
  --source alice \
  --network testnet)

echo "ReputationContract Deployed: $REPUTATION_ADDR"

echo "=== 3. Deploying EscrowContract to Stellar Testnet ==="
ESCROW_ADDR=$(soroban contract deploy \
  --wasm "$ESCROW_WASM" \
  --source alice \
  --network testnet)

echo "EscrowContract Deployed: $ESCROW_ADDR"

echo "=== 4. Initializing Contracts and Inter-Contract Link ==="
# Initialize ReputationContract with EscrowContract address for restricted auth
soroban contract invoke \
  --id "$REPUTATION_ADDR" \
  --source alice \
  --network testnet \
  -- initialize \
  --admin alice \
  --escrow_contract "$ESCROW_ADDR"

# Initialize EscrowContract with ReputationContract link
soroban contract invoke \
  --id "$ESCROW_ADDR" \
  --source alice \
  --network testnet \
  -- initialize \
  --admin alice \
  --reputation_contract "$REPUTATION_ADDR"

echo "=== 5. Writing deployed_addresses.json ==="
cat <<EOF > deployed_addresses.json
{
  "network": "testnet",
  "reputationContract": "$REPUTATION_ADDR",
  "escrowContract": "$ESCROW_ADDR",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "Deployment finished successfully!"
cat deployed_addresses.json
