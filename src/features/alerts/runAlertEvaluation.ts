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

/** Evita carreras entre `runAllAlertsEvaluation` y ticks del WS que pisan el mapa de bordes. */
let evaluationTail: Promise<void> = Promise.resolve();

function queueAlertEvaluation(
  queryClient: QueryClient,
  options: { onlyFsyms: Set<string> | null }
): Promise<void> {
  const run = evaluationTail.then(() => runAlertEvaluation(queryClient, options));
  evaluationTail = run.catch(() => {});
  return run;
}

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
    void queueAlertEvaluation(queryClient, { onlyFsyms: batch });
  }, 150);
}

export async function runAllAlertsEvaluation(
  queryClient: QueryClient
): Promise<void> {
  await queueAlertEvaluation(queryClient, { onlyFsyms: null });
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

  const idsToMarkNotified: string[] = [];

  for (const alert of subset) {
    if (alert.status !== "active") continue;

    const fsym = alert.fsym.trim().toUpperCase();
    const metrics = getPriceMetricsFromCache(queryClient, fsym);
    if (!metrics) continue;

    const satisfied = isAlertConditionMet(alert, metrics);
    const prevSat = lastConditionSatisfied.get(alert.id) ?? false;

    if (satisfied && !prevSat) {
      const sent = await presentAlertTriggeredNotification(alert, metrics);
      if (sent) {
        idsToMarkNotified.push(alert.id);
        lastConditionSatisfied.delete(alert.id);
      }
      continue;
    }

    lastConditionSatisfied.set(alert.id, satisfied);
  }

  if (idsToMarkNotified.length) {
    const notified = new Set(idsToMarkNotified);
    const next = alerts.map((a) =>
      notified.has(a.id) ? { ...a, status: "notified" as const } : a
    );
    await writeAlerts(next);
    emitAlertsChanged();
  }
}

/** Rearma el borde para que la próxima evaluación pueda disparar de nuevo. */
export function resetAlertEdgeState(alertId: string): void {
  lastConditionSatisfied.delete(alertId);
}

export async function reactivateAlert(
  queryClient: QueryClient,
  alertId: string
): Promise<void> {
  const alerts = await readAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert || alert.status !== "notified") return;

  const fsym = alert.fsym.trim().toUpperCase();

  const next = alerts.map((a) =>
    a.id === alertId ? { ...a, status: "active" as const } : a
  );
  await writeAlerts(next);
  resetAlertEdgeState(alertId);
  emitAlertsChanged();

  await queueAlertEvaluation(queryClient, { onlyFsyms: new Set([fsym]) });
}

export function __resetAlertEdgeStateForTests(): void {
  lastConditionSatisfied.clear();
  evaluationTail = Promise.resolve();
}
