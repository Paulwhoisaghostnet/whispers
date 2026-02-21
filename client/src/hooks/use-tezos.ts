import { useState, useEffect, useCallback } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { NetworkType } from "@airgap/beacon-types";

// Initialize Tezos Toolkit
// Using Ghostnet for development/testing, or Mainnet for production
const TEZOS_NODE = "https://mainnet.api.tez.ie"; // or ghostnet
const Tezos = new TezosToolkit(TEZOS_NODE);

const wallet = new BeaconWallet({
  name: "Objkt Chat Extension",
  preferredNetwork: NetworkType.MAINNET,
});

Tezos.setWalletProvider(wallet);

export function useTezos() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await wallet.requestPermissions({
        network: {
          type: NetworkType.MAINNET,
        },
      });
      const userAddress = await wallet.getPKH();
      setAddress(userAddress);
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      setError(err?.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setLoading(true);
    try {
      await wallet.clearActiveAccount();
      setAddress(null);
    } catch (err: any) {
      console.error("Disconnect failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check initial connection status
  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const activeAccount = await wallet.client.getActiveAccount();
        if (activeAccount && mounted) {
          setAddress(activeAccount.address);
        }
      } catch (err) {
        console.error("Failed to check active account", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    checkConnection();
    return () => { mounted = false; };
  }, []);

  return {
    address,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    Tezos,
    wallet
  };
}
