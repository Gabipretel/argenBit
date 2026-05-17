import { parseBinanceMiniTicker } from "@/ws/parseBinanceMiniTicker";

describe("parseBinanceMiniTicker", () => {
  it("parsea combined 24hrMiniTicker y deriva % desde o/c", () => {
    const raw = JSON.stringify({
      stream: "btcusdt@miniTicker",
      data: {
        e: "24hrMiniTicker",
        E: 1672515782136,
        s: "BTCUSDT",
        c: "50000",
        o: "49000",
        h: "50100",
        l: "48000",
        v: "100",
        q: "1000",
      },
    });
    const tick = parseBinanceMiniTicker(raw);
    expect(tick?.fsym).toBe("BTC");
    expect(tick?.price).toBe(50000);
    expect(tick?.changePercent24Hr).toBeCloseTo((1000 / 49000) * 100, 5);
  });

  it("prioriza P en 24hrTicker", () => {
    const raw = JSON.stringify({
      stream: "ethusdt@miniTicker",
      data: {
        e: "24hrTicker",
        s: "ETHUSDT",
        p: "1",
        P: "-2.5",
        c: "3000",
        o: "3100",
      },
    });
    const tick = parseBinanceMiniTicker(raw);
    expect(tick?.fsym).toBe("ETH");
    expect(tick?.price).toBe(3000);
    expect(tick?.changePercent24Hr).toBe(-2.5);
  });

  it("sin P ni o válido devuelve precio sin changePercent24Hr", () => {
    const raw = JSON.stringify({
      data: {
        e: "24hrMiniTicker",
        s: "BTCUSDT",
        c: "1",
        o: "0",
      },
    });
    const tick = parseBinanceMiniTicker(raw);
    expect(tick).toEqual({ fsym: "BTC", price: 1 });
  });

  it("rechaza pares no USDT", () => {
    const raw = JSON.stringify({
      data: { e: "24hrMiniTicker", s: "BNBBTC", c: "1", o: "1" },
    });
    expect(parseBinanceMiniTicker(raw)).toBeNull();
  });

  it("JSON inválido → null", () => {
    expect(parseBinanceMiniTicker("not json")).toBeNull();
  });
});
