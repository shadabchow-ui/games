import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { status: "disabled", message: "Ecommerce revalidation is disabled." },
    { status: 410 },
  );
}
