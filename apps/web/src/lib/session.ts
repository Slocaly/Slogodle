import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./session.server";

export const fetchIsAdmin = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      await requireAdmin();
      return true;
    } catch (error) {
      console.error("fetchIsAdmin: not authorized", error);
      return false;
    }
  },
);
