import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export default function VerifyPage() {
  return (
      <Suspense fallback={<p>Verifikujem vaš nalog...</p>}>
        <VerifyClient />
      </Suspense>
  );
}