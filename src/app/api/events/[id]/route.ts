import { prisma } from "@/lib/db";
import { success, error, withAuth } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(null, async () => {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        mealSlots: { orderBy: { date: "asc" } },
        _count: { select: { qrCodes: true } },
        managers: { include: { user: { select: { id: true, name: true, email: true } } } },
        staff: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
    if (!event) return error("Event not found", 404);
    return success({ event });
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(["SUPER_ADMIN"], async () => {
    const { id } = await params;
    const body = await request.json();
    const { name, description, startDate, endDate, managerIds, staffIds } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    if (managerIds) {
      await prisma.eventManager.deleteMany({ where: { eventId: id } });
      await prisma.eventManager.createMany({
        data: managerIds.map((userId: string) => ({ eventId: id, userId })),
      });
    }

    if (staffIds) {
      await prisma.eventStaff.deleteMany({ where: { eventId: id } });
      await prisma.eventStaff.createMany({
        data: staffIds.map((userId: string) => ({ eventId: id, userId })),
      });
    }

    return success({ event });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(["SUPER_ADMIN"], async () => {
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return success({ message: "Event deleted" });
  });
}
