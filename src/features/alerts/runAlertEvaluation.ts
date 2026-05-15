import type { QueryClient } from "@tanstack/react-query";

import { isAlertConditionMet } from "./alertConditions";
import { emitAlertsChanged } from "./alertsEvents";
import { presentAlertTriggeredNotification } from "./localNotifications";
import { getPriceMetricsFromCache } from "./priceMetricsFromCache";
import type { StoredAlert } from "@/storage/alertsStorage";
import { readAlerts, writeAlerts } from "@/storage/alertsStorage";

/** Por id — si la condición ya estaba cumplida en la corrida anterior (evita spam). */
const lastConditionSatisfied = new Map<string, boolean>();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const pendingFsyms = new Set<string>();

export function enqueueAlertEvaluation(
  queryClient: QueryClient,
  fsymUpper: string
): void {
  pendingFsyms.add(fsymUpper.toUpperCase());
  if (debounceTimer) return;
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    const batch = new Set(pendingFsyms);
    pendingFsyms.clear();
    void runAlertEvaluation(queryClient, { onlyFsyms: batch });
  }, 150);
}

export async function runAllAlertsEvaluation(
  queryClient: QueryClient
): Promise<void> {
  await runAlertEvaluation(queryClient, { onlyFsyms: null });
}

async function runAlertEvaluation(
  queryClient: QueryClient,
  options: { onlyFsyms: Set<string> | null }
): Promise<void> {
  const alerts = await readAlerts();
  if (!alerts.length) return;

  const subset: StoredAlert[] = options.onlyFsyms
    ? alerts.filter((a) =>
        options.onlyFsyms!.has(a.fsym.trim().toUpperCase())
      )
    : [...alerts];

  if (!subset.length) return;

  const idsToRemove: string[] = [];

  for (const alert of subset) {
    const fsym = alert.fsym.trim().toUpperCase();
    const metrics = getPriceMetricsFromCache(queryClient, fsym);
    if (!metrics) continue;

    const satisfied = isAlertConditionMet(alert, metrics);
    const prevSat = lastConditionSatisfied.get(alert.id) ?? false;

    if (satisfied && !prevSat) {
      await presentAlertTriggeredNotification(alert, metrics);
      if (!alert.recurring) {
        idsToRemove.push(alert.id);
        lastConditionSatisfied.delete(alert.id);
        continue;
      }
    }

    lastConditionSatisfied.set(alert.id, satisfied);
  }

  if (idsToRemove.length) {
    const next = alerts.filter((a) => !idsToRemove.includes(a.id));
    await writeAlerts(next);
    emitAlertsChanged();
  }
}

export function __resetAlertEdgeStateForTests(): void {
  lastConditionSatisfied.clear();
}
