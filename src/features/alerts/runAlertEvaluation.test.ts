import { QueryClient } from "@tanstack/react-query";

import type { StoredAlert } from "@/storage/alertsStorage";
import { readAlerts, writeAlerts } from "@/storage/alertsStorage";

import { presentAlertTriggeredNotification } from "./localNotifications";
import { getPriceMetricsFromCache } from "./priceMetricsFromCache";
import {
  __resetAlertEdgeStateForTests,
  reactivateAlert,
  runAllAlertsEvaluation,
} from "./runAlertEvaluation";

jest.mock("./localNotifications", () => ({
  presentAlertTriggeredNotification: jest.fn(),
}));

jest.mock("./priceMetricsFromCache", () => ({
  getPriceMetricsFromCache: jest.fn(),
}));

jest.mock("@/storage/alertsStorage", () => ({
  readAlerts: jest.fn(),
  writeAlerts: jest.fn(),
}));

const presentMock = presentAlertTriggeredNotification as jest.MockedFunction<
  typeof presentAlertTriggeredNotification
>;
const metricsMock = getPriceMetricsFromCache as jest.MockedFunction<
  typeof getPriceMetricsFromCache
>;
const readAlertsMock = readAlerts as jest.MockedFunction<typeof readAlerts>;
const writeAlertsMock = writeAlerts as jest.MockedFunction<typeof writeAlerts>;

const metrics = { priceUsd: 100_000, changePercent24Hr: 5 };

function makeAlert(overrides: Partial<StoredAlert> = {}): StoredAlert {
  return {
    id: overrides.id ?? "a1",
    fsym: overrides.fsym ?? "BTC",
    kind: overrides.kind ?? "price_above",
    threshold: overrides.threshold ?? 90_000,
    status: overrides.status ?? "active",
  };
}

describe("runAllAlertsEvaluation", () => {
  let queryClient: QueryClient;
  let storedAlerts: StoredAlert[];

  beforeEach(() => {
    __resetAlertEdgeStateForTests();
    queryClient = new QueryClient();
    storedAlerts = [];
    presentMock.mockResolvedValue(true);
    writeAlertsMock.mockImplementation(async (next) => {
      storedAlerts = next;
    });
    readAlertsMock.mockImplementation(async () => [...storedAlerts]);
    metricsMock.mockReturnValue(metrics);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("notifica cada alerta activa y las marca como notificadas", async () => {
    storedAlerts = [
      makeAlert({ id: "a1", fsym: "BTC", threshold: 90_000 }),
      makeAlert({ id: "a2", fsym: "ETH", threshold: 3_000 }),
    ];

    await runAllAlertsEvaluation(queryClient);

    expect(presentMock).toHaveBeenCalledTimes(2);
    expect(storedAlerts).toEqual([
      expect.objectContaining({ id: "a1", status: "notified" }),
      expect.objectContaining({ id: "a2", status: "notified" }),
    ]);
  });

  it("no evalúa alertas ya notificadas", async () => {
    storedAlerts = [makeAlert({ id: "a1", status: "notified" })];

    await runAllAlertsEvaluation(queryClient);

    expect(presentMock).not.toHaveBeenCalled();
  });

  it("reintenta si el envío falló (sigue activa)", async () => {
    storedAlerts = [makeAlert({ id: "a1" })];
    presentMock.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await runAllAlertsEvaluation(queryClient);
    await runAllAlertsEvaluation(queryClient);

    expect(presentMock).toHaveBeenCalledTimes(2);
    expect(storedAlerts[0]?.status).toBe("notified");
  });

  it("marca notificada y no repite hasta reactivar", async () => {
    storedAlerts = [makeAlert({ id: "a1" })];

    await runAllAlertsEvaluation(queryClient);
    await runAllAlertsEvaluation(queryClient);

    expect(presentMock).toHaveBeenCalledTimes(1);
    expect(storedAlerts[0]?.status).toBe("notified");
  });
});

describe("reactivateAlert", () => {
  let queryClient: QueryClient;
  let storedAlerts: StoredAlert[];

  beforeEach(() => {
    __resetAlertEdgeStateForTests();
    queryClient = new QueryClient();
    storedAlerts = [makeAlert({ id: "a1", status: "notified", threshold: 90_000 })];
    presentMock.mockClear();
    presentMock.mockResolvedValue(true);
    writeAlertsMock.mockImplementation(async (next) => {
      storedAlerts = next;
    });
    readAlertsMock.mockImplementation(async () => [...storedAlerts]);
    metricsMock.mockReturnValue(metrics);
  });

  it("evalúa al instante y notifica si la condición sigue cumplida", async () => {
    await reactivateAlert(queryClient, "a1");

    expect(presentMock).toHaveBeenCalledTimes(1);
    expect(storedAlerts[0]?.status).toBe("notified");
  });

  it("queda activa sin avisar si la condición aún no se cumple", async () => {
    metricsMock.mockReturnValue({ priceUsd: 50_000, changePercent24Hr: 0 });

    await reactivateAlert(queryClient, "a1");

    expect(presentMock).not.toHaveBeenCalled();
    expect(storedAlerts[0]?.status).toBe("active");
  });
});
