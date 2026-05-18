import {
  getTopRatedGames,
  isIgdbConfigError,
  isIgdbUpstreamError,
} from "lib/igdb/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUCCESS_CACHE_HEADERS = {
  // Cache the healthy path briefly; error responses stay no-store so failures are not pinned.
  "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=300",
};

export async function GET() {
  try {
    const games = await getTopRatedGames();

    return NextResponse.json({
      games,
    }, {
      headers: SUCCESS_CACHE_HEADERS,
    });
  } catch (error) {
    if (isIgdbConfigError(error)) {
      return NextResponse.json(
        {
          error: "config_required",
          message: "IGDB server credentials are not configured.",
        },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (isIgdbUpstreamError(error)) {
      return NextResponse.json(
        {
          error: "upstream_error",
          message: "Unable to fetch games from IGDB.",
        },
        {
          status: error.status >= 400 && error.status < 600 ? error.status : 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json(
      {
        error: "internal_error",
        message: "Unable to fetch games.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
