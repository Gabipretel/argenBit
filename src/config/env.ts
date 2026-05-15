/** Variables públicas del bundle (prefijo EXPO_PUBLIC_). Ver `.env.example`. */
export const env = {
  cryptocompareApiKey: process.env.EXPO_PUBLIC_CRYPTOCOMPARE_API_KEY ?? "",
} as const;
