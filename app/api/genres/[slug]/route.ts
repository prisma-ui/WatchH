import { NextRequest, NextResponse } from "next/server";
import { scrapeGenreDetail } from "@/lib/scraper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  try {
    const data = await scrapeGenreDetail(slug, page);
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
