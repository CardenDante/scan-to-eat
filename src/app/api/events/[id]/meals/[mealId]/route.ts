import { prisma } from "@/lib/db";
import { success, error, withAuth } from "@/lib/api-helpers";
import { invalidateMealCache } from "@/lib/scan-cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; mealId: string }> }
) {
  return withAuth(["SUPER_ADMIN", "EVENT_MANAGER"], async () => {
    const { id: eventId, mealId } = await params;
    const body = await request.json();

    const meal = await prisma.mealSlot.update({
      where: { id: mealId },
      data: body,
    });

    // Clear cached active meal when toggled
    if ("isActive" in body) {
      invalidateMealCache(eventId);
    }

    return success({ meal });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; mealId: string }> }
) {
  return withAuth(["SUPER_ADMIN"], async () => {
    const { mealId } = await params;
    try {
      await prisma.mealSlot.delete({ where: { id: mealId } });
      return success({ message: "Meal slot deleted" });
    } catch {
      return error("Meal slot not found", 404);
    }
  });
}
