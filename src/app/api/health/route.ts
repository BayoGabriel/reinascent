import { pingDatabase } from "@/server/db/mongodb";

/**
 * Readiness probe for orchestrators/monitors. Returns a generic status and
 * HTTP code only — never hosts, URIs, credentials, or internal errors.
 */
export async function GET() {
  const ready = await pingDatabase();
  return Response.json(
    { status: ready ? "ok" : "unavailable" },
    { status: ready ? 200 : 503 },
  );
}
