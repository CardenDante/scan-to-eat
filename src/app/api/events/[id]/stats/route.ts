import { prisma } from "@/lib/db";
import { success, error, withAuth } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(["SUPER_ADMIN", "EVENT_MANAGER"], async () => {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: { select: { qrCodes: true } },
      },
    });
    if (!event) return error("Event not found", 404);

    const mealSlots = await prisma.mealSlot.findMany({
      where: { eventId: id },
      include: {
        _count: { select: { scans: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const totalScans = await prisma.scan.count({
      where: { mealSlot: { eventId: id } },
    });

    return success({
      totalQRCodes: event._count.qrCodes,
      totalScans,
      mealSlots: mealSlots.map((slot) => ({
        id: slot.id,
        name: slot.name,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive,
        scannedCount: slot._count.scans,
        totalQRCodes: event._count.qrCodes,
      })),
    });
  });
}
