"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { signInSchema } from "@/features/auth/schemas/sign-in-schema";

export type SignInActionState = {
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
  formError?: string;
};

export async function signInAction(
  previousState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  void previousState;

  const validationResult = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationResult.success) {
    return {
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      email: validationResult.data.email,
      password: validationResult.data.password,
      redirectTo: "/dashboard",
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          formError: "The email or password is incorrect.",
        };
      }

      return {
        formError: "Unable to sign in. Please try again.",
      };
    }

    // Successful Auth.js redirects are thrown internally.
    throw error;
  }
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/login",
  });
}
