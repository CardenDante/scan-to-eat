import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/api-helpers";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return error("Unauthorized", 401);
  }
  return success({ user: session });
}
