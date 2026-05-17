import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

import { binanceMiniTickerUrl, MAX_BINANCE_STREAMS, toBinanceMiniStreamToken } from "@/core/config/binanceWs";
import { parseBinanceMiniTicker } from "@/ws/parseBinanceMiniTicker";
import { patchPriceInQueryCaches } from "@/ws/patchPriceCaches";

const RECONNECT_MS = [1000, 2000, 4000, 8000, 16_000];

/**
 * Precios y variación 24 h (ventana rodante Binance) vía `@miniTicker` / `24hrMiniTicker`.
 * No requiere API key. El % se deriva de `o`/`c` del ticker; alinea listado y detalle con el mismo stream.
 */
export function useBinancePriceStream(symbols: string[], enabled = true) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);

  const streamsKey = useMemo(() => {
    const capped = [...new Set(symbols.map((s) => s.trim().toUpperCase()))]
      .filter(Boolean)
      .slice(0, MAX_BINANCE_STREAMS);
    capped.sort();
    return capped.join(",");
  }, [symbols]);

  useEffect(() => {
    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    if (!enabled) {
      intentionalCloseRef.current = true;
      clearReconnectTimer();
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    const buildUrl = () => {
      const bases = streamsKey.split(",").filter(Boolean);
      const streams = bases.map(toBinanceMiniStreamToken);
      return binanceMiniTickerUrl(streams);
    };

    const scheduleReconnect = () => {
      clearReconnectTimer();
      const idx = Math.min(reconnectAttemptRef.current, RECONNECT_MS.length - 1);
      const delay = RECONNECT_MS[idx]!;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectAttemptRef.current += 1;
        connectSocket();
      }, delay);
    };

    const connectSocket = () => {
      clearReconnectTimer();
      wsRef.current?.close();

      const url = buildUrl();
      if (!url) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (ev) => {
        if (typeof ev.data !== "string") return;
        const tick = parseBinanceMiniTicker(ev.data);
        if (!tick) return;
        patchPriceInQueryCaches(
          queryClient,
          tick.fsym,
          tick.price,
          tick.changePercent24Hr
        );
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (intentionalCloseRef.current) return;
        scheduleReconnect();
      };
    };

    intentionalCloseRef.current = false;
    connectSocket();

    const unsubNet = NetInfo.addEventListener((state) => {
      if (
        state.isConnected &&
        (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)
      ) {
        reconnectAttemptRef.current = 0;
        connectSocket();
      }
    });

    return () => {
      intentionalCloseRef.current = true;
      clearReconnectTimer();
      unsubNet();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [queryClient, enabled, streamsKey]);
}
