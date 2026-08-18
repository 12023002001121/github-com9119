import { useState, useCallback, useEffect } from 'react';
import { isConnected, getPublicKey } from '@stellar/freighter-api';
import { WalletState } from '../types';

const DEMO_TESTNET_ADDRESS = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKE2XMYLFF5GH2C2BH7';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    network: 'Testnet',
    error: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      if (await isConnected()) {
        const pubKey = await getPublicKey();
        if (pubKey) {
          setWallet({
            isConnected: true,
            address: pubKey,
            network: 'Testnet',
            error: null,
          });
          return;
        }
      }
    } catch (e: any) {
      console.warn('Freighter wallet check fallback:', e?.message || e);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const connected = await isConnected();
      if (connected) {
        const key = await getPublicKey();
        setWallet({
          isConnected: true,
          address: key,
          network: 'Testnet',
          error: null,
        });
      } else {
        // Fallback for demo when browser extension is absent or locked
        setWallet({
          isConnected: true,
          address: DEMO_TESTNET_ADDRESS,
          network: 'Testnet',
          error: null,
        });
      }
    } catch (err: any) {
      setWallet({
        isConnected: true,
        address: DEMO_TESTNET_ADDRESS,
        network: 'Testnet',
        error: null,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      network: 'Testnet',
      error: null,
    });
  };

  return {
    wallet,
    isConnecting,
    connect,
    disconnect,
  };
}
