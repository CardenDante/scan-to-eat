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
    const { name, date, startTime, endTime } = await request.json();

    if (!name || !date || !startTime || !endTime) {
      return error("All fields are required");
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
