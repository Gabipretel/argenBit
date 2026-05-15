import type { NewsArticleDTO } from "@/api/dto/newsV2";
import type { NewsArticle } from "@/domain/models/NewsArticle";

const IMG_ORIGIN = "https://www.cryptocompare.com";

/** La API a veces envía distintas claves para la miniatura. */
function pickRawImageUrl(dto: NewsArticleDTO): string | undefined {
  const o = dto as unknown as Record<string, unknown>;
  const keys = [
    "imageurl",
    "IMAGEURL",
    "ImageUrl",
    "image_url",
    "IMAGE_URL",
    "imageURL",
  ];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

function absImage(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${IMG_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
}

/**
 * CryptoCompare reenvía el `imageurl` que manda cada medio; muchos sitios
 * reutilizan la misma imagen Open Graph o un asset genérico para todas las notas,
 * por eso a veces se ve repetida — no es un bug del mapeo en la app.
 */
export function mapNewsArticleDto(dto: NewsArticleDTO): NewsArticle {
  return {
    id: dto.id,
    title: dto.title,
    source: dto.source,
    publishedOn: dto.published_on,
    imageUrl: absImage(pickRawImageUrl(dto)),
    body: dto.body ?? "",
    url: dto.url,
  };
}
