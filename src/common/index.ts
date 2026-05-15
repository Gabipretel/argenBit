/** Entrada pública de UI/hooks/utils compartidos — importar desde `@/common`. */

export { AlertLifecycle } from "./components/AlertLifecycle";
export { AppErrorFallback } from "./components/AppErrorFallback";
export { AppTopBar } from "./components/layout/AppTopBar";
export { AppFriendlyLoader } from "./components/ui/AppFriendlyLoader";
export { AppRefreshBanner } from "./components/ui/AppRefreshBanner";
export { ErrorCallout } from "./components/ui/ErrorCallout";

export { useAppFonts } from "./hooks/useAppFonts";
export { useBinancePriceStream } from "./hooks/useBinancePriceStream";
export { useDebouncedValue } from "./hooks/useDebouncedValue";
export { useMinDurationActive } from "./hooks/useMinDurationActive";

export * from "./utils/formatters";
export * from "./utils/newsUi";
export * from "./utils/parseLocaleNumber";
export * from "./utils/sparkSeries";
