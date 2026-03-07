import { prisma } from "@/lib/db";
import { success, error, withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(null, async (session) => {
    let events;
    if (session.role === "SUPER_ADMIN") {
      events = await prisma.event.findMany({
        include: {
          _count: { select: { qrCodes: true, mealSlots: true } },
          mealSlots: { orderBy: { date: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (session.role === "EVENT_MANAGER") {
      events = await prisma.event.findMany({
        where: { managers: { some: { userId: session.userId } } },
        include: {
          _count: { select: { qrCodes: true, mealSlots: true } },
          mealSlots: { orderBy: { date: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      events = await prisma.event.findMany({
        where: { staff: { some: { userId: session.userId } } },
        include: {
          _count: { select: { qrCodes: true, mealSlots: true } },
          mealSlots: {
            where: { isActive: true },
            orderBy: { date: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    return success({ events });
  });
}

export async function POST(request: Request) {
  return withAuth(["SUPER_ADMIN"], async (session) => {
    const { name, description, startDate, endDate } = await request.json();

    if (!name || !startDate || !endDate) {
      return error("Name, start date, and end date are required");
    }

    const event = await prisma.event.create({
      data: {
        name,
        description: description || "",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdBy: session.userId,
      },
    });

    return success({ event }, 201);
  });
}
