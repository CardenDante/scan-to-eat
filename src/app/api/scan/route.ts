import { prisma } from "@/lib/db";
import { success, error, withAuth } from "@/lib/api-helpers";
import { lookupQRCode, lookupActiveMeal } from "@/lib/scan-cache";

export async function POST(request: Request) {
  return withAuth(["STAFF"], async (session) => {
    const { code, eventId } = await request.json();

    if (!code || !eventId) {
      return error("QR code and event ID are required");
    }

    // Cached lookup — hits memory instead of DB after first scan
    const qrCode = await lookupQRCode(code, eventId);
    if (!qrCode) {
      return error("Invalid QR code", 404);
    }

    // Cached with 5s TTL — one DB hit shared across all 30 staff
    const activeMealSlot = await lookupActiveMeal(eventId);
    if (!activeMealSlot) {
      return error("No meal is currently active", 400);
    }

    // Skip the check query — just try to insert.
    // The unique constraint (qrCodeId, mealSlotId) prevents duplicates
    // even if two staff scan the same code at the exact same millisecond.
    try {
      const scan = await prisma.scan.create({
        data: {
          qrCodeId: qrCode.id,
          mealSlotId: activeMealSlot.id,
          scannedBy: session.userId,
        },
      });

      return success({
        message: "Scan successful!",
        scan: {
          id: scan.id,
          attendee: qrCode.label,
          meal: activeMealSlot.name,
          scannedAt: scan.scannedAt,
        },
      });
    } catch (err: unknown) {
      // Prisma unique constraint violation = already scanned
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        return error(
          `This QR code has already been used for ${activeMealSlot.name}`,
          409
        );
      }
      throw err;
    }
  });
}
