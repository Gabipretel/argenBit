import type { TextStyle } from "react-native";

import { colors } from "@/core/theme/colors";

/**
 * Familias cargadas en useAppFonts — claves = fontFamily en RN.
 * Si la carga falla, usamos sistema + fontWeight (evita texto invisible).
 * §15.2
 */
export const fontFamilies = {
  displayBold: "HankenGrotesk_700Bold",
  headlineBold: "HankenGrotesk_700Bold",
  headlineSemi: "HankenGrotesk_600SemiBold",
  body: "Manrope_400Regular",
  bodyMedium: "Manrope_500Medium",
  labelSemi: "Manrope_600SemiBold",
} as const;

let brandFontsActive = false;

/** Llamar desde App cuando las fuentes ya resolvieron (éxito o error). */
export function setBrandTypographyActive(value: boolean) {
  brandFontsActive = value;
}

function fam(key: keyof typeof fontFamilies): string | undefined {
  return brandFontsActive ? fontFamilies[key] : undefined;
}

/** Peso fallback cuando no hay fuente custom (misma jerarquía visual aproximada). */
function fw(weight: TextStyle["fontWeight"]): Pick<TextStyle, "fontWeight"> {
  return brandFontsActive ? {} : { fontWeight: weight };
}

export const typography = {
  get displayLg(): TextStyle {
    return {
      fontFamily: fam("displayBold"),
      ...fw("700"),
      fontSize: 48,
      lineHeight: 56,
      letterSpacing: -0.96,
      color: colors.onSurface,
    };
  },
  get headlineLg(): TextStyle {
    return {
      fontFamily: fam("headlineBold"),
      ...fw("700"),
      fontSize: 32,
      lineHeight: 40,
      color: colors.primary,
    };
  },
  get headlineMd(): TextStyle {
    return {
      fontFamily: fam("headlineSemi"),
      ...fw("600"),
      fontSize: 24,
      lineHeight: 32,
      color: colors.onSurface,
    };
  },
  get bodyLg(): TextStyle {
    return {
      fontFamily: fam("body"),
      ...fw("400"),
      fontSize: 18,
      lineHeight: 28,
      color: colors.onSurfaceVariant,
    };
  },
  get bodyMd(): TextStyle {
    return {
      fontFamily: fam("body"),
      ...fw("400"),
      fontSize: 16,
      lineHeight: 24,
      color: colors.onSurfaceVariant,
    };
  },
  get labelMd(): TextStyle {
    return {
      fontFamily: fam("labelSemi"),
      ...fw("600"),
      fontSize: 14,
      lineHeight: 20,
      color: colors.onSurface,
    };
  },
  get caption(): TextStyle {
    return {
      fontFamily: fam("bodyMedium"),
      ...fw("500"),
      fontSize: 12,
      lineHeight: 16,
      color: colors.outline,
    };
  },
};
