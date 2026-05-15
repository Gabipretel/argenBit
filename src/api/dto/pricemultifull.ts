/** Respuesta GET /data/pricemultifull — forma típica CryptoCompare */

export interface PricemultifullResponseDTO {
  RAW?: Record<
    string,
    | Record<
        string,
        {
          PRICE?: unknown;
          CHANGEPCT24HOUR?: unknown;
          MKTCAP?: unknown;
          TOTALVOLUME24HTO?: unknown;
          TOTALTOPTIERVOLUME24HTO?: unknown;
          SUPPLY?: unknown;
          CIRCULATINGSUPPLY?: unknown;
          MAXSUPPLY?: unknown;
          FROMSYMBOL?: string;
          FROMSYMBOLNAME?: string;
          IMAGEURL?: string;
          [k: string]: unknown;
        }
      >
    | undefined
  >;
  DISPLAY?: Record<string, unknown>;
}
