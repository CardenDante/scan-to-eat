import { prisma } from "@/lib/db";
import { success, error, withAuth } from "@/lib/api-helpers";

export async function POST(request: Request) {
  return withAuth(["STAFF"], async (session) => {
    const { code, eventId } = await request.json();

    if (!code || !eventId) {
      return error("QR code and event ID are required");
    }

    const qrCode = await prisma.qRCode.findFirst({
      where: { code, eventId },
    });

    if (!qrCode) {
      return error("Invalid QR code", 404);
    }

    // Find active meal slot for this event
    const activeMealSlot = await prisma.mealSlot.findFirst({
      where: { eventId, isActive: true },
    });

    if (!activeMealSlot) {
      return error("No meal is currently active", 400);
    }

    // Check if already scanned for this meal
    const existingScan = await prisma.scan.findUnique({
      where: {
        qrCodeId_mealSlotId: {
          qrCodeId: qrCode.id,
          mealSlotId: activeMealSlot.id,
        },
      },
    });

    if (existingScan) {
      return error(
        `This QR code has already been used for ${activeMealSlot.name}`,
        409
      );
    }

    const scan = await prisma.scan.create({
      data: {
        qrCodeId: qrCode.id,
        mealSlotId: activeMealSlot.id,
        scannedBy: session.userId,
      },
      include: {
        qrCode: true,
        mealSlot: true,
      },
    });

    return success({
      message: "Scan successful!",
      scan: {
        id: scan.id,
        attendee: scan.qrCode.label,
        meal: scan.mealSlot.name,
        scannedAt: scan.scannedAt,
      },
    });
  });
}
