"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Nedostaje verifikacioni token.");
      return;
    }

    //sprečava dupli poziv u dev (StrictMode remount)
    const key = `verify_attempted:${token}`;
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    }

    (async () => {
      try {
        const res = await fetch(
          `${API}/users/verify/${encodeURIComponent(token)}`,
          { method: "GET" }
        );

        if (res.ok) {
          router.replace("/verify/success");
        } else {
          setError("Nevalidan ili istekao token za verifikaciju.");
        }
      } catch (e) {
        setError("Greška u komunikaciji sa serverom.");
        console.error(e);
      }
    })();
  }, [token, router]);

  if (error) return <p>{error}</p>;
  return <p>Verifikujem vaš nalog...</p>;
}