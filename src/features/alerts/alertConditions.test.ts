import { isAlertConditionMet } from "@/features/alerts";

describe("isAlertConditionMet", () => {
  const base = { priceUsd: 50_000, changePercent24Hr: 2.5 };

  it("price_above cuando el precio alcanza el umbral", () => {
    expect(
      isAlertConditionMet(
        { kind: "price_above", threshold: 49_000 },
        { ...base, priceUsd: 49_500 }
      )
    ).toBe(true);
    expect(
      isAlertConditionMet(
        { kind: "price_above", threshold: 49_000 },
        { ...base, priceUsd: 48_000 }
      )
    ).toBe(false);
  });

  it("price_below cuando el precio cae al umbral", () => {
    expect(
      isAlertConditionMet(
        { kind: "price_below", threshold: 48_000 },
        { ...base, priceUsd: 47_500 }
      )
    ).toBe(true);
    expect(
      isAlertConditionMet(
        { kind: "price_below", threshold: 48_000 },
        { ...base, priceUsd: 49_000 }
      )
    ).toBe(false);
  });

  it("pct_up según variación 24h", () => {
    expect(
      isAlertConditionMet(
        { kind: "pct_up", threshold: 3 },
        { ...base, changePercent24Hr: 3.1 }
      )
    ).toBe(true);
    expect(
      isAlertConditionMet(
        { kind: "pct_up", threshold: 3 },
        { ...base, changePercent24Hr: 2.9 }
      )
    ).toBe(false);
  });

  it("pct_down con umbral positivo en UI", () => {
    expect(
      isAlertConditionMet(
        { kind: "pct_down", threshold: 5 },
        { ...base, changePercent24Hr: -5.5 }
      )
    ).toBe(true);
    expect(
      isAlertConditionMet(
        { kind: "pct_down", threshold: 5 },
        { ...base, changePercent24Hr: -4 }
      )
    ).toBe(false);
  });
});
