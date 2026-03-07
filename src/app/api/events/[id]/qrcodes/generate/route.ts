import { prisma } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { success, error, withAuth } from "@/lib/api-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(["SUPER_ADMIN"], async () => {
    const { id } = await params;
    const { count = 1, labelPrefix = "Attendee" } = await request.json();

    if (count < 1 || count > 500) {
      return error("Count must be between 1 and 500");
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return error("Event not found", 404);

    const existingCount = await prisma.qRCode.count({ where: { eventId: id } });

    const codes = Array.from({ length: count }, (_, i) => ({
      eventId: id,
      code: `STE-${id.slice(0, 8)}-${uuid().slice(0, 12)}`,
      label: `${labelPrefix} #${existingCount + i + 1}`,
    }));

    await prisma.qRCode.createMany({ data: codes });

    const created = await prisma.qRCode.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
      take: count,
    });

    return success({ qrCodes: created }, 201);
  });
}
