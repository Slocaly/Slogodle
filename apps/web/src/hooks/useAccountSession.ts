import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { fetchIsAdmin } from "../lib/session";

export function useAccountSession() {
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    fetchIsAdmin().then((result) => {
      if (!cancelled) setIsAdmin(result);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  return { session, isPending, isAdmin };
}
