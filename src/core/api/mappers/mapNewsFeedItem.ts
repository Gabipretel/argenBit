import type { NewsFeedItemDto } from "@/core/api/dto/newsFeed";
import type { NewsArticle } from "@/domain/models/NewsArticle";

export function mapNewsFeedItem(dto: NewsFeedItemDto): NewsArticle {
  const publishedSec = Math.floor((dto.feedDate ?? 0) / 1000);
  return {
    id: dto.id,
    title: dto.title?.trim() || "Sin título",
    source: dto.source?.trim() || "—",
    publishedOn: publishedSec,
    imageUrl: dto.imgUrl?.trim() || null,
    body: dto.description?.trim() ?? "",
    url: dto.link?.trim() || "",
  };
}
