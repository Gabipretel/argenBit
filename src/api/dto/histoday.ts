/** GET /data/v2/histoday — envelope §6.3 */

export interface HistodayCandleDTO {
  time: number;
  close: number;
  high: number;
  low: number;
  open: number;
  volumefrom: number;
  volumeto: number;
}

export interface HistodayResponseDTO {
  Response: string;
  Type: number;
  Data?: {
    TimeFrom?: number;
    TimeTo?: number;
    Data?: HistodayCandleDTO[];
  };
}
