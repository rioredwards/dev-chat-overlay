import { auth } from "../../../auth";
import { mintRelayToken } from "../../../lib/relay-token";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    const payload = await mintRelayToken(email, "tester");
    return Response.json(payload);
  } catch (error: any) {
    return Response.json({ error: error?.message ?? "token_error" }, { status: 500 });
  }
}
