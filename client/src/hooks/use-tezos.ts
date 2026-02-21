import { useState, useEffect, useCallback, useRef } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { NetworkType } from "@airgap/beacon-types";
import { DAppClient } from "@tezos-x/octez.connect-sdk";
import { TempleWallet } from "@temple-wallet/dapp";

const TEZOS_NODE = "https://mainnet.api.tez.ie";
const APP_NAME = "Whispers";
const NETWORK_MAINNET = "mainnet" as const;

// Shared Tezos toolkit (used for read-only; wallet provider set per connection)
const tezosToolkit = new TezosToolkit(TEZOS_NODE);

// Beacon (primary until sunset) – https://docs.walletbeacon.io
const beaconWallet = new BeaconWallet({
  name: APP_NAME,
  preferredNetwork: NetworkType.MAINNET,
});

// Octez Connect (backup when Beacon fails/sunsets) – https://github.com/trilitech/octez.connect
// Network must be set on the client; it is no longer accepted in requestPermissions().
const octezClient = new DAppClient({
  name: APP_NAME,
  network: { type: NetworkType.MAINNET },
});

type WalletProvider = "temple" | "beacon" | "octez" | null;

export function useTezos() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<WalletProvider>(null);
  const templeWalletRef = useRef<InstanceType<typeof TempleWallet> | null>(null);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Temple (direct wallet, no Beacon dependency)
      const templeAvailable = await TempleWallet.isAvailable();
      if (templeAvailable) {
        try {
          const temple = new TempleWallet(APP_NAME);
          await temple.connect(NETWORK_MAINNET);
          const pkh = await temple.getPKH();
          templeWalletRef.current = temple;
          providerRef.current = "temple";
          tezosToolkit.setWalletProvider(temple);
          setAddress(pkh);
          return;
        } catch (templeErr) {
          console.warn("Temple connect failed:", templeErr);
        }
      }

      // 2. Beacon (primary until service sunsets)
      // Network is set on BeaconWallet constructor (preferredNetwork); do not pass in requestPermissions().
      try {
        await beaconWallet.requestPermissions();
        const pkh = await beaconWallet.getPKH();
        templeWalletRef.current = null;
        providerRef.current = "beacon";
        tezosToolkit.setWalletProvider(beaconWallet);
        setAddress(pkh);
        return;
      } catch (beaconErr) {
        console.warn("Beacon connect failed, trying Octez Connect:", beaconErr);
      }

      // 3. Octez Connect (backup when Beacon fails/sunsets)
      const permissions = await octezClient.requestPermissions();
      const pkh = permissions.address;
      templeWalletRef.current = null;
      providerRef.current = "octez";
      setAddress(pkh);
    } catch (err: unknown) {
      console.error("Wallet connection failed:", err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setLoading(true);
    try {
      if (providerRef.current === "beacon") {
        await beaconWallet.clearActiveAccount();
      } else if (providerRef.current === "octez") {
        await octezClient.clearActiveAccount();
      }
      templeWalletRef.current = null;
      providerRef.current = null;
      setAddress(null);
    } catch (err) {
      console.error("Disconnect failed:", err);
      setAddress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore session: Temple → Beacon → Octez Connect
  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const templeAvailable = await TempleWallet.isAvailable();
        if (templeAvailable) {
          const permission = await TempleWallet.getCurrentPermission();
          if (permission?.pkh && mounted) {
            const temple = new TempleWallet(APP_NAME, permission);
            templeWalletRef.current = temple;
            providerRef.current = "temple";
            tezosToolkit.setWalletProvider(temple);
            setAddress(permission.pkh);
            if (mounted) setLoading(false);
            return;
          }
        }

        const beaconAccount = await beaconWallet.client.getActiveAccount();
        if (beaconAccount && mounted) {
          providerRef.current = "beacon";
          tezosToolkit.setWalletProvider(beaconWallet);
          setAddress(beaconAccount.address);
          if (mounted) setLoading(false);
          return;
        }

        const octezAccount = await octezClient.getActiveAccount();
        if (octezAccount?.address && mounted) {
          providerRef.current = "octez";
          setAddress(octezAccount.address);
        }
      } catch (err) {
        console.error("Failed to check active account", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    checkConnection();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    address,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    Tezos: tezosToolkit,
    wallet:
      providerRef.current === "beacon"
        ? beaconWallet
        : providerRef.current === "octez"
          ? octezClient
          : templeWalletRef.current,
  };
}
