import { useCallback, useEffect, useState } from "react";

import { subscribeAlertsChanged } from "../alertsEvents";
import type { StoredAlert } from "@/storage/alertsStorage";
import { readAlerts, writeAlerts } from "@/storage/alertsStorage";

export function useAlerts() {
  const [alerts, setAlerts] = useState<StoredAlert[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    readAlerts().then((rows) => {
      if (alive) {
        setAlerts(rows);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    return subscribeAlertsChanged(() => {
      readAlerts().then(setAlerts);
    });
  }, []);

  const addAlert = useCallback((rule: Omit<StoredAlert, "id" | "status">) => {
    const row: StoredAlert = {
      ...rule,
      status: "active",
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    setAlerts((prev) => {
      const next = [...prev, row];
      void writeAlerts(next);
      return next;
    });
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      void writeAlerts(next);
      return next;
    });
  }, []);

  return { alerts, ready, addAlert, removeAlert };
}
