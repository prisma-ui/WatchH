import { NextRequest, NextResponse } from "next/server";
import { scrapeSeries } from "@/lib/scraper";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const genre = searchParams.get("genre") || undefined;
  const year = searchParams.get("year") || undefined;
  try {
    const data = await scrapeSeries(page, genre, year);
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
