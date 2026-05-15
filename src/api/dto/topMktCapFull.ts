/** Respuesta parcial GET /data/top/mktcapfull — §6.5 */

export interface TopMktCapFullResponseDTO {
  Message: string;
  Type: number;
  MetaData?: { Count?: number };
  Data: TopCoinEntryDTO[];
}

export interface TopCoinEntryDTO {
  CoinInfo: {
    Id: string;
    Name: string;
    FullName: string;
    Internal: string;
    ImageUrl?: string;
  };
  RAW?: {
    USD?: Record<string, unknown>;
  };
}
