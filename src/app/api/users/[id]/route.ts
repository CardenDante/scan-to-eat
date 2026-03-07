import { prisma } from "@/lib/db";
import { error, success, withAuth } from "@/lib/api-helpers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(["SUPER_ADMIN"], async () => {
    const { id } = await params;
    try {
      await prisma.user.delete({ where: { id } });
      return success({ message: "User deleted" });
    } catch {
      return error("User not found", 404);
    }
  });
}
