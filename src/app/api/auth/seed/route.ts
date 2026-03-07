import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { success, error } from "@/lib/api-helpers";

export async function POST() {
  try {
    const existing = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });
    if (existing) {
      return error("Super admin already exists", 409);
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.create({
      data: {
        email: "admin@scantoeat.com",
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
      },
    });

    return success({
      message: "Super admin created",
      email: admin.email,
      password: "admin123",
    }, 201);
  } catch (err) {
    console.error(err);
    return error("Failed to seed", 500);
  }
}
