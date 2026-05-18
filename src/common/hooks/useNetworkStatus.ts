import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean;
  isOffline: boolean;
};

function toNetworkStatus(state: NetInfoState): NetworkStatus {
  const isConnected = state.isConnected ?? true;
  const isInternetReachable = state.isInternetReachable ?? isConnected;
  const isOffline = !isConnected || isInternetReachable === false;
  return { isConnected, isInternetReachable, isOffline };
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    isOffline: false,
  });

  useEffect(() => {
    let alive = true;
    void NetInfo.fetch().then((state) => {
      if (alive) setStatus(toNetworkStatus(state));
    });
    const unsub = NetInfo.addEventListener((state) => {
      setStatus(toNetworkStatus(state));
    });
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  return status;
}
