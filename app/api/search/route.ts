import { NextRequest, NextResponse } from "next/server";
import { scrapeSearch } from "@/lib/scraper";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  if (!q) return NextResponse.json({ error: "Missing query parameter: q" }, { status: 400 });
  try {
    const data = await scrapeSearch(q, page);
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
