import { buildAlertNotificationContent } from "@/features/alerts/localNotifications";
import type { StoredAlert } from "@/storage/alertsStorage";

const baseAlert: StoredAlert = {
  id: "1",
  fsym: "BTC",
  kind: "price_below",
  threshold: 78_184.13,
  recurring: false,
};

describe("buildAlertNotificationContent", () => {
  it("no usa comparadores matemáticos en el cuerpo", () => {
    const { title, body } = buildAlertNotificationContent(baseAlert, {
      priceUsd: 77_074.89,
      changePercent24Hr: -1.2,
    });
    expect(title).toBe("BTC: bajó de tu precio");
    expect(body).toContain("Tu alerta era por debajo de");
    expect(body).not.toMatch(/≤|≥|<=|>=/);
  });

  it("describe subida de precio en lenguaje claro", () => {
    const { title, body } = buildAlertNotificationContent(
      { ...baseAlert, kind: "price_above", threshold: 90_000 },
      { priceUsd: 95_000, changePercent24Hr: 2 }
    );
    expect(title).toBe("BTC: subió de tu precio");
    expect(body).toContain("Configuraste aviso por encima de");
  });
});
