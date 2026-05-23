import type { RawJob } from "@/lib/types";

// WWR doesn't have an official JSON API so we parse their RSS feed
export async function fetchWWR(): Promise<RawJob[]> {
  const categories = ["programming", "design", "marketing", "copywriting", "customer-support", "sales", "finance", "all-other"];
  const results: RawJob[] = [];

  for (const category of categories) {
    try {
      const res = await fetch(`https://weworkremotely.com/categories/remote-${category}-jobs.rss`, {
        headers: { "User-Agent": "jobsai/1.0" },
      });
      if (!res.ok) continue;

      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

      for (const item of items) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ?? "";
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
        const region = item.match(/<region><!\[CDATA\[(.*?)\]\]><\/region>/)?.[1] ?? null;

        // Title format is "Company: Position"
        const [company, ...positionParts] = title.split(": ");
        const position = positionParts.join(": ");

        if (!position || !link) continue;

        results.push({
          title: position.trim(),
          company: company.trim(),
          description,
          url: link,
          location: region,
          salaryMin: null,
          salaryMax: null,
          currency: null,
          tags: [category],
          source: "wwr",
          postedAt: pubDate ? new Date(pubDate) : new Date(),
        });
      }
    } catch {
      // Skip failed categories silently
    }
  }

  return results;
}
