import { NextResponse } from "next/server";
import { scrapeGenres } from "@/lib/scraper";

export async function GET() {
  try {
    const data = await scrapeGenres();
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
