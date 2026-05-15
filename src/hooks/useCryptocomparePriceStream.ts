import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import {
  MAX_STREAMER_SYMBOLS,
  streamerWsUrl,
  toAggSub,
} from "@/config/streamer";
import { parseStreamerPrice } from "@/ws/parseStreamerPrice";
import { patchPriceInQueryCaches } from "@/ws/patchPriceCaches";

/** §5.2 — backoff exponencial */
const RECONNECT_MS = [1000, 2000, 4000, 8000, 16000];

function sendSubAction(
  ws: WebSocket,
  action: "SubAdd" | "SubRemove",
  fsyms: string[]
) {
  if (ws.readyState !== WebSocket.OPEN || fsyms.length === 0) return;
  const subs = fsyms.map((s) => toAggSub(s.toUpperCase()));
  ws.send(JSON.stringify({ action, subs }));
}

/**
 * Stream CCCAGG precio USD → `setQueryData` en top coins + detalle (§5).
 * Requiere `EXPO_PUBLIC_CRYPTOCOMPARE_API_KEY`.
 * Usar `enabled={useIsFocused()}` para no duplicar sockets (Mercados vs Detalle).
 */
export function useCryptocomparePriceStream(symbols: string[], enabled = true) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);
  const subscribedRef = useRef<Set<string>>(new Set());
  const symbolsRef = useRef(symbols);
  symbolsRef.current = symbols;

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
      subscribedRef.current = new Set();
      return;
    }

    const url = streamerWsUrl();
    if (!url) return;

    const syncSubscriptions = () => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const capped = [...new Set(symbolsRef.current.map((s) => s.toUpperCase()))].slice(
        0,
        MAX_STREAMER_SYMBOLS
      );
      const next = new Set(capped);
      const prev = subscribedRef.current;

      const toRemove = [...prev].filter((s) => !next.has(s));
      const toAdd = [...next].filter((s) => !prev.has(s));

      sendSubAction(ws, "SubRemove", toRemove);
      sendSubAction(ws, "SubAdd", toAdd);
      subscribedRef.current = next;
    };

    const scheduleReconnect = () => {
      clearReconnectTimer();
      const idx = Math.min(reconnectAttemptRef.current, RECONNECT_MS.length - 1);
      const delay = RECONNECT_MS[idx];
      reconnectTimerRef.current = setTimeout(() => {
        reconnectAttemptRef.current += 1;
        connectSocket();
      }, delay);
    };

    const connectSocket = () => {
      clearReconnectTimer();
      wsRef.current?.close();

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        subscribedRef.current = new Set();
        syncSubscriptions();
      };

      ws.onmessage = (ev) => {
        if (typeof ev.data !== "string") return;
        const tick = parseStreamerPrice(ev.data);
        if (!tick) return;
        patchPriceInQueryCaches(queryClient, tick.fsym, tick.price);
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
      subscribedRef.current = new Set();
    };
  }, [queryClient, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const capped = [...new Set(symbols.map((s) => s.toUpperCase()))].slice(
      0,
      MAX_STREAMER_SYMBOLS
    );
    const next = new Set(capped);
    const prev = subscribedRef.current;

    const toRemove = [...prev].filter((s) => !next.has(s));
    const toAdd = [...next].filter((s) => !prev.has(s));

    sendSubAction(ws, "SubRemove", toRemove);
    sendSubAction(ws, "SubAdd", toAdd);
    subscribedRef.current = next;
  }, [symbols, enabled]);
}
