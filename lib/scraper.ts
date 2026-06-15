import * as cheerio from "cheerio";
import type { Element } from "domhandler";

const BASE_URL = process.env.BASE_URL as string;
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: BASE_URL,
};

export async function fetchPage(url: string): Promise<{ $: cheerio.CheerioAPI; html: string }> {
  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const html = await res.text();
  return { $: cheerio.load(html), html };
}

export function parseEpisodeCard($: cheerio.CheerioAPI, el: Element) {
  const $el = $(el);
  return {
    series: $el.find(".serie").text().trim(),
    episode: $el.find("h3").text().trim(),
    link: $el.find(".season_m a").attr("href") || $el.find(".data a").attr("href") || "",
    thumbnail: $el.find("img").attr("data-src") || "",
    subType: $el.find(".buttonextra span").text().trim(),
    censored: $el.find(".buttoncensured span, .buttonuncensured span").text().trim(),
    ago: $el.find(".videotext .fa-clock").parent().text().trim(),
    views: $el.find(".videotext .fa-eye").parent().text().trim(),
  };
}

export function parseSeriesCard($: cheerio.CheerioAPI, el: Element) {
  const $el = $(el);
  return {
    title: $el.find("h3 a").text().trim() || $el.find("img").attr("alt") || "",
    link: $el.find("a").first().attr("href") || "",
    thumbnail: $el.find("img").attr("data-src") || "",
    year: $el.find(".buttonyear span").text().trim(),
    censored: $el.find(".buttoncensured span, .buttonuncensured span").text().trim(),
  };
}

export function parsePagination($: cheerio.CheerioAPI) {
  const current = parseInt($(".pagination span.current").text()) || 1;
  const pages: number[] = [];
  $(".pagination a").each((_: number, el: Element) => {
    const n = parseInt($(el).text());
    if (!isNaN(n)) pages.push(n);
  });
  return { current, total: pages.length ? Math.max(...pages) : current };
}

export async function scrapeHome() {
  const { $, html: _html } = await fetchPage(BASE_URL);
  const slider: object[] = [];
  $("#slider-movies-tvshows .item").each((_: number, el: Element) => {
    const $el = $(el);
    slider.push({
      title: $el.find("h3.title").text().trim(),
      year: $el.find(".data span").text().trim(),
      link: $el.find("a").first().attr("href"),
      backdrop: $el.find("img").attr("data-src"),
    });
  });
  const recentEpisodes: object[] = [];
  $(".animation-2.items.full .item.se.episodes").each((_: number, el: Element) => {
    recentEpisodes.push(parseEpisodeCard($, el));
  });
  const hentaiSeries: object[] = [];
  $("#dt-tvshows .item.tvshows").each((_: number, el: Element) => {
    hentaiSeries.push(parseSeriesCard($, el));
  });
  return { slider, recentEpisodes, hentaiSeries };
}

export async function scrapeVideos(page = 1) {
  const url = page > 1 ? `${BASE_URL}/videos/page/${page}/` : `${BASE_URL}/videos/`;
  const { $, html: _html } = await fetchPage(url);
  const episodes: object[] = [];
  $(".item.se.episodes").each((_: number, el: Element) => {
    episodes.push(parseEpisodeCard($, el));
  });
  return { episodes, pagination: parsePagination($) };
}

export async function scrapeTrending(page = 1) {
  const url = page > 1 ? `${BASE_URL}/trending/page/${page}/` : `${BASE_URL}/trending/`;
  const { $, html: _html } = await fetchPage(url);
  const items: object[] = [];
  $(".item.tvshows, .item.se.episodes").each((_: number, el: Element) => {
    const cls = $(el).attr("class") || "";
    if (cls.includes("episodes")) items.push(parseEpisodeCard($, el));
    else items.push(parseSeriesCard($, el));
  });
  return { items, pagination: parsePagination($) };
}

