import axios from "axios";

import { env } from "@/config/env";

export const CRYPTOCOMPARE_BASE_URL = "https://min-api.cryptocompare.com";

export const cryptocompareClient = axios.create({
  baseURL: CRYPTOCOMPARE_BASE_URL,
  timeout: 25_000,
  params: {
    ...(env.cryptocompareApiKey ? { api_key: env.cryptocompareApiKey } : {}),
  },
});
