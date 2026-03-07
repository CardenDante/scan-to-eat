import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { success, error, withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(["SUPER_ADMIN"], async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return success({ users });
  });
}

export async function POST(request: Request) {
  return withAuth(["SUPER_ADMIN"], async () => {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return error("All fields are required");
    }

    if (!["EVENT_MANAGER", "STAFF"].includes(role)) {
      return error("Invalid role");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return error("Email already in use", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
      select: { id: true, email: true, name: true, role: true },
    });

    return success({ user }, 201);
  });
}
