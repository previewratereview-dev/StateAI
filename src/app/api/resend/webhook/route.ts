import { NextResponse } from "next/server";

// Redirect from the old/incorrect webhook path to the correct one
export async function POST(request: Request) {
  const url = new URL(request.url);
  const targetUrl = `${url.origin}/api/webhooks/resend`;

  // Forward the request to the correct endpoint
  const body = await request.text();
  const response = await fetch(targetUrl, {
    method: "POST",
    headers: request.headers,
    body,
  });

  return NextResponse.json(
    await response.json(),
    { status: response.status }
  );
}