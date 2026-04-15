import { getCurrentUser } from "#/auth";
import { createMiddleware } from "@tanstack/react-start";

export const authMiddleware = createMiddleware().server(async ({next}) => {
  const user = await getCurrentUser();
  if (!user) {
    console.error("Unauthorized");
    throw new Error("Unauthorized");
  }
  return next({context: {user}});
});
