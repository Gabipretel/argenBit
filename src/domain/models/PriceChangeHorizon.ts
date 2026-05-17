/** Punto del gráfico de rendimiento (solo ventanas que expone CoinStats en `GET /coins/{id}`). */
export interface PriceChangeHorizonPoint {
  idx: number;
  label: string;
  changePct: number;
}
