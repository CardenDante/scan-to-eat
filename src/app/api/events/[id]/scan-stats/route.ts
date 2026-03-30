import { prisma } from "@/lib/db";
import { success, error, withAuth } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(["STAFF", "SUPER_ADMIN", "EVENT_MANAGER"], async () => {
    const { id } = await params;

    const activeMeal = await prisma.mealSlot.findFirst({
      where: { eventId: id, isActive: true },
      include: { _count: { select: { scans: true } } },
    });

    const totalScans = await prisma.scan.count({
      where: { mealSlot: { eventId: id } },
    });

    const totalQR = await prisma.qRCode.count({
      where: { eventId: id },
    });

    return success({
      activeMeal: activeMeal
        ? { name: activeMeal.name, scanned: activeMeal._count.scans, total: totalQR }
        : null,
      totalScans,
    });
  });
}
