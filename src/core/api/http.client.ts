import axios from "axios";

import { env } from "@/core/config/env";

export const COINSTATS_BASE_URL = "https://openapiv1.coinstats.app";

/**
 * Cliente HTTP único para CoinStats (cabecera `X-API-KEY` según documentación oficial).
 */
export const httpClient = axios.create({
  baseURL: COINSTATS_BASE_URL,
  timeout: 4000,
  headers: {
    "Content-Type": "application/json",
    ...(env.coinstatsApiKey.trim()
      ? { "X-API-KEY": env.coinstatsApiKey.trim() }
      : {}),
  },
});
