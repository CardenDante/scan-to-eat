import { prisma } from "@/lib/db";
import { success, withAuth } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(["SUPER_ADMIN"], async () => {
    const { id } = await params;
    const qrCodes = await prisma.qRCode.findMany({
      where: { eventId: id },
      include: {
        scans: {
          include: { mealSlot: { select: { name: true, date: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return success({ qrCodes });
  });
}
