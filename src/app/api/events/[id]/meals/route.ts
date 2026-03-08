import { prisma } from "@/lib/db";
import { success, error, withAuth } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(null, async () => {
    const { id } = await params;
    const meals = await prisma.mealSlot.findMany({
      where: { eventId: id },
      include: { _count: { select: { scans: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    return success({ meals });
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(["SUPER_ADMIN", "EVENT_MANAGER"], async () => {
    const { id } = await params;
    const { name, date, startTime, endTime, applyToAllDays } = await request.json();

    if (!name || !startTime || !endTime) {
      return error("All fields are required");
    }

    if (applyToAllDays) {
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) return error("Event not found", 404);

      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const dates: Date[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      const meals = await Promise.all(
        dates.map((d) =>
          prisma.mealSlot.create({
            data: {
              eventId: id,
              name,
              date: d,
              startTime,
              endTime,
            },
          })
        )
      );

      return success({ meals }, 201);
    }

    if (!date) {
      return error("Date is required");
    }

    const meal = await prisma.mealSlot.create({
      data: {
        eventId: id,
        name,
        date: new Date(date),
        startTime,
        endTime,
      },
    });

    return success({ meal }, 201);
  });
}
