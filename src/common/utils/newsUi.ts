import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export type NewsPillStyle = { label: string; bg: string; fg: string };

const PILL_PRESETS: NewsPillStyle[] = [
  { label: "Tendencia", bg: "#E3F2FD", fg: "#1565C0" },
  { label: "Actualización", bg: "#FFF3E0", fg: "#C2410C" },
  { label: "Mercados", bg: "#E8F5E9", fg: "#1B5E20" },
  { label: "Regulación", bg: "#EDE7F6", fg: "#4527A0" },
];

export function newsPillForArticle(articleId: string): NewsPillStyle {
  return PILL_PRESETS[hashStr(articleId) % PILL_PRESETS.length]!;
}

export function sourceInitials(source: string): string {
  const t = source.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]!.slice(0, 1) + parts[1]!.slice(0, 1)).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

/** Tiempo desde publicación en formato corto */
export function newsRelativeShort(publishedOn: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - publishedOn);
  const mins = Math.floor(diff / 60);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} d`;
  return dayjs.unix(publishedOn).format("D MMM");
}

export function newsReadingMinutesFromHtml(html: string): number {
  const plain = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
