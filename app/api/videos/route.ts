import { NextRequest, NextResponse } from "next/server";
import { scrapeVideos } from "@/lib/scraper";

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  try {
    const data = await scrapeVideos(page);
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
