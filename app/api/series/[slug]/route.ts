import { NextRequest, NextResponse } from "next/server";
import { scrapeSeriesDetail } from "@/lib/scraper";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const data = await scrapeSeriesDetail(slug);
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
