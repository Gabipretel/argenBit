/**
 * Tokens §15.1 — argenBit Light & Professional
 */
export const colors = {
  background: "#f9f9fc",
  surface: "#f9f9fc",
  surfaceBright: "#f9f9fc",
  surfaceContainerLow: "#f3f3f6",
  surfaceContainerLowest: "#ffffff",
  surfaceContainer: "#eeeef0",
  surfaceContainerHigh: "#e8e8ea",
  surfaceVariant: "#e2e2e5",
  primary: "#236391",
  onPrimary: "#ffffff",
  primaryContainer: "#74acdf",
  onPrimaryContainer: "#003f65",
  secondary: "#7b5800",
  secondaryContainer: "#febb1b",
  onSecondaryContainer: "#6c4d00",
  onSurface: "#1a1c1e",
  onSurfaceVariant: "#41474f",
  outline: "#717880",
  outlineVariant: "#c1c7d0",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  success: "#059669",
  primaryFixed: "#cee5ff",
  onPrimaryFixed: "#001d32",
  /** Tabs inferiores — dorado apagado (marca, menos “neón” que amarillo puro). */
  tabBarActive: "#A67C00",
} as const;

export type ColorToken = keyof typeof colors;
