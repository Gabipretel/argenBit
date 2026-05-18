import {
  changePctFromChart,
  chartUsdToSparkPoints,
} from "@/common/utils/chartSparkPoints";
import type { CoinChartPointDto } from "@/core/api/dto/coinChart";

describe("chartUsdToSparkPoints", () => {
  const chart: CoinChartPointDto[] = [
    [1, 100, 0, 0],
    [2, 120, 0, 0],
    [3, 90, 0, 0],
    [4, 110, 0, 0],
  ];

  it("normaliza precios USD a valores entre 0 y 1", () => {
    const points = chartUsdToSparkPoints(chart);
    expect(points.length).toBeGreaterThanOrEqual(2);
    for (const v of points) {
      expect(v).toBeGreaterThanOrEqual(0.06);
      expect(v).toBeLessThanOrEqual(0.94);
    }
  });

  it("devuelve vacío con menos de dos precios válidos", () => {
    expect(chartUsdToSparkPoints([[1, 0, 0, 0]])).toEqual([]);
  });
});

describe("changePctFromChart", () => {
  it("calcula variación entre primer y último precio", () => {
    const chart: CoinChartPointDto[] = [
      [1, 100, 0, 0],
      [2, 110, 0, 0],
    ];
    expect(changePctFromChart(chart)).toBe(10);
  });
});
