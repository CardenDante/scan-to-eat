import { cookies } from "next/headers";
import { success } from "@/lib/api-helpers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return success({ message: "Logged out" });
}