export async function scrapeSeries(page = 1, genre?: string, year?: string) {
  let base = genre ? `${BASE_URL}/genre/${genre}/` : year ? `${BASE_URL}/release/${year}/` : `${BASE_URL}/series/`;
  const url = page > 1 ? base.replace(/\/$/, "") + `/page/${page}/` : base;
  const { $, html: _html } = await fetchPage(url);
  const series: object[] = [];
  $(".item.tvshows").each((_: number, el: Element) => {
    series.push(parseSeriesCard($, el));
  });
  return { series, pagination: parsePagination($) };
}

export async function scrapeCalendar() {
  const { $, html: _html } = await fetchPage(`${BASE_URL}/calendar/`);
  const calendar: object[] = [];
  let currentMonth = "";
  $(".calendar-page-content > header, .calendar-page-content > div#archive-content, .calendar-page-content > div.items").each(
    (_: number, el: Element) => {
      const $el = $(el);
      if ($el.is("header")) {
        currentMonth = $el.find("h2").text().trim();
        return;
      }
      const items: object[] = [];
      $el.find("article.item.tvshows").each((_i: number, item: Element) => {
        const $item = $(item);
        items.push({
          date: $item.find(".buttonextra span").text().replace(/\s+/g, " ").trim(),
          series: $item.find(".data .serie").text().trim(),
          seriesLink: $item.find(".poster a").attr("href") || "",
          episode: $item.find(".data h3").text().trim(),
          episodeLink: $item.find(".data p a[href*='/videos/']").attr("href") || "",
          thumbnail: $item.find(".poster img").attr("data-src") || $item.find(".poster img").attr("src") || "",
        });
      });
      calendar.push({ month: currentMonth, items });
    }
  );
  return { calendar };
}

export async function scrapeSearch(q: string, page = 1) {
  const base = `${BASE_URL}/?s=${encodeURIComponent(q)}`;
  const url = page > 1 ? `${BASE_URL}/page/${page}/?s=${encodeURIComponent(q)}` : base;
  const { $, html: _html } = await fetchPage(url);
  const results: object[] = [];
  $(".result-item article").each((_: number, el: Element) => {
    const $el = $(el);
    results.push({
      title: $el.find(".details .title a").text().trim(),
      link: $el.find(".details .title a").attr("href") || "",
      thumbnail: $el.find(".image img").attr("data-src") || $el.find(".image img").attr("src") || "",
      year: $el.find(".meta .year").text().trim(),
      synopsis: $el.find(".contenido p").text().trim(),
    });
  });
  return { query: q, results, pagination: parsePagination($) };
}

export async function scrapeSeriesDetail(slug: string) {
  const { $, html: _html } = await fetchPage(`${BASE_URL}/series/${slug}/`);
  const genres: string[] = [];
  $(".sgeneros a").each((_: number, el: Element) => { genres.push($(el).text().trim()); });
  const episodes: object[] = [];
  $(".episodios li").each((_: number, el: Element) => {
    const $el = $(el);
    episodes.push({
      name: $el.find(".episodiotitle a").text().trim(),
      link: $el.find(".episodiotitle a").attr("href"),
      date: $el.find(".episodiotitle .date").text().trim(),
      thumbnail: $el.find(".imagen img").attr("data-src"),
    });
  });
  const gallery: string[] = [];
  $("#dt_galery .g-item a").each((_: number, el: Element) => {
    const src = $(el).attr("href")?.trim();
    if (src) gallery.push(src);
  });
  const customFields: Record<string, string> = {};
  $(".custom_fields").each((_: number, el: Element) => {
    const key = $(el).find(".variante").text().trim();
    const val = $(el).find(".valor").text().trim();
    if (key) customFields[key] = val;
  });
  const related: object[] = [];
  $("#single_relacionados article").each((_: number, el: Element) => {
    related.push({
      link: $(el).find("a").attr("href"),
      thumbnail: $(el).find("img").attr("data-src"),
      title: $(el).find("img").attr("alt"),
    });
  });
  return {
    title: $(".sheader .data h1").text().trim(),
    poster: $(".sheader .poster img").attr("data-src") || "",
    date: $(".sheader .extra .date").text().trim(),
    network: $(".sheader .extra a").first().text().trim(),
    genres,
    rating: $(".dt_rating_vgs").text().trim(),
    ratingCount: $(".rating-count").text().trim(),
    synopsis: $(".wp-content > p").map((_: number, el: Element) => $(el).text().trim()).get().join("\n\n"),
    episodes,
    gallery,
    details: customFields,
    related,
  };
}

