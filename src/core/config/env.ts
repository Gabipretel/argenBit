/** Variables públicas del bundle (prefijo EXPO_PUBLIC_). Ver `.env.example`. */
export const env = {
  coinstatsApiKey: process.env.EXPO_PUBLIC_COINSTATS_API_KEY ?? "",
} as const;
