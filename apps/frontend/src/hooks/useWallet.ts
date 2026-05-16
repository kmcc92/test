import { useState, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { useAuthStore } from "../store/authStore";

export function useWallet() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress, setWallet } = useAuthStore();

  const connect = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask not detected. Please install it.");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0] as string;

      // Switch to Polygon Amoy (chainId 80002)
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x13882" }]);
      } catch (switchErr: unknown) {
        const err = switchErr as { code?: number };
        if (err.code === 4902) {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: "0x13882",
              chainName: "Polygon Amoy Testnet",
              rpcUrls: ["https://rpc-amoy.polygon.technology/"],
              nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
              blockExplorerUrls: ["https://amoy.polygonscan.com/"],
            },
          ]);
        }
      }

      setWallet(address);
    } catch (err) {
      setError("Failed to connect wallet");
      console.error(err);
    } finally {
      setConnecting(false);
    }
  }, [setWallet]);

  return { walletAddress, connecting, error, connect };
}
