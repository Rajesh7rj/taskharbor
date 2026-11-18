import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateTaskPages() {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