export async function scrapeWatch(slug: string) {
  const { $, html: rawHtml } = await fetchPage(`${BASE_URL}/videos/${slug}/`);
  const genres: string[] = [];
  $("#info .sgeneros a").each((_: number, el: Element) => { genres.push($(el).text().trim()); });
  const playerSrcFromAttr = $("#search_iframe").attr("data-src") || "";
  const playerSrcFromRegex = rawHtml.match(/id=["']search_iframe["'][^>]*data-src=["']([^"']+)["']/)?.[1] || rawHtml.match(/data-src=["']([^"']*jwplayer[^"']*)["']/)?.[1] || "";
  const playerSrcMeta = $('meta[itemprop="contentUrl"]').attr("content") || "";
  const playerSrcRaw = playerSrcFromAttr || playerSrcFromRegex || playerSrcMeta;
  const playerSrc = playerSrcRaw.replace(/&amp;/g, "&");
  const qualityRaw = (playerSrcFromAttr || playerSrcFromRegex).replace(/&amp;/g, "&");

  // fallback: fetch dooplayer API to get full src with quality
  const postId = $("#report-submit-button").closest("form").find("input[name='postid']").attr("value") || rawHtml.match(/data-post=['"](\d+)['"]/)?.[1] || "";
  let playerSrcFinal = playerSrc;
  let qualityFinal = qualityRaw.match(/quality=([^&'"]+)/)?.[1] || playerSrc.match(/quality=([^&'"]+)/)?.[1] || "";
  if (!qualityFinal && postId) {
    try {
      const apiRes = await fetch(`${BASE_URL}/wp-json/dooplayer/v2/${postId}/1`, { headers: HEADERS, cache: "no-store" });
      if (apiRes.ok) {
        const apiData = await apiRes.json() as { embed_url?: string; quality?: string };
        if (apiData.embed_url) playerSrcFinal = apiData.embed_url;
        if (apiData.quality) qualityFinal = apiData.quality;
        if (!qualityFinal) qualityFinal = playerSrcFinal.match(/quality=([^&'"]+)/)?.[1] || "";
      }
    } catch { /* ignore */ }
  }
  const episodeList: object[] = [];
  $(".episodios li").each((_: number, el: Element) => {
    const $el = $(el);
    episodeList.push({
      name: $el.find(".episodiotitle a").text().trim(),
      link: $el.find(".episodiotitle a").attr("href"),
      date: $el.find(".date").text().trim(),
      thumbnail: $el.find(".imagen img").attr("data-src"),
    });
  });
  const gallery: string[] = [];
  $("#dt_galery .g-item a").each((_: number, el: Element) => {
    const src = $(el).attr("href")?.trim();
    if (src) gallery.push(src);
  });
  const navItems = $(".pag_episodes .item");
  const prevLink = navItems.eq(0).find("a").not(".nonex").attr("href") || null;
  const nextLink = navItems.eq(2).find("a").not(".nonex").attr("href") || null;
  const seriesLink = navItems.eq(1).find("a").attr("href") || "";
  return {
    title: $("#info h1").text().trim(),
    genres,
    posted: $("#info h3").text().trim(),
    views: $("#playernotice").attr("data-text") || "",
    duration: $('meta[itemprop="duration"]').attr("content") || "",
    thumbnail: $('meta[itemprop="thumbnailUrl"]').attr("content") || "",
    player: {
      src: playerSrcFinal,
      videoUrl: playerSrcFinal.match(/source=([^&]+)/) ? decodeURIComponent(playerSrcFinal.match(/source=([^&]+)/)![1]) : "",
      quality: qualityFinal,
    },
    downloadLink: $("a.download-video[href*='/download/']").attr("href") || "",
    navigation: {
      prev: prevLink,
      next: nextLink,
      series: seriesLink,
    },
    synopsis: $(".synopsis p").text().replace(/^\s*Synopsis\s*:\s*/i, "").replace(/\s+/g, " ").trim(),
    episodeList,
    gallery,
  };
}
