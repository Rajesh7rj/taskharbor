import "server-only";

import { compare } from "bcryptjs";

import { signInSchema } from "@/features/auth/schemas/sign-in-schema";
import { prisma } from "@/lib/prisma";

export async function authenticateUser(credentials: unknown) {
  const validationResult = signInSchema.safeParse(credentials);

  if (!validationResult.success) {
    return null;
  }

  const { email, password } = validationResult.data;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  const passwordMatches = await compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}