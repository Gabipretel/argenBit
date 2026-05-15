/** Entrada pública del módulo Alertas — importar desde `@/features/alerts`. */

export { isAlertConditionMet } from "./alertConditions";
export type { PriceMetrics } from "./alertConditions";

export { ExpoNotificationsHintBanner } from "./components/ExpoNotificationsHintBanner";

export { ensureNotificationPermissions } from "./localNotifications";

export { enqueueAlertEvaluation, runAllAlertsEvaluation } from "./runAlertEvaluation";

export { useAlerts } from "./hooks/useAlerts";

export { AlertsScreen } from "./screen/AlertsScreen";
